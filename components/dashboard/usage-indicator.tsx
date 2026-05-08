'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Package,
  Receipt,
  Users,
  AlertTriangle,
  TrendingUp,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface UsageData {
  plan: string
  isTrialActive: boolean
  usage: {
    products: { current: number; limit: number; percentage: number }
    transactions: { current: number; limit: number; percentage: number; periodLabel: string }
    customers: { current: number; limit: number; percentage: number }
  }
  warnings: string[]
}

function formatLimit(limit: number): string {
  if (limit >= 999999) return 'Unlimited'
  if (limit >= 1000) return `${(limit / 1000).toFixed(0)}K`
  return String(limit)
}

function getBarColor(percentage: number): string {
  if (percentage >= 90) return 'bg-red-500'
  if (percentage >= 70) return 'bg-amber-500'
  return 'bg-emerald-500'
}

function getBarBg(percentage: number): string {
  if (percentage >= 90) return 'bg-red-100 dark:bg-red-950/30'
  if (percentage >= 70) return 'bg-amber-100 dark:bg-amber-950/30'
  return 'bg-emerald-100 dark:bg-emerald-950/20'
}

interface UsageBarProps {
  label: string
  icon: React.ElementType
  current: number
  limit: number
  percentage: number
  suffix?: string
}

function UsageBar({ label, icon: Icon, current, limit, percentage, suffix }: UsageBarProps) {
  const isUnlimited = limit >= 999999

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">{label}</span>
        </div>
        <span className="text-sm tabular-nums text-muted-foreground">
          {isUnlimited ? (
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">Unlimited</span>
          ) : (
            <>
              <span className={cn(
                'font-semibold',
                percentage >= 90 ? 'text-red-600 dark:text-red-400' :
                percentage >= 70 ? 'text-amber-600 dark:text-amber-400' :
                'text-foreground'
              )}>
                {current.toLocaleString('id-ID')}
              </span>
              <span className="text-muted-foreground">/{formatLimit(limit)}</span>
              {suffix && <span className="text-muted-foreground ml-1 text-xs">({suffix})</span>}
            </>
          )}
        </span>
      </div>
      {!isUnlimited && (
        <div className={cn('h-2 rounded-full overflow-hidden', getBarBg(percentage))}>
          <div
            className={cn('h-full rounded-full transition-all duration-500', getBarColor(percentage))}
            style={{ width: `${Math.min(100, percentage)}%` }}
          />
        </div>
      )}
    </div>
  )
}

/**
 * Dashboard widget showing current resource usage vs plan limits.
 * Fetches data from /api/plan/usage.
 */
export function UsageIndicator() {
  const [data, setData] = useState<UsageData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUsage() {
      try {
        const res = await fetch('/api/plan/usage')
        if (res.ok) {
          const json = await res.json()
          setData(json)
        }
      } catch {
        // Silently fail — usage indicator is non-critical
      } finally {
        setLoading(false)
      }
    }
    fetchUsage()
  }, [])

  if (loading) {
    return (
      <div className="rounded-2xl border border-border/40 bg-card p-5 animate-pulse">
        <div className="h-4 w-32 bg-muted rounded mb-4" />
        <div className="space-y-4">
          <div className="h-8 bg-muted rounded" />
          <div className="h-8 bg-muted rounded" />
          <div className="h-8 bg-muted rounded" />
        </div>
      </div>
    )
  }

  if (!data) return null

  const { usage, warnings, plan } = data
  const planLabel = plan.charAt(0).toUpperCase() + plan.slice(1).toLowerCase()

  return (
    <div className="rounded-2xl border border-border/40 bg-card shadow-[var(--shadow-card)]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-sm font-semibold text-foreground">Penggunaan</h3>
          <span className="rounded-md bg-emerald-100 dark:bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            {planLabel}
          </span>
        </div>
      </div>

      {/* Usage Bars */}
      <div className="px-5 pb-4 space-y-4">
        <UsageBar
          label="Produk"
          icon={Package}
          current={usage.products.current}
          limit={usage.products.limit}
          percentage={usage.products.percentage}
        />
        <UsageBar
          label="Transaksi"
          icon={Receipt}
          current={usage.transactions.current}
          limit={usage.transactions.limit}
          percentage={usage.transactions.percentage}
          suffix={usage.transactions.periodLabel}
        />
        <UsageBar
          label="Pelanggan"
          icon={Users}
          current={usage.customers.current}
          limit={usage.customers.limit}
          percentage={usage.customers.percentage}
        />
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="mx-5 mb-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-3">
          {warnings.map((warning, i) => (
            <div key={i} className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-700 dark:text-amber-400">{warning}</p>
            </div>
          ))}
        </div>
      )}

      {/* Upgrade CTA */}
      {plan !== 'BUSINESS' && (
        <div className="border-t border-border/40 px-5 py-3">
          <Link
            href="/upgrade"
            className="flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
          >
            <Zap className="h-3.5 w-3.5" />
            Upgrade untuk limit lebih besar
          </Link>
        </div>
      )}
    </div>
  )
}
