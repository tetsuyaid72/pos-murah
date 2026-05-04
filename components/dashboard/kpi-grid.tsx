'use client'

import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Package,
} from 'lucide-react'
import { KpiCard } from './kpi-card'
import { formatRupiah } from '@/lib/format'

export interface DashboardKpi {
  revenue: number
  transactions: number
  profit: number
  activeProducts: number
  revenueTrend: number
  transactionsTrend: number
  profitTrend: number
  revenueSparkline: number[]
  countSparkline: number[]
  profitSparkline: number[]
}

interface KpiGridProps {
  kpi: DashboardKpi
}

export function KpiGrid({ kpi }: KpiGridProps) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        title="Pendapatan"
        value={formatRupiah(kpi.revenue)}
        icon={DollarSign}
        trend={kpi.revenueTrend !== 0 ? { value: kpi.revenueTrend, positive: kpi.revenueTrend > 0 } : undefined}
        sparklineData={kpi.revenueSparkline}
        iconColor="#059669"
        iconBgFrom="#059669"
        iconBgTo="#10b981"
      />
      <KpiCard
        title="Transaksi"
        value={kpi.transactions.toString()}
        icon={ShoppingCart}
        trend={kpi.transactionsTrend !== 0 ? { value: kpi.transactionsTrend, positive: kpi.transactionsTrend > 0 } : undefined}
        sparklineData={kpi.countSparkline}
        iconColor="#6366f1"
        iconBgFrom="#6366f1"
        iconBgTo="#818cf8"
      />
      <KpiCard
        title="Profit"
        value={formatRupiah(kpi.profit)}
        icon={TrendingUp}
        trend={kpi.profitTrend !== 0 ? { value: kpi.profitTrend, positive: kpi.profitTrend > 0 } : undefined}
        sparklineData={kpi.profitSparkline}
        iconColor="#10b981"
        iconBgFrom="#10b981"
        iconBgTo="#34d399"
      />
      <KpiCard
        title="Produk Aktif"
        value={kpi.activeProducts.toString()}
        icon={Package}
        iconColor="#f59e0b"
        iconBgFrom="#f59e0b"
        iconBgTo="#fbbf24"
      />
    </div>
  )
}
