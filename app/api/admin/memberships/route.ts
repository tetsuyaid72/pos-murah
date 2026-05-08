/**
 * GET /api/admin/memberships — List memberships with store & owner info
 */

import { NextRequest, NextResponse } from 'next/server'
import { eq, count, desc, and } from 'drizzle-orm'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { memberships, stores, users } from '@/lib/db/schema'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = 20
    const offset = (page - 1) * limit
    const planFilter = searchParams.get('plan')
    const trialFilter = searchParams.get('trial') // 'active', 'expired', 'paid'

    // Build conditions
    const conditions = []

    if (planFilter && ['BASIC', 'PRO', 'BUSINESS', 'ENTERPRISE'].includes(planFilter)) {
      conditions.push(eq(memberships.plan, planFilter as 'BASIC' | 'PRO' | 'BUSINESS' | 'ENTERPRISE'))
    }

    if (trialFilter === 'active') {
      conditions.push(eq(memberships.isTrial, true))
    } else if (trialFilter === 'paid') {
      conditions.push(eq(memberships.isTrial, false))
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    // Count total
    const [totalResult] = await db
      .select({ value: count() })
      .from(memberships)
      .where(whereClause)

    const total = totalResult?.value ?? 0

    // Fetch memberships with store and owner info
    const membershipList = await db
      .select({
        id: memberships.id,
        storeId: memberships.storeId,
        plan: memberships.plan,
        isTrial: memberships.isTrial,
        trialStartAt: memberships.trialStartAt,
        trialEndAt: memberships.trialEndAt,
        createdAt: memberships.createdAt,
        storeName: stores.name,
        ownerName: users.name,
        ownerEmail: users.email,
      })
      .from(memberships)
      .innerJoin(stores, eq(memberships.storeId, stores.id))
      .innerJoin(users, eq(stores.ownerId, users.id))
      .where(whereClause)
      .orderBy(desc(memberships.createdAt))
      .limit(limit)
      .offset(offset)

    return NextResponse.json({
      memberships: membershipList,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Admin memberships list error:', error)
    return NextResponse.json({ error: 'Gagal mengambil data' }, { status: 500 })
  }
}
