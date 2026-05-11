'use client'

import { useEffect, useState, useMemo } from 'react'
import { Calendar, Menu, Receipt, Search } from 'lucide-react'
import { useTransactionStore } from '@/stores/transaction-store'
import { useUIStore } from '@/stores/ui-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { TransactionTable } from '@/components/transactions/transaction-table'
import { TransactionMobileCard } from '@/components/transactions/transaction-mobile-card'
import type { PaymentMethod } from '@/types'

export default function DemoTransactionsPage() {
  const { transactions, isLoading, fetchTransactions } = useTransactionStore()
  const { setSidebarOpen } = useUIStore()
  const [search, setSearch] = useState('')
  const [filterPayment, setFilterPayment] = useState<PaymentMethod | 'all'>('all')
  const [filterDate, setFilterDate] = useState('')

  const formatDateLabel = (value: string) => {
    if (!value) return 'Tanggal'
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(value))
  }

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
      <div className="block min-h-screen overflow-x-hidden bg-background md:hidden">
        <div className="flex items-center justify-between px-4 pt-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-[26px] font-bold tracking-tight">Transaksi</h1>
              <p className="text-sm text-muted-foreground">
                {transactions.length} transaksi tercatat
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2 px-4 pt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari invoice atau produk..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 rounded-2xl pl-10 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Select
              value={filterPayment}
              onChange={(e) => setFilterPayment(e.target.value as PaymentMethod | 'all')}
              className="h-11 rounded-2xl border bg-background px-4 text-sm font-medium text-foreground shadow-sm"
            >
              <option value="all">Semua Metode</option>
              <option value="cash">Tunai</option>
              <option value="qris">QRIS</option>
              <option value="debt">Hutang</option>
            </Select>
            <div className="relative h-11">
              <button
                type="button"
                className="flex h-11 w-full items-center justify-between rounded-2xl border bg-background px-4 text-sm font-medium text-foreground shadow-sm"
              >
                <span className={filterDate ? 'text-foreground' : 'text-muted-foreground'}>
                  {filterDate ? formatDateLabel(filterDate) : 'Tanggal'}
                </span>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </button>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2 px-4 pt-4 pb-24">
          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-center">
              <p className="text-sm text-muted-foreground">Memuat transaksi...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-4 pt-10 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                <Receipt className="h-7 w-7 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-base font-semibold">
                Belum ada transaksi
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Transaksi kasir akan muncul di sini.
              </p>
            </div>
          ) : (
            filtered.map((transaction) => (
              <TransactionMobileCard
                key={transaction.id}
                transaction={transaction}
                href={`/demo/transactions/${transaction.id}`}
              />
            ))
          )}
        </div>
      </div>

      <div className="hidden h-full flex-col md:flex">
        <div className="border-b px-4 py-4 md:px-6">
          <h1 className="text-2xl font-bold">Transaksi</h1>
          <p className="text-sm text-muted-foreground">
            {transactions.length} transaksi tercatat
          </p>
        </div>

        <div className="flex flex-col gap-3 border-b px-4 py-3 sm:flex-row sm:items-center md:px-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari invoice atau produk..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

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

          <Input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-full sm:w-44"
          />
        </div>

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
    </div>
  )
}
