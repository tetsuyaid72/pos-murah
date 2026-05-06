'use client'

import { createContext, useContext, useEffect } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { useSettingsStore } from '@/stores/settings-store'

interface DemoContextValue {
  isDemo: boolean
}

const DemoContext = createContext<DemoContextValue>({ isDemo: false })

export function useDemo() {
  return useContext(DemoContext)
}

/**
 * DemoProvider — sets up fake auth state and settings for demo mode.
 * No API calls are made; everything is in-memory.
 */
export function DemoProvider({ children }: { children: React.ReactNode }) {
  const { setAuth } = useAuthStore()
  const { setStoreName, setUserName, setUserEmail } = useSettingsStore()

  useEffect(() => {
    // Set fake auth data so sidebar/topbar render correctly
    setAuth({
      user: {
        id: 'demo-user',
        name: 'Demo User',
        email: 'demo@warungmadura.pos',
        role: 'OWNER',
        avatarUrl: null,
      },
      store: {
        id: 'demo-store',
        name: 'Warung Madura Demo',
        address: 'Jl. Contoh No. 123, Jakarta',
        phone: '08123456789',
        logoUrl: null,
      },
      membership: {
        plan: 'PRO',
        isTrial: false,
        trialEndAt: null,
      },
    })

    // Sync to settings store
    setStoreName('Warung Madura Demo')
    setUserName('Demo User')
    setUserEmail('demo@warungmadura.pos')
  }, [setAuth, setStoreName, setUserName, setUserEmail])

  return (
    <DemoContext.Provider value={{ isDemo: true }}>
      {children}
    </DemoContext.Provider>
  )
}
