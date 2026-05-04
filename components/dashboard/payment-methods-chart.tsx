'use client'

import { useMemo } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatRupiah } from '@/lib/format'
import { Wallet } from 'lucide-react'
import type { Transaction, PaymentMethod } from '@/types'
import type { DashboardPeriod } from './dashboard-header'

interface PaymentMethodsChartProps {
  transactions: Transaction[]
  period: DashboardPeriod
}

const METHOD_CONFIG: Record<PaymentMethod, { label: string; color: string }> = {
  cash: { label: 'Tunai', color: '#059669' },
  qris: { label: 'QRIS', color: '#6366f1' },
  debt: { label: 'Hutang', color: '#f59e0b' },
}

function getDaysForPeriod(period: DashboardPeriod): number {
  switch (period) {
    case 'today': return 1
    case '7days': return 7
    case '30days': return 30
  }
}

export function PaymentMethodsChart({ transactions, period }: PaymentMethodsChartProps) {
  const data = useMemo(() => {
    const days = getDaysForPeriod(period)
    const dates = new Set<string>()
    for (let i = 0; i < days; i++) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      dates.add(d.toISOString().slice(0, 10))
    }

    const filtered = transactions.filter(
      (t) => dates.has(t.createdAt.slice(0, 10)) && t.status === 'completed'
    )

    const methodMap = new Map<PaymentMethod, { count: number; total: number }>()

    for (const trx of filtered) {
      const existing = methodMap.get(trx.paymentMethod)
      if (existing) {
        existing.count++
        existing.total += trx.totalAmount
      } else {
        methodMap.set(trx.paymentMethod, { count: 1, total: trx.totalAmount })
      }
    }

    const totalAll = filtered.reduce((s, t) => s + t.totalAmount, 0)

    return {
      items: Array.from(methodMap.entries()).map(([method, { count, total }]) => ({
        name: METHOD_CONFIG[method].label,
        value: total,
        count,
        color: METHOD_CONFIG[method].color,
        percentage: totalAll > 0 ? ((total / totalAll) * 100).toFixed(1) : '0',
      })),
      total: totalAll,
    }
  }, [transactions, period])

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-500/10">
            <Wallet className="h-4 w-4 text-emerald-500" />
          </div>
          Metode Pembayaran
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.items.length === 0 ? (
          <div className="flex h-[200px] items-center justify-center">
            <p className="text-sm text-muted-foreground">Belum ada data transaksi.</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-5">
            {/* Donut chart */}
            <div className="relative h-[180px] w-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.items}
                    cx="50%"
                    cy="50%"
                    innerRadius={58}
                    outerRadius={82}
                    paddingAngle={4}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {data.items.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '16px',
                      fontSize: '12px',
                      boxShadow: '0 8px 25px rgb(0 0 0 / 0.1)',
                      padding: '12px 16px',
                    }}
                    formatter={(value: unknown) => [formatRupiah(Number(value)), 'Total']}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Center text */}
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Total</p>
                <p className="text-sm font-bold tabular-nums text-foreground">{formatRupiah(data.total)}</p>
              </div>
            </div>

            {/* Legend */}
            <div className="w-full space-y-2.5">
              {data.items.map((item) => (
                <div key={item.name} className="flex items-center justify-between rounded-xl p-2 transition-colors hover:bg-muted/50">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="h-3 w-3 rounded-full shadow-sm"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm font-medium text-foreground">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">{item.count}x</span>
                    <span className="text-sm font-bold tabular-nums text-foreground">{item.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
