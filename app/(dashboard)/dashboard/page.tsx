'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { DollarSign, Menu, Package, ShoppingCart, TrendingUp } from 'lucide-react'
import { useProductStore } from '@/stores/product-store'
import { useDashboardStore } from '@/stores/dashboard-store'
import { useUIStore } from '@/stores/ui-store'
import { useAuthStore } from '@/stores/auth-store'
import { DashboardHeader, type DashboardPeriod } from '@/components/dashboard/dashboard-header'
import { KpiGrid } from '@/components/dashboard/kpi-grid'
import { SalesTrendChart } from '@/components/dashboard/sales-trend-chart'
import { TopProducts } from '@/components/dashboard/top-products'
import { LowStockAlert } from '@/components/dashboard/low-stock-alert'
import { UsageIndicator } from '@/components/dashboard/usage-indicator'
import { UpgradePopup } from '@/components/dashboard/upgrade-popup'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatRupiah } from '@/lib/format'
import { cn } from '@/lib/utils'

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

export default function DashboardPage() {
  const { products, fetchProducts, fetchCategories } = useProductStore()
  const {
    data,
    period,
    isLoading,
    isStale,
    fetchDashboard,
    setPeriod,
    refreshIfStale,
  } = useDashboardStore()
  const { setSidebarOpen } = useUIStore()
  const user = useAuthStore((s) => s.user)

  // Fetch products for low stock alert (still from product store)
  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [fetchProducts, fetchCategories])

  // Initial fetch on mount
  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  // Auto-refresh when dashboard data is stale (e.g. after transaction delete/create)
  useEffect(() => {
    if (isStale) {
      refreshIfStale()
    }
  }, [isStale, refreshIfStale])

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
      badgeClassName: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
    },
    {
      title: 'Transaksi',
      value: data.kpi.transactions.toString(),
      icon: ShoppingCart,
      trend: data.kpi.transactionsTrend,
      iconClassName: 'bg-indigo-600',
      badgeClassName: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300',
    },
    {
      title: 'Profit',
      value: formatRupiah(data.kpi.profit),
      icon: TrendingUp,
      trend: data.kpi.profitTrend,
      iconClassName: 'bg-teal-600',
      badgeClassName: 'bg-teal-50 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300',
    },
    {
      title: 'Produk Aktif',
      value: data.kpi.activeProducts.toString(),
      trend: null,
      icon: Package,
      iconClassName: 'bg-amber-500',
      badgeClassName: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
    },
  ]

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden lg:h-screen">
      <div className="block min-h-screen overflow-x-hidden bg-background pb-24 md:hidden">
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
                <h1 className="truncate text-base font-bold leading-tight text-foreground">
                  {getGreeting()}, {user?.name || 'Pengguna'}
                </h1>
                <p className="text-[11px] text-muted-foreground">Ringkasan performa toko Anda</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex h-9 flex-1 items-center rounded-2xl border border-border bg-muted p-1 shadow-sm">
              {PERIOD_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handlePeriodChange(opt.value)}
                  className={cn(
                    'h-7 flex-1 rounded-xl px-2 text-[11px] font-medium transition-all',
                    period === opt.value ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <Link href="/pos">
              <Button className="h-9 shrink-0 rounded-2xl bg-emerald-600 px-3 text-xs font-semibold text-white shadow-sm hover:bg-emerald-600">
                <ShoppingCart className="mr-1.5 h-4 w-4" />
                Kasir
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 gap-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-[98px] animate-pulse rounded-2xl border border-border bg-card shadow-sm" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {mobileStats.map((stat) => {
                const Icon = stat.icon
                return (
                  <Card key={stat.title} className="rounded-2xl border border-border bg-card shadow-sm">
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
                      <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                        {stat.title}
                      </p>
                      <p className="mt-1 truncate text-base font-bold leading-none text-foreground">
                        {stat.value}
                      </p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          <Card className="rounded-2xl border border-border bg-card shadow-sm">
            <CardHeader className="px-3 py-3">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-sm font-bold">Trend Penjualan</CardTitle>
                <div className="scale-[0.92] origin-right [&_.rounded-xl]:rounded-lg [&_button]:h-7 [&_button]:px-2 [&_button]:text-[11px]" />
              </div>
            </CardHeader>
            <CardContent className="px-3 pb-3 pt-0">
              {isLoading ? (
                <div className="h-[135px] animate-pulse rounded-2xl border border-border/40 bg-muted/30" />
              ) : (
                <SalesTrendChart trend={data.trend} compact hideHeader />
              )}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-border bg-card shadow-sm">
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

      <div className="hidden min-h-0 flex-1 overflow-x-hidden overflow-y-auto md:block lg:overflow-hidden">
        <div className="mx-auto flex h-full max-w-[1366px] min-h-0 flex-col gap-3 p-4 lg:overflow-hidden">
          <div className="shrink-0">
            <DashboardHeader period={period} onPeriodChange={handlePeriodChange} />
          </div>

          {isLoading ? (
            <div className="grid shrink-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-[135px] animate-pulse rounded-2xl border border-border/40 bg-muted/30"
                />
              ))}
            </div>
          ) : (
            <KpiGrid kpi={data.kpi} />
          )}

          <section className="grid min-h-0 flex-1 grid-cols-1 gap-3 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:overflow-hidden">
            <div className="flex min-h-0 flex-col gap-3">
              {isLoading ? (
                <div className="h-[220px] shrink-0 animate-pulse rounded-2xl border border-border/40 bg-muted/30" />
              ) : (
                <SalesTrendChart trend={data.trend} />
              )}

              <div className="min-h-0 flex-1">
                <LowStockAlert products={products} />
              </div>
            </div>

            <div className="flex min-h-0 flex-col gap-3">
              {isLoading ? (
                <div className="h-[260px] shrink-0 animate-pulse rounded-2xl border border-border/40 bg-muted/30" />
              ) : (
                <TopProducts topProducts={data.topProducts} />
              )}

              <div className="min-h-0 flex-1">
                <UsageIndicator />
              </div>
            </div>
          </section>
        </div>
      </div>

      <UpgradePopup />
    </div>
  )
}
