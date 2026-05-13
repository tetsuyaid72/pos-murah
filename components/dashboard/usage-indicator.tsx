'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSubscriptionStore } from '@/stores/subscription-store'
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
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-sm font-medium leading-tight text-foreground">{label}</span>
        </div>
        <span className="text-xs tabular-nums text-muted-foreground md:text-sm">
          {isUnlimited ? (
            <span className="font-medium text-emerald-600 dark:text-emerald-400">Unlimited</span>
          ) : (
            <>
              <span
                className={cn(
                  'font-semibold',
                  percentage >= 90
                    ? 'text-red-600 dark:text-red-400'
                    : percentage >= 70
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-foreground'
                )}
              >
                {current.toLocaleString('id-ID')}
              </span>
              <span className="text-muted-foreground">/{formatLimit(limit)}</span>
              {suffix && <span className="ml-1 text-xs text-muted-foreground">({suffix})</span>}
            </>
          )}
        </span>
      </div>
      {!isUnlimited && (
        <div className={cn('h-2 overflow-hidden rounded-full', getBarBg(percentage))}>
          <div
            className={cn('h-full rounded-full transition-all duration-500', getBarColor(percentage))}
            style={{ width: `${Math.min(100, percentage)}%` }}
          />
        </div>
      )}
    </div>
  )
}

export function UsageIndicator() {
  const [data, setData] = useState<UsageData | null>(null)
  const [loading, setLoading] = useState(true)
  const { paymentStatus } = useSubscriptionStore()

  useEffect(() => {
    async function fetchUsage() {
      try {
        const res = await fetch('/api/plan/usage')
        if (res.ok) {
          const json = await res.json()
          setData(json)
        }
      } catch {
        // Silently fail - usage indicator is non-critical
      } finally {
        setLoading(false)
      }
    }
    fetchUsage()
  }, [])

  if (loading) {
    return (
      <div className="rounded-2xl border border-border/40 bg-card p-4 animate-pulse">
        <div className="mb-3 h-4 w-32 rounded bg-muted" />
        <div className="space-y-3">
          <div className="h-8 rounded bg-muted" />
          <div className="h-8 rounded bg-muted" />
          <div className="h-8 rounded bg-muted" />
        </div>
      </div>
    )
  }

  if (!data) return null

  const { usage, warnings, plan } = data
  const planLabel = plan.charAt(0).toUpperCase() + plan.slice(1).toLowerCase()
  const upgradeHref = paymentStatus === 'pending' ? '/successpayment' : '/pricing'
  const upgradeLabel =
    paymentStatus === 'pending' ? 'Lihat Status Pembayaran' : 'Upgrade untuk limit lebih besar'

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-border/40 bg-card shadow-[var(--shadow-card)]">
      <div className="shrink-0 flex items-center justify-between px-4 pb-2 pt-4 md:px-5 md:pt-5">

        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-sm font-semibold text-foreground">Penggunaan</h3>
          <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
            {planLabel}
          </span>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 pb-4 md:px-5">
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

      {warnings.length > 0 && (
        <div className="mx-4 mb-4 max-h-[58px] shrink-0 overflow-y-auto rounded-xl border border-amber-200 bg-amber-50 p-2.5 dark:border-amber-800 dark:bg-amber-950/20 md:mx-5">
          {warnings.map((warning, i) => (
            <div key={i} className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
              <p className="text-xs text-amber-700 dark:text-amber-400">{warning}</p>
            </div>
          ))}
        </div>
      )}

      {plan !== 'BUSINESS' && (
        <div className="shrink-0 border-t border-border/40 px-4 py-3 md:px-5">
          <Link
            href={upgradeHref}
            className="flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-600 transition-colors hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
          >
            <Zap className="h-3.5 w-3.5" />
            {upgradeLabel}
          </Link>
        </div>
      )}
    </div>
  )
}

