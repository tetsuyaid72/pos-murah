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
      <div className="px-4 pt-10 text-center md:flex md:flex-1 md:flex-col md:items-center md:justify-center md:gap-3 md:py-16">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
          <PackageSearch className="h-7 w-7 text-slate-400" />
        </div>
        <h3 className="mt-4 text-base font-semibold">
          {searchQuery ? 'Produk tidak ditemukan' : 'Belum ada produk'}
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          {searchQuery ? 'Coba kata kunci atau kategori lain.' : 'Tambahkan produk terlebih dahulu'}
        </p>
      </div>
    )
  }

  if (viewMode === 'list') {
    return (
      <div className="space-y-2 px-4 pt-4 pb-32 md:flex md:flex-col md:gap-2.5 md:px-0 md:pt-0 md:pb-0">
        <AnimatePresence mode="popLayout">
          {products.map((product) => (
            <ProductListItem key={product.id} product={product} />
          ))}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div className="hidden grid-cols-2 gap-2 md:grid md:grid-cols-3 md:gap-3 xl:grid-cols-5">
      <AnimatePresence mode="popLayout">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </AnimatePresence>
    </div>
  )
}
