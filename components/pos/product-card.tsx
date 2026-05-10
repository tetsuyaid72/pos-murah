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
        'group relative min-h-[220px] overflow-hidden rounded-2xl border border-border/60 bg-card text-left shadow-sm transition-all duration-200 cursor-pointer hover:-translate-y-0.5 hover:shadow-md',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
        isOutOfStock && 'cursor-not-allowed opacity-50 hover:translate-y-0 hover:shadow-sm'
      )}
      whileTap={!isOutOfStock ? { scale: 0.97 } : undefined}
    >
      <div className="flex h-full flex-col p-3">
        <ProductImage product={product} size="card" className="flex h-24 shrink-0 items-center justify-center rounded-xl bg-muted/20" />

        <div className="mt-3 flex min-h-0 flex-1 flex-col">
          <h3 className="min-h-[34px] line-clamp-2 text-[14px] font-semibold leading-tight text-foreground">
            {product.name}
          </h3>

          <div className="mt-1 flex shrink-0 items-center gap-1.5">
            {isCriticalStock && !isOutOfStock && (
              <AlertTriangle className="h-3 w-3 text-rose-500" />
            )}
            <span
              className={cn(
                'shrink-0 text-[11px] font-medium',
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

          <p className="mt-auto shrink-0 pt-2 text-[15px] font-bold text-emerald-600 dark:text-emerald-400">
            {formatRupiah(product.sellingPrice)}
          </p>
        </div>
      </div>

      {!isOutOfStock && (
        <div className="absolute right-3 top-3 flex h-8 w-8 scale-75 items-center justify-center rounded-xl bg-emerald-500 text-white opacity-0 shadow-sm transition-all duration-200 group-hover:scale-100 group-hover:opacity-100">
          <Plus className="h-4 w-4" />
        </div>
      )}
    </motion.button>
  )
}
