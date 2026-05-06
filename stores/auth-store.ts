import { create } from 'zustand'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: string
  avatarUrl: string | null
}

export interface AuthStore {
  id: string
  name: string
  address: string | null
  phone: string | null
  logoUrl: string | null
}

export interface AuthMembership {
  plan: string
  isTrial: boolean
  trialEndAt: string | null
}

interface AuthState {
  user: AuthUser | null
  store: AuthStore | null
  membership: AuthMembership | null
  isLoading: boolean
  isAuthenticated: boolean
}

interface AuthActions {
  setAuth: (data: { user: AuthUser; store: AuthStore | null; membership: AuthMembership | null }) => void
  clearAuth: () => void
  setLoading: (loading: boolean) => void
  fetchAuth: () => Promise<void>
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState & AuthActions>()((set) => ({
  user: null,
  store: null,
  membership: null,
  isLoading: true,
  isAuthenticated: false,

  setAuth: (data) =>
    set({
      user: data.user,
      store: data.store,
      membership: data.membership,
      isAuthenticated: true,
      isLoading: false,
    }),

  clearAuth: () =>
    set({
      user: null,
      store: null,
      membership: null,
      isAuthenticated: false,
      isLoading: false,
    }),

  setLoading: (loading) => set({ isLoading: loading }),

  fetchAuth: async () => {
    try {
      set({ isLoading: true })
      const res = await fetch('/api/auth/me')
      if (!res.ok) {
        set({ user: null, store: null, membership: null, isAuthenticated: false, isLoading: false })
        return
      }
      const data = await res.json()
      set({
        user: data.user,
        store: data.store,
        membership: data.membership,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch {
      set({ user: null, store: null, membership: null, isAuthenticated: false, isLoading: false })
    }
  },

  logout: async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {
      // Ignore network errors — clear local state regardless
    }
    // Clear persisted settings so next user doesn't see stale data
    if (typeof window !== 'undefined') {
      localStorage.removeItem('pos-settings')
      localStorage.removeItem('pos-subscription')
      localStorage.removeItem('pos-upgrade-popup-dismissed')
    }
    set({
      user: null,
      store: null,
      membership: null,
      isAuthenticated: false,
      isLoading: false,
    })
    window.location.href = '/login'
  },
}))
