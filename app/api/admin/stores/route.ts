/**
 * GET /api/admin/stores — List stores with pagination, search, filter
 */

import { NextRequest, NextResponse } from 'next/server'
import { eq, like, or, count, desc, and, sql } from 'drizzle-orm'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { stores, users, memberships, products, transactions } from '@/lib/db/schema'

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
    const planFilter = searchParams.get('plan')
    const statusFilter = searchParams.get('status')

    // Build conditions
    const conditions = []

    if (search) {
      conditions.push(
        or(
          like(stores.name, `%${search}%`),
          like(users.name, `%${search}%`)
        )
      )
    }

    if (planFilter && ['FREE', 'PRO', 'BUSINESS'].includes(planFilter)) {
      conditions.push(eq(memberships.plan, planFilter as 'FREE' | 'PRO' | 'BUSINESS'))
    }

    if (statusFilter === 'active') {
      conditions.push(eq(stores.isActive, true))
    } else if (statusFilter === 'inactive') {
      conditions.push(eq(stores.isActive, false))
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    // Subqueries for counts
    const productCounts = db
      .select({
        storeId: products.storeId,
        prodCount: count().as('prod_count'),
      })
      .from(products)
      .groupBy(products.storeId)
      .as('product_counts')

    const transactionCounts = db
      .select({
        storeId: transactions.storeId,
        txCount: count().as('tx_count'),
      })
      .from(transactions)
      .groupBy(transactions.storeId)
      .as('transaction_counts')

    // Count total
    const [totalResult] = await db
      .select({ value: count() })
      .from(stores)
      .innerJoin(users, eq(stores.ownerId, users.id))
      .leftJoin(memberships, eq(stores.id, memberships.storeId))
      .where(whereClause)

    const total = totalResult?.value ?? 0

    // Fetch stores
    const storeList = await db
      .select({
        id: stores.id,
        name: stores.name,
        isActive: stores.isActive,
        createdAt: stores.createdAt,
        ownerName: users.name,
        ownerEmail: users.email,
        plan: memberships.plan,
        isTrial: memberships.isTrial,
        trialEndAt: memberships.trialEndAt,
        productCount: sql<number>`coalesce(${productCounts.prodCount}, 0)`,
        transactionCount: sql<number>`coalesce(${transactionCounts.txCount}, 0)`,
      })
      .from(stores)
      .innerJoin(users, eq(stores.ownerId, users.id))
      .leftJoin(memberships, eq(stores.id, memberships.storeId))
      .leftJoin(productCounts, eq(stores.id, productCounts.storeId))
      .leftJoin(transactionCounts, eq(stores.id, transactionCounts.storeId))
      .where(whereClause)
      .orderBy(desc(stores.createdAt))
      .limit(limit)
      .offset(offset)

    return NextResponse.json({
      stores: storeList,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Admin stores list error:', error)
    return NextResponse.json({ error: 'Gagal mengambil data' }, { status: 500 })
  }
}
