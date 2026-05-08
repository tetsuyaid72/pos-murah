/**
 * GET /api/admin/users — List users with pagination, search, filter
 */

import { NextRequest, NextResponse } from 'next/server'
import { eq, like, or, count, desc, and, sql } from 'drizzle-orm'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { users, stores, memberships } from '@/lib/db/schema'

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
    const search = searchParams.get('search')
    const roleFilter = searchParams.get('role')
    const statusFilter = searchParams.get('status')

    // Build conditions
    const conditions = []

    if (search) {
      conditions.push(
        or(
          like(users.name, `%${search}%`),
          like(users.email, `%${search}%`)
        )
      )
    }

    if (roleFilter && ['OWNER', 'CASHIER', 'SUPER_ADMIN'].includes(roleFilter)) {
      conditions.push(eq(users.role, roleFilter as 'OWNER' | 'CASHIER' | 'SUPER_ADMIN'))
    }

    if (statusFilter === 'active') {
      conditions.push(eq(users.isActive, true))
    } else if (statusFilter === 'inactive') {
      conditions.push(eq(users.isActive, false))
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    // Count total
    const [totalResult] = await db
      .select({ value: count() })
      .from(users)
      .where(whereClause)

    const total = totalResult?.value ?? 0

    // Fetch users with store info
    const userList = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        isActive: users.isActive,
        lastLoginAt: users.lastLoginAt,
        createdAt: users.createdAt,
        storeName: stores.name,
        storeId: stores.id,
        plan: memberships.plan,
      })
      .from(users)
      .leftJoin(stores, eq(users.id, stores.ownerId))
      .leftJoin(memberships, eq(stores.id, memberships.storeId))
      .where(whereClause)
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset)

    return NextResponse.json({
      users: userList,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Admin users list error:', error)
    return NextResponse.json({ error: 'Gagal mengambil data' }, { status: 500 })
  }
}
