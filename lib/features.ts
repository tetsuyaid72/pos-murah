/**
 * Feature Flag System — Warung Madura POS
 *
 * Controls which features are available based on the store's plan.
 * Full paid model: FREE / PRO / BUSINESS (no free tier).
 *
 * Usage:
 *   import { canAccess, PLAN_LIMITS } from '@/lib/features'
 *   if (canAccess(membership, 'export_excel')) { ... }
 */

export type PlanType = 'FREE' | 'PRO' | 'BUSINESS'

export function normalizePlanType(plan: string | null | undefined): PlanType {
  const normalized = String(plan || 'FREE').toUpperCase()
  if (normalized === 'PRO') return 'PRO'
  if (normalized === 'BUSINESS') return 'BUSINESS'
  return 'FREE'
}

export const QUICK_TRIAL_LIMITS = {
  max_products: 15,
  max_transactions_monthly: 5,
  max_customers: 5,
} as const

/**
 * Numeric plan limits (for countable resources).
 */
export const PLAN_LIMITS = {
  max_products: {
    FREE: 50,
    PRO: 200,
    BUSINESS: 999999,
  },
  max_transactions_monthly: {
    FREE: 300,
    PRO: 500,
    BUSINESS: 999999,
  },
  max_cashiers: {
    FREE: 1,
    PRO: 5,
    BUSINESS: 999999,
  },
  max_customers: {
    FREE: 50,
    PRO: 100,
    BUSINESS: 999999,
  },
  report_history_days: {
    FREE: 30,
    PRO: 365,
    BUSINESS: 999999,
  },
  storage_mb: {
    FREE: 100,
    PRO: 1024,
    BUSINESS: 10240,
  },
} as const satisfies Record<string, Record<PlanType, number>>

export type LimitKey = keyof typeof PLAN_LIMITS

/**
 * Feature definitions with default access per plan.
 * true = enabled, false = disabled
 */
export const FEATURE_DEFAULTS: Record<string, Record<PlanType, boolean | number>> = {
  // =========================================================================
  // LIMITS (numeric)
  // =========================================================================
  max_products: { FREE: 50, PRO: 200, BUSINESS: 999999 },
  max_transactions_monthly: { FREE: 300, PRO: 500, BUSINESS: 999999 },
  max_cashiers: { FREE: 1, PRO: 5, BUSINESS: 999999 },
  max_customers: { FREE: 50, PRO: 100, BUSINESS: 999999 },
  report_history_days: { FREE: 30, PRO: 365, BUSINESS: 999999 },
  storage_mb: { FREE: 100, PRO: 1024, BUSINESS: 10240 },

  // =========================================================================
  // POS / KASIR
  // =========================================================================
  thermal_printer: { FREE: true, PRO: true, BUSINESS: true },
  barcode_scanner: { FREE: true, PRO: true, BUSINESS: true },
  custom_receipt_logo: { FREE: true, PRO: true, BUSINESS: true },
  auto_promo: { FREE: false, PRO: true, BUSINESS: true },
  voucher_coupon: { FREE: false, PRO: true, BUSINESS: true },
  multi_payment_split: { FREE: false, PRO: false, BUSINESS: true },

  // =========================================================================
  // PRODUK
  // =========================================================================
  bulk_import: { FREE: false, PRO: true, BUSINESS: true },
  product_variant: { FREE: false, PRO: true, BUSINESS: true },
  batch_price_update: { FREE: false, PRO: false, BUSINESS: true },

  // =========================================================================
  // PELANGGAN & HUTANG
  // =========================================================================
  customer_management: { FREE: true, PRO: true, BUSINESS: true },
  debt_tracking: { FREE: true, PRO: true, BUSINESS: true },
  debt_reminder_manual: { FREE: true, PRO: true, BUSINESS: true },
  wa_debt_reminder: { FREE: false, PRO: true, BUSINESS: true },
  loyalty_points: { FREE: false, PRO: false, BUSINESS: true },

  // =========================================================================
  // LAPORAN & ANALYTICS
  // =========================================================================
  dashboard_summary: { FREE: true, PRO: true, BUSINESS: true },
  profit_report: { FREE: true, PRO: true, BUSINESS: true },
  period_comparison: { FREE: false, PRO: true, BUSINESS: true },
  per_cashier_report: { FREE: false, PRO: true, BUSINESS: true },
  per_category_report: { FREE: false, PRO: true, BUSINESS: true },
  per_customer_report: { FREE: false, PRO: false, BUSINESS: true },
  advanced_reports: { FREE: false, PRO: true, BUSINESS: true },
  stock_prediction: { FREE: false, PRO: false, BUSINESS: true },
  peak_hour_analysis: { FREE: false, PRO: false, BUSINESS: true },
  export_excel: { FREE: true, PRO: true, BUSINESS: true },
  export_pdf: { FREE: false, PRO: true, BUSINESS: true },
  email_report: { FREE: false, PRO: false, BUSINESS: true },

  // =========================================================================
  // OPERASIONAL
  // =========================================================================
  shift_management: { FREE: false, PRO: true, BUSINESS: true },
  cash_flow: { FREE: true, PRO: true, BUSINESS: true },
  expense_tracking: { FREE: true, PRO: true, BUSINESS: true },
  multi_outlet: { FREE: false, PRO: false, BUSINESS: true },
  stock_transfer: { FREE: false, PRO: false, BUSINESS: true },
  multi_staff_role: { FREE: false, PRO: false, BUSINESS: true },

  // =========================================================================
  // INTEGRASI & TEKNIS
  // =========================================================================
  backup_restore: { FREE: true, PRO: true, BUSINESS: true },
  auto_backup: { FREE: false, PRO: true, BUSINESS: true },
  wa_notification: { FREE: false, PRO: true, BUSINESS: true },
  api_access: { FREE: false, PRO: false, BUSINESS: true },
  webhook: { FREE: false, PRO: false, BUSINESS: true },
}

/** All feature keys */
export type FeatureKey = keyof typeof FEATURE_DEFAULTS

/**
 * Membership info needed for feature checks.
 */
export interface MembershipInfo {
  plan: PlanType
  isTrial: boolean
  trialEndAt: Date | string
  features?: Record<string, boolean | number> // Per-store overrides
}

/**
 * Check if a store can access a feature based on their plan.
 *
 * During active trial, ALL features are enabled regardless of plan.
 * After trial expires, features are determined by plan + per-store overrides.
 */
export function canAccess(
  membership: MembershipInfo,
  feature: FeatureKey
): boolean | number {
  // During active trial, features are enabled, but countable resources keep quick-trial limits.
  if (membership.isTrial) {
    const trialEnd = new Date(membership.trialEndAt)
    if (trialEnd > new Date()) {
      if (feature === 'max_products') return QUICK_TRIAL_LIMITS.max_products
      if (feature === 'max_transactions_monthly') return QUICK_TRIAL_LIMITS.max_transactions_monthly
      if (feature === 'max_customers') return QUICK_TRIAL_LIMITS.max_customers
      const defaultValue = FEATURE_DEFAULTS[feature]?.BUSINESS
      if (typeof defaultValue === 'number') return defaultValue
      return true
    }

    return false
  }

  // Check per-store override first
  if (membership.features && feature in membership.features) {
    return membership.features[feature]
  }

  // Business users get full feature access by default.
  const normalizedPlan = normalizePlanType(membership.plan)
  if (normalizedPlan === 'BUSINESS') {
    const defaultValue = FEATURE_DEFAULTS[feature]?.[normalizedPlan]
    return typeof defaultValue === 'number' ? defaultValue : true
  }

  // Fall back to plan defaults
  const planDefaults = FEATURE_DEFAULTS[feature]
  if (!planDefaults) return false

  return planDefaults[normalizedPlan] ?? false
}

/**
 * Get the numeric limit for a countable resource.
 * Returns the limit number (999999 = unlimited).
 */
export function getLimit(
  membership: MembershipInfo,
  limitKey: LimitKey
): number {
  if (membership.isTrial) {
    const trialEnd = new Date(membership.trialEndAt)
    if (trialEnd > new Date()) {
      if (limitKey === 'max_products') return QUICK_TRIAL_LIMITS.max_products
      if (limitKey === 'max_transactions_monthly') return QUICK_TRIAL_LIMITS.max_transactions_monthly
      if (limitKey === 'max_customers') return QUICK_TRIAL_LIMITS.max_customers
    }

    return 0
  }

  return PLAN_LIMITS[limitKey][normalizePlanType(membership.plan)]
}

/**
 * Check if a trial has expired.
 */
export function isTrialExpired(membership: MembershipInfo): boolean {
  if (!membership.isTrial) return false
  const trialEnd = new Date(membership.trialEndAt)
  return trialEnd <= new Date()
}

/**
 * Check if trial is currently active (not expired).
 */
export function isTrialActive(membership: MembershipInfo): boolean {
  if (!membership.isTrial) return false
  const trialEnd = new Date(membership.trialEndAt)
  return trialEnd > new Date()
}

/**
 * Get remaining trial days.
 */
export function getTrialDaysRemaining(membership: MembershipInfo): number {
  if (!membership.isTrial) return 0
  const trialEnd = new Date(membership.trialEndAt)
  const now = new Date()
  const diff = trialEnd.getTime() - now.getTime()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

