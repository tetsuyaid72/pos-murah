/**
 * Feature Flag System — Warung Madura POS
 *
 * Controls which features are available based on the store's plan.
 * Full paid model: BASIC / PRO / BUSINESS (no free tier).
 *
 * Usage:
 *   import { canAccess, PLAN_LIMITS } from '@/lib/features'
 *   if (canAccess(membership, 'export_excel')) { ... }
 */

export type PlanType = 'BASIC' | 'PRO' | 'BUSINESS' | 'ENTERPRISE'

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
    BASIC: 50,
    PRO: 150,
    BUSINESS: 999999,
    ENTERPRISE: 999999,
  },
  max_transactions_monthly: {
    BASIC: 300,
    PRO: 250,
    BUSINESS: 999999,
    ENTERPRISE: 999999,
  },
  max_cashiers: {
    BASIC: 1,
    PRO: 5,
    BUSINESS: 999999,
    ENTERPRISE: 999999,
  },
  max_customers: {
    BASIC: 50,
    PRO: 500,
    BUSINESS: 999999,
    ENTERPRISE: 999999,
  },
  report_history_days: {
    BASIC: 30,
    PRO: 365,
    BUSINESS: 999999,
    ENTERPRISE: 999999,
  },
  storage_mb: {
    BASIC: 100,
    PRO: 1024,
    BUSINESS: 10240,
    ENTERPRISE: 999999,
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
  max_products: { BASIC: 50, PRO: 150, BUSINESS: 999999, ENTERPRISE: 999999 },
  max_transactions_monthly: { BASIC: 300, PRO: 250, BUSINESS: 999999, ENTERPRISE: 999999 },
  max_cashiers: { BASIC: 1, PRO: 5, BUSINESS: 999999, ENTERPRISE: 999999 },
  max_customers: { BASIC: 50, PRO: 500, BUSINESS: 999999, ENTERPRISE: 999999 },
  report_history_days: { BASIC: 30, PRO: 365, BUSINESS: 999999, ENTERPRISE: 999999 },
  storage_mb: { BASIC: 100, PRO: 1024, BUSINESS: 10240, ENTERPRISE: 999999 },

  // =========================================================================
  // POS / KASIR
  // =========================================================================
  thermal_printer: { BASIC: true, PRO: true, BUSINESS: true, ENTERPRISE: true },
  barcode_scanner: { BASIC: true, PRO: true, BUSINESS: true, ENTERPRISE: true },
  custom_receipt_logo: { BASIC: true, PRO: true, BUSINESS: true, ENTERPRISE: true },
  auto_promo: { BASIC: false, PRO: true, BUSINESS: true, ENTERPRISE: true },
  voucher_coupon: { BASIC: false, PRO: true, BUSINESS: true, ENTERPRISE: true },
  multi_payment_split: { BASIC: false, PRO: false, BUSINESS: true, ENTERPRISE: true },

  // =========================================================================
  // PRODUK
  // =========================================================================
  bulk_import: { BASIC: false, PRO: true, BUSINESS: true, ENTERPRISE: true },
  product_variant: { BASIC: false, PRO: true, BUSINESS: true, ENTERPRISE: true },
  batch_price_update: { BASIC: false, PRO: false, BUSINESS: true, ENTERPRISE: true },

  // =========================================================================
  // PELANGGAN & HUTANG
  // =========================================================================
  customer_management: { BASIC: true, PRO: true, BUSINESS: true, ENTERPRISE: true },
  debt_tracking: { BASIC: true, PRO: true, BUSINESS: true, ENTERPRISE: true },
  debt_reminder_manual: { BASIC: true, PRO: true, BUSINESS: true, ENTERPRISE: true },
  wa_debt_reminder: { BASIC: false, PRO: true, BUSINESS: true, ENTERPRISE: true },
  loyalty_points: { BASIC: false, PRO: false, BUSINESS: true, ENTERPRISE: true },

  // =========================================================================
  // LAPORAN & ANALYTICS
  // =========================================================================
  basic_dashboard: { BASIC: true, PRO: true, BUSINESS: true, ENTERPRISE: true },
  profit_report: { BASIC: true, PRO: true, BUSINESS: true, ENTERPRISE: true },
  period_comparison: { BASIC: false, PRO: true, BUSINESS: true, ENTERPRISE: true },
  per_cashier_report: { BASIC: false, PRO: true, BUSINESS: true, ENTERPRISE: true },
  per_category_report: { BASIC: false, PRO: true, BUSINESS: true, ENTERPRISE: true },
  per_customer_report: { BASIC: false, PRO: false, BUSINESS: true, ENTERPRISE: true },
  advanced_reports: { BASIC: false, PRO: true, BUSINESS: true, ENTERPRISE: true },
  stock_prediction: { BASIC: false, PRO: false, BUSINESS: true, ENTERPRISE: true },
  peak_hour_analysis: { BASIC: false, PRO: false, BUSINESS: true, ENTERPRISE: true },
  export_excel: { BASIC: true, PRO: true, BUSINESS: true, ENTERPRISE: true },
  export_pdf: { BASIC: false, PRO: true, BUSINESS: true, ENTERPRISE: true },
  email_report: { BASIC: false, PRO: false, BUSINESS: true, ENTERPRISE: true },

  // =========================================================================
  // OPERASIONAL
  // =========================================================================
  shift_management: { BASIC: false, PRO: true, BUSINESS: true, ENTERPRISE: true },
  cash_flow: { BASIC: true, PRO: true, BUSINESS: true, ENTERPRISE: true },
  expense_tracking: { BASIC: true, PRO: true, BUSINESS: true, ENTERPRISE: true },
  multi_outlet: { BASIC: false, PRO: false, BUSINESS: true, ENTERPRISE: true },
  stock_transfer: { BASIC: false, PRO: false, BUSINESS: true, ENTERPRISE: true },
  multi_staff_role: { BASIC: false, PRO: false, BUSINESS: true, ENTERPRISE: true },

  // =========================================================================
  // INTEGRASI & TEKNIS
  // =========================================================================
  backup_restore: { BASIC: true, PRO: true, BUSINESS: true, ENTERPRISE: true },
  auto_backup: { BASIC: false, PRO: true, BUSINESS: true, ENTERPRISE: true },
  wa_notification: { BASIC: false, PRO: true, BUSINESS: true, ENTERPRISE: true },
  api_access: { BASIC: false, PRO: false, BUSINESS: true, ENTERPRISE: true },
  webhook: { BASIC: false, PRO: false, BUSINESS: true, ENTERPRISE: true },
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

  // Fall back to plan defaults
  const planDefaults = FEATURE_DEFAULTS[feature]
  if (!planDefaults) return false

  return planDefaults[membership.plan] ?? false
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

  return PLAN_LIMITS[limitKey][membership.plan]
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
