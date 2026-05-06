import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Plan = 'free' | 'pro'
export type PaymentStatus = 'none' | 'pending' | 'approved'

interface SubscriptionState {
  plan: Plan
  paymentStatus: PaymentStatus
  paymentDate: string | null // ISO string
}

interface SubscriptionActions {
  submitPayment: () => void
  resetSubscription: () => void
  /**
   * Sync local subscription state with server membership.
   * Server is always the source of truth for plan status.
   * Only keeps local paymentStatus for pending payment tracking.
   */
  syncFromServer: (serverPlan: string, serverPaymentStatus?: PaymentStatus) => void
}

export const useSubscriptionStore = create<SubscriptionState & SubscriptionActions>()(
  persist(
    (set, get) => ({
      plan: 'free',
      paymentStatus: 'none',
      paymentDate: null,

      submitPayment: () => {
        set({
          paymentStatus: 'pending',
          paymentDate: new Date().toISOString(),
        })
      },

      syncFromServer: (serverPlan: string, serverPaymentStatus?: PaymentStatus) => {
        const { paymentStatus } = get()

        // Server plan is always the source of truth
        const normalizedPlan: Plan = serverPlan === 'PRO' ? 'pro' : 'free'

        // If server says PRO, payment is approved (admin approved it)
        if (normalizedPlan === 'pro') {
          set({
            plan: 'pro',
            paymentStatus: 'approved',
          })
          return
        }

        // If server says FREE but we have a pending payment, keep pending state
        // (user submitted payment, waiting for admin approval)
        if (paymentStatus === 'pending') {
          set({
            plan: 'free',
            // Keep paymentStatus as 'pending'
          })
          return
        }

        // Default: server says FREE, no pending payment
        set({
          plan: 'free',
          paymentStatus: serverPaymentStatus || 'none',
        })
      },

      resetSubscription: () => {
        set({
          plan: 'free',
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
