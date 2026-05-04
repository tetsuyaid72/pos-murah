/**
 * GET /api/admin/stats
 *
 * Super Admin dashboard — provides overview statistics for the developer.
 * Protected: only SUPER_ADMIN role can access.
 *
 * Returns:
 * - Total users
 * - Total stores
 * - Total transactions (all stores)
 * - Active users today
 * - Active users this week
 * - Revenue estimation (total transaction amounts)
 * - Recent registrations
 * - Top stores by transaction count
 * - Trial expiring soon
 */

import { NextResponse } from 'next/server'
import { eq, gte, lte, and, count, sum, avg, desc, asc, sql } from 'drizzle-orm'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import {
  users,
  stores,
  transactions,
  memberships,
  products,
} from '@/lib/db/schema'

export async function GET() {
  try {
    // Auth check — only SUPER_ADMIN
    const session = await getSession()
    if (!session || session.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Akses ditolak. Hanya Super Admin.' },
        { status: 403 }
      )
    }

    // Time boundaries
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekStart = new Date(todayStart)
    weekStart.setDate(weekStart.getDate() - 7)

    // Run all queries in parallel
    const [
      totalUsersResult,
      totalStoresResult,
      totalTransactionsResult,
      activeUsersTodayResult,
      activeUsersWeekResult,
      revenueResult,
      recentRegistrations,
      topStoresRaw,
      trialsExpiringSoon,
      planDistributionResult,
    ] = await Promise.all([
      // Total users
      db.select({ value: count() }).from(users),

      // Total stores (active)
      db.select({ value: count() }).from(stores).where(eq(stores.isActive, true)),

      // Total transactions
      db.select({ value: count() }).from(transactions),

      // Active users today (logged in today)
      db.select({ value: count() }).from(users).where(gte(users.lastLoginAt, todayStart)),

      // Active users this week
      db.select({ value: count() }).from(users).where(gte(users.lastLoginAt, weekStart)),

      // Revenue estimation (sum + avg of all transaction amounts)
      db.select({
        totalRevenue: sum(transactions.totalAmount),
        avgAmount: avg(transactions.totalAmount),
      }).from(transactions),

      // Recent registrations (last 10)
      db.query.users.findMany({
        limit: 10,
        orderBy: desc(users.createdAt),
        columns: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          lastLoginAt: true,
        },
        with: {
          store: {
            columns: {
              id: true,
              name: true,
            },
          },
        },
      }),

      // Top 10 stores by transaction count (using subquery)
      (() => {
        const txCounts = db
          .select({
            storeId: transactions.storeId,
            txCount: count().as('tx_count'),
          })
          .from(transactions)
          .groupBy(transactions.storeId)
          .as('tx_counts')

        const prodCounts = db
          .select({
            storeId: products.storeId,
            prodCount: count().as('prod_count'),
          })
          .from(products)
          .groupBy(products.storeId)
          .as('prod_counts')

        return db
          .select({
            id: stores.id,
            name: stores.name,
            ownerId: stores.ownerId,
            createdAt: stores.createdAt,
            transactionCount: sql<number>`coalesce(${txCounts.txCount}, 0)`.as('transaction_count'),
            productCount: sql<number>`coalesce(${prodCounts.prodCount}, 0)`.as('product_count'),
          })
          .from(stores)
          .where(eq(stores.isActive, true))
          .leftJoin(txCounts, eq(stores.id, txCounts.storeId))
          .leftJoin(prodCounts, eq(stores.id, prodCounts.storeId))
          .orderBy(sql`transaction_count desc`)
          .limit(10)
      })(),

      // Trials expiring in next 7 days
      db.query.memberships.findMany({
        where: and(
          eq(memberships.isTrial, true),
          gte(memberships.trialEndAt, now),
          lte(memberships.trialEndAt, new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)),
        ),
        with: {
          store: {
            columns: { name: true },
            with: {
              owner: {
                columns: { name: true, email: true },
              },
            },
          },
        },
        orderBy: asc(memberships.trialEndAt),
      }),

      // Plan distribution
      db
        .select({
          plan: memberships.plan,
          count: count(),
        })
        .from(memberships)
        .groupBy(memberships.plan),
    ])

    // Fetch owner info for top stores
    const topStoreOwnerIds = topStoresRaw.map((s) => s.ownerId)
    const ownerMap = new Map<string, { name: string; email: string; lastLoginAt: Date | null }>()

    if (topStoreOwnerIds.length > 0) {
      const owners = await db.query.users.findMany({
        where: sql`${users.id} IN (${sql.join(topStoreOwnerIds.map(id => sql`${id}`), sql`, `)})`,
        columns: { id: true, name: true, email: true, lastLoginAt: true },
      })
      for (const owner of owners) {
        ownerMap.set(owner.id, { name: owner.name, email: owner.email, lastLoginAt: owner.lastLoginAt })
      }
    }

    return NextResponse.json({
      overview: {
        totalUsers: totalUsersResult[0]?.value ?? 0,
        totalStores: totalStoresResult[0]?.value ?? 0,
        totalTransactions: totalTransactionsResult[0]?.value ?? 0,
        activeUsersToday: activeUsersTodayResult[0]?.value ?? 0,
        activeUsersWeek: activeUsersWeekResult[0]?.value ?? 0,
        totalRevenue: Number(revenueResult[0]?.totalRevenue ?? 0),
        avgTransactionAmount: Math.round(Number(revenueResult[0]?.avgAmount ?? 0)),
      },
      recentRegistrations,
      topStores: topStoresRaw.map((store) => {
        const owner = ownerMap.get(store.ownerId)
        return {
          id: store.id,
          name: store.name,
          ownerName: owner?.name ?? '',
          ownerEmail: owner?.email ?? '',
          ownerLastLogin: owner?.lastLoginAt ?? null,
          transactionCount: store.transactionCount,
          productCount: store.productCount,
          createdAt: store.createdAt,
        }
      }),
      trialsExpiringSoon: trialsExpiringSoon.map((m) => ({
        storeName: m.store.name,
        ownerName: m.store.owner.name,
        ownerEmail: m.store.owner.email,
        trialEndAt: m.trialEndAt,
        plan: m.plan,
      })),
      planDistribution: planDistributionResult.map((p) => ({
        plan: p.plan,
        count: p.count,
      })),
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan' },
      { status: 500 }
    )
  }
}
