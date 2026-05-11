'use client'

import { useEffect, useState, useMemo } from 'react'
import { BarChart3, DollarSign, Lock, Menu, ShoppingCart, TrendingUp } from 'lucide-react'
import { useTransactionStore } from '@/stores/transaction-store'
import { useUIStore } from '@/stores/ui-store'
import { usePlanLimit } from '@/hooks/use-plan-limit'
import { ReportSummary } from '@/components/reports/report-summary'
import { ReportTable } from '@/components/reports/report-table'
import { ExportCSV } from '@/components/reports/export-csv'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatDate, formatNumber, formatRupiah } from '@/lib/format'

type ReportPeriod = '7days' | '30days' | 'all'

function getDateStr(daysAgo: number): string {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return d.toISOString().slice(0, 10)
}

export default function ReportsPage() {
  const { transactions, fetchTransactions } = useTransactionStore()
  const [period, setPeriod] = useState<ReportPeriod>('30days')
  const [mobilePeriodVisual, setMobilePeriodVisual] = useState<'today' | '7days' | '30days' | 'all'>('30days')
  const { getResourceLimit } = usePlanLimit()
  const { setSidebarOpen } = useUIStore()

  // Determine which periods are available based on plan
  const maxHistoryDays = getResourceLimit('report_history_days')

  // Fetch from database on mount
  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  useEffect(() => {
    if (period === '30days') setMobilePeriodVisual('30days')
    else if (period === 'all') setMobilePeriodVisual('all')
  }, [period])

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

  const completedTransactions = useMemo(
    () => filteredTransactions.filter((t) => t.status === 'completed'),
    [filteredTransactions]
  )

  const mobileStats = useMemo(() => {
    const revenue = completedTransactions.reduce((sum, t) => sum + t.totalAmount, 0)
    const profit = completedTransactions.reduce((sum, t) => {
      return (
        sum +
        t.items.reduce(
          (itemSum, item) =>
            itemSum +
            (item.unitPrice - item.costPrice) * item.quantity -
            item.discountAmount,
          0
        )
      )
    }, 0)
    const count = completedTransactions.length

    return { revenue, profit, count }
  }, [completedTransactions])

  const dailySummaries = useMemo(() => {
    const grouped = new Map<string, typeof completedTransactions>()
    for (const trx of completedTransactions) {
      const date = trx.createdAt.slice(0, 10)
      if (!grouped.has(date)) grouped.set(date, [])
      grouped.get(date)!.push(trx)
    }

    const summaries = Array.from(grouped.entries()).map(([date, trxs]) => {
      const revenue = trxs.reduce((sum, t) => sum + t.totalAmount, 0)
      const profit = trxs.reduce((sum, t) => {
        return (
          sum +
          t.items.reduce(
            (itemSum, item) =>
              itemSum +
              (item.unitPrice - item.costPrice) * item.quantity -
              item.discountAmount,
            0
          )
        )
      }, 0)

      return {
        date,
        transactionCount: trxs.length,
        revenue,
        profit,
      }
    })

    summaries.sort((a, b) => b.date.localeCompare(a.date))
    return summaries
  }, [completedTransactions])

  // Period options with plan-based locking
  const periodOptions: { value: ReportPeriod; label: string; minDays: number; requiredPlan?: string }[] = [
    { value: '7days', label: '7 Hari', minDays: 7 },
    { value: '30days', label: '30 Hari', minDays: 30 },
    { value: 'all', label: 'Semua', minDays: 365, requiredPlan: 'PRO' },
  ]

  const mobilePeriodOptions: {
    value: ReportPeriod
    visual: 'today' | '7days' | '30days' | 'all'
    label: string
    minDays: number
    requiredPlan?: string
  }[] = [
    { value: '7days', visual: 'today', label: 'Hari Ini', minDays: 1 },
    { value: '7days', visual: '7days', label: '7 Hari', minDays: 7 },
    { value: '30days', visual: '30days', label: '30 Hari', minDays: 30 },
    { value: 'all', visual: 'all', label: 'Semua', minDays: 365, requiredPlan: 'PRO' },
  ]

  return (
    <div className="flex h-full flex-col">
      <div className="block min-h-screen overflow-x-hidden bg-background pb-24 text-foreground dark:bg-[#0B1220] dark:text-slate-50 md:hidden">
        <div className="space-y-4 px-4 pt-4">
          <header className="pb-3">
            <div className="flex items-start gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="mt-1 h-9 w-9 shrink-0 rounded-xl text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="min-w-0">
                <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-slate-50">
                  Laporan
                </h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Ringkasan penjualan dan performa toko
                </p>
              </div>
            </div>
          </header>

          <div className="grid grid-cols-4 gap-1 rounded-2xl border border-border bg-muted/80 p-1 shadow-sm backdrop-blur-sm dark:border-[#253044] dark:bg-[#111827]">
            {mobilePeriodOptions.map((opt) => {
              const isLocked = opt.minDays > maxHistoryDays
              const isActive = !isLocked && mobilePeriodVisual === opt.visual
              return (
                <Button
                  key={opt.visual}
                  variant={isActive ? 'default' : 'ghost'}
                  onClick={() => {
                    if (isLocked) return
                    setMobilePeriodVisual(opt.visual)
                    setPeriod(opt.value)
                  }}
                  disabled={isLocked}
                  className={
                    isActive
                      ? 'h-9 rounded-xl bg-primary px-2 text-xs font-semibold text-primary-foreground shadow-sm dark:bg-emerald-500 dark:text-slate-950 dark:shadow-emerald-500/20'
                      : 'h-9 rounded-xl px-2 text-xs font-semibold text-muted-foreground hover:bg-accent hover:text-accent-foreground dark:bg-[#162033] dark:text-slate-400 dark:hover:bg-[#1E293B] dark:hover:text-slate-200'
                  }
                >
                  <span className="flex items-center gap-1">
                    {opt.label}
                    {isLocked && <Lock className="h-3 w-3 text-amber-500" />}
                  </span>
                </Button>
              )
            })}
          </div>

          <ExportCSV transactions={filteredTransactions} mobile />

          <Card className="relative overflow-hidden rounded-[26px] border border-border bg-card shadow-sm shadow-black/5 dark:border-[#253044] dark:bg-[#111827] dark:shadow-black/20">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent dark:from-emerald-400/10 dark:via-emerald-400/5" />
            <CardContent className="relative flex items-center gap-3 p-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-sm shadow-emerald-500/10 dark:bg-emerald-500/15 dark:text-emerald-300">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground dark:text-slate-400">Pendapatan</p>
                <p className="mt-1 text-xl font-bold tracking-tight text-foreground dark:text-slate-50">{formatRupiah(mobileStats.revenue)}</p>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-3">
            <Card className="relative overflow-hidden rounded-[24px] border border-border bg-card shadow-sm shadow-black/5 dark:border-[#253044] dark:bg-[#111827] dark:shadow-black/20">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-r from-sky-500/8 to-transparent dark:from-sky-500/10" />
              <CardContent className="relative p-4">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 shadow-sm shadow-sky-500/10 dark:bg-sky-500/15 dark:text-sky-300">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground dark:text-slate-400">Profit</p>
                <p className="mt-1 text-lg font-bold tracking-tight text-foreground dark:text-slate-50">{formatRupiah(mobileStats.profit)}</p>
              </CardContent>
            </Card>
            <Card className="relative overflow-hidden rounded-[24px] border border-border bg-card shadow-sm shadow-black/5 dark:border-[#253044] dark:bg-[#111827] dark:shadow-black/20">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-r from-violet-500/8 to-transparent dark:from-violet-500/10" />
              <CardContent className="relative p-4">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 shadow-sm shadow-violet-500/10 dark:bg-violet-500/15 dark:text-violet-300">
                  <ShoppingCart className="h-5 w-5" />
                </div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground dark:text-slate-400">Transaksi</p>
                <p className="mt-1 text-lg font-bold tracking-tight text-foreground dark:text-slate-50">{formatNumber(mobileStats.count)}</p>
              </CardContent>
            </Card>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-muted-foreground dark:text-slate-400">
                Ringkasan Harian
              </h2>
            </div>

            {dailySummaries.length === 0 ? (
              <Card className="mt-3 rounded-2xl border border-border bg-card shadow-sm dark:border-[#253044] dark:bg-[#111827] dark:shadow-black/20">
                <CardContent className="py-10 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-muted dark:bg-[#162033]">
                    <BarChart3 className="h-7 w-7 text-muted-foreground dark:text-slate-400" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-foreground dark:text-slate-50">Belum ada laporan</h3>
                  <p className="mt-1 text-sm text-muted-foreground dark:text-slate-400">
                    Laporan akan muncul setelah ada transaksi.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="mt-3 space-y-2.5">
                {dailySummaries.map((report) => (
                  <Card key={report.date} className="rounded-2xl border border-border bg-card shadow-sm dark:border-[#253044] dark:bg-[#111827] dark:shadow-black/20">
                    <CardContent className="p-3.5">
                      <div className="mb-2.5 flex items-start justify-between gap-2.5">
                        <div>
                          <p className="text-sm font-bold text-foreground dark:text-slate-50">{formatDate(report.date)}</p>
                          <p className="text-[11px] text-muted-foreground dark:text-slate-400">{report.transactionCount} transaksi</p>
                        </div>
                        <Badge className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] text-emerald-700 hover:bg-emerald-50 dark:border dark:border-emerald-500/20 dark:bg-emerald-500/15 dark:text-emerald-300 dark:hover:bg-emerald-500/15">
                          Profit
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="rounded-2xl bg-muted p-2.5 dark:bg-[#162033]">
                          <p className="text-[10px] font-medium text-muted-foreground dark:text-slate-400">Pendapatan</p>
                          <p className="mt-0.5 text-[13px] font-bold text-foreground dark:text-slate-50">{formatRupiah(report.revenue)}</p>
                        </div>
                        <div className="rounded-2xl bg-emerald-50 p-2.5 dark:border dark:border-emerald-500/20 dark:bg-emerald-500/10">
                          <p className="text-[10px] font-medium text-emerald-700 dark:text-emerald-300">Profit</p>
                          <p className="mt-0.5 text-[13px] font-bold text-emerald-700 dark:text-emerald-300">{formatRupiah(report.profit)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="hidden flex-1 overflow-y-auto md:block">
        <div className="mx-auto max-w-[1400px] space-y-6 p-5 md:p-8 lg:p-10">
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

          <ReportSummary transactions={filteredTransactions} />

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
