import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { BillingPeriod } from '@/lib/pricing'

export type Plan = 'basic' | 'pro' | 'business'
export type PaymentStatus = 'none' | 'pending' | 'approved'

interface SubscriptionState {
  plan: Plan | null // null = no active subscription
  billingPeriod: BillingPeriod
  paymentStatus: PaymentStatus
  paymentDate: string | null // ISO string
}

interface SubscriptionActions {
  submitPayment: () => void
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

export const useSubscriptionStore = create<SubscriptionState & SubscriptionActions>()(
  persist(
    (set, get) => ({
      plan: null,
      billingPeriod: 'monthly',
      paymentStatus: 'none',
      paymentDate: null,

      submitPayment: () => {
        set({
          paymentStatus: 'pending',
          paymentDate: new Date().toISOString(),
        })
      },

      setBillingPeriod: (period: BillingPeriod) => {
        set({ billingPeriod: period })
      },

      syncFromServer: (serverPlan: string, isTrial?: boolean, trialEndAt?: string | null) => {
        const { paymentStatus } = get()
        const normalizedPlan = normalizePlan(serverPlan)

        // Check if trial is expired (user registered but hasn't paid yet)
        const isTrialExpired = isTrial && trialEndAt && new Date(trialEndAt) <= new Date()

        // If user has a plan AND is not in expired trial → payment is approved (paid user)
        if (normalizedPlan && !isTrialExpired) {
          set({
            plan: normalizedPlan,
            paymentStatus: 'approved',
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
        })
      },

      resetSubscription: () => {
        set({
          plan: null,
          billingPeriod: 'monthly',
          paymentStatus: 'none',
          paymentDate: null,
        })
      },
    }),
    {
      name: 'pos-subscription',
    }
  )
)
