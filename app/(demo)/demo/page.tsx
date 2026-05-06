'use client'

import { useEffect, useState, useCallback } from 'react'
import { demoProducts } from '@/data/demo'
import { DashboardHeader, type DashboardPeriod } from '@/components/dashboard/dashboard-header'
import { KpiGrid, type DashboardKpi } from '@/components/dashboard/kpi-grid'
import { SalesTrendChart, type TrendDataPoint } from '@/components/dashboard/sales-trend-chart'
import { TopProducts, type TopProductData } from '@/components/dashboard/top-products'
import { LowStockAlert } from '@/components/dashboard/low-stock-alert'

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

export default function DemoDashboardPage() {
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

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1400px] space-y-6 p-5 md:p-8 lg:p-10">
          {/* Header */}
          <DashboardHeader period={period} onPeriodChange={handlePeriodChange} posHref="/demo/pos" />

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
          <LowStockAlert products={demoProducts} />
        </div>
      </div>
    </div>
  )
}
