'use client'

import { useEffect, useCallback } from 'react'
import { Menu } from 'lucide-react'
import { useProductStore } from '@/stores/product-store'
import { useCartStore } from '@/stores/cart-store'
import { useUIStore } from '@/stores/ui-store'
import { useBarcodeScanner } from '@/hooks/use-barcode-scanner'
import { SearchBar } from '@/components/pos/search-bar'
import { CategoryFilter } from '@/components/pos/category-filter'
import { ProductGrid } from '@/components/pos/product-grid'
import { CartPanel } from '@/components/pos/cart-panel'
import { MobileCartSheet } from '@/components/pos/mobile-cart-sheet'
import { Button } from '@/components/ui/button'

export default function DemoPOSPage() {
  const { products, fetchProducts, fetchCategories } = useProductStore()
  const addItem = useCartStore((s) => s.addItem)
  const setViewMode = useProductStore((s) => s.setViewMode)
  const { setSidebarOpen } = useUIStore()

  // Fetch from demo API instead of real API
  useEffect(() => {
    // Override fetch to use demo endpoints
    const originalFetch = window.fetch
    const demoFetch: typeof fetch = (input, init) => {
      if (typeof input === 'string') {
        if (input.startsWith('/api/products')) {
          return originalFetch(input.replace('/api/products', '/api/demo/products'), init)
        }
        if (input.startsWith('/api/categories')) {
          return originalFetch(input.replace('/api/categories', '/api/demo/categories'), init)
        }
        if (input.startsWith('/api/transactions')) {
          return originalFetch(input.replace('/api/transactions', '/api/demo/transactions'), init)
        }
        if (input.startsWith('/api/auth/me')) {
          return originalFetch('/api/demo/auth', init)
        }
      }
      return originalFetch(input, init)
    }
    window.fetch = demoFetch

    fetchProducts()
    fetchCategories()
    setViewMode('list')

    return () => {
      window.fetch = originalFetch
    }
  }, [fetchProducts, fetchCategories, setViewMode])

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
    <div className="flex h-full min-h-0 overflow-hidden bg-background">
      <div className="block min-h-screen overflow-x-hidden bg-slate-50 pb-24 md:hidden">
        <div className="flex items-start gap-3 px-4 pt-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0 rounded-xl"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-950">Kasir</h1>
            <p className="text-sm text-slate-500">Pilih produk untuk transaksi</p>
          </div>
        </div>

        <div className="pt-2">
          <SearchBar />
          <CategoryFilter />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <ProductGrid />
        </div>

        <MobileCartSheet />
      </div>

      <div className="hidden flex-1 overflow-hidden md:flex">
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="space-y-3 border-b border-border/50 bg-card/50 backdrop-blur-sm px-5 py-4 md:px-8">
            <SearchBar />
            <CategoryFilter />
          </div>

          <div className="flex-1 overflow-y-auto p-5 md:p-8">
            <ProductGrid />
          </div>
        </div>

        <div className="hidden w-[400px] md:block">
          <CartPanel />
        </div>
      </div>
    </div>
  )
}
