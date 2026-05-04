'use client'

import Image from 'next/image'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { formatRupiah } from '@/lib/format'
import { useCartStore, type CartItem as CartItemType } from '@/stores/cart-store'
import { useProductStore } from '@/stores/product-store'
import { getCategoryIcon } from '@/lib/category-icons'

interface CartItemProps {
  item: CartItemType
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCartStore()
  const categories = useProductStore((s) => s.categories)

  const category = categories.find((c) => c.id === item.categoryId)
  const Icon = getCategoryIcon(category?.icon || null)
  const categoryColor = category?.color || '#6b7280'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex items-start gap-3 rounded-xl border border-border/40 bg-muted/20 p-3.5 transition-all duration-200 hover:bg-muted/40"
    >
      {/* Thumbnail */}
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg"
        style={{ backgroundColor: `${categoryColor}15` }}
      >
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.productName}
            width={40}
            height={40}
            className="h-full w-full object-cover"
          />
        ) : (
          <Icon className="h-5 w-5" style={{ color: categoryColor }} />
        )}
      </div>

      {/* Product info */}
      <div className="flex-1 min-w-0">
        <h4 className="truncate text-sm font-semibold text-foreground">
          {item.productName}
        </h4>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {formatRupiah(item.unitPrice)} x {item.quantity}
        </p>
      </div>

      {/* Quantity controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => updateQuantity(item.id, item.quantity - 1)}
          aria-label="Kurangi jumlah"
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-border/50 bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
        >
          <Minus className="h-3 w-3" />
        </button>

        <span className="w-7 text-center text-sm font-bold tabular-nums text-foreground">
          {item.quantity}
        </span>

        <button
          onClick={() => updateQuantity(item.id, item.quantity + 1)}
          aria-label="Tambah jumlah"
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-border/50 bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>

      {/* Subtotal + delete */}
      <div className="flex flex-col items-end gap-1.5">
        <span className="text-sm font-bold text-foreground tabular-nums">
          {formatRupiah(item.subtotal)}
        </span>
        <button
          onClick={() => removeItem(item.id)}
          className="rounded-md p-0.5 text-muted-foreground transition-colors hover:text-rose-500 cursor-pointer"
          aria-label="Hapus item"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.div>
  )
}
