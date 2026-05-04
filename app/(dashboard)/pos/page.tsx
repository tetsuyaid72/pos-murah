'use client'

import { useEffect, useCallback } from 'react'
import { useProductStore } from '@/stores/product-store'
import { useCartStore } from '@/stores/cart-store'
import { useBarcodeScanner } from '@/hooks/use-barcode-scanner'
import { SearchBar } from '@/components/pos/search-bar'
import { CategoryFilter } from '@/components/pos/category-filter'
import { ProductGrid } from '@/components/pos/product-grid'
import { CartPanel } from '@/components/pos/cart-panel'
import { MobileCartSheet } from '@/components/pos/mobile-cart-sheet'

export default function POSPage() {
  const { products, fetchProducts, fetchCategories } = useProductStore()
  const addItem = useCartStore((s) => s.addItem)

  // Fetch real data from database
  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [fetchProducts, fetchCategories])

  // Barcode scanner integration
  const handleBarcodeScan = useCallback(
    (barcode: string) => {
      const product = products.find(
        (p) => p.barcode === barcode && p.isActive && p.stock > 0
      )
      if (product) {
        addItem(product)
      }
    },
    [products, addItem]
  )

  useBarcodeScanner({ onScan: handleBarcodeScan })

  return (
    <div className="flex h-full">
      {/* Left panel — Products */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header with search & filters */}
        <div className="space-y-3 border-b border-border/50 bg-card/50 backdrop-blur-sm px-5 py-4 md:px-8">
          <SearchBar />
          <CategoryFilter />
        </div>

        {/* Product grid */}
        <div className="flex-1 overflow-y-auto p-5 md:p-8">
          <ProductGrid />
        </div>
      </div>

      {/* Right panel — Cart (desktop only) */}
      <div className="hidden w-[400px] md:block">
        <CartPanel />
      </div>

      {/* Mobile cart sheet */}
      <div className="md:hidden">
        <MobileCartSheet />
      </div>
    </div>
  )
}
