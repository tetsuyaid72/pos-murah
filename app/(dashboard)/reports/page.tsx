'use client'

import { useEffect, useState, useMemo } from 'react'
import { BarChart3 } from 'lucide-react'
import { useTransactionStore } from '@/stores/transaction-store'
import { ReportSummary } from '@/components/reports/report-summary'
import { ReportTable } from '@/components/reports/report-table'
import { ExportCSV } from '@/components/reports/export-csv'

type ReportPeriod = '7days' | '30days' | 'all'

function getDateStr(daysAgo: number): string {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return d.toISOString().slice(0, 10)
}

export default function ReportsPage() {
  const { transactions, fetchTransactions } = useTransactionStore()
  const [period, setPeriod] = useState<ReportPeriod>('30days')

  // Fetch from database on mount
  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  // Filter transactions by period
  const filteredTransactions = useMemo(() => {
    if (period === 'all') return transactions

    const days = period === '7days' ? 7 : 30
    const dates = new Set<string>()
    for (let i = 0; i < days; i++) {
      dates.add(getDateStr(i))
    }

    return transactions.filter((t) => dates.has(t.createdAt.slice(0, 10)))
  }, [transactions, period])

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1400px] space-y-6 p-5 md:p-8 lg:p-10">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-500/10">
                  <BarChart3 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  Laporan
                </h1>
              </div>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Ringkasan penjualan dan performa toko
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              {/* Period selector */}
              <div className="flex rounded-xl border border-border/50 bg-muted/30 p-0.5">
                {([
                  { value: '7days', label: '7 Hari' },
                  { value: '30days', label: '30 Hari' },
                  { value: 'all', label: 'Semua' },
                ] as const).map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setPeriod(opt.value)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 cursor-pointer ${
                      period === opt.value
                        ? 'bg-card text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <ExportCSV transactions={filteredTransactions} />
            </div>
          </div>

          {/* KPI Summary Cards */}
          <ReportSummary transactions={filteredTransactions} />

          {/* Daily Summary Table */}
          <div>
            <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Ringkasan Harian
            </h2>
            <ReportTable transactions={filteredTransactions} />
          </div>
        </div>
      </div>
    </div>
  )
}
