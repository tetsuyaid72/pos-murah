/**
 * GET /api/admin/activity — List activity logs with pagination and filters
 */

import { NextRequest, NextResponse } from 'next/server'
import { eq, like, or, count, desc, and, gte, lte } from 'drizzle-orm'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { activityLogs, users, stores } from '@/lib/db/schema'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = 50
    const offset = (page - 1) * limit
    const actionFilter = searchParams.get('action')
    const entityFilter = searchParams.get('entity')
    const storeFilter = searchParams.get('storeId')
    const search = searchParams.get('search')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    // Build conditions
    const conditions = []

    if (actionFilter) {
      conditions.push(eq(activityLogs.action, actionFilter))
    }

    if (entityFilter) {
      conditions.push(eq(activityLogs.entity, entityFilter))
    }

    if (storeFilter) {
      conditions.push(eq(activityLogs.storeId, storeFilter))
    }

    if (search) {
      conditions.push(
        or(
          like(users.name, `%${search}%`),
          like(users.email, `%${search}%`)
        )
      )
    }

    if (dateFrom) {
      conditions.push(gte(activityLogs.createdAt, new Date(dateFrom)))
    }

    if (dateTo) {
      const endDate = new Date(dateTo)
      endDate.setHours(23, 59, 59, 999)
      conditions.push(lte(activityLogs.createdAt, endDate))
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    // Count total
    const [totalResult] = await db
      .select({ value: count() })
      .from(activityLogs)
      .leftJoin(users, eq(activityLogs.userId, users.id))
      .leftJoin(stores, eq(activityLogs.storeId, stores.id))
      .where(whereClause)

    const total = totalResult?.value ?? 0

    // Fetch logs
    const logs = await db
      .select({
        id: activityLogs.id,
        action: activityLogs.action,
        entity: activityLogs.entity,
        entityId: activityLogs.entityId,
        metadata: activityLogs.metadata,
        createdAt: activityLogs.createdAt,
        userName: users.name,
        userEmail: users.email,
        storeName: stores.name,
      })
      .from(activityLogs)
      .leftJoin(users, eq(activityLogs.userId, users.id))
      .leftJoin(stores, eq(activityLogs.storeId, stores.id))
      .where(whereClause)
      .orderBy(desc(activityLogs.createdAt))
      .limit(limit)
      .offset(offset)

    return NextResponse.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Admin activity log error:', error)
    return NextResponse.json({ error: 'Gagal mengambil data' }, { status: 500 })
  }
}
