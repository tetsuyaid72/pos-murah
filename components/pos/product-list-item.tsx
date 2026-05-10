'use client'

import { Plus, AlertTriangle } from 'lucide-react'
import { motion } from 'framer-motion'
import type { Product } from '@/types'
import { formatRupiah } from '@/lib/format'
import { cn } from '@/lib/utils'
import { useCartStore } from '@/stores/cart-store'
import { STOCK_LEVELS } from '@/lib/constants'
import { ProductImage } from '@/components/products/product-image'

interface ProductListItemProps {
  product: Product
}

export function ProductListItem({ product }: ProductListItemProps) {
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
        'group flex w-full items-center gap-3 rounded-2xl border border-border/60 bg-card/95 px-4 py-3 text-left transition-all duration-200 cursor-pointer backdrop-blur-sm',
        'hover:-translate-y-0.5 hover:shadow-md',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        isOutOfStock && 'cursor-not-allowed opacity-60'
      )}
      whileTap={!isOutOfStock ? { scale: 0.99 } : undefined}
    >
      {/* Product image */}
      <ProductImage product={product} size="sm" />

      {/* Product info */}
      <div className="flex-1 min-w-0">
        <h3 className="truncate text-sm font-semibold text-foreground">
          {product.name}
        </h3>
        <div className="flex items-center gap-1">
          {isCriticalStock && !isOutOfStock && (
            <AlertTriangle className="h-3 w-3 text-destructive" />
          )}
          <span
            className={cn(
              'text-xs',
              isOutOfStock
                ? 'font-medium text-destructive'
                : isCriticalStock
                  ? 'text-destructive'
                  : isLowStock
                    ? 'text-warning'
                    : 'text-muted-foreground'
            )}
          >
            {isOutOfStock
              ? 'Habis'
              : `Stok: ${product.stock} ${product.unit}`}
          </span>
        </div>
      </div>

      {/* Price */}
      <p className="shrink-0 text-sm font-bold text-emerald-600 dark:text-emerald-400">
        {formatRupiah(product.sellingPrice)}
      </p>

      {/* Add button */}
      {!isOutOfStock && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white opacity-0 transition-all duration-200 group-hover:opacity-100">
          <Plus className="h-4 w-4" />
        </div>
      )}
    </motion.button>
  )
}
