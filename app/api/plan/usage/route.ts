/**
 * GET /api/plan/usage
 *
 * Returns current resource usage and plan limits for the authenticated store.
 * Used by the frontend to display usage indicators, progress bars, and
 * near-limit warnings.
 */

import { NextResponse } from 'next/server'
import { eq, and, gte, count } from 'drizzle-orm'
import { db } from '@/lib/db'
import { memberships, products, transactions, customers } from '@/lib/db/schema'
import { requireTenant, handleTenantError } from '@/lib/db/tenant'
import { PLAN_LIMITS, TRIAL_LIMITS, FEATURE_DEFAULTS, normalizePlanType } from '@/lib/features'

export async function GET() {
  try {
    const { storeId } = await requireTenant()

    // Get membership
    const [membership] = await db
      .select({
        plan: memberships.plan,
        isTrial: memberships.isTrial,
        trialEndAt: memberships.trialEndAt,
        subscriptionEndAt: memberships.subscriptionEndAt,
      })
      .from(memberships)
      .where(eq(memberships.storeId, storeId))
      .limit(1)

    if (!membership) {
      return NextResponse.json(
        { error: 'Membership tidak ditemukan' },
        { status: 404 }
      )
    }

    const plan = normalizePlanType(membership.plan)
    const isTrialActive = membership.isTrial && new Date(membership.trialEndAt) > new Date()
    const isTrialExpired = membership.isTrial && new Date(membership.trialEndAt) <= new Date()
    const isSubscriptionExpired = plan === 'PRO' && membership.subscriptionEndAt && new Date(membership.subscriptionEndAt) <= new Date()

    const effectiveLimit = (key: keyof typeof PLAN_LIMITS) => {
      if (isTrialActive) {
        if (key === 'max_products') return TRIAL_LIMITS.max_products
        if (key === 'max_transactions_monthly') return TRIAL_LIMITS.max_transactions_monthly
        if (key === 'max_customers') return TRIAL_LIMITS.max_customers
      }

      if (isTrialExpired || isSubscriptionExpired) return 0

      return PLAN_LIMITS[key][plan]
    }

    const percentage = (current: number, limit: number) => {
      if (limit <= 0) return current > 0 ? 100 : 0
      return Math.min(100, Math.round((current / limit) * 100))
    }

    // Count current usage in parallel
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    const [productsResult, transactionsResult, customersResult] = await Promise.all([
      db
        .select({ count: count() })
        .from(products)
        .where(and(eq(products.storeId, storeId), eq(products.isActive, true))),
      db
        .select({ count: count() })
        .from(transactions)
        .where(
          and(
            eq(transactions.storeId, storeId),
            gte(transactions.createdAt, startOfDay)
          )
        ),
      db
        .select({ count: count() })
        .from(customers)
        .where(eq(customers.storeId, storeId)),
    ])

    const usage = {
      products: {
        current: productsResult[0]?.count ?? 0,
        limit: effectiveLimit('max_products'),
        percentage: percentage(productsResult[0]?.count ?? 0, effectiveLimit('max_products')),
      },
      transactions: {
        current: transactionsResult[0]?.count ?? 0,
        limit: effectiveLimit('max_transactions_monthly'),
        percentage: percentage(transactionsResult[0]?.count ?? 0, effectiveLimit('max_transactions_monthly')),
        periodLabel: 'hari ini',
      },
      customers: {
        current: customersResult[0]?.count ?? 0,
        limit: effectiveLimit('max_customers'),
        percentage: percentage(customersResult[0]?.count ?? 0, effectiveLimit('max_customers')),
      },
      cashiers: {
        limit: effectiveLimit('max_cashiers'),
      },
      storage: {
        limit: effectiveLimit('storage_mb'),
      },
      reportHistoryDays: effectiveLimit('report_history_days'),
    }

    // Determine which features are accessible for this plan
    const featureAccess: Record<string, boolean> = {}
    const featureKeys = [
      'export_pdf', 'export_excel', 'advanced_reports', 'auto_promo',
      'voucher_coupon', 'bulk_import', 'product_variant', 'shift_management',
      'multi_outlet', 'wa_notification', 'wa_debt_reminder', 'auto_backup',
      'loyalty_points', 'stock_prediction', 'peak_hour_analysis',
      'multi_payment_split', 'batch_price_update', 'api_access',
      'per_cashier_report', 'per_category_report', 'per_customer_report',
      'period_comparison', 'email_report', 'stock_transfer', 'multi_staff_role',
    ]

    for (const key of featureKeys) {
      if (isTrialActive) {
        featureAccess[key] = true
      } else if (isTrialExpired || isSubscriptionExpired) {
        featureAccess[key] = false
      } else {
        const config = FEATURE_DEFAULTS[key]
        featureAccess[key] = plan === 'BUSINESS' || config?.[plan] === true
      }
    }

    // Near-limit warnings (>= 80% usage)
    const warnings: string[] = []
    if (isTrialExpired) {
      warnings.push('Masa Trial Anda telah berakhir. Upgrade paket untuk melanjutkan.')
    } else if (isSubscriptionExpired) {
      warnings.push('Langganan Pro Anda telah berakhir. Perpanjang paket untuk melanjutkan.')
    } else {
      if (usage.products.percentage >= 80) {
        warnings.push(`Produk hampir penuh (${usage.products.current}/${usage.products.limit})`)
      }
      if (usage.transactions.percentage >= 80) {
        warnings.push(`Transaksi hari ini hampir penuh (${usage.transactions.current}/${usage.transactions.limit})`)
      }
      if (usage.customers.percentage >= 80) {
        warnings.push(`Pelanggan hampir penuh (${usage.customers.current}/${usage.customers.limit})`)
      }
    }

    return NextResponse.json({
      plan,
      isTrialActive,
      isTrialExpired,
      isSubscriptionExpired,
      usage,
      featureAccess,
      warnings,
    })
  } catch (error) {
    return handleTenantError(error)
  }
}
