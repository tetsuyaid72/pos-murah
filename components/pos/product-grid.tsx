'use client'

import { PackageSearch } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import { useProductStore } from '@/stores/product-store'
import { ProductCard } from './product-card'
import { ProductListItem } from './product-list-item'

export function ProductGrid() {
  const { viewMode, getFilteredProducts, searchQuery } = useProductStore()
  const products = getFilteredProducts()

  if (products.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16 text-center">
        <PackageSearch className="h-12 w-12 text-muted-foreground/50" />
        <div>
          <p className="font-medium text-muted-foreground">
            {searchQuery ? 'Produk tidak ditemukan' : 'Belum ada produk'}
          </p>
          <p className="text-sm text-muted-foreground/70">
            {searchQuery
              ? `Tidak ada hasil untuk "${searchQuery}"`
              : 'Tambahkan produk terlebih dahulu'}
          </p>
        </div>
      </div>
    )
  }

  if (viewMode === 'list') {
    return (
      <div className="flex flex-col gap-2.5">
        <AnimatePresence mode="popLayout">
          {products.map((product) => (
            <ProductListItem key={product.id} product={product} />
          ))}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
      <AnimatePresence mode="popLayout">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </AnimatePresence>
    </div>
  )
}
