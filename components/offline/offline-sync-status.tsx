'use client'

import { useCallback, useEffect, useState } from 'react'
import { CloudOff, RefreshCw, Wifi } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  getPendingOfflineTransactions,
  syncPendingOfflineTransactions,
  type PendingOfflineTransaction,
} from '@/lib/offline-transactions'

export function OfflineSyncStatus() {
  const [mounted, setMounted] = useState(false)
  const [online, setOnline] = useState(true)
  const [pending, setPending] = useState<PendingOfflineTransaction[]>([])
  const [syncing, setSyncing] = useState(false)

  const refreshPending = useCallback(() => {
    setPending(getPendingOfflineTransactions())
  }, [])

  const syncNow = useCallback(async () => {
    if (syncing || (typeof navigator !== 'undefined' && !navigator.onLine)) return
    setSyncing(true)
    try {
      await syncPendingOfflineTransactions()
      refreshPending()
    } finally {
      setSyncing(false)
    }
  }, [refreshPending, syncing])

  useEffect(() => {
    const hydrateStatus = () => {
      setMounted(true)
      setOnline(navigator.onLine)
      refreshPending()
    }
    const timer = window.setTimeout(hydrateStatus, 0)
    const updateOnline = () => setOnline(navigator.onLine)

    window.addEventListener('online', updateOnline)
    window.addEventListener('offline', updateOnline)
    window.addEventListener('offline-transactions-changed', refreshPending)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('online', updateOnline)
      window.removeEventListener('offline', updateOnline)
      window.removeEventListener('offline-transactions-changed', refreshPending)
    }
  }, [refreshPending])

  useEffect(() => {
    if (online && pending.length > 0) {
      const timer = window.setTimeout(() => {
        syncNow()
      }, 0)
      return () => window.clearTimeout(timer)
    }
  }, [online, pending.length, syncNow])

  if (!mounted || (online && pending.length === 0)) return null

  return (
    <div className="fixed bottom-20 left-1/2 z-[80] w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 md:bottom-5 md:left-auto md:right-5 md:translate-x-0">
      <div
        className={cn(
          'flex items-center justify-between gap-3 rounded-2xl border px-3 py-2 shadow-xl backdrop-blur',
          online
            ? 'border-amber-200 bg-amber-50/95 text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/15 dark:text-amber-100'
            : 'border-rose-200 bg-rose-50/95 text-rose-900 dark:border-rose-500/20 dark:bg-rose-500/15 dark:text-rose-100'
        )}
      >
        <div className="flex min-w-0 items-center gap-2">
          {online ? <Wifi className="h-4 w-4 shrink-0" /> : <CloudOff className="h-4 w-4 shrink-0" />}
          <div className="min-w-0">
            <p className="truncate text-xs font-bold">
              {online ? 'Sinkron transaksi pending' : 'Mode offline aktif'}
            </p>
            <p className="truncate text-[11px] opacity-80">
              {pending.length} transaksi belum tersinkron
            </p>
          </div>
        </div>
        {online && pending.length > 0 && (
          <Button size="sm" variant="outline" className="h-8 shrink-0 rounded-xl bg-background/70" onClick={syncNow} disabled={syncing}>
            <RefreshCw className={cn('h-3.5 w-3.5', syncing && 'animate-spin')} />
            Sync
          </Button>
        )}
      </div>
    </div>
  )
}
