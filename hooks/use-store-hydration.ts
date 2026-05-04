'use client'

import { useEffect, useState } from 'react'
import { useCartStore } from '@/stores/cart-store'
import { useSettingsStore } from '@/stores/settings-store'

/**
 * Returns true once all persisted Zustand stores have finished
 * rehydrating from localStorage. Use this to prevent hydration
 * mismatches between server-rendered (empty) and client (persisted) state.
 *
 * Note: useProductStore and useTransactionStore are NOT persisted
 * (they fetch from the database), so they're excluded from hydration checks.
 */
export function useStoreHydration(): boolean {
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const stores = [
      useCartStore,
      useSettingsStore,
    ]

    // Check if all stores have already hydrated (synchronous path)
    const allReady = stores.every((store) => store.persist.hasHydrated())
    if (allReady) {
      setHydrated(true)
      return
    }

    // Otherwise, subscribe to each store's onFinishHydration
    const unsubscribes = stores.map((store) =>
      store.persist.onFinishHydration(() => {
        const nowReady = stores.every((s) => s.persist.hasHydrated())
        if (nowReady) {
          setHydrated(true)
        }
      })
    )

    return () => {
      unsubscribes.forEach((unsub) => unsub())
    }
  }, [])

  return hydrated
}
