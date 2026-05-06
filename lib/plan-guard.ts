/**
 * Server-Side Plan Enforcement
 *
 * Checks plan limits before allowing resource creation.
 * Used in API routes to enforce FREE plan restrictions.
 *
 * Usage:
 *   const check = await checkProductLimit(storeId)
 *   if (!check.allowed) return NextResponse.json({ error: check.message }, { status: 403 })
 */

import { eq, and, gte, count } from 'drizzle-orm'
import { db } from '@/lib/db'
import { memberships, products, transactions } from '@/lib/db/schema'
import { PLAN_LIMITS, type PlanType, type LimitKey } from '@/lib/features'

interface PlanCheckResult {
  allowed: boolean
  limit: number
  current: number
  message: string
  plan: PlanType
  isTrialActive: boolean
}

/**
 * Get the membership for a store from the database.
 */
async function getMembership(storeId: string) {
  const [membership] = await db
    .select()
    .from(memberships)
    .where(eq(memberships.storeId, storeId))
    .limit(1)

  return membership || null
}

/**
 * Check if the store's trial is still active.
 */
function checkTrialActive(membership: { isTrial: boolean; trialEndAt: Date }): boolean {
  if (!membership.isTrial) return false
  return new Date(membership.trialEndAt) > new Date()
}

/**
 * Get the effective limit for a store based on their plan and trial status.
 */
function getEffectiveLimit(
  membership: { plan: string; isTrial: boolean; trialEndAt: Date },
  limitKey: LimitKey
): number {
  // During active trial, unlimited
  if (checkTrialActive(membership)) {
    return 999999
  }

  const plan = membership.plan as PlanType
  return PLAN_LIMITS[limitKey][plan] ?? PLAN_LIMITS[limitKey].FREE
}

/**
 * Check if a store can add more products.
 */
export async function checkProductLimit(storeId: string): Promise<PlanCheckResult> {
  const membership = await getMembership(storeId)

  if (!membership) {
    // No membership record — treat as FREE with no trial
    return {
      allowed: false,
      limit: PLAN_LIMITS.max_products.FREE,
      current: 0,
      message: 'Membership tidak ditemukan. Silakan hubungi admin.',
      plan: 'FREE',
      isTrialActive: false,
    }
  }

  const isTrialActive = checkTrialActive(membership)
  const limit = getEffectiveLimit(membership, 'max_products')

  // Count current active products
  const [result] = await db
    .select({ count: count() })
    .from(products)
    .where(and(eq(products.storeId, storeId), eq(products.isActive, true)))

  const current = result?.count ?? 0

  if (current >= limit) {
    return {
      allowed: false,
      limit,
      current,
      message: `Batas produk tercapai (${current}/${limit}). Upgrade ke Pro untuk produk unlimited.`,
      plan: membership.plan as PlanType,
      isTrialActive,
    }
  }

  return {
    allowed: true,
    limit,
    current,
    message: '',
    plan: membership.plan as PlanType,
    isTrialActive,
  }
}

/**
 * Check if a store can create more transactions this month.
 */
export async function checkTransactionLimit(storeId: string): Promise<PlanCheckResult> {
  const membership = await getMembership(storeId)

  if (!membership) {
    return {
      allowed: false,
      limit: PLAN_LIMITS.max_transactions_monthly.FREE,
      current: 0,
      message: 'Membership tidak ditemukan. Silakan hubungi admin.',
      plan: 'FREE',
      isTrialActive: false,
    }
  }

  const isTrialActive = checkTrialActive(membership)
  const limit = getEffectiveLimit(membership, 'max_transactions_monthly')

  // Count transactions this month
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [result] = await db
    .select({ count: count() })
    .from(transactions)
    .where(
      and(
        eq(transactions.storeId, storeId),
        gte(transactions.createdAt, startOfMonth)
      )
    )

  const current = result?.count ?? 0

  if (current >= limit) {
    return {
      allowed: false,
      limit,
      current,
      message: `Batas transaksi bulanan tercapai (${current}/${limit}). Upgrade ke Pro untuk transaksi unlimited.`,
      plan: membership.plan as PlanType,
      isTrialActive,
    }
  }

  return {
    allowed: true,
    limit,
    current,
    message: '',
    plan: membership.plan as PlanType,
    isTrialActive,
  }
}

/**
 * Check if a store can access a boolean feature (export, reports, etc.).
 */
export async function checkFeatureAccess(
  storeId: string,
  feature: 'export_excel' | 'export_pdf' | 'advanced_reports' | 'multi_outlet'
): Promise<{ allowed: boolean; message: string; plan: PlanType }> {
  const membership = await getMembership(storeId)

  if (!membership) {
    return {
      allowed: false,
      message: 'Membership tidak ditemukan.',
      plan: 'FREE',
    }
  }

  // During active trial, all features enabled
  if (checkTrialActive(membership)) {
    return { allowed: true, message: '', plan: membership.plan as PlanType }
  }

  const { FEATURE_DEFAULTS } = await import('@/lib/features')
  const featureConfig = FEATURE_DEFAULTS[feature]
  const plan = membership.plan as PlanType
  const allowed = featureConfig?.[plan] === true

  if (!allowed) {
    const featureNames: Record<string, string> = {
      export_excel: 'Export Excel',
      export_pdf: 'Export PDF',
      advanced_reports: 'Laporan Lanjutan',
      multi_outlet: 'Multi-Toko',
    }
    return {
      allowed: false,
      message: `Fitur ${featureNames[feature] || feature} hanya tersedia di paket Pro. Upgrade sekarang!`,
      plan,
    }
  }

  return { allowed: true, message: '', plan }
}
