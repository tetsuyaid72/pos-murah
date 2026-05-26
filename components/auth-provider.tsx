'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { useSettingsStore } from '@/stores/settings-store'
import { useSubscriptionStore } from '@/stores/subscription-store'
import { getUserAvatar } from '@/lib/avatar'

/**
 * AuthProvider â€” fetches /api/auth/me on mount and syncs auth data
 * to both the auth store and the settings store (for sidebar, receipts, etc.).
 * Also syncs server membership â†’ subscription store so server is always source of truth.
 *
 * Place this inside the dashboard layout so it runs on every dashboard page load.
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

  // Fetch auth state on mount
  useEffect(() => {
    fetchAuth()
  }, [fetchAuth])

  // Sync auth data â†’ settings store so sidebar/receipts/etc. stay in sync
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

  // Sync server membership â†’ subscription store (server is source of truth)
  useEffect(() => {
    if (isAuthenticated && membership) {
      syncFromServer(membership.plan, membership.isTrial, membership.trialEndAt, membership.subscriptionEndAt)
    }
  }, [isAuthenticated, membership, syncFromServer])

  // Users without an active trial/subscription should choose a package first.
  useEffect(() => {
    if (isLoading || !isAuthenticated || !membership || user?.role === 'SUPER_ADMIN') return

    const now = new Date()
    const isTrialActive = Boolean(
      membership.isTrial &&
      membership.trialEndAt &&
      new Date(membership.trialEndAt) > now
    )
    const isPaidActive = Boolean(
      !membership.isTrial &&
      membership.plan !== 'FREE' &&
      (!membership.subscriptionEndAt || new Date(membership.subscriptionEndAt) > now)
    )

    if (!isTrialActive && !isPaidActive) {
      router.replace('/pricing')
    }
  }, [isLoading, isAuthenticated, membership, user, router])

  return <>{children}</>
}

