'use client'

import { useState } from 'react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type ChartMode = 'revenue' | 'transactions' | 'profit'

export interface TrendDataPoint {
  date: string
  revenue: number
  transactions: number
  profit: number
}

interface SalesTrendChartProps {
  trend: TrendDataPoint[]
}

const MODE_TABS: { value: ChartMode; label: string }[] = [
  { value: 'revenue', label: 'Pendapatan' },
  { value: 'transactions', label: 'Transaksi' },
  { value: 'profit', label: 'Profit' },
]

const DAYS_SHORT = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

export function SalesTrendChart({ trend }: SalesTrendChartProps) {
  const [mode, setMode] = useState<ChartMode>('revenue')

  const chartData = trend.map((point) => {
    const d = new Date(point.date + 'T00:00:00')
    const label = trend.length <= 7
      ? DAYS_SHORT[d.getDay()]
      : `${d.getDate()}/${d.getMonth() + 1}`

    return {
      label,
      date: point.date,
      revenue: point.revenue,
      transactions: point.transactions,
      profit: point.profit,
    }
  })

  const formatValue = (v: number) => {
    if (mode === 'transactions') return v.toString()
    if (v >= 1000000) return `${(v / 1000000).toFixed(1)}jt`
    if (v >= 1000) return `${(v / 1000).toFixed(0)}rb`
    return v.toString()
  }

  const tooltipFormatter = (value: unknown) => {
    const num = Number(value)
    if (mode === 'transactions') return [num.toString(), 'Transaksi']
    return [`Rp ${num.toLocaleString('id-ID')}`, mode === 'revenue' ? 'Pendapatan' : 'Profit']
  }

  const chartColor = mode === 'revenue' ? '#059669' : mode === 'profit' ? '#10b981' : '#6366f1'
  const gradientId = `gradient-${mode}`

  return (
    <Card className="h-[220px] shrink-0 overflow-hidden rounded-2xl">
      <CardHeader className="space-y-0 px-4 pb-2 pt-3.5">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-sm font-semibold md:text-base">Trend Penjualan</CardTitle>

          {/* Mode toggle */}
          <div className="flex rounded-xl border border-border/50 bg-muted/50 p-1">
            {MODE_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setMode(tab.value)}
                className={cn(
                  'cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium leading-tight transition-all duration-200',
                  mode === tab.value
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-full px-3 pb-3 pt-0">
        <div className="h-[154px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {mode === 'transactions' ? (
              <BarChart data={chartData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} opacity={0.5} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11 }}
                  className="fill-muted-foreground"
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  className="fill-muted-foreground"
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    fontSize: '12px',
                    boxShadow: '0 8px 25px rgb(0 0 0 / 0.1)',
                    padding: '8px 10px',
                  }}
                  formatter={tooltipFormatter}
                  cursor={{ fill: 'var(--muted)', opacity: 0.3, radius: 8 }}
                />
                <Bar
                  dataKey="transactions"
                  fill={chartColor}
                  radius={[8, 8, 0, 0]}
                  maxBarSize={24}
                />
              </BarChart>
            ) : (
              <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={chartColor} stopOpacity={0.15} />
                    <stop offset="100%" stopColor={chartColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} opacity={0.5} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11 }}
                  className="fill-muted-foreground"
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  className="fill-muted-foreground"
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={formatValue}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    fontSize: '12px',
                    boxShadow: '0 8px 25px rgb(0 0 0 / 0.1)',
                    padding: '8px 10px',
                  }}
                  formatter={tooltipFormatter}
                />
                <Area
                  type="monotone"
                  dataKey={mode}
                  stroke={chartColor}
                  strokeWidth={2.25}
                  fill={`url(#${gradientId})`}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 2, fill: 'var(--card)', stroke: chartColor }}
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
