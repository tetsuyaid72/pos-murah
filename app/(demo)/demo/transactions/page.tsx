'use client'

import { useEffect, useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import { useTransactionStore } from '@/stores/transaction-store'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { TransactionTable } from '@/components/transactions/transaction-table'
import type { PaymentMethod } from '@/types'

export default function DemoTransactionsPage() {
  const { transactions, isLoading, fetchTransactions } = useTransactionStore()
  const [search, setSearch] = useState('')
  const [filterPayment, setFilterPayment] = useState<PaymentMethod | 'all'>('all')
  const [filterDate, setFilterDate] = useState('')

  // Fetch from demo API
  useEffect(() => {
    const originalFetch = window.fetch
    const demoFetch: typeof fetch = (input, init) => {
      if (typeof input === 'string' && input.startsWith('/api/transactions')) {
        return originalFetch(input.replace('/api/transactions', '/api/demo/transactions'), init)
      }
      return originalFetch(input, init)
    }
    window.fetch = demoFetch

    fetchTransactions()

    return () => {
      window.fetch = originalFetch
    }
  }, [fetchTransactions])

  // Filter transactions (client-side for instant UX)
  const filtered = useMemo(() => {
    return transactions.filter((trx) => {
      const matchesSearch =
        !search ||
        trx.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
        trx.items.some((i) =>
          i.productName.toLowerCase().includes(search.toLowerCase())
        )

      const matchesPayment =
        filterPayment === 'all' || trx.paymentMethod === filterPayment

      const matchesDate =
        !filterDate || trx.createdAt.startsWith(filterDate)

      return matchesSearch && matchesPayment && matchesDate
    })
  }, [transactions, search, filterPayment, filterDate])

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b px-4 py-4 md:px-6">
        <h1 className="text-2xl font-bold">Transaksi</h1>
        <p className="text-sm text-muted-foreground">
          {transactions.length} transaksi tercatat
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 border-b px-4 py-3 sm:flex-row sm:items-center md:px-6">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari invoice atau produk..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Payment filter */}
        <Select
          value={filterPayment}
          onChange={(e) => setFilterPayment(e.target.value as PaymentMethod | 'all')}
          className="w-full sm:w-40"
        >
          <option value="all">Semua Metode</option>
          <option value="cash">Tunai</option>
          <option value="qris">QRIS</option>
          <option value="debt">Hutang</option>
        </Select>

        {/* Date filter */}
        <Input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="w-full sm:w-44"
        />
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-sm text-muted-foreground">Memuat transaksi...</p>
          </div>
        ) : (
          <TransactionTable transactions={filtered} />
        )}
      </div>
    </div>
  )
}
