'use client'

import { Plus, AlertTriangle } from 'lucide-react'
import { motion } from 'framer-motion'
import type { Product } from '@/types'
import { formatRupiah } from '@/lib/format'
import { cn } from '@/lib/utils'
import { useCartStore } from '@/stores/cart-store'
import { STOCK_LEVELS } from '@/lib/constants'
import { ProductImage } from '@/components/products/product-image'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem)
  const isLowStock = product.stock <= STOCK_LEVELS.LOW
  const isCriticalStock = product.stock <= STOCK_LEVELS.CRITICAL
  const isOutOfStock = product.stock <= 0

  const handleAdd = () => {
    if (isOutOfStock) return
    addItem(product)
  }

  return (
    <motion.button
      layout
      onClick={handleAdd}
      disabled={isOutOfStock}
      className={cn(
        'group relative min-h-[184px] overflow-hidden rounded-xl border border-border/60 bg-card text-left shadow-sm transition-all duration-200 cursor-pointer hover:-translate-y-0.5 hover:shadow-md md:min-h-[220px] md:rounded-2xl',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
        isOutOfStock && 'cursor-not-allowed opacity-50 hover:translate-y-0 hover:shadow-sm'
      )}
      whileTap={!isOutOfStock ? { scale: 0.97 } : undefined}
    >
      <div className="flex h-full flex-col p-2.5 md:p-3">
        <ProductImage product={product} size="card" className="flex h-20 shrink-0 items-center justify-center rounded-lg bg-muted/20 md:h-24 md:rounded-xl" />

        <div className="mt-2 flex min-h-0 flex-1 flex-col md:mt-3">
          <h3 className="min-h-[30px] line-clamp-2 text-[13px] font-semibold leading-tight text-foreground md:min-h-[34px] md:text-[14px]">
            {product.name}
          </h3>

          <div className="mt-0.5 flex shrink-0 items-center gap-1 md:mt-1 md:gap-1.5">
            {isCriticalStock && !isOutOfStock && (
              <AlertTriangle className="h-2.5 w-2.5 text-rose-500 md:h-3 md:w-3" />
            )}
            <span
              className={cn(
                'shrink-0 text-[10px] font-medium md:text-[11px]',
                isOutOfStock
                  ? 'text-rose-500'
                  : isCriticalStock
                    ? 'text-rose-500'
                    : isLowStock
                      ? 'text-amber-500'
                      : 'text-muted-foreground'
              )}
            >
              {isOutOfStock
                ? 'Habis'
                : `Stok: ${product.stock} ${product.unit}`}
            </span>
          </div>

          <p className="mt-auto shrink-0 pt-1.5 text-[14px] font-bold text-emerald-600 dark:text-emerald-400 md:pt-2 md:text-[15px]">
            {formatRupiah(product.sellingPrice)}
          </p>
        </div>
      </div>

      {!isOutOfStock && (
        <div className="absolute right-2.5 top-2.5 flex h-7 w-7 scale-75 items-center justify-center rounded-lg bg-emerald-500 text-white opacity-0 shadow-sm transition-all duration-200 group-hover:scale-100 group-hover:opacity-100 md:right-3 md:top-3 md:h-8 md:w-8 md:rounded-xl">
          <Plus className="h-3.5 w-3.5 md:h-4 md:w-4" />
        </div>
      )}
    </motion.button>
  )
}
