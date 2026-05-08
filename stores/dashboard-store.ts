import { create } from 'zustand'

/**
 * Dashboard Store
 *
 * Manages dashboard data fetching and invalidation.
 * When transactions are created, updated, or deleted, call `invalidate()`
 * to mark the dashboard data as stale. The dashboard page will automatically
 * refetch when it detects stale data.
 */

interface DashboardKpi {
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

interface TrendDataPoint {
  date: string
  revenue: number
  transactions: number
  profit: number
}

interface TopProductData {
  productId: string
  productName: string
  totalQty: number
  totalRevenue: number
}

interface DashboardData {
  kpi: DashboardKpi
  trend: TrendDataPoint[]
  topProducts: TopProductData[]
}

type DashboardPeriod = 'today' | '7days' | '30days'

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

interface DashboardState {
  data: DashboardData
  period: DashboardPeriod
  isLoading: boolean
  isStale: boolean
  lastFetchedAt: number | null
}

interface DashboardActions {
  fetchDashboard: (range?: DashboardPeriod) => Promise<void>
  setPeriod: (period: DashboardPeriod) => void
  invalidate: () => void
  refreshIfStale: () => Promise<void>
}

export const useDashboardStore = create<DashboardState & DashboardActions>()(
  (set, get) => ({
    data: {
      kpi: DEFAULT_KPI,
      trend: [],
      topProducts: [],
    },
    period: '7days',
    isLoading: true,
    isStale: true,
    lastFetchedAt: null,

    fetchDashboard: async (range?: DashboardPeriod) => {
      const period = range || get().period
      set({ isLoading: true })
      try {
        const res = await fetch(`/api/dashboard?range=${period}`)
        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            set({
              data: { kpi: DEFAULT_KPI, trend: [], topProducts: [] },
              isLoading: false,
              isStale: false,
              lastFetchedAt: Date.now(),
            })
            return
          }
          throw new Error('Gagal memuat dashboard')
        }
        const json = await res.json()
        set({
          data: {
            kpi: json.kpi,
            trend: json.trend,
            topProducts: json.topProducts,
          },
          isLoading: false,
          isStale: false,
          lastFetchedAt: Date.now(),
        })
      } catch (err) {
        console.error('Dashboard fetch error:', err)
        set({ isLoading: false })
      }
    },

    setPeriod: (period: DashboardPeriod) => {
      set({ period })
      get().fetchDashboard(period)
    },

    invalidate: () => {
      set({ isStale: true })
    },

    refreshIfStale: async () => {
      if (get().isStale) {
        await get().fetchDashboard()
      }
    },
  })
)
