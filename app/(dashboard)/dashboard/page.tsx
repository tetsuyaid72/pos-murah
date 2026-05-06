'use client'

import { useEffect, useState, useCallback } from 'react'
import { useProductStore } from '@/stores/product-store'
import { DashboardHeader, type DashboardPeriod } from '@/components/dashboard/dashboard-header'
import { KpiGrid, type DashboardKpi } from '@/components/dashboard/kpi-grid'
import { SalesTrendChart, type TrendDataPoint } from '@/components/dashboard/sales-trend-chart'
import { TopProducts, type TopProductData } from '@/components/dashboard/top-products'
import { LowStockAlert } from '@/components/dashboard/low-stock-alert'
import { UpgradePopup } from '@/components/dashboard/upgrade-popup'

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

export default function DashboardPage() {
  const { products, fetchProducts, fetchCategories } = useProductStore()
  const [period, setPeriod] = useState<DashboardPeriod>('7days')
  const [data, setData] = useState<DashboardData>({
    kpi: DEFAULT_KPI,
    trend: [],
    topProducts: [],
  })
  const [isLoading, setIsLoading] = useState(true)

  const fetchDashboard = useCallback(async (range: DashboardPeriod) => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/dashboard?range=${range}`)
      if (!res.ok) {
        // 401/403 means user has no store — show empty state instead of error
        if (res.status === 401 || res.status === 403) {
          setData({ kpi: DEFAULT_KPI, trend: [], topProducts: [] })
          return
        }
        throw new Error('Gagal memuat dashboard')
      }
      const json = await res.json()

      console.log('[Dashboard] API response:', {
        kpiRevenue: json.kpi?.revenue,
        kpiTransactions: json.kpi?.transactions,
        kpiProfit: json.kpi?.profit,
        trendLength: json.trend?.length,
        trendSample: json.trend?.slice(0, 3),
        topProductsCount: json.topProducts?.length,
      })

      setData({
        kpi: json.kpi,
        trend: json.trend,
        topProducts: json.topProducts,
      })
    } catch (err) {
      console.error('Dashboard fetch error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Fetch products for low stock alert (still from product store)
  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [fetchProducts, fetchCategories])

  // Fetch dashboard data when period changes
  useEffect(() => {
    fetchDashboard(period)
  }, [period, fetchDashboard])

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

          {/* Low Stock Alert */}
          <LowStockAlert products={products} />
        </div>
      </div>

      {/* Upgrade Popup for free plan users */}
      <UpgradePopup />
    </div>
  )
}
