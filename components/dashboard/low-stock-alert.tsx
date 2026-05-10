'use client'

import { AlertTriangle, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { STOCK_LEVELS } from '@/lib/constants'
import type { Product } from '@/types'

interface LowStockAlertProps {
  products: Product[]
}

export function LowStockAlert({ products }: LowStockAlertProps) {
  const lowStockProducts = products
    .filter((p) => p.isActive && (p.stock <= p.minStock || p.stock <= STOCK_LEVELS.LOW))
    .sort((a, b) => a.stock - b.stock)

  return (
    <Card className="h-full min-h-0 overflow-hidden rounded-2xl">
      <CardHeader className="px-4 pb-2 pt-4 md:px-5 md:pt-5">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold md:text-base">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-500/10">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
            </div>
            Stok Menipis
            {lowStockProducts.length > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-100 px-1.5 text-[11px] font-bold text-amber-700 dark:bg-amber-500/20 dark:text-amber-400">
                {lowStockProducts.length}
              </span>
            )}
          </CardTitle>
          {lowStockProducts.length > 0 && (
            <Link
              href="/products"
              className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              Lihat semua
              <ArrowRight className="h-3 w-3" />
            </Link>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex h-full min-h-0 flex-col px-4 pb-4 pt-1 md:px-5">
        {lowStockProducts.length === 0 ? (
          <div className="flex h-[180px] flex-col items-center justify-center gap-2.5 lg:h-[188px]">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-500/10">
              <svg className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">Semua stok aman</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Tidak ada produk yang perlu restock</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 min-h-0 space-y-2 overflow-y-auto pr-1">
            {lowStockProducts.slice(0, 5).map((product) => {
              const isCritical = product.stock <= STOCK_LEVELS.CRITICAL
              const isOut = product.stock <= 0
              const percentage = product.minStock > 0
                ? Math.min((product.stock / product.minStock) * 100, 100)
                : 0

              return (
                <div
                  key={product.id}
                  className="flex items-center gap-2.5 rounded-xl border border-border/40 p-2.5 transition-all duration-200 hover:bg-muted/30 hover:shadow-sm"
                >
                  {/* Stock indicator */}
                  <div
                    className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold',
                      isOut
                        ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'
                        : isCritical
                          ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'
                          : 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
                    )}
                  >
                    {product.stock}
                  </div>

                  {/* Product info */}
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {product.name}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      {/* Mini progress bar */}
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted/80">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all duration-500',
                            isOut
                              ? 'bg-rose-500'
                              : isCritical
                                ? 'bg-rose-500'
                                : 'bg-amber-500'
                          )}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="shrink-0 text-[10px] leading-none text-muted-foreground">
                        min: {product.minStock}
                      </span>
                    </div>
                  </div>

                  {/* Status label */}
                  <span
                    className={cn(
                      'shrink-0 rounded-lg px-2 py-1 text-[10px] font-semibold leading-none',
                      isOut
                        ? 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400'
                        : isCritical
                          ? 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                    )}
                  >
                    {isOut ? 'Habis' : isCritical ? 'Kritis' : 'Rendah'}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
