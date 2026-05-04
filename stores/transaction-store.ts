import { create } from 'zustand'
import type { Transaction } from '@/types'

function normalizeTransaction(t: Record<string, any>): Transaction {
  return {
    ...t,
    paymentMethod: (t.paymentMethod || 'cash').toLowerCase(),
    status: (t.status || 'completed').toLowerCase(),
    discountType: (t.discountType || 'fixed').toLowerCase(),
  } as Transaction
}

interface TransactionState {
  transactions: Transaction[]
  isLoading: boolean
  error: string | null
}

interface TransactionActions {
  fetchTransactions: (params?: { from?: string; to?: string; status?: string }) => Promise<void>
  addTransaction: (transaction: Transaction) => void
  getTransactionsByDate: (date: string) => Transaction[]
  getTodayTransactions: () => Transaction[]
  getTodayRevenue: () => number
  getTodayProfit: () => number
}

export const useTransactionStore = create<TransactionState & TransactionActions>()(
  (set, get) => ({
    transactions: [],
    isLoading: false,
    error: null,

    fetchTransactions: async (params) => {
      set({ isLoading: true, error: null })
      try {
        const searchParams = new URLSearchParams()
        if (params?.from) searchParams.set('from', params.from)
        if (params?.to) searchParams.set('to', params.to)
        if (params?.status) searchParams.set('status', params.status)
        searchParams.set('limit', '100')

        const res = await fetch(`/api/transactions?${searchParams.toString()}`)
        if (!res.ok) throw new Error('Gagal memuat transaksi')
        const data = await res.json()
        const normalized = data.transactions.map(normalizeTransaction)
        set({ transactions: normalized, isLoading: false })
      } catch (err) {
        set({ error: (err as Error).message, isLoading: false })
      }
    },

    addTransaction: (transaction) => {
      set((state) => ({
        transactions: [transaction, ...state.transactions],
      }))
    },

    getTransactionsByDate: (date: string) => {
      return get().transactions.filter((t) => t.createdAt.startsWith(date))
    },

    getTodayTransactions: () => {
      const today = new Date().toISOString().slice(0, 10)
      return get().getTransactionsByDate(today)
    },

    getTodayRevenue: () => {
      return get()
        .getTodayTransactions()
        .filter((t) => t.status === 'completed')
        .reduce((sum, t) => sum + t.totalAmount, 0)
    },

    getTodayProfit: () => {
      return get()
        .getTodayTransactions()
        .filter((t) => t.status === 'completed')
        .reduce((sum, t) => {
          return sum + t.items.reduce(
            (is, item) => is + (item.unitPrice - item.costPrice) * item.quantity - item.discountAmount,
            0
          )
        }, 0)
    },
  })
)
