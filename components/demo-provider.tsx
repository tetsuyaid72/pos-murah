'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useAuthStore } from '@/stores/auth-store'
import { useSettingsStore } from '@/stores/settings-store'
import { Button } from '@/components/ui/button'
import { Dialog, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog'
import { ShoppingBag, ArrowRight } from 'lucide-react'

/** Maximum number of demo transactions before showing CTA */
const DEMO_TRANSACTION_LIMIT = 5

interface DemoContextValue {
  isDemo: boolean
  /** Number of demo transactions created in this session */
  demoTransactionCount: number
  /** Whether the demo transaction limit has been reached */
  isDemoLimitReached: boolean
  /** Increment the demo transaction counter. Returns false if limit reached. */
  recordDemoTransaction: () => boolean
}

const DemoContext = createContext<DemoContextValue>({
  isDemo: false,
  demoTransactionCount: 0,
  isDemoLimitReached: false,
  recordDemoTransaction: () => true,
})

export function useDemo() {
  return useContext(DemoContext)
}

/**
 * DemoProvider — sets up fake auth state and settings for demo mode.
 * No API calls are made; everything is in-memory.
 * Tracks demo transaction count and shows CTA when limit is reached.
 */
export function DemoProvider({ children }: { children: React.ReactNode }) {
  const { setAuth } = useAuthStore()
  const { setStoreName, setUserName, setUserEmail } = useSettingsStore()
  const [demoTransactionCount, setDemoTransactionCount] = useState(0)
  const [showLimitModal, setShowLimitModal] = useState(false)

  const isDemoLimitReached = demoTransactionCount >= DEMO_TRANSACTION_LIMIT

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

  const recordDemoTransaction = useCallback(() => {
    if (demoTransactionCount >= DEMO_TRANSACTION_LIMIT) {
      setShowLimitModal(true)
      return false
    }
    setDemoTransactionCount((prev) => {
      const next = prev + 1
      if (next >= DEMO_TRANSACTION_LIMIT) {
        setShowLimitModal(true)
      }
      return next
    })
    return true
  }, [demoTransactionCount])

  return (
    <DemoContext.Provider
      value={{
        isDemo: true,
        demoTransactionCount,
        isDemoLimitReached,
        recordDemoTransaction,
      }}
    >
      {children}

      {/* Demo limit reached modal */}
      <Dialog open={showLimitModal} onClose={() => setShowLimitModal(false)}>
        <DialogHeader>
          <DialogTitle>
            <span className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-amber-500" />
              Batas Demo Tercapai
            </span>
          </DialogTitle>
          <DialogClose onClose={() => setShowLimitModal(false)} />
        </DialogHeader>

        <p className="text-sm text-muted-foreground mb-5">
          Anda telah mencoba {DEMO_TRANSACTION_LIMIT} transaksi demo. Untuk melanjutkan menggunakan
          semua fitur POS, silakan daftar dan pilih paket berlangganan.
        </p>

        <div className="rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 p-4 mb-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
            Mulai dari
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-foreground">Rp 50.000</span>
                          <span className="text-sm text-muted-foreground">akses selamanya</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Semua fitur dasar POS termasuk cetak struk, export Excel, dan backup data.
          </p>
        </div>

        <div className="flex flex-col gap-2.5">
          <Link href="/register">
            <Button variant="premium" size="lg" className="w-full">
              Daftar & Berlangganan
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="lg"
            className="w-full text-muted-foreground"
            onClick={() => setShowLimitModal(false)}
          >
            Lanjut Lihat-lihat
          </Button>
        </div>
      </Dialog>
    </DemoContext.Provider>
  )
}
