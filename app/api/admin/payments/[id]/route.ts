/**
 * PATCH /api/admin/payments/[id] — Approve or reject a payment (admin only)
 * Body: { action: "approve" | "reject" }
 */

import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { payments, memberships } from '@/lib/db/schema'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 })
    }

    if (session.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { action } = body

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Action tidak valid' }, { status: 400 })
    }

    // Get the payment
    const payment = await db.query.payments.findFirst({
      where: eq(payments.id, id),
    })

    if (!payment) {
      return NextResponse.json({ error: 'Pembayaran tidak ditemukan' }, { status: 404 })
    }

    if (payment.status !== 'PENDING') {
      return NextResponse.json({ error: 'Pembayaran sudah diproses sebelumnya' }, { status: 409 })
    }

    if (action === 'approve') {
      // Update payment status
      await db.update(payments).set({
        status: 'APPROVED',
        approvedBy: session.userId,
        approvedAt: new Date(),
      }).where(eq(payments.id, id))

      const now = new Date()
      const subscriptionEndAt = payment.plan === 'PRO' && payment.billingPeriod === 'monthly'
        ? new Date(now.getFullYear(), now.getMonth() + 1, now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds())
        : null

      // Activate the requested plan from the approved payment.
      await db.update(memberships).set({
        plan: payment.plan,
        isTrial: false,
        billingPeriod: payment.billingPeriod,
        subscriptionStartAt: now,
        subscriptionEndAt,
      }).where(eq(memberships.storeId, payment.storeId))

      return NextResponse.json({ message: 'Pembayaran berhasil di-approve', status: 'APPROVED' })
    } else {
      // Reject
      await db.update(payments).set({
        status: 'REJECTED',
        approvedBy: session.userId,
        approvedAt: new Date(),
      }).where(eq(payments.id, id))

      return NextResponse.json({ message: 'Pembayaran ditolak', status: 'REJECTED' })
    }
  } catch (error) {
    console.error('Admin payment action error:', error)
    return NextResponse.json({ error: 'Gagal memproses pembayaran' }, { status: 500 })
  }
}
