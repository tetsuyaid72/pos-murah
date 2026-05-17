'use client'

import { useState } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
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
  compact?: boolean
  hideHeader?: boolean
}

const MODE_TABS: { value: ChartMode; label: string }[] = [
  { value: 'revenue', label: 'Pendapatan' },
  { value: 'transactions', label: 'Transaksi' },
  { value: 'profit', label: 'Profit' },
]

const DAYS_SHORT = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

function getPointLabel(point: TrendDataPoint, pointCount: number) {
  if (point.date.includes('T')) {
    const d = new Date(point.date)
    return `${d.getHours().toString().padStart(2, '0')}:00`
  }

  const d = new Date(`${point.date}T00:00:00`)
  return pointCount <= 7 ? DAYS_SHORT[d.getDay()] : `${d.getDate()}/${d.getMonth() + 1}`
}

export function SalesTrendChart({ trend, compact = false, hideHeader = false }: SalesTrendChartProps) {
  const [mode, setMode] = useState<ChartMode>('revenue')
  const chartData = trend.map((point) => {
    return {
      label: getPointLabel(point, trend.length),
      date: point.date,
      revenue: point.revenue,
      transactions: point.transactions,
      profit: point.profit,
    }
  })

  const formatValue = (value: number) => {
    if (mode === 'transactions') return value.toString()
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}jt`
    if (value >= 1000) return `${(value / 1000).toFixed(0)}rb`
    return value.toString()
  }

  const tooltipFormatter = (value: unknown) => {
    const num = Number(value)
    if (mode === 'transactions') return [num.toString(), 'Transaksi']
    return [`Rp ${num.toLocaleString('id-ID')}`, mode === 'revenue' ? 'Pendapatan' : 'Profit']
  }

  const chartColor = mode === 'revenue' ? '#059669' : mode === 'profit' ? '#0d9488' : '#2563eb'
  const gradientId = `gradient-${mode}`

  return (
    <Card className={cn('flex shrink-0 flex-col overflow-hidden rounded-2xl border-border/70 bg-card shadow-sm', compact ? 'h-[220px]' : 'h-[230px]')}>
      {!hideHeader && (
        <CardHeader className={cn('space-y-0', compact ? 'px-3 pb-2 pt-3' : 'px-4 pb-2 pt-3.5')}>
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className={cn('font-semibold tracking-tight', compact ? 'text-xs' : 'text-sm md:text-base')}>Trend Penjualan</CardTitle>

            <div className="flex rounded-xl border border-border/60 bg-muted/40 p-1">
              {MODE_TABS.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setMode(tab.value)}
                  className={cn(
                    'cursor-pointer rounded-lg font-medium leading-tight transition-all duration-200',
                    compact ? 'px-2 py-1 text-[10px]' : 'px-3 py-1.5 text-xs',
                    mode === tab.value
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
      )}
      <CardContent className={cn('min-h-0 flex-1 px-3', hideHeader ? 'pb-3 pt-3' : 'pb-3 pt-0')}>
        <div className="h-full w-full rounded-xl bg-muted/15 p-2">
          <ResponsiveContainer width="100%" height="100%">
            {mode === 'transactions' ? (
              <BarChart data={chartData} margin={{ top: 6, right: 8, left: -22, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} opacity={0.45} />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} className="fill-muted-foreground" axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '12px', boxShadow: '0 10px 30px rgb(0 0 0 / 0.10)', padding: '8px 10px' }}
                  formatter={tooltipFormatter}
                  cursor={{ fill: 'var(--muted)', opacity: 0.28, radius: 8 }}
                />
                <Bar dataKey="transactions" fill={chartColor} radius={[8, 8, 2, 2]} maxBarSize={26} />
              </BarChart>
            ) : (
              <AreaChart data={chartData} margin={{ top: 6, right: 8, left: -22, bottom: 0 }}>
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={chartColor} stopOpacity={0.22} />
                    <stop offset="100%" stopColor={chartColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} opacity={0.45} />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} className="fill-muted-foreground" axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" axisLine={false} tickLine={false} tickFormatter={formatValue} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '12px', boxShadow: '0 10px 30px rgb(0 0 0 / 0.10)', padding: '8px 10px' }}
                  formatter={tooltipFormatter}
                />
                <Area
                  type="monotone"
                  dataKey={mode}
                  stroke={chartColor}
                  strokeWidth={2.5}
                  fill={`url(#${gradientId})`}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 2.5, fill: 'var(--card)', stroke: chartColor }}
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
