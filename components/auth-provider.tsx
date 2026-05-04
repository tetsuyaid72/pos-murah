'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { useSettingsStore } from '@/stores/settings-store'

/**
 * AuthProvider — fetches /api/auth/me on mount and syncs auth data
 * to both the auth store and the settings store (for sidebar, receipts, etc.).
 *
 * Place this inside the dashboard layout so it runs on every dashboard page load.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { fetchAuth, user, store, isAuthenticated } = useAuthStore()
  const { setUserName, setUserEmail, setUserAvatar, setStoreName } = useSettingsStore()

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

  return <>{children}</>
}
