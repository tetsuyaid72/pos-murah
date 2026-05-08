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
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1400px] space-y-6 p-5 md:p-8 lg:p-10">
          {/* Header */}
          <DashboardHeader period={period} onPeriodChange={handlePeriodChange} />

          {/* KPI Cards */}
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

          {/* Chart + Top Products */}
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

          {/* Usage Indicator + Low Stock Alert */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <LowStockAlert products={products} />
            </div>
            <div>
              <UsageIndicator />
            </div>
          </div>
        </div>
      </div>

      {/* Upgrade Popup for free plan users */}
      <UpgradePopup />
    </div>
  )
}
