/**
 * GET /api/admin/payments — List all payments (admin only)
 * Query params: ?status=PENDING|APPROVED|REJECTED&search=keyword
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
        status: payments.status,
        method: payments.method,
        proofUrl: payments.proofUrl,
        notes: payments.notes,
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

    if (statusFilter && ['PENDING', 'APPROVED', 'REJECTED'].includes(statusFilter)) {
      query = query.where(eq(payments.status, statusFilter as 'PENDING' | 'APPROVED' | 'REJECTED'))
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
      proofUrl: normalizeStoragePublicUrl(payment.proofUrl),
    }))

    return NextResponse.json({ payments: normalizedPayments })
  } catch (error) {
    console.error('Admin payments list error:', error)
    return NextResponse.json({ error: 'Gagal mengambil data' }, { status: 500 })
  }
}
