import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { memberships, payments, stores, users } from '@/lib/db/schema'
import { createSnapTransaction, getMidtransMode } from '@/lib/payments/midtrans'
import { TRIAL_DAYS, TRIAL_PRICE, getDisplayPricing, type BillingPeriod, type CheckoutPlanType } from '@/lib/pricing'

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 })
    }

    if (!session.storeId) {
      return NextResponse.json({ error: 'Store tidak ditemukan' }, { status: 400 })
    }

    const [sessionUser] = await db
      .select({ id: users.id, name: users.name, email: users.email })
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1)

    if (!sessionUser) {
      return NextResponse.json({ error: 'Sesi login sudah tidak valid. Silakan login ulang.' }, { status: 401 })
    }

    const [sessionStore] = await db
      .select({
        id: stores.id,
        membership: {
          isTrial: memberships.isTrial,
          trialStartAt: memberships.trialStartAt,
          trialEndAt: memberships.trialEndAt,
          subscriptionStartAt: memberships.subscriptionStartAt,
        },
      })
      .from(stores)
      .leftJoin(memberships, eq(memberships.storeId, stores.id))
      .where(eq(stores.id, session.storeId))
      .limit(1)

    if (!sessionStore) {
      return NextResponse.json({ error: 'Data toko tidak ditemukan. Silakan login ulang.' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const plan = parsePlan(body.plan)
    const requestedBillingPeriod = parseBillingPeriod(body.billingPeriod)
    const billingPeriod: BillingPeriod = plan === 'PRO' ? requestedBillingPeriod : 'lifetime'
    const isTrialCheckout = plan === 'TRIAL'
    if (isTrialCheckout && hasUsedTrial(sessionStore.membership)) {
      return NextResponse.json({ error: 'Masa trial hanya bisa diaktifkan satu kali per akun.' }, { status: 409 })
    }

    const displayPricing = isTrialCheckout ? null : getDisplayPricing(plan, billingPeriod, false)
    const promoPricing = isTrialCheckout
      ? {
          originalPrice: TRIAL_PRICE,
          discountPercent: 0,
          discountAmount: 0,
          finalAmount: TRIAL_PRICE,
          promoCode: null,
          promoType: 'TRIAL',
        }
      : displayPricing!.promo
    const metadata = isTrialCheckout
      ? { mode: getMidtransMode(), checkoutType: 'TRIAL', trialDays: TRIAL_DAYS }
      : { mode: getMidtransMode() }

    const [payment] = await db.insert(payments).values({
      userId: session.userId,
      storeId: session.storeId,
      amount: promoPricing.finalAmount,
      plan: isTrialCheckout ? 'PRO' : plan,
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
      metadata,
    }).returning()

    const providerOrderId = `POS-${payment.id}`
    const snap = await createSnapTransaction({
      orderId: providerOrderId,
      grossAmount: promoPricing.finalAmount,
      plan: isTrialCheckout ? 'TRIAL' : plan,
      customer: {
        firstName: sessionUser.name || 'Warung Madura POS User',
        email: sessionUser.email || session.email || 'user@example.com',
      },
    })

    const [updatedPayment] = await db.update(payments).set({
      providerOrderId,
      snapToken: snap.token,
      snapRedirectUrl: snap.redirect_url,
      metadata: { ...metadata, snapCreatedAt: new Date().toISOString() },
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

function parsePlan(plan: unknown): CheckoutPlanType {
  if (plan === 'TRIAL' || plan === 'trial') return 'TRIAL'
  if (plan === 'PRO' || plan === 'BUSINESS') return plan
  if (plan === 'pro') return 'PRO'
  if (plan === 'business' || plan === 'bisnis') return 'BUSINESS'
  return 'PRO'
}

function parseBillingPeriod(period: unknown): BillingPeriod {
  return period === 'monthly' ? 'monthly' : 'lifetime'
}

function hasUsedTrial(membership: { isTrial: boolean; trialStartAt: Date; trialEndAt: Date; subscriptionStartAt: Date | null } | null): boolean {
  if (!membership) return false
  return membership.isTrial || membership.subscriptionStartAt !== null || membership.trialEndAt > membership.trialStartAt
}
