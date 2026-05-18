import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { payments, users } from '@/lib/db/schema'
import { createSnapTransaction, getMidtransMode } from '@/lib/payments/midtrans'
import { getDisplayPricing, type BillingPeriod, type PaidPlanType } from '@/lib/pricing'

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 })
    }

    if (!session.storeId) {
      return NextResponse.json({ error: 'Store tidak ditemukan' }, { status: 400 })
    }

    const body = await request.json().catch(() => ({}))
    const plan = parsePlan(body.plan)
    const requestedBillingPeriod = parseBillingPeriod(body.billingPeriod)
    const billingPeriod: BillingPeriod = plan === 'PRO' ? requestedBillingPeriod : 'lifetime'
    const displayPricing = getDisplayPricing(plan, billingPeriod, false)
    const promoPricing = displayPricing.promo

    const [user] = await db
      .select({ name: users.name, email: users.email })
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1)

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
      promoCode: promoPricing.promoCode,
      promoType: promoPricing.promoType,
      method: 'MIDTRANS',
      provider: 'MIDTRANS',
      status: 'PENDING',
      metadata: { mode: getMidtransMode() },
    }).returning()

    const providerOrderId = `POS-${payment.id}`
    const snap = await createSnapTransaction({
      orderId: providerOrderId,
      grossAmount: promoPricing.finalAmount,
      plan,
      billingPeriod,
      customer: {
        firstName: user?.name || 'Warung Madura POS User',
        email: user?.email || session.email || 'user@example.com',
      },
    })

    const [updatedPayment] = await db.update(payments).set({
      providerOrderId,
      snapToken: snap.token,
      snapRedirectUrl: snap.redirect_url,
      metadata: { mode: getMidtransMode(), snapCreatedAt: new Date().toISOString() },
    }).where(eq(payments.id, payment.id)).returning()

    return NextResponse.json({
      payment: updatedPayment,
      snapToken: snap.token,
      redirectUrl: snap.redirect_url,
    }, { status: 201 })
  } catch (error) {
    console.error('Midtrans create payment error:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Gagal membuat pembayaran Midtrans' }, { status: 500 })
  }
}

function parsePlan(plan: unknown): PaidPlanType {
  if (plan === 'PRO' || plan === 'BUSINESS') return plan
  if (plan === 'pro') return 'PRO'
  if (plan === 'business' || plan === 'bisnis') return 'BUSINESS'
  return 'PRO'
}

function parseBillingPeriod(period: unknown): BillingPeriod {
  return period === 'monthly' ? 'monthly' : 'lifetime'
}
