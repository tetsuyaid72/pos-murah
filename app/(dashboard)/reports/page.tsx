'use client'

import { useEffect, useState, useMemo } from 'react'
import { BarChart3, Lock } from 'lucide-react'
import { useTransactionStore } from '@/stores/transaction-store'
import { usePlanLimit } from '@/hooks/use-plan-limit'
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
  const { getResourceLimit, plan } = usePlanLimit()

  // Determine which periods are available based on plan
  const maxHistoryDays = getResourceLimit('report_history_days')

  // Fetch from database on mount
  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  // Filter transactions by period, capped by plan's report_history_days
  const filteredTransactions = useMemo(() => {
    if (period === 'all') {
      // 'all' is capped by maxHistoryDays
      if (maxHistoryDays >= 999999) return transactions
      const dates = new Set<string>()
      for (let i = 0; i < maxHistoryDays; i++) {
        dates.add(getDateStr(i))
      }
      return transactions.filter((t) => dates.has(t.createdAt.slice(0, 10)))
    }

    const days = period === '7days' ? 7 : 30
    const cappedDays = Math.min(days, maxHistoryDays)
    const dates = new Set<string>()
    for (let i = 0; i < cappedDays; i++) {
      dates.add(getDateStr(i))
    }

    return transactions.filter((t) => dates.has(t.createdAt.slice(0, 10)))
  }, [transactions, period, maxHistoryDays])

  // Period options with plan-based locking
  const periodOptions: { value: ReportPeriod; label: string; minDays: number; requiredPlan?: string }[] = [
    { value: '7days', label: '7 Hari', minDays: 7 },
    { value: '30days', label: '30 Hari', minDays: 30 },
    { value: 'all', label: 'Semua', minDays: 365, requiredPlan: 'PRO' },
  ]

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
                {maxHistoryDays < 999999 && (
                  <span className="ml-1 text-xs text-amber-600 dark:text-amber-400">
                    (Riwayat {maxHistoryDays} hari)
                  </span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              {/* Period selector */}
              <div className="flex rounded-xl border border-border/50 bg-muted/30 p-0.5">
                {periodOptions.map((opt) => {
                  const isLocked = opt.minDays > maxHistoryDays
                  return (
                    <button
                      key={opt.value}
                      onClick={() => !isLocked && setPeriod(opt.value)}
                      disabled={isLocked}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                        isLocked
                          ? 'text-muted-foreground/50 cursor-not-allowed'
                          : period === opt.value
                          ? 'bg-card text-foreground shadow-sm cursor-pointer'
                          : 'text-muted-foreground hover:text-foreground cursor-pointer'
                      }`}
                      title={isLocked ? `Upgrade ke ${opt.requiredPlan || 'Pro'} untuk akses riwayat lebih lama` : undefined}
                    >
                      <span className="flex items-center gap-1">
                        {opt.label}
                        {isLocked && <Lock className="h-3 w-3 text-amber-500" />}
                      </span>
                    </button>
                  )
                })}
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
