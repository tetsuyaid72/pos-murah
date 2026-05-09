/**
 * POST /api/payments — Submit a payment (user clicks "Saya Sudah Bayar")
 * GET  /api/payments — Get current user's payment status
 */

import { NextResponse } from 'next/server'
import { eq, and, desc } from 'drizzle-orm'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { memberships, payments } from '@/lib/db/schema'
import { normalizeStoragePublicUrl } from '@/lib/supabase'
import {
  NEW_USER_DISCOUNT_PERCENT,
  NEW_USER_PROMO_CODE,
  PRICING,
  getPromoPricing,
  isEligibleForNewUserPromo,
  type BillingPeriod,
  type PaidPlanType,
} from '@/lib/pricing'

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 })
    }

    if (!session.storeId) {
      return NextResponse.json({ error: 'Store tidak ditemukan' }, { status: 400 })
    }

    // Check if there's already a pending payment
    const existing = await db.query.payments.findFirst({
      where: and(
        eq(payments.userId, session.userId),
        eq(payments.status, 'PENDING')
      ),
    })

    if (existing) {
      return NextResponse.json({ error: 'Sudah ada pembayaran yang menunggu verifikasi' }, { status: 409 })
    }

    const body = await request.json().catch(() => ({}))
    const method = body.method === 'QRIS' ? 'QRIS' : 'BANK_TRANSFER'
    const proofUrl = typeof body.proofUrl === 'string'
      ? normalizeStoragePublicUrl(body.proofUrl)
      : null
    const plan = parsePlan(body.plan)
    const billingPeriod = parseBillingPeriod(body.billingPeriod)
    const originalPrice = PRICING[plan][billingPeriod]

    const [membership, paymentHistory] = await Promise.all([
      db.query.memberships.findFirst({
        where: eq(memberships.storeId, session.storeId),
      }),
      db.query.payments.findMany({
        where: eq(payments.userId, session.userId),
      }),
    ])
    const isNewUserPromoEligible = isEligibleForNewUserPromo({
      membership,
      memberships: membership ? [membership] : [],
      payments: paymentHistory,
    })
    const promoPricing = getPromoPricing(originalPrice, isNewUserPromoEligible, NEW_USER_DISCOUNT_PERCENT)

    console.log('[Pricing Promo]', {
      plan,
      isNewUserPromoEligible,
      originalPrice: promoPricing.originalPrice,
      discountPercent: promoPricing.discountPercent,
      finalAmount: promoPricing.finalAmount,
    })

    // Create payment record
    const [payment] = await db.insert(payments).values({
      userId: session.userId,
      storeId: session.storeId,
      amount: promoPricing.finalAmount,
      plan,
      billingPeriod,
      originalPrice: promoPricing.originalPrice,
      discountPercent: promoPricing.discountPercent,
      discountAmount: promoPricing.discountAmount,
      finalAmount: promoPricing.finalAmount,
      promoCode: promoPricing.isPromoApplied ? NEW_USER_PROMO_CODE : null,
      promoType: promoPricing.isPromoApplied ? NEW_USER_PROMO_CODE : null,
      method,
      proofUrl,
      status: 'PENDING',
    }).returning()

    return NextResponse.json({ payment }, { status: 201 })
  } catch (error) {
    console.error('Payment submit error:', error)
    return NextResponse.json({ error: 'Gagal menyimpan pembayaran' }, { status: 500 })
  }
}

function parsePlan(plan: unknown): PaidPlanType {
  if (plan === 'BASIC' || plan === 'PRO' || plan === 'BUSINESS') return plan
  if (plan === 'basic') return 'BASIC'
  if (plan === 'pro') return 'PRO'
  if (plan === 'business') return 'BUSINESS'
  return 'PRO'
}

function parseBillingPeriod(period: unknown): BillingPeriod {
  return period === 'yearly' ? 'yearly' : 'monthly'
}

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 })
    }

    // Get latest payment for this user
    const payment = await db.query.payments.findFirst({
      where: eq(payments.userId, session.userId),
      orderBy: [desc(payments.createdAt)],
    })

    return NextResponse.json({ payment: payment || null })
  } catch (error) {
    console.error('Payment fetch error:', error)
    return NextResponse.json({ error: 'Gagal mengambil data pembayaran' }, { status: 500 })
  }
}
