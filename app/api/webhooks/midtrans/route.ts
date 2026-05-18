import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { payments } from '@/lib/db/schema'
import { verifyMidtransSignature, type MidtransNotificationPayload } from '@/lib/payments/midtrans'
import { activateMembership, markPaymentFromGateway } from '@/lib/payments/payment-service'
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

    if (!verifyMidtransSignature(payload)) {
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
      await activateMembership({
        storeId: payment.storeId,
        plan: payment.plan,
        billingPeriod: payment.billingPeriod,
      })
    }

    return NextResponse.json({ received: true, status: nextStatus })
  } catch (error) {
    console.error('Midtrans webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
