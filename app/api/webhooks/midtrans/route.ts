import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { payments } from '@/lib/db/schema'
import { verifyMidtransSignature, type MidtransNotificationPayload } from '@/lib/payments/midtrans'
import { activateMembership, activateTrialMembership, markPaymentFromGateway } from '@/lib/payments/payment-service'
import { isFinalPaymentStatus, mapMidtransStatus, type PaymentStatus } from '@/lib/payments/status'

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: 'Midtrans webhook ready',
  })
}

export async function POST(request: Request) {
  try {
    const payload = await request.json() as MidtransNotificationPayload

    console.log('[Midtrans Webhook] Received notification:', {
      order_id: payload.order_id,
      transaction_status: payload.transaction_status,
      fraud_status: payload.fraud_status,
      gross_amount: payload.gross_amount,
    })

    if (!verifyMidtransSignature(payload)) {
      console.error('[Midtrans Webhook] Invalid signature for order:', payload.order_id)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const orderId = payload.order_id
    if (!orderId) {
      return NextResponse.json({ error: 'Missing order_id' }, { status: 400 })
    }

    const payment = await db.query.payments.findFirst({
      where: eq(payments.providerOrderId, orderId),
    })

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    const nextStatus = mapMidtransStatus(payload.transaction_status || 'pending', payload.fraud_status)
    const currentStatus = payment.status as PaymentStatus

    if (isFinalPaymentStatus(currentStatus) && currentStatus !== 'PENDING') {
      return NextResponse.json({ received: true, skipped: true, status: currentStatus })
    }

    await markPaymentFromGateway({
      paymentId: payment.id,
      status: nextStatus,
      providerTransactionId: payload.transaction_id || null,
      providerStatus: payload.transaction_status || null,
      expiredAt: payload.expiry_time ? new Date(payload.expiry_time) : null,
      metadata: payload,
    })

    if (nextStatus === 'PAID') {
      const metadata = payment.metadata as { checkoutType?: string } | null
      console.log('[Midtrans Webhook] Payment PAID, activating membership:', {
        storeId: payment.storeId,
        checkoutType: metadata?.checkoutType,
        plan: payment.plan,
        billingPeriod: payment.billingPeriod,
      })

      try {
        if (metadata?.checkoutType === 'TRIAL') {
          await activateTrialMembership(payment.storeId)
        } else {
          await activateMembership({
            storeId: payment.storeId,
            plan: payment.plan,
            billingPeriod: payment.billingPeriod,
          })
        }
        console.log('[Midtrans Webhook] Membership activated successfully for store:', payment.storeId)
      } catch (activationError) {
        console.error('[Midtrans Webhook] Failed to activate membership:', activationError)
        // Don't fail the webhook response - payment was already marked as PAID
      }
    }

    return NextResponse.json({ received: true, status: nextStatus })
  } catch (error) {
    console.error('Midtrans webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
