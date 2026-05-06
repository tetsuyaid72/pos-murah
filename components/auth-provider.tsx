'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { useSettingsStore } from '@/stores/settings-store'
import { useSubscriptionStore } from '@/stores/subscription-store'

/**
 * AuthProvider — fetches /api/auth/me on mount and syncs auth data
 * to both the auth store and the settings store (for sidebar, receipts, etc.).
 * Also syncs server membership → subscription store so server is always source of truth.
 *
 * Place this inside the dashboard layout so it runs on every dashboard page load.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { fetchAuth, user, store, membership, isAuthenticated } = useAuthStore()
  const { setUserName, setUserEmail, setUserAvatar, setStoreName } = useSettingsStore()
  const { syncFromServer } = useSubscriptionStore()

  // Fetch auth state on mount
  useEffect(() => {
    fetchAuth()
  }, [fetchAuth])

  // Sync auth data → settings store so sidebar/receipts/etc. stay in sync
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

  // Sync server membership → subscription store (server is source of truth)
  useEffect(() => {
    if (isAuthenticated && membership) {
      syncFromServer(membership.plan)
    }
  }, [isAuthenticated, membership, syncFromServer])

  return <>{children}</>
}
