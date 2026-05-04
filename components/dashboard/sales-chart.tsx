'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Transaction } from '@/types'

interface SalesChartProps {
  transactions: Transaction[]
}

export function SalesChart({ transactions }: SalesChartProps) {
  // Aggregate sales by day for the last 7 days
  const chartData = getWeeklyData(transactions)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Penjualan 7 Hari Terakhir</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 12 }}
                className="fill-muted-foreground"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                className="fill-muted-foreground"
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                formatter={(value) => [
                  `Rp ${Number(value).toLocaleString('id-ID')}`,
                  'Penjualan',
                ]}
              />
              <Bar
                dataKey="revenue"
                fill="var(--primary)"
                radius={[4, 4, 0, 0]}
                maxBarSize={48}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

function getWeeklyData(transactions: Transaction[]) {
  const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
  const data: { day: string; date: string; revenue: number; count: number }[] = []

  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().slice(0, 10)
    const dayName = days[d.getDay()]

    const dayTransactions = transactions.filter(
      (t) => t.createdAt.slice(0, 10) === dateStr && t.status === 'completed'
    )

    data.push({
      day: dayName,
      date: dateStr,
      revenue: dayTransactions.reduce((sum, t) => sum + t.totalAmount, 0),
      count: dayTransactions.length,
    })
  }

  return data
}
