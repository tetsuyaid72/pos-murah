/**
 * GET /api/admin/payments — List all payments (admin only)
 * Query params: ?status=PENDING|APPROVED|REJECTED&search=keyword
 * Future gateway statuses are tolerated by the UI after schema migration.
 */

import { NextRequest, NextResponse } from 'next/server'
import { eq, desc, like, or } from 'drizzle-orm'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { payments, users, stores } from '@/lib/db/schema'
import { normalizeStoragePublicUrl } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 })
    }

    // Check admin role
    if (session.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const statusFilter = searchParams.get('status')
    const search = searchParams.get('search')

    // Build query
    let query = db
      .select({
        id: payments.id,
        amount: payments.amount,
        plan: payments.plan,
        billingPeriod: payments.billingPeriod,
        originalPrice: payments.originalPrice,
        discountPercent: payments.discountPercent,
        discountAmount: payments.discountAmount,
        finalAmount: payments.finalAmount,
        promoCode: payments.promoCode,
        promoType: payments.promoType,
        status: payments.status,
        method: payments.method,
        provider: payments.provider,
        providerOrderId: payments.providerOrderId,
        providerTransactionId: payments.providerTransactionId,
        providerStatus: payments.providerStatus,
        proofUrl: payments.proofUrl,
        notes: payments.notes,
        paidAt: payments.paidAt,
        expiredAt: payments.expiredAt,
        createdAt: payments.createdAt,
        approvedAt: payments.approvedAt,
        userName: users.name,
        userEmail: users.email,
        storeName: stores.name,
      })
      .from(payments)
      .innerJoin(users, eq(payments.userId, users.id))
      .innerJoin(stores, eq(payments.storeId, stores.id))
      .orderBy(desc(payments.createdAt))
      .$dynamic()

    const validStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'PAID', 'FAILED', 'EXPIRED', 'CANCELLED', 'REFUNDED'] as const
    if (statusFilter && validStatuses.includes(statusFilter as typeof validStatuses[number])) {
      query = query.where(eq(payments.status, statusFilter as typeof validStatuses[number]))
    }

    if (search) {
      query = query.where(
        or(
          like(users.name, `%${search}%`),
          like(users.email, `%${search}%`),
          like(stores.name, `%${search}%`)
        )
      )
    }

    const results = await query
    const normalizedPayments = results.map((payment) => ({
      ...payment,
      paidAt: payment.paidAt ?? payment.approvedAt,
      proofUrl: normalizeStoragePublicUrl(payment.proofUrl),
    }))

    return NextResponse.json({ payments: normalizedPayments })
  } catch (error) {
    console.error('Admin payments list error:', error)
    return NextResponse.json({ error: 'Gagal mengambil data' }, { status: 500 })
  }
}
