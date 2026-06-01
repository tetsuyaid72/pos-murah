/**
 * POST /api/plan/sync
 *
 * Checks if the current user has any PAID Midtrans payments whose
 * membership hasn't been activated yet, and activates them automatically.
 *
 * This is the safety net for when the Midtrans webhook processes the payment
 * but the user's browser already loaded the dashboard before the webhook ran.
 * It also handles the case where the webhook succeeded but the membership
 * update failed for some reason.
 *
 * Returns: { activated: boolean, plan?: string }
 */

import { NextResponse } from 'next/server'
import { eq, and, desc } from 'drizzle-orm'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { memberships, payments } from '@/lib/db/schema'
import { activateMembership, activateTrialMembership } from '@/lib/payments/payment-service'

export async function POST() {
  try {
    const session = await getSession()
    if (!session || !session.storeId) {
      return NextResponse.json({ activated: false }, { status: 401 })
    }

    // Get current membership
    const membership = await db.query.memberships.findFirst({
      where: eq(memberships.storeId, session.storeId),
    })

    if (!membership) {
      return NextResponse.json({ activated: false })
    }

    // Check if membership is already active
    const now = new Date()
    const isTrialActive = membership.isTrial && new Date(membership.trialEndAt) > now
    const isPaidActive = !membership.isTrial && membership.plan !== 'FREE' && (
      !membership.subscriptionEndAt || new Date(membership.subscriptionEndAt) > now
    )

    if (isTrialActive || isPaidActive) {
      // Already active, nothing to do
      return NextResponse.json({ activated: false, alreadyActive: true })
    }

    // Find the most recent PAID payment for this store that hasn't been applied
    const paidPayment = await db.query.payments.findFirst({
      where: and(
        eq(payments.storeId, session.storeId),
        eq(payments.status, 'PAID'),
      ),
      orderBy: [desc(payments.paidAt)],
    })

    if (!paidPayment) {
      // Also check for APPROVED manual payments
      const approvedPayment = await db.query.payments.findFirst({
        where: and(
          eq(payments.storeId, session.storeId),
          eq(payments.status, 'APPROVED'),
        ),
        orderBy: [desc(payments.approvedAt)],
      })

      if (!approvedPayment) {
        // Check for PENDING Midtrans payments and try to verify with Midtrans
        const pendingMidtrans = await db.query.payments.findFirst({
          where: and(
            eq(payments.storeId, session.storeId),
            eq(payments.status, 'PENDING'),
            eq(payments.provider, 'MIDTRANS'),
          ),
          orderBy: [desc(payments.createdAt)],
        })

        if (pendingMidtrans && pendingMidtrans.providerOrderId) {
          // Try to check status with Midtrans
          const midtransStatus = await checkMidtransStatus(pendingMidtrans.providerOrderId)
          if (midtransStatus === 'settlement' || midtransStatus === 'capture') {
            // Payment is actually paid! Update payment and activate membership
            await db.update(payments).set({
              status: 'PAID',
              paidAt: new Date(),
              providerStatus: midtransStatus,
            }).where(eq(payments.id, pendingMidtrans.id))

            const metadata = pendingMidtrans.metadata as { checkoutType?: string } | null
            if (metadata?.checkoutType === 'TRIAL') {
              await activateTrialMembership(session.storeId)
            } else {
              await activateMembership({
                storeId: session.storeId,
                plan: pendingMidtrans.plan as 'PRO' | 'BUSINESS',
                billingPeriod: pendingMidtrans.billingPeriod as 'monthly' | 'lifetime',
              })
            }

            return NextResponse.json({ activated: true, plan: pendingMidtrans.plan, source: 'midtrans_check' })
          }
        }

        return NextResponse.json({ activated: false })
      }

      // Activate from APPROVED payment
      await activateMembership({
        storeId: session.storeId,
        plan: approvedPayment.plan as 'PRO' | 'BUSINESS',
        billingPeriod: approvedPayment.billingPeriod as 'monthly' | 'lifetime',
      })

      return NextResponse.json({ activated: true, plan: approvedPayment.plan, source: 'approved' })
    }

    // We found a PAID payment but membership is not active — activate it now
    const metadata = paidPayment.metadata as { checkoutType?: string } | null
    if (metadata?.checkoutType === 'TRIAL') {
      await activateTrialMembership(session.storeId)
    } else {
      await activateMembership({
        storeId: session.storeId,
        plan: paidPayment.plan as 'PRO' | 'BUSINESS',
        billingPeriod: paidPayment.billingPeriod as 'monthly' | 'lifetime',
      })
    }

    return NextResponse.json({ activated: true, plan: paidPayment.plan, source: 'paid' })
  } catch (error) {
    console.error('Plan sync error:', error)
    return NextResponse.json({ activated: false, error: 'Sync failed' }, { status: 500 })
  }
}

/**
 * Check payment status directly with Midtrans API.
 */
async function checkMidtransStatus(orderId: string): Promise<string | null> {
  try {
    const serverKey = process.env.MIDTRANS_SERVER_KEY
    if (!serverKey) return null

    const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true'
    const baseUrl = isProduction
      ? 'https://api.midtrans.com/v2'
      : 'https://api.sandbox.midtrans.com/v2'

    const auth = Buffer.from(`${serverKey}:`).toString('base64')
    const res = await fetch(`${baseUrl}/${orderId}/status`, {
      headers: {
        Authorization: `Basic ${auth}`,
        Accept: 'application/json',
      },
    })

    if (!res.ok) return null

    const data = await res.json()
    return data.transaction_status || null
  } catch {
    return null
  }
}
