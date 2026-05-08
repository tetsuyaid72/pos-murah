'use client'

import { useMemo } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import {
  canAccess,
  getLimit,
  isTrialActive,
  isTrialExpired,
  getTrialDaysRemaining,
  type PlanType,
  type FeatureKey,
  type LimitKey,
  type MembershipInfo,
} from '@/lib/features'

interface PlanLimitResult {
  /** Current plan type */
  plan: PlanType
  /** Whether trial is currently active */
  isTrial: boolean
  /** Whether trial has expired */
  trialExpired: boolean
  /** Days remaining in trial (0 if not on trial or expired) */
  trialDaysRemaining: number
  /** Check if a feature is accessible */
  canUse: (feature: FeatureKey) => boolean | number
  /** Get the numeric limit for a resource */
  getResourceLimit: (limitKey: LimitKey) => number
  /** Whether the user is on a limited (free) plan with expired trial */
  isLimited: boolean
  /** Membership info for passing to canAccess() */
  membershipInfo: MembershipInfo | null
}

/**
 * Client-side hook for checking plan limits and feature access.
 *
 * Uses the membership data from auth-store (synced from server via AuthProvider).
 *
 * Usage:
 *   const { canUse, isLimited, plan, trialDaysRemaining } = usePlanLimit()
 *   if (!canUse('export_excel')) { showUpgradeModal() }
 */
export function usePlanLimit(): PlanLimitResult {
  const { membership } = useAuthStore()

  return useMemo(() => {
    if (!membership) {
      // No membership data yet (loading or not authenticated)
      return {
        plan: 'FREE' as PlanType,
        isTrial: false,
        trialExpired: false,
        trialDaysRemaining: 0,
        canUse: () => false,
        getResourceLimit: () => 0,
        isLimited: true,
        membershipInfo: null,
      }
    }

    const membershipInfo: MembershipInfo = {
      plan: membership.plan as PlanType,
      isTrial: membership.isTrial,
      trialEndAt: membership.trialEndAt || new Date().toISOString(),
    }

    const trialActive = isTrialActive(membershipInfo)
    const trialExp = isTrialExpired(membershipInfo)
    const daysRemaining = getTrialDaysRemaining(membershipInfo)

    // User is limited if they're on BASIC plan and trial has expired
    const isLimited = membership.plan === 'BASIC' && !trialActive

    return {
      plan: membership.plan as PlanType,
      isTrial: trialActive,
      trialExpired: trialExp,
      trialDaysRemaining: daysRemaining,
      canUse: (feature: FeatureKey) => canAccess(membershipInfo, feature),
      getResourceLimit: (limitKey: LimitKey) => getLimit(membershipInfo, limitKey),
      isLimited,
      membershipInfo,
    }
  }, [membership])
}
