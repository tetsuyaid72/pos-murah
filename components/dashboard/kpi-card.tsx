'use client'

import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import {
  LineChart,
  Line,
  ResponsiveContainer,
} from 'recharts'
import { cn } from '@/lib/utils'

interface KpiCardProps {
  title: string
  value: string
  icon: LucideIcon
  trend?: { value: number; positive: boolean }
  sparklineData?: number[]
  iconColor: string
  iconBgFrom: string
  iconBgTo: string
  className?: string
}

export function KpiCard({
  title,
  value,
  icon: Icon,
  trend,
  sparklineData,
  iconColor,
  iconBgFrom,
  iconBgTo,
  className,
}: KpiCardProps) {
  const sparkData = sparklineData?.map((v, i) => ({ v, i })) || []

  return (
    <div
      className={cn(
        'group relative flex h-[135px] flex-col overflow-hidden rounded-2xl border border-border/40 bg-card p-4 transition-all duration-300',
        'shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5',
        className
      )}
    >
      {/* Subtle gradient glow in background */}
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-[0.06] blur-3xl transition-opacity duration-500 group-hover:opacity-[0.12]"
        style={{
          background: `linear-gradient(135deg, ${iconBgFrom}, ${iconBgTo})`,
        }}
      />

      <div className="flex items-start justify-between">
        {/* Icon */}
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl shadow-sm transition-transform duration-300 group-hover:scale-105"
          style={{
            background: `linear-gradient(135deg, ${iconBgFrom}, ${iconBgTo})`,
          }}
        >
          <Icon className="h-5 w-5 text-white" />
        </div>

        {/* Trend badge */}
        {trend && (
          <div
            className={cn(
              'flex items-center gap-0.5 rounded-full px-2 py-1 text-[11px] font-semibold',
              trend.positive
                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'
            )}
          >
            {trend.positive ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
            {Math.abs(trend.value).toFixed(1)}%
          </div>
        )}
      </div>

      {/* Content */}
      <div className="mt-3 flex-1">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          {title}
        </p>
        <p className="mt-1 text-xl font-bold tabular-nums tracking-tight text-foreground lg:text-2xl">
          {value}
        </p>
      </div>

      {/* Mini sparkline */}
      {sparkData.length > 1 && (
        <div className="mt-2.5 h-7 w-full opacity-60 transition-opacity group-hover:opacity-100">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparkData}>
              <Line
                type="monotone"
                dataKey="v"
                stroke={iconColor}
                strokeWidth={2}
                dot={false}
                strokeLinecap="round"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
