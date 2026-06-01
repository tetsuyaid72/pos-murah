'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { useSettingsStore } from '@/stores/settings-store'
import { useSubscriptionStore } from '@/stores/subscription-store'
import { getUserAvatar } from '@/lib/avatar'

/**
 * Check if this user's membership is currently active (trial or paid).
 */
function isMembershipActive(membership: {
  plan: string
  isTrial: boolean
  trialEndAt: string | null
  subscriptionStartAt?: string | null
  subscriptionEndAt?: string | null
}): boolean {
  const now = new Date()

  // Active trial
  if (membership.isTrial && membership.trialEndAt && new Date(membership.trialEndAt) > now) {
    return true
  }

  // Active paid plan (non-trial, non-FREE)
  if (!membership.isTrial && membership.plan !== 'FREE') {
    // Lifetime plans have no subscriptionEndAt
    if (!membership.subscriptionEndAt) return true
    // Monthly plans - check if not expired
    if (new Date(membership.subscriptionEndAt) > now) return true
  }

  return false
}

/**
 * AuthProvider - fetches /api/auth/me on mount and syncs auth data
 * to both the auth store and the settings store (for sidebar, receipts, etc.).
 * Also syncs server membership -> subscription store so server is always source of truth.
 *
 * When membership is not active, it checks the server for recent PAID payments
 * (Midtrans webhook may have processed it) and retries a few times before
 * redirecting to /pricing. This eliminates the race condition where the
 * webhook fires after the user is already redirected back from Midtrans.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { fetchAuth, user, store, membership, isAuthenticated, isLoading } = useAuthStore()
  const {
    setUserName,
    setUserEmail,
    setUserAvatar,
    setStoreName,
    setStoreAddress,
    setStorePhone,
    setStoreLogo,
  } = useSettingsStore()
  const { syncFromServer } = useSubscriptionStore()
  const retryCountRef = useRef(0)
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Fetch auth state on mount
  useEffect(() => {
    fetchAuth()
  }, [fetchAuth])

  // Sync auth data -> settings store so sidebar/receipts/etc. stay in sync
  useEffect(() => {
    if (isAuthenticated && user) {
      setUserName(user.name)
      setUserEmail(user.email)
      setUserAvatar(getUserAvatar(user))
    }
  }, [isAuthenticated, user, setUserName, setUserEmail, setUserAvatar])

  useEffect(() => {
    if (isAuthenticated && store) {
      setStoreName(store.name)
      setStoreAddress(store.address || '')
      setStorePhone(store.phone || '')
      setStoreLogo(store.logoUrl || null)
    }
  }, [isAuthenticated, store, setStoreName, setStoreAddress, setStorePhone, setStoreLogo])

  // Sync server membership -> subscription store (server is source of truth)
  useEffect(() => {
    if (isAuthenticated && membership) {
      syncFromServer(membership.plan, membership.isTrial, membership.trialEndAt, membership.subscriptionEndAt)
    }
  }, [isAuthenticated, membership, syncFromServer])

  /**
   * Ask the server to check & sync payment status.
   * If there's a PAID Midtrans payment whose membership hasn't been activated,
   * the server will activate it and return the updated membership.
   * Returns true if membership is now active after the sync.
   */
  const syncPaymentStatus = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch('/api/plan/sync', { method: 'POST' })
      if (!res.ok) return false
      const data = await res.json()
      if (data.activated) {
        // Membership was activated server-side - re-fetch auth to pick up the change
        await fetchAuth()
        return true
      }
      return false
    } catch {
      return false
    }
  }, [fetchAuth])

  // Users without an active trial/subscription should choose a package first.
  // However, we retry a few times in case the Midtrans webhook is still being processed.
  useEffect(() => {
    if (isLoading || !isAuthenticated || !membership || user?.role === 'SUPER_ADMIN') return

    if (isMembershipActive(membership)) {
      // Membership is active - reset retry counter and stay on dashboard
      retryCountRef.current = 0
      return
    }

    // Membership is not active - could be webhook delay.
    // Try syncing payment status with the server a few times before redirecting.
    const MAX_RETRIES = 3
    const RETRY_DELAY_MS = 3000 // 3 seconds between retries

    if (retryCountRef.current < MAX_RETRIES) {
      retryCountRef.current += 1
      retryTimerRef.current = setTimeout(async () => {
        const activated = await syncPaymentStatus()
        if (!activated) {
          // Re-fetch auth to check if webhook updated membership in the meantime
          await fetchAuth()
        }
      }, RETRY_DELAY_MS)
      return
    }

    // All retries exhausted - redirect to pricing
    router.replace('/pricing')
  }, [isLoading, isAuthenticated, membership, user, router, syncPaymentStatus, fetchAuth])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current)
    }
  }, [])

  return <>{children}</>
}
