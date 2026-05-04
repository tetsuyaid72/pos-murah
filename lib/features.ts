/**
 * Feature Flag System
 *
 * Controls which features are available based on the store's plan.
 * During Phase 1 (free trial), all features are enabled.
 *
 * Usage:
 *   import { canAccess, FEATURES } from '@/lib/features'
 *   if (canAccess(membership, 'export_excel')) { ... }
 */

export type PlanType = 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE'

/**
 * Feature definitions with default access per plan.
 * true = enabled, false = disabled, number = limit
 */
export const FEATURE_DEFAULTS: Record<string, Record<PlanType, boolean | number>> = {
  // Product management
  max_products: {
    FREE: 999999,      // Unlimited during trial
    STARTER: 100,
    PRO: 999999,
    ENTERPRISE: 999999,
  },
  // Transaction features
  export_excel: {
    FREE: true,        // All enabled during trial
    STARTER: true,
    PRO: true,
    ENTERPRISE: true,
  },
  export_pdf: {
    FREE: true,
    STARTER: false,
    PRO: true,
    ENTERPRISE: true,
  },
  // Multi-outlet (future)
  multi_outlet: {
    FREE: false,
    STARTER: false,
    PRO: true,
    ENTERPRISE: true,
  },
  // Thermal printer
  thermal_printer: {
    FREE: true,
    STARTER: true,
    PRO: true,
    ENTERPRISE: true,
  },
  // Reports
  advanced_reports: {
    FREE: true,
    STARTER: false,
    PRO: true,
    ENTERPRISE: true,
  },
  // Customer management
  customer_management: {
    FREE: true,
    STARTER: true,
    PRO: true,
    ENTERPRISE: true,
  },
  // Debt tracking
  debt_tracking: {
    FREE: true,
    STARTER: true,
    PRO: true,
    ENTERPRISE: true,
  },
}

/** All feature keys */
export type FeatureKey = keyof typeof FEATURE_DEFAULTS

/**
 * Membership info needed for feature checks.
 */
interface MembershipInfo {
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
  // During active trial, everything is enabled
  if (membership.isTrial) {
    const trialEnd = new Date(membership.trialEndAt)
    if (trialEnd > new Date()) {
      // Trial is still active — all features enabled
      const defaultValue = FEATURE_DEFAULTS[feature]?.FREE
      // For numeric limits, return unlimited during trial
      if (typeof defaultValue === 'number') return 999999
      return true
    }
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
 * Check if a trial has expired.
 */
export function isTrialExpired(membership: MembershipInfo): boolean {
  if (!membership.isTrial) return false
  const trialEnd = new Date(membership.trialEndAt)
  return trialEnd <= new Date()
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
