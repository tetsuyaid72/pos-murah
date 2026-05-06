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
        'group relative flex flex-col items-start rounded-2xl border border-border/40 bg-card p-4 text-left transition-all duration-300 cursor-pointer',
        'shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-1',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
        isOutOfStock && 'cursor-not-allowed opacity-50 hover:translate-y-0 hover:shadow-[var(--shadow-card)]'
      )}
      whileTap={!isOutOfStock ? { scale: 0.97 } : undefined}
    >
      {/* Product image */}
      <ProductImage product={product} size="card" className="mb-3 rounded-xl" />

      {/* Product name */}
      <h3 className="mb-1.5 line-clamp-2 text-sm font-semibold leading-tight text-foreground">
        {product.name}
      </h3>

      {/* Stock info */}
      <div className="mb-2 flex items-center gap-1.5">
        {isCriticalStock && !isOutOfStock && (
          <AlertTriangle className="h-3 w-3 text-rose-500" />
        )}
        <span
          className={cn(
            'text-xs font-medium',
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

      {/* Price */}
      <p className="mt-auto text-base font-bold text-emerald-600 dark:text-emerald-400">
        {formatRupiah(product.sellingPrice)}
      </p>

      {/* Add indicator */}
      {!isOutOfStock && (
        <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500 text-white opacity-0 shadow-lg shadow-emerald-500/30 transition-all duration-200 group-hover:opacity-100 group-hover:scale-100 scale-75">
          <Plus className="h-4 w-4" />
        </div>
      )}
    </motion.button>
  )
}
