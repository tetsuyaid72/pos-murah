/**
 * GET /api/dashboard?range=today|7days|30days
 *
 * Server-side dashboard aggregation endpoint.
 * All KPIs, trend data, and top products are computed here via SQL.
 * No limit — aggregates ALL transactions within the date range.
 *
 * IMPORTANT: The `createdAt` column is stored as Unix epoch SECONDS (integer)
 * because the schema uses `integer('created_at', { mode: 'timestamp' })`.
 * Drizzle converts Date objects to seconds when using gte/lte operators.
 * Raw SQL must use `unixepoch` without dividing by 1000.
 */

import { NextRequest, NextResponse } from 'next/server'
import { eq, and, gte, lte, desc, count, sum, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { transactions, transactionItems, products } from '@/lib/db/schema'
import { requireTenant, handleTenantError } from '@/lib/db/tenant'

type DashboardRange = 'today' | '7days' | '30days'

function getDateRange(range: DashboardRange) {
  const now = new Date()

  // End of today
  const to = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)

  let days: number
  switch (range) {
    case 'today':
      days = 1
      break
    case '7days':
      days = 7
      break
    case '30days':
      days = 30
      break
    default:
      days = 7
  }

  // Start of the period
  const from = new Date(to)
  from.setDate(from.getDate() - days + 1)
  from.setHours(0, 0, 0, 0)

  // Previous period of same length (for trend comparison)
  const prevTo = new Date(from.getTime() - 1) // 1ms before current period start
  const prevFrom = new Date(prevTo)
  prevFrom.setDate(prevFrom.getDate() - days + 1)
  prevFrom.setHours(0, 0, 0, 0)

  return { from, to, prevFrom, prevTo, days }
}

export async function GET(request: NextRequest) {
  try {
    const { storeId } = await requireTenant()
    const { searchParams } = new URL(request.url)
    const range = (searchParams.get('range') || '7days') as DashboardRange

    const { from, to, prevFrom, prevTo, days } = getDateRange(range)

    // =========================================================================
    // DEBUG: Log date range
    // =========================================================================
    console.log('[Dashboard API] ===========================')
    console.log('[Dashboard API] storeId:', storeId)
    console.log('[Dashboard API] range:', range)
    console.log('[Dashboard API] from:', from.toISOString())
    console.log('[Dashboard API] to:', to.toISOString())
    console.log('[Dashboard API] prevFrom:', prevFrom.toISOString())
    console.log('[Dashboard API] prevTo:', prevTo.toISOString())

    // =========================================================================
    // 1. KPI: Current period — Revenue + Transaction count
    //    status = 'COMPLETED' (uppercase, as stored in DB)
    // =========================================================================
    const [currentKpi] = await db
      .select({
        totalRevenue: sum(transactions.totalAmount),
        totalTransactions: count(),
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.storeId, storeId),
          eq(transactions.status, 'COMPLETED'),
          gte(transactions.createdAt, from),
          lte(transactions.createdAt, to),
        )
      )

    // =========================================================================
    // 2. KPI: Current period — Profit
    //    profit = SUM((unitPrice - costPrice) * quantity - discountAmount)
    // =========================================================================
    const [currentProfitResult] = await db
      .select({
        totalProfit: sql<number>`coalesce(sum(
          (${transactionItems.unitPrice} - ${transactionItems.costPrice}) * ${transactionItems.quantity} - ${transactionItems.discountAmount}
        ), 0)`,
      })
      .from(transactionItems)
      .innerJoin(transactions, eq(transactionItems.transactionId, transactions.id))
      .where(
        and(
          eq(transactions.storeId, storeId),
          eq(transactions.status, 'COMPLETED'),
          gte(transactions.createdAt, from),
          lte(transactions.createdAt, to),
        )
      )

    // =========================================================================
    // 3. KPI: Previous period (for trend % calculation)
    // =========================================================================
    const [prevKpi] = await db
      .select({
        totalRevenue: sum(transactions.totalAmount),
        totalTransactions: count(),
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.storeId, storeId),
          eq(transactions.status, 'COMPLETED'),
          gte(transactions.createdAt, prevFrom),
          lte(transactions.createdAt, prevTo),
        )
      )

    const [prevProfitResult] = await db
      .select({
        totalProfit: sql<number>`coalesce(sum(
          (${transactionItems.unitPrice} - ${transactionItems.costPrice}) * ${transactionItems.quantity} - ${transactionItems.discountAmount}
        ), 0)`,
      })
      .from(transactionItems)
      .innerJoin(transactions, eq(transactionItems.transactionId, transactions.id))
      .where(
        and(
          eq(transactions.storeId, storeId),
          eq(transactions.status, 'COMPLETED'),
          gte(transactions.createdAt, prevFrom),
          lte(transactions.createdAt, prevTo),
        )
      )

    // =========================================================================
    // 4. Active products count
    // =========================================================================
    const [activeProductsResult] = await db
      .select({ count: count() })
      .from(products)
      .where(
        and(
          eq(products.storeId, storeId),
          eq(products.isActive, true),
        )
      )

    // =========================================================================
    // 5. Sales Trend: GROUP BY DATE(createdAt)
    //
    //    createdAt is stored as Unix seconds in SQLite.
    //    SQLite date function: date(unix_seconds, 'unixepoch', 'localtime')
    //    DO NOT divide by 1000 — it's already in seconds.
    // =========================================================================
    const trendRevenue = await db
      .select({
        date: sql<string>`date(${transactions.createdAt}, 'unixepoch', 'localtime')`.as('trend_date'),
        revenue: sql<number>`coalesce(sum(${transactions.totalAmount}), 0)`,
        count: count(),
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.storeId, storeId),
          eq(transactions.status, 'COMPLETED'),
          gte(transactions.createdAt, from),
          lte(transactions.createdAt, to),
        )
      )
      .groupBy(sql`trend_date`)
      .orderBy(sql`trend_date`)

    const trendProfit = await db
      .select({
        date: sql<string>`date(${transactions.createdAt}, 'unixepoch', 'localtime')`.as('trend_date'),
        profit: sql<number>`coalesce(sum(
          (${transactionItems.unitPrice} - ${transactionItems.costPrice}) * ${transactionItems.quantity} - ${transactionItems.discountAmount}
        ), 0)`,
      })
      .from(transactionItems)
      .innerJoin(transactions, eq(transactionItems.transactionId, transactions.id))
      .where(
        and(
          eq(transactions.storeId, storeId),
          eq(transactions.status, 'COMPLETED'),
          gte(transactions.createdAt, from),
          lte(transactions.createdAt, to),
        )
      )
      .groupBy(sql`trend_date`)
      .orderBy(sql`trend_date`)

    // Build lookup maps from raw query results
    const revenueByDate = new Map<string, { revenue: number; count: number }>()
    for (const row of trendRevenue) {
      revenueByDate.set(row.date, { revenue: Number(row.revenue) || 0, count: row.count })
    }

    const profitByDate = new Map<string, number>()
    for (const row of trendProfit) {
      profitByDate.set(row.date, Number(row.profit) || 0)
    }

    // Fill all days in range (zero-fill missing days so chart is never flat/empty)
    const salesTrend: { date: string; revenue: number; transactions: number; profit: number }[] = []
    for (let i = 0; i < days; i++) {
      const d = new Date(from)
      d.setDate(d.getDate() + i)
      const dateStr = d.toISOString().slice(0, 10)

      const revData = revenueByDate.get(dateStr)
      salesTrend.push({
        date: dateStr,
        revenue: revData?.revenue ?? 0,
        transactions: revData?.count ?? 0,
        profit: profitByDate.get(dateStr) ?? 0,
      })
    }

    // =========================================================================
    // 6. Top Products: GROUP BY product, ORDER BY SUM(quantity) DESC
    // =========================================================================
    const topProductsRaw = await db
      .select({
        productId: transactionItems.productId,
        productName: transactionItems.productName,
        totalQty: sql<number>`coalesce(sum(${transactionItems.quantity}), 0)`,
        totalRevenue: sql<number>`coalesce(sum(${transactionItems.subtotal}), 0)`,
      })
      .from(transactionItems)
      .innerJoin(transactions, eq(transactionItems.transactionId, transactions.id))
      .where(
        and(
          eq(transactions.storeId, storeId),
          eq(transactions.status, 'COMPLETED'),
          gte(transactions.createdAt, from),
          lte(transactions.createdAt, to),
        )
      )
      .groupBy(transactionItems.productId, transactionItems.productName)
      .orderBy(desc(sql`sum(${transactionItems.quantity})`))
      .limit(5)

    const topProducts = topProductsRaw.map((p) => ({
      productId: p.productId,
      productName: p.productName,
      totalQty: Number(p.totalQty) || 0,
      totalRevenue: Number(p.totalRevenue) || 0,
    }))

    // =========================================================================
    // 7. Sparkline: last N days (max 7) for KPI cards
    // =========================================================================
    const sparkDays = Math.min(days, 7)
    const revenueSparkline: number[] = []
    const countSparkline: number[] = []
    const profitSparkline: number[] = []

    for (let i = sparkDays - 1; i >= 0; i--) {
      const d = new Date(to)
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().slice(0, 10)
      const revData = revenueByDate.get(dateStr)
      revenueSparkline.push(revData?.revenue ?? 0)
      countSparkline.push(revData?.count ?? 0)
      profitSparkline.push(profitByDate.get(dateStr) ?? 0)
    }

    // =========================================================================
    // 8. Compute trend percentages
    // =========================================================================
    const totalRevenue = Number(currentKpi.totalRevenue) || 0
    const totalTransactions = currentKpi.totalTransactions
    const totalProfit = Number(currentProfitResult.totalProfit) || 0
    const prevRevenue = Number(prevKpi.totalRevenue) || 0
    const prevTransactions = prevKpi.totalTransactions
    const prevProfit = Number(prevProfitResult.totalProfit) || 0

    const revenueTrend = prevRevenue > 0
      ? ((totalRevenue - prevRevenue) / prevRevenue) * 100
      : totalRevenue > 0 ? 100 : 0

    const transactionsTrend = prevTransactions > 0
      ? ((totalTransactions - prevTransactions) / prevTransactions) * 100
      : totalTransactions > 0 ? 100 : 0

    const profitTrend = prevProfit > 0
      ? ((totalProfit - prevProfit) / prevProfit) * 100
      : totalProfit > 0 ? 100 : 0

    // =========================================================================
    // DEBUG: Final output log
    // =========================================================================
    console.log('[Dashboard API] RESULTS:')
    console.log({
      totalRevenue,
      totalProfit,
      totalTransactions,
      trendCount: salesTrend.length,
      topProductsCount: topProducts.length,
      trendSample: salesTrend.slice(0, 3),
    })
    console.log('[Dashboard API] ===========================')

    // =========================================================================
    // Response
    // =========================================================================
    return NextResponse.json({
      kpi: {
        revenue: totalRevenue,
        transactions: totalTransactions,
        profit: totalProfit,
        activeProducts: activeProductsResult.count,
        revenueTrend,
        transactionsTrend,
        profitTrend,
        revenueSparkline,
        countSparkline,
        profitSparkline,
      },
      trend: salesTrend,
      topProducts,
    })
  } catch (error) {
    return handleTenantError(error)
  }
}
