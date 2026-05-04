'use client'

import { Trophy } from 'lucide-react'
import { formatRupiah } from '@/lib/format'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface TopProductData {
  productId: string | null
  productName: string
  totalQty: number
  totalRevenue: number
}

interface TopProductsProps {
  topProducts: TopProductData[]
}

const RANK_STYLES = [
  { bg: 'bg-gradient-to-br from-amber-400 to-amber-500', bar: 'from-amber-400 to-amber-500' },
  { bg: 'bg-gradient-to-br from-slate-300 to-slate-400', bar: 'from-slate-300 to-slate-400' },
  { bg: 'bg-gradient-to-br from-orange-400 to-orange-500', bar: 'from-orange-400 to-orange-500' },
  { bg: 'bg-gradient-to-br from-indigo-400 to-indigo-500', bar: 'from-indigo-400 to-indigo-500' },
  { bg: 'bg-gradient-to-br from-emerald-400 to-emerald-500', bar: 'from-emerald-400 to-emerald-500' },
]

export function TopProducts({ topProducts }: TopProductsProps) {
  const maxQty = topProducts.length > 0 ? topProducts[0].totalQty : 1

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-500/10">
            <Trophy className="h-4 w-4 text-amber-500" />
          </div>
          Produk Terlaris
        </CardTitle>
      </CardHeader>
      <CardContent>
        {topProducts.length === 0 ? (
          <div className="flex h-[200px] items-center justify-center">
            <p className="text-sm text-muted-foreground">Belum ada data penjualan.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {topProducts.map((product, index) => {
              const percentage = (product.totalQty / maxQty) * 100
              const style = RANK_STYLES[index] || { bg: 'bg-gradient-to-br from-gray-400 to-gray-500', bar: 'from-gray-400 to-gray-500' }

              return (
                <div key={product.productId ?? product.productName} className="group space-y-2">
                  <div className="flex items-center gap-3">
                    {/* Rank badge */}
                    <div
                      className={cn(
                        'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold text-white shadow-sm',
                        style.bg
                      )}
                    >
                      {index + 1}
                    </div>

                    {/* Product info */}
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {product.productName}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold tabular-nums text-foreground">
                        {formatRupiah(product.totalRevenue)}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {product.totalQty} terjual
                      </p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="ml-10 h-1.5 overflow-hidden rounded-full bg-muted/80">
                    <div
                      className={cn(
                        'h-full rounded-full bg-gradient-to-r transition-all duration-700 ease-out',
                        style.bar
                      )}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
