'use client'

import { useState, useEffect } from 'react'
import {
  Users,
  Store,
  Receipt,
  DollarSign,
  UserCheck,
  TrendingUp,
  Clock,
  Crown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatRupiah } from '@/lib/format'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

interface Overview {
  totalUsers: number
  totalStores: number
  totalTransactions: number
  activeUsersToday: number
  activeUsersWeek: number
  totalRevenue: number
  avgTransactionAmount: number
}

interface RecentRegistration {
  id: string
  name: string
  email: string
  createdAt: string
  lastLoginAt: string | null
  store: { id: string; name: string } | null
}

interface TopStore {
  id: string
  name: string
  ownerName: string
  ownerEmail: string
  transactionCount: number
  productCount: number
  createdAt: string
}

interface TrialExpiring {
  storeName: string
  ownerName: string
  ownerEmail: string
  trialEndAt: string
  plan: string
}

interface PlanDistribution {
  plan: string
  count: number
}

interface StatsData {
  overview: Overview
  recentRegistrations: RecentRegistration[]
  topStores: TopStore[]
  trialsExpiringSoon: TrialExpiring[]
  planDistribution: PlanDistribution[]
}

const PLAN_COLORS: Record<string, string> = {
  BASIC: '#3b82f6',
  PRO: '#10b981',
  BUSINESS: '#f59e0b',
  ENTERPRISE: '#8b5cf6',
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<StatsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/stats')
        if (res.ok) {
          const json = await res.json()
          setData(json)
        }
      } catch {
        // Fallback
      } finally {
        setIsLoading(false)
      }
    }
    fetchStats()
  }, [])

  const overview = data?.overview

  const statCards = [
    {
      label: 'Total Users',
      value: overview?.totalUsers ?? 0,
      icon: Users,
      color: 'bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    },
    {
      label: 'Total Stores',
      value: overview?.totalStores ?? 0,
      icon: Store,
      color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    },
    {
      label: 'Total Transaksi',
      value: overview?.totalTransactions ?? 0,
      icon: Receipt,
      color: 'bg-purple-100 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400',
    },
    {
      label: 'Total Revenue',
      value: formatRupiah(overview?.totalRevenue ?? 0),
      icon: DollarSign,
      color: 'bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
      isFormatted: true,
    },
    {
      label: 'Active Today',
      value: overview?.activeUsersToday ?? 0,
      icon: UserCheck,
      color: 'bg-teal-100 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400',
    },
    {
      label: 'Active This Week',
      value: overview?.activeUsersWeek ?? 0,
      icon: TrendingUp,
      color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400',
    },
  ]

  const pieData = data?.planDistribution?.map((p) => ({
    name: p.plan,
    value: p.count,
  })) || []

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Stat Cards */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-border/50 bg-card p-4 shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', card.color)}>
                <card.icon className="h-4 w-4" />
              </div>
            </div>
            <p className={cn(
              'text-2xl font-bold text-foreground',
              isLoading && 'animate-pulse'
            )}>
              {isLoading ? '—' : (card.isFormatted ? card.value : card.value.toLocaleString('id-ID'))}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Plan Distribution Pie Chart */}
        <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-foreground mb-4">Distribusi Plan</h3>
          {isLoading ? (
            <div className="h-[250px] flex items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
            </div>
          ) : pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={PLAN_COLORS[entry.name] || '#6b7280'} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-sm text-muted-foreground">
              Belum ada data
            </div>
          )}
        </div>

        {/* Top Stores Bar Chart */}
        <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-foreground mb-4">Top Stores (Transaksi)</h3>
          {isLoading ? (
            <div className="h-[250px] flex items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
            </div>
          ) : (data?.topStores?.length ?? 0) > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data!.topStores.slice(0, 7)} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => v.length > 10 ? v.slice(0, 10) + '…' : v}
                />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)' }}
                  formatter={(value) => [String(value), 'Transaksi']}
                />
                <Bar dataKey="transactionCount" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-sm text-muted-foreground">
              Belum ada data
            </div>
          )}
        </div>
      </div>

      {/* Tables Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Registrations */}
        <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            Registrasi Terbaru
          </h3>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-10 rounded-lg bg-muted/50 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {data?.recentRegistrations?.slice(0, 5).map((user) => (
                <div key={user.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <p className="text-xs text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    </p>
                    {user.store && (
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400 truncate max-w-[120px]">
                        {user.store.name}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {(!data?.recentRegistrations || data.recentRegistrations.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">Belum ada data</p>
              )}
            </div>
          )}
        </div>

        {/* Trials Expiring Soon */}
        <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-500" />
            Trial Segera Berakhir
          </h3>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-10 rounded-lg bg-muted/50 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {data?.trialsExpiringSoon?.map((trial, i) => {
                const daysLeft = Math.ceil(
                  (new Date(trial.trialEndAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                )
                return (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{trial.storeName}</p>
                      <p className="text-xs text-muted-foreground truncate">{trial.ownerName}</p>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <span className={cn(
                        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium',
                        daysLeft <= 2
                          ? 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                      )}>
                        {daysLeft} hari lagi
                      </span>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        <Crown className="inline h-3 w-3 mr-0.5" />{trial.plan}
                      </p>
                    </div>
                  </div>
                )
              })}
              {(!data?.trialsExpiringSoon || data.trialsExpiringSoon.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">Tidak ada trial yang segera berakhir</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
