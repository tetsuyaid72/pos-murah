'use client'

import { useEffect, useCallback } from 'react'
import { useProductStore } from '@/stores/product-store'
import { useCartStore } from '@/stores/cart-store'
import { useAuthStore } from '@/stores/auth-store'
import { useBarcodeScanner } from '@/hooks/use-barcode-scanner'
import { SearchBar } from '@/components/pos/search-bar'
import { CategoryFilter } from '@/components/pos/category-filter'
import { ProductGrid } from '@/components/pos/product-grid'
import { CartPanel } from '@/components/pos/cart-panel'
import { MobileCartSheet } from '@/components/pos/mobile-cart-sheet'

export default function POSPage() {
  const { products, fetchProducts, fetchCategories } = useProductStore()
  const storeId = useAuthStore((s) => s.store?.id ?? null)
  const addItem = useCartStore((s) => s.addItem)
  const setStoreContext = useCartStore((s) => s.setStoreContext)
  const removeMissingProducts = useCartStore((s) => s.removeMissingProducts)

  // Reset persisted cart when the active store changes.
  useEffect(() => {
    setStoreContext(storeId)
  }, [storeId, setStoreContext])

  // Fetch real data from database
  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [fetchProducts, fetchCategories])

  // Drop stale cart items that do not belong to the current store anymore.
  useEffect(() => {
    removeMissingProducts(products.map((product) => product.id))
  }, [products, removeMissingProducts])

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
    <div className="flex h-full min-h-0 overflow-hidden bg-background lg:h-screen">
      <div className="grid h-full min-h-0 flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[minmax(0,1fr)_380px]">
        <section className="flex min-h-0 flex-col overflow-hidden bg-background">
          <div className="sticky top-0 z-20 shrink-0 border-b border-border/50 bg-background/95 p-3 backdrop-blur-xl">
            <div className="rounded-2xl border border-border/60 bg-card/80 p-3 shadow-sm backdrop-blur-xl">
              <div className="space-y-2">
                <SearchBar />
                <CategoryFilter />
              </div>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-4 pr-5">
            <ProductGrid />
          </div>
        </section>

        <aside className="hidden h-full min-h-0 overflow-hidden border-l border-border/50 bg-card/50 backdrop-blur-xl lg:flex lg:w-[380px] lg:flex-col">
          <CartPanel />
        </aside>

        <div className="lg:hidden">
          <MobileCartSheet />
        </div>
      </div>
    </div>
  )
}
