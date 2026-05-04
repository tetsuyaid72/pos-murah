'use client'

import { useMemo } from 'react'
import { formatRupiah, formatDate } from '@/lib/format'
import type { Transaction } from '@/types'

interface ReportTableProps {
  transactions: Transaction[]
}

interface DailySummary {
  date: string
  transactionCount: number
  revenue: number
  profit: number
}

export function ReportTable({ transactions }: ReportTableProps) {
  const dailySummaries = useMemo(() => {
    const completed = transactions.filter((t) => t.status === 'completed')

    // Group by date
    const grouped = new Map<string, Transaction[]>()
    for (const trx of completed) {
      const date = trx.createdAt.slice(0, 10)
      if (!grouped.has(date)) {
        grouped.set(date, [])
      }
      grouped.get(date)!.push(trx)
    }

    // Build summaries sorted by date descending
    const summaries: DailySummary[] = []
    for (const [date, trxs] of grouped) {
      const revenue = trxs.reduce((sum, t) => sum + t.totalAmount, 0)
      const profit = trxs.reduce((sum, t) => {
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

      summaries.push({
        date,
        transactionCount: trxs.length,
        revenue,
        profit,
      })
    }

    summaries.sort((a, b) => b.date.localeCompare(a.date))
    return summaries
  }, [transactions])

  if (dailySummaries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-sm text-muted-foreground">
          Belum ada data transaksi untuk periode ini
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-border/50 bg-card shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="px-5 py-3 text-left font-medium text-muted-foreground">
                Tanggal
              </th>
              <th className="px-5 py-3 text-right font-medium text-muted-foreground">
                Transaksi
              </th>
              <th className="px-5 py-3 text-right font-medium text-muted-foreground">
                Pendapatan
              </th>
              <th className="px-5 py-3 text-right font-medium text-muted-foreground">
                Profit
              </th>
            </tr>
          </thead>
          <tbody>
            {dailySummaries.map((row) => (
              <tr
                key={row.date}
                className="border-b border-border/30 last:border-0 hover:bg-muted/20 transition-colors"
              >
                <td className="px-5 py-3 font-medium">
                  {formatDate(row.date)}
                </td>
                <td className="px-5 py-3 text-right tabular-nums">
                  {row.transactionCount}
                </td>
                <td className="px-5 py-3 text-right tabular-nums">
                  {formatRupiah(row.revenue)}
                </td>
                <td className="px-5 py-3 text-right tabular-nums text-emerald-600 dark:text-emerald-400">
                  {formatRupiah(row.profit)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
