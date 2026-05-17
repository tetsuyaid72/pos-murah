import type { Transaction } from '@/types'

export type PendingOfflineTransaction = {
  id: string
  payload: Record<string, unknown>
  receiptTransaction: Transaction
  createdAt: string
  attempts: number
  lastError?: string
}

const STORAGE_KEY = 'pos-pending-offline-transactions'

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

export function getPendingOfflineTransactions(): PendingOfflineTransaction[] {
  if (!canUseStorage()) return []

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function savePendingOfflineTransactions(items: PendingOfflineTransaction[]) {
  if (!canUseStorage()) return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  window.dispatchEvent(new Event('offline-transactions-changed'))
}

export function queueOfflineTransaction(transaction: Omit<PendingOfflineTransaction, 'attempts'>) {
  const pending = getPendingOfflineTransactions()
  savePendingOfflineTransactions([{ ...transaction, attempts: 0 }, ...pending])
}

export function removeOfflineTransaction(id: string) {
  savePendingOfflineTransactions(getPendingOfflineTransactions().filter((item) => item.id !== id))
}

export function updateOfflineTransaction(id: string, patch: Partial<PendingOfflineTransaction>) {
  savePendingOfflineTransactions(
    getPendingOfflineTransactions().map((item) => (item.id === id ? { ...item, ...patch } : item))
  )
}

export async function syncPendingOfflineTransactions() {
  const pending = getPendingOfflineTransactions()
  let synced = 0

  for (const item of pending) {
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item.payload),
      })

      if (!res.ok) {
        const message = await res.text()
        updateOfflineTransaction(item.id, {
          attempts: item.attempts + 1,
          lastError: message || 'Gagal sinkron transaksi',
        })
        continue
      }

      removeOfflineTransaction(item.id)
      synced += 1
    } catch (error) {
      updateOfflineTransaction(item.id, {
        attempts: item.attempts + 1,
        lastError: error instanceof Error ? error.message : 'Gagal sinkron transaksi',
      })
    }
  }

  return synced
}
