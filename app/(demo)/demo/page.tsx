'use client'

import Link from 'next/link'
import { useEffect, useState, useCallback } from 'react'
import { DollarSign, Menu, Package, ShoppingCart, TrendingUp } from 'lucide-react'
import { demoProducts } from '@/data/demo'
import { useUIStore } from '@/stores/ui-store'
import { DashboardHeader, type DashboardPeriod } from '@/components/dashboard/dashboard-header'
import { KpiGrid, type DashboardKpi } from '@/components/dashboard/kpi-grid'
import { SalesTrendChart, type TrendDataPoint } from '@/components/dashboard/sales-trend-chart'
import { TopProducts, type TopProductData } from '@/components/dashboard/top-products'
import { LowStockAlert } from '@/components/dashboard/low-stock-alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatRupiah } from '@/lib/format'
import { cn } from '@/lib/utils'

interface DashboardData {
  kpi: DashboardKpi
  trend: TrendDataPoint[]
  topProducts: TopProductData[]
}

const DEFAULT_KPI: DashboardKpi = {
  revenue: 0,
  transactions: 0,
  profit: 0,
  activeProducts: 0,
  revenueTrend: 0,
  transactionsTrend: 0,
  profitTrend: 0,
  revenueSparkline: [],
  countSparkline: [],
  profitSparkline: [],
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 11) return 'Selamat Pagi'
  if (hour >= 11 && hour < 15) return 'Selamat Siang'
  if (hour >= 15 && hour < 18) return 'Selamat Sore'
  return 'Selamat Malam'
}

const PERIOD_OPTIONS: { value: DashboardPeriod; label: string }[] = [
  { value: 'today', label: 'Hari Ini' },
  { value: '7days', label: '7 Hari' },
  { value: '30days', label: '30 Hari' },
]

export default function DemoDashboardPage() {
  const [period, setPeriod] = useState<DashboardPeriod>('7days')
  const [data, setData] = useState<DashboardData>({
    kpi: DEFAULT_KPI,
    trend: [],
    topProducts: [],
  })
  const [isLoading, setIsLoading] = useState(true)
  const { setSidebarOpen } = useUIStore()

  const fetchDashboard = useCallback(async (range: DashboardPeriod) => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/demo/dashboard?range=${range}`)
      if (!res.ok) throw new Error('Gagal memuat dashboard')
      const json = await res.json()
      setData({
        kpi: json.kpi,
        trend: json.trend,
        topProducts: json.topProducts,
      })
    } catch (err) {
      console.error('Demo dashboard fetch error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboard(period)
  }, [period, fetchDashboard])

  const handlePeriodChange = (newPeriod: DashboardPeriod) => {
    setPeriod(newPeriod)
  }

  const mobileStats = [
    {
      title: 'Pendapatan',
      value: formatRupiah(data.kpi.revenue),
      icon: DollarSign,
      trend: data.kpi.revenueTrend,
      iconClassName: 'bg-emerald-600',
      badgeClassName: 'bg-emerald-50 text-emerald-700',
    },
    {
      title: 'Transaksi',
      value: data.kpi.transactions.toString(),
      icon: ShoppingCart,
      trend: data.kpi.transactionsTrend,
      iconClassName: 'bg-indigo-600',
      badgeClassName: 'bg-indigo-50 text-indigo-700',
    },
    {
      title: 'Profit',
      value: formatRupiah(data.kpi.profit),
      icon: TrendingUp,
      trend: data.kpi.profitTrend,
      iconClassName: 'bg-teal-600',
      badgeClassName: 'bg-teal-50 text-teal-700',
    },
    {
      title: 'Produk Aktif',
      value: data.kpi.activeProducts.toString(),
      trend: null,
      icon: Package,
      iconClassName: 'bg-amber-500',
      badgeClassName: 'bg-amber-50 text-amber-700',
    },
  ]

  return (
    <div className="flex h-full flex-col">
      <div className="block min-h-screen overflow-x-hidden bg-slate-50 pb-24 md:hidden">
        <div className="space-y-3 px-3 pt-3">
          <div>
            <div className="flex items-start gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 rounded-xl"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-4 w-4" />
              </Button>
              <div className="min-w-0 flex-1">
                <h1 className="truncate text-base font-bold leading-tight text-slate-950">
                  {getGreeting()}, pakdeindro
                </h1>
                <p className="text-[11px] text-slate-500">Ringkasan performa toko Anda</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex h-9 flex-1 items-center rounded-2xl border bg-white p-1 shadow-sm">
              {PERIOD_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handlePeriodChange(opt.value)}
                  className={cn(
                    'h-7 flex-1 rounded-xl px-2 text-[11px] font-medium transition-all',
                    period === opt.value ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <Link href="/demo/pos">
              <Button className="h-9 shrink-0 rounded-2xl bg-emerald-600 px-3 text-xs font-semibold text-white shadow-sm hover:bg-emerald-600">
                <ShoppingCart className="mr-1.5 h-4 w-4" />
                Kasir
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 gap-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-[98px] animate-pulse rounded-2xl border bg-white shadow-sm" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {mobileStats.map((stat) => {
                const Icon = stat.icon
                return (
                  <Card key={stat.title} className="rounded-2xl border bg-white shadow-sm">
                    <CardContent className="p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <div className={cn('flex h-8 w-8 items-center justify-center rounded-xl text-white', stat.iconClassName)}>
                          <Icon className="h-4 w-4" />
                        </div>
                        {typeof stat.trend === 'number' && stat.trend !== 0 ? (
                          <Badge className={cn('h-5 rounded-full px-1.5 text-[9px] font-semibold', stat.badgeClassName)}>
                            {stat.trend > 0 ? '↗' : '↘'} {Math.abs(stat.trend).toFixed(0)}%
                          </Badge>
                        ) : (
                          <div className="h-5" />
                        )}
                      </div>
                      <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                        {stat.title}
                      </p>
                      <p className="mt-1 truncate text-base font-bold leading-none text-slate-950">
                        {stat.value}
                      </p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          <Card className="rounded-2xl border bg-white shadow-sm">
            <CardHeader className="px-3 py-3">
              <CardTitle className="text-sm font-bold">Trend Penjualan</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 pt-0">
              {isLoading ? (
                <div className="h-[135px] animate-pulse rounded-2xl border border-border/40 bg-muted/30" />
              ) : (
                <SalesTrendChart trend={data.trend} compact hideHeader />
              )}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border bg-white shadow-sm">
            <CardHeader className="px-3 py-3">
              <CardTitle className="text-sm font-bold">Produk Terlaris</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 pt-0">
              {isLoading ? (
                <div className="h-[132px] animate-pulse rounded-2xl border border-border/40 bg-muted/30" />
              ) : (
                <TopProducts topProducts={data.topProducts} compact hideHeader />
              )}
            </CardContent>
          </Card>

        </div>
      </div>

      <div className="hidden flex-1 overflow-y-auto md:block">
        <div className="mx-auto max-w-[1400px] space-y-6 p-5 md:p-8 lg:p-10">
          <DashboardHeader period={period} onPeriodChange={handlePeriodChange} posHref="/demo/pos" />

          {isLoading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-[180px] animate-pulse rounded-3xl border border-border/40 bg-muted/30"
                />
              ))}
            </div>
          ) : (
            <KpiGrid kpi={data.kpi} />
          )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              {isLoading ? (
                <div className="h-[400px] animate-pulse rounded-xl border border-border/40 bg-muted/30" />
              ) : (
                <SalesTrendChart trend={data.trend} />
              )}
            </div>
            <div>
              {isLoading ? (
                <div className="h-[400px] animate-pulse rounded-xl border border-border/40 bg-muted/30" />
              ) : (
                <TopProducts topProducts={data.topProducts} />
              )}
            </div>
          </div>

          <LowStockAlert products={demoProducts} />
        </div>
      </div>
    </div>
  )
}
