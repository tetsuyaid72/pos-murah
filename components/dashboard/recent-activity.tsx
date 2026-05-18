'use client'

import { useMemo, useState } from 'react'
import {
  CheckCircle2,
  ShoppingCart,
  AlertTriangle,
  Package,
  Activity,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatRupiah } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Transaction } from '@/types'
import type { Product } from '@/types'

interface RecentActivityProps {
  transactions: Transaction[]
  products: Product[]
}

interface ActivityItem {
  id: string
  icon: typeof CheckCircle2
  iconColor: string
  iconBg: string
  title: string
  description: string
  time: string
  timestamp: number
}

function getRelativeTime(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffMs = now - then
  const diffMin = Math.floor(diffMs / 60000)
  const diffHour = Math.floor(diffMs / 3600000)
  const diffDay = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return 'Baru saja'
  if (diffMin < 60) return `${diffMin}m lalu`
  if (diffHour < 24) return `${diffHour}j lalu`
  if (diffDay === 1) return 'Kemarin'
  return `${diffDay}h lalu`
}

export function RecentActivity({ transactions, products }: RecentActivityProps) {
  const [renderedAt] = useState(() => Date.now())

  const activities = useMemo(() => {
    const items: ActivityItem[] = []

    // Add transaction activities
    const recentTrx = [...transactions]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)

    for (const trx of recentTrx) {
      items.push({
        id: `trx-${trx.id}`,
        icon: trx.status === 'completed' ? CheckCircle2 : ShoppingCart,
        iconColor: trx.status === 'completed' ? 'text-emerald-600 dark:text-emerald-400' : 'text-indigo-600 dark:text-indigo-400',
        iconBg: trx.status === 'completed' ? 'bg-emerald-50 dark:bg-emerald-500/10' : 'bg-indigo-50 dark:bg-indigo-500/10',
        title: `Transaksi ${trx.invoiceNumber}`,
        description: `${formatRupiah(trx.totalAmount)} - ${trx.items.length} item`,
        time: getRelativeTime(trx.createdAt),
        timestamp: new Date(trx.createdAt).getTime(),
      })
    }

    // Add low stock warnings
    const lowStockProducts = products
      .filter((p) => p.isActive && p.stock <= p.minStock && p.stock > 0)
      .slice(0, 2)

    for (const prod of lowStockProducts) {
      items.push({
        id: `stock-${prod.id}`,
        icon: AlertTriangle,
        iconColor: 'text-amber-600 dark:text-amber-400',
        iconBg: 'bg-amber-50 dark:bg-amber-500/10',
        title: `Stok ${prod.name} menipis`,
        description: `Tersisa ${prod.stock} ${prod.unit}`,
        time: 'Perlu restock',
        timestamp: renderedAt - 1000,
      })
    }

    // Add a product activity
    if (products.length > 0) {
      const newest = [...products].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0]
      items.push({
        id: `prod-${newest.id}`,
        icon: Package,
        iconColor: 'text-indigo-600 dark:text-indigo-400',
        iconBg: 'bg-indigo-50 dark:bg-indigo-500/10',
        title: `Produk terdaftar: ${newest.name}`,
        description: `Harga ${formatRupiah(newest.sellingPrice)}`,
        time: getRelativeTime(newest.createdAt),
        timestamp: new Date(newest.createdAt).getTime(),
      })
    }

    return items
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 6)
  }, [transactions, products, renderedAt])

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-500/10">
            <Activity className="h-4 w-4 text-indigo-500" />
          </div>
          Aktivitas Terbaru
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="flex h-[200px] items-center justify-center">
            <p className="text-sm text-muted-foreground">Belum ada aktivitas.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {activities.map((activity, index) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 rounded-xl p-2.5 transition-all duration-200 hover:bg-muted/50"
              >
                {/* Icon with timeline connector */}
                <div className="relative flex flex-col items-center">
                  <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', activity.iconBg)}>
                    <activity.icon className={cn('h-4 w-4', activity.iconColor)} />
                  </div>
                  {index < activities.length - 1 && (
                    <div className="mt-1.5 h-full w-px bg-border/50" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pt-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {activity.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{activity.description}</p>
                </div>

                {/* Time */}
                <span className="shrink-0 pt-1 text-[11px] font-medium text-muted-foreground">
                  {activity.time}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
