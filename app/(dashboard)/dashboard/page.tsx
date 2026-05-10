'use client'

import { useEffect } from 'react'
import { useProductStore } from '@/stores/product-store'
import { useDashboardStore } from '@/stores/dashboard-store'
import { DashboardHeader, type DashboardPeriod } from '@/components/dashboard/dashboard-header'
import { KpiGrid } from '@/components/dashboard/kpi-grid'
import { SalesTrendChart } from '@/components/dashboard/sales-trend-chart'
import { TopProducts } from '@/components/dashboard/top-products'
import { LowStockAlert } from '@/components/dashboard/low-stock-alert'
import { UsageIndicator } from '@/components/dashboard/usage-indicator'
import { UpgradePopup } from '@/components/dashboard/upgrade-popup'

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

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden lg:h-screen">
      <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto lg:overflow-hidden">
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
