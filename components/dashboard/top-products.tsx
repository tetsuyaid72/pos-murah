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
    <Card className="h-[260px] shrink-0 overflow-hidden rounded-2xl">
      <CardContent className="flex h-full min-h-0 flex-col p-4">
        <div className="shrink-0 pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold md:text-base">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-500/10">
              <Trophy className="h-3.5 w-3.5 text-amber-500" />
            </div>
            Produk Terlaris
          </CardTitle>
        </div>
        {topProducts.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-sm text-muted-foreground">Belum ada data penjualan.</p>
          </div>
        ) : (
          <div className="flex-1 min-h-0 space-y-3 overflow-y-auto pr-1">
            {topProducts.slice(0, 3).map((product, index) => {
              const percentage = (product.totalQty / maxQty) * 100
              const style = RANK_STYLES[index] || { bg: 'bg-gradient-to-br from-gray-400 to-gray-500', bar: 'from-gray-400 to-gray-500' }

              return (
                <div key={product.productId ?? product.productName} className="group space-y-1.5">
                  <div className="flex items-center gap-2.5">
                    {/* Rank badge */}
                    <div
                      className={cn(
                        'flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[10px] font-bold text-white shadow-sm',
                        style.bg
                      )}
                    >
                      {index + 1}
                    </div>

                    {/* Product info */}
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium leading-tight text-foreground">
                        {product.productName}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="shrink-0 text-right">
                      <p className="text-xs font-semibold tabular-nums text-foreground md:text-sm">
                        {formatRupiah(product.totalRevenue)}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {product.totalQty} terjual
                      </p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="ml-8 h-1.5 overflow-hidden rounded-full bg-muted/80">
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
