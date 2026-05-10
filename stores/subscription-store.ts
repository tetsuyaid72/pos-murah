import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { BillingPeriod } from '@/lib/pricing'

export type Plan = 'basic' | 'pro' | 'business'
export type PaymentStatus = 'none' | 'pending' | 'approved'

interface PendingPaymentSummary {
  plan: Plan
  method: 'bank' | 'qris'
  amount: number
  submittedAt: string
}

interface SubscriptionState {
  plan: Plan | null // null = no active subscription
  billingPeriod: BillingPeriod
  paymentStatus: PaymentStatus
  paymentDate: string | null // ISO string
  pendingPaymentSummary: PendingPaymentSummary | null
}

interface SubscriptionActions {
  submitPayment: (summary?: { plan: Plan; method: 'bank' | 'qris'; amount: number }) => void
  setBillingPeriod: (period: BillingPeriod) => void
  resetSubscription: () => void
  /**
   * Sync local subscription state with server membership.
   * Server is always the source of truth for plan status.
   *
   * @param serverPlan - The plan from server (e.g. 'BASIC', 'PRO', 'BUSINESS')
   * @param isTrial - Whether the membership is still in trial mode (not yet paid)
   * @param trialEndAt - Trial end date (if trial is expired and isTrial=true, user hasn't paid)
   */
  syncFromServer: (serverPlan: string, isTrial?: boolean, trialEndAt?: string | null) => void
}

function normalizePlan(serverPlan: string): Plan | null {
  switch (serverPlan.toUpperCase()) {
    case 'BASIC': return 'basic'
    case 'PRO': return 'pro'
    case 'BUSINESS': return 'business'
    case 'ENTERPRISE': return 'business' // Map enterprise to business for UI
    default: return null
  }
}

function getPlanRank(plan: Plan | null): number {
  switch (plan) {
    case 'basic': return 1
    case 'pro': return 2
    case 'business': return 3
    default: return 0
  }
}

export const useSubscriptionStore = create<SubscriptionState & SubscriptionActions>()(
  persist(
    (set, get) => ({
      plan: null,
      billingPeriod: 'monthly',
      paymentStatus: 'none',
      paymentDate: null,
      pendingPaymentSummary: null,

      submitPayment: (summary) => {
        const submittedAt = new Date().toISOString()
        set({
          paymentStatus: 'pending',
          paymentDate: submittedAt,
          pendingPaymentSummary: summary
            ? {
                ...summary,
                submittedAt,
              }
            : null,
        })
      },

      setBillingPeriod: (period: BillingPeriod) => {
        set({ billingPeriod: period })
      },

      syncFromServer: (serverPlan: string, isTrial?: boolean, trialEndAt?: string | null) => {
        const { paymentStatus, pendingPaymentSummary } = get()
        const normalizedPlan = normalizePlan(serverPlan)

        // Trial memberships are not paid subscriptions, even while active.
        const isTrialExpired = isTrial && trialEndAt && new Date(trialEndAt) <= new Date()
        const isTrialActive = isTrial && !isTrialExpired

        if (isTrialActive) {
          set({
            plan: normalizedPlan,
            paymentStatus,
          })
          return
        }

        // If user is upgrading to a higher tier and server is still on the old tier,
        // keep pending until the server plan catches up with the requested target.
        if (
          pendingPaymentSummary &&
          paymentStatus === 'pending' &&
          getPlanRank(pendingPaymentSummary.plan) > getPlanRank(normalizedPlan)
        ) {
          set({
            plan: normalizedPlan,
            paymentStatus: 'pending',
          })
          return
        }

        // If user has a plan and is not in trial mode, treat it as paid/approved.
        if (normalizedPlan && !isTrialExpired) {
          set({
            plan: normalizedPlan,
            paymentStatus: 'approved',
            pendingPaymentSummary: null,
          })
          return
        }

        // If trial is expired (user hasn't paid), keep pending state if they submitted payment
        if (isTrialExpired && paymentStatus === 'pending') {
          set({ plan: normalizedPlan })
          return
        }

        // Trial expired and no pending payment → user needs to pay
        if (isTrialExpired) {
          set({
            plan: normalizedPlan,
            paymentStatus: 'none',
          })
          return
        }

        // Default: no active plan
        set({
          plan: null,
          paymentStatus: 'none',
          pendingPaymentSummary: null,
        })
      },

      resetSubscription: () => {
        set({
          plan: null,
          billingPeriod: 'monthly',
          paymentStatus: 'none',
          paymentDate: null,
          pendingPaymentSummary: null,
        })
      },
    }),
    {
      name: 'pos-subscription',
    }
  )
)
