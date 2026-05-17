'use client'

import { Trophy } from 'lucide-react'
import { formatRupiah } from '@/lib/format'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
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
  { badge: 'bg-amber-500 text-white', bar: 'bg-amber-500' },
  { badge: 'bg-slate-500 text-white', bar: 'bg-slate-500' },
  { badge: 'bg-orange-500 text-white', bar: 'bg-orange-500' },
]

export function TopProducts({ topProducts, compact = false, hideHeader = false }: TopProductsProps) {
  const visibleProducts = topProducts.slice(0, 3)
  const maxQty = visibleProducts.length > 0 ? Math.max(...visibleProducts.map((product) => product.totalQty), 1) : 1

  return (
    <Card className={cn('shrink-0 overflow-hidden rounded-2xl border-border/70 bg-card shadow-sm', compact ? 'h-auto' : 'h-[260px]')}>
      <CardContent className={cn('flex h-full min-h-0 flex-col', compact ? 'p-3' : 'p-4')}>
        {!hideHeader && (
          <div className={cn('shrink-0', compact ? 'pb-2' : 'pb-3')}>
            <CardTitle className={cn('flex items-center gap-2 font-semibold tracking-tight', compact ? 'text-xs' : 'text-sm md:text-base')}>
              <span className={cn('flex items-center justify-center rounded-lg bg-amber-50 ring-1 ring-amber-500/10 dark:bg-amber-500/10', compact ? 'h-5 w-5' : 'h-6 w-6')}>
                <Trophy className={cn('text-amber-500', compact ? 'h-3 w-3' : 'h-3.5 w-3.5')} />
              </span>
              Produk Terlaris
            </CardTitle>
          </div>
        )}
        {visibleProducts.length === 0 ? (
          <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-border/70 bg-muted/20">
            <p className={cn('text-muted-foreground', compact ? 'text-xs' : 'text-sm')}>Belum ada data penjualan.</p>
          </div>
        ) : (
          <div className={cn('flex-1 min-h-0 overflow-y-auto pr-1 [scrollbar-width:thin]', compact ? 'space-y-2' : 'space-y-3')}>
            {visibleProducts.map((product, index) => {
              const percentage = (product.totalQty / maxQty) * 100
              const style = RANK_STYLES[index] ?? RANK_STYLES[2]

              return (
                <div key={product.productId ?? product.productName} className={cn('group', compact ? 'space-y-1' : 'space-y-1.5')}>
                  <div className={cn('flex items-center', compact ? 'gap-2' : 'gap-2.5')}>
                    <span className={cn('flex shrink-0 items-center justify-center rounded-md font-bold shadow-sm', compact ? 'h-5 w-5 text-[9px]' : 'h-6 w-6 text-[10px]', style.badge)}>
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className={cn('truncate font-medium leading-tight text-foreground', compact ? 'text-xs' : 'text-sm')}>
                        {product.productName}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className={cn('font-semibold tabular-nums text-foreground', compact ? 'text-[11px]' : 'text-xs md:text-sm')}>
                        {formatRupiah(product.totalRevenue)}
                      </p>
                      <p className={cn('text-muted-foreground', compact ? 'text-[10px]' : 'text-[11px]')}>
                        {product.totalQty} terjual
                      </p>
                    </div>
                  </div>
                  <div className={cn('overflow-hidden rounded-full bg-muted/80', compact ? 'ml-7 h-1.5' : 'ml-8 h-2')}>
                    <div className={cn('h-full rounded-full transition-all duration-700 ease-out', style.bar)} style={{ width: `${percentage}%` }} />
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
