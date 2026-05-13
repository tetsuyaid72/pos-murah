'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { useSettingsStore } from '@/stores/settings-store'
import { useSubscriptionStore } from '@/stores/subscription-store'

/**
 * AuthProvider â€” fetches /api/auth/me on mount and syncs auth data
 * to both the auth store and the settings store (for sidebar, receipts, etc.).
 * Also syncs server membership â†’ subscription store so server is always source of truth.
 *
 * Place this inside the dashboard layout so it runs on every dashboard page load.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { fetchAuth, user, store, membership, isAuthenticated, isLoading } = useAuthStore()
  const { setUserName, setUserEmail, setUserAvatar, setStoreName } = useSettingsStore()
  const { syncFromServer, paymentStatus } = useSubscriptionStore()

  // Fetch auth state on mount
  useEffect(() => {
    fetchAuth()
  }, [fetchAuth])

  // Sync auth data â†’ settings store so sidebar/receipts/etc. stay in sync
  useEffect(() => {
    if (isAuthenticated && user) {
      setUserName(user.name)
      setUserEmail(user.email)
      setUserAvatar(user.avatarUrl ?? null)
    }
  }, [isAuthenticated, user, setUserName, setUserEmail, setUserAvatar])

  useEffect(() => {
    if (isAuthenticated && store) {
      setStoreName(store.name)
    }
  }, [isAuthenticated, store, setStoreName])

  // Sync server membership â†’ subscription store (server is source of truth)
  useEffect(() => {
    if (isAuthenticated && membership) {
      syncFromServer(membership.plan, membership.isTrial, membership.trialEndAt)
    }
  }, [isAuthenticated, membership, syncFromServer])

  // Guard: redirect unpaid users to /pricing
  // If trial is expired (isTrial=true, trialEndAt <= now) and payment is not approved,
  // the user hasn't paid yet and must choose a plan.
  // SUPER_ADMIN is exempt from this check.
  useEffect(() => {
    if (isLoading || !isAuthenticated || !membership) return

    // SUPER_ADMIN never gets redirected to /pricing
    if (user?.role === 'SUPER_ADMIN') return

    const isTrialExpired =
      membership.isTrial &&
      membership.trialEndAt &&
      new Date(membership.trialEndAt) <= new Date()

    // Only redirect if trial is expired and user hasn't paid
    if (isTrialExpired && paymentStatus !== 'approved' && paymentStatus !== 'pending') {
      // Avoid redirect loop â€” don't redirect if already on /pricing
      if (pathname !== '/pricing') {
        router.replace('/pricing')
      }
    }
  }, [isLoading, isAuthenticated, user, membership, paymentStatus, pathname, router])

  return <>{children}</>
}

