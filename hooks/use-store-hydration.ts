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
const persistedStores = [
  useCartStore,
  useSettingsStore,
]

export function useStoreHydration(): boolean {
  const [hydrated, setHydrated] = useState(() =>
    persistedStores.every((store) => store.persist.hasHydrated())
  )

  useEffect(() => {
    if (hydrated) return

    // Subscribe to each store's onFinishHydration
    const unsubscribes = persistedStores.map((store) =>
      store.persist.onFinishHydration(() => {
        const nowReady = persistedStores.every((s) => s.persist.hasHydrated())
        if (nowReady) {
          setHydrated(true)
        }
      })
    )

    return () => {
      unsubscribes.forEach((unsub) => unsub())
    }
  }, [hydrated])

  return hydrated
}
