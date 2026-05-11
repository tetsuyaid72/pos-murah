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
  compact?: boolean
  hideHeader?: boolean
}

const RANK_STYLES = [
  { bg: 'bg-gradient-to-br from-amber-400 to-amber-500', bar: 'from-amber-400 to-amber-500' },
  { bg: 'bg-gradient-to-br from-slate-300 to-slate-400', bar: 'from-slate-300 to-slate-400' },
  { bg: 'bg-gradient-to-br from-orange-400 to-orange-500', bar: 'from-orange-400 to-orange-500' },
  { bg: 'bg-gradient-to-br from-indigo-400 to-indigo-500', bar: 'from-indigo-400 to-indigo-500' },
  { bg: 'bg-gradient-to-br from-emerald-400 to-emerald-500', bar: 'from-emerald-400 to-emerald-500' },
]

export function TopProducts({ topProducts, compact = false, hideHeader = false }: TopProductsProps) {
  const maxQty = topProducts.length > 0 ? topProducts[0].totalQty : 1

  return (
    <Card className={cn('shrink-0 overflow-hidden rounded-2xl', compact ? 'h-auto' : 'h-[260px]')}>
      <CardContent className={cn('flex h-full min-h-0 flex-col', compact ? 'p-3' : 'p-4')}>
        {!hideHeader && (
          <div className={cn('shrink-0', compact ? 'pb-2' : 'pb-3')}>
            <CardTitle className={cn('flex items-center gap-2 font-semibold', compact ? 'text-xs' : 'text-sm md:text-base')}>
              <div className={cn('flex items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-500/10', compact ? 'h-5 w-5' : 'h-6 w-6')}>
                <Trophy className={cn('text-amber-500', compact ? 'h-3 w-3' : 'h-3.5 w-3.5')} />
              </div>
              Produk Terlaris
            </CardTitle>
          </div>
        )}
        {topProducts.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <p className={cn('text-muted-foreground', compact ? 'text-xs' : 'text-sm')}>Belum ada data penjualan.</p>
          </div>
        ) : (
          <div className={cn('flex-1 min-h-0 overflow-y-auto pr-1', compact ? 'space-y-2' : 'space-y-3')}>
            {topProducts.slice(0, 3).map((product, index) => {
              const percentage = (product.totalQty / maxQty) * 100
              const style = RANK_STYLES[index] || { bg: 'bg-gradient-to-br from-gray-400 to-gray-500', bar: 'from-gray-400 to-gray-500' }

              return (
                <div key={product.productId ?? product.productName} className={cn('group', compact ? 'space-y-1' : 'space-y-1.5')}>
                  <div className={cn('flex items-center', compact ? 'gap-2' : 'gap-2.5')}>
                    {/* Rank badge */}
                    <div
                      className={cn(
                        cn(
                          'shrink-0 items-center justify-center rounded-md font-bold text-white shadow-sm flex',
                          compact ? 'h-5 w-5 text-[9px]' : 'h-6 w-6 text-[10px]'
                        ),
                        style.bg
                      )}
                    >
                      {index + 1}
                    </div>

                    {/* Product info */}
                    <div className="flex-1 min-w-0">
                      <p className={cn('truncate font-medium leading-tight text-foreground', compact ? 'text-xs' : 'text-sm')}>
                        {product.productName}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="shrink-0 text-right">
                      <p className={cn('font-semibold tabular-nums text-foreground', compact ? 'text-[11px]' : 'text-xs md:text-sm')}>
                        {formatRupiah(product.totalRevenue)}
                      </p>
                      <p className={cn('text-muted-foreground', compact ? 'text-[11px]' : 'text-[10px]')}>
                        {product.totalQty} terjual
                      </p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className={cn('overflow-hidden rounded-full bg-muted/80', compact ? 'ml-7 h-1.5' : 'ml-8 h-1.5')}>
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
