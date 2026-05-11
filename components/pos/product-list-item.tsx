'use client'

import { Plus, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
    <motion.div
      layout
      className={cn(
        'rounded-2xl border border-border bg-card text-card-foreground shadow-sm transition active:scale-[0.99] md:rounded-2xl',
        isOutOfStock && 'opacity-60'
      )}
      whileTap={!isOutOfStock ? { scale: 0.99 } : undefined}
    >
      <div className="flex items-center gap-3 p-3">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-muted">
          <ProductImage product={product} size="md" className="h-12 w-12 rounded-xl bg-transparent" />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-bold text-foreground">
            {product.name}
          </h3>
          <div className="mt-0.5 flex items-center gap-1">
            {isCriticalStock && !isOutOfStock && (
              <AlertTriangle className="h-3 w-3 text-destructive" />
            )}
            <p
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
              {isOutOfStock ? 'Habis' : `Stok: ${product.stock} ${product.unit}`}
            </p>
          </div>
          <p className="mt-1 text-base font-bold text-emerald-600 dark:text-emerald-400">
            {formatRupiah(product.sellingPrice)}
          </p>
        </div>

        <Button
          onClick={handleAdd}
          disabled={isOutOfStock}
          className="h-10 w-10 shrink-0 rounded-2xl bg-emerald-600 p-0 text-white shadow-sm hover:bg-emerald-600"
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>
    </motion.div>
  )
}
