'use client'

import { useMemo } from 'react'
import { DollarSign, TrendingUp, ShoppingCart } from 'lucide-react'
import { formatRupiah, formatNumber } from '@/lib/format'
import type { Transaction } from '@/types'

interface ReportSummaryProps {
  transactions: Transaction[]
}

export function ReportSummary({ transactions }: ReportSummaryProps) {
  const stats = useMemo(() => {
    const completed = transactions.filter((t) => t.status === 'completed')

    const revenue = completed.reduce((sum, t) => sum + t.totalAmount, 0)

    const profit = completed.reduce((sum, t) => {
      return (
        sum +
        t.items.reduce(
          (itemSum, item) =>
            itemSum +
            (item.unitPrice - item.costPrice) * item.quantity -
            item.discountAmount,
          0
        )
      )
    }, 0)

    const count = completed.length

    return { revenue, profit, count }
  }, [transactions])

  const cards = [
    {
      title: 'Pendapatan',
      value: formatRupiah(stats.revenue),
      icon: DollarSign,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    },
    {
      title: 'Profit',
      value: formatRupiah(stats.profit),
      icon: TrendingUp,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-500/10',
    },
    {
      title: 'Transaksi',
      value: formatNumber(stats.count),
      icon: ShoppingCart,
      color: 'text-violet-600 dark:text-violet-400',
      bg: 'bg-violet-50 dark:bg-violet-500/10',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div
            key={card.title}
            className="rounded-2xl border border-border/50 bg-card p-5 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.bg}`}
              >
                <Icon className={`h-5 w-5 ${card.color}`} />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  {card.title}
                </p>
                <p className="text-lg font-bold tabular-nums">{card.value}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
