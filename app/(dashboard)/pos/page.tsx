'use client'

import { useEffect, useCallback, useState } from 'react'
import { Barcode, Menu } from 'lucide-react'
import { useProductStore } from '@/stores/product-store'
import { useCartStore } from '@/stores/cart-store'
import { useAuthStore } from '@/stores/auth-store'
import { useUIStore } from '@/stores/ui-store'
import { useBarcodeScanner } from '@/hooks/use-barcode-scanner'
import { SearchBar } from '@/components/pos/search-bar'
import { CategoryFilter } from '@/components/pos/category-filter'
import { ProductGrid } from '@/components/pos/product-grid'
import { CartPanel } from '@/components/pos/cart-panel'
import { MobileCartSheet } from '@/components/pos/mobile-cart-sheet'
import { BarcodeScannerModal } from '@/components/pos/barcode-scanner-modal'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import type { Product } from '@/types'

export default function POSPage() {
  const { products, fetchProducts, fetchCategories } = useProductStore()
  const storeId = useAuthStore((s) => s.store?.id ?? null)
  const addItem = useCartStore((s) => s.addItem)
  const setStoreContext = useCartStore((s) => s.setStoreContext)
  const removeMissingProducts = useCartStore((s) => s.removeMissingProducts)
  const setViewMode = useProductStore((s) => s.setViewMode)
  const { setSidebarOpen } = useUIStore()
  const { toast } = useToast()
  const [scannerOpen, setScannerOpen] = useState(false)

  // Reset persisted cart when the active store changes.
  useEffect(() => {
    setStoreContext(storeId)
  }, [storeId, setStoreContext])

  // Fetch real data from database
  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [fetchProducts, fetchCategories])

  useEffect(() => {
    setViewMode('list')
  }, [setViewMode])

  // Drop stale cart items that do not belong to the current store anymore.
  useEffect(() => {
    removeMissingProducts(products.map((product) => product.id))
  }, [products, removeMissingProducts])

  // Barcode scanner integration
  const addScannedProduct = useCallback((product: Product) => {
    if (product.stock <= 0) {
      toast('Stok produk habis.', 'warning')
      return false
    }
    addItem(product)
    toast(`${product.name} ditambahkan ke keranjang.`, 'success')
    return true
  }, [addItem, toast])

  const handleBarcodeScan = useCallback(
    (barcode: string) => {
      const product = products.find((p) => p.barcode === barcode && p.isActive)
      if (product) addScannedProduct(product)
    },
    [products, addScannedProduct]
  )

  const handleCameraBarcodeScan = useCallback(async (barcode: string) => {
    const localProduct = products.find((p) => p.barcode === barcode && p.isActive)
    if (localProduct) return addScannedProduct(localProduct)

    const res = await fetch(`/api/products/by-barcode?code=${encodeURIComponent(barcode)}`)
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      toast(data.error || 'Gagal mencari produk barcode.', 'error')
      return false
    }
    if (!data.product) return false
    return addScannedProduct(data.product)
  }, [products, addScannedProduct, toast])

  useBarcodeScanner({ onScan: handleBarcodeScan })

  return (
    <div className="flex h-full min-h-0 overflow-hidden bg-background lg:h-screen">
      <div className="block min-h-screen overflow-x-hidden bg-background pb-24 md:hidden">
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
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Kasir</h1>
            <p className="text-sm text-muted-foreground">Pilih produk untuk transaksi</p>
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 shrink-0 rounded-xl"
            onClick={() => setScannerOpen(true)}
            aria-label="Scan barcode"
          >
            <Barcode className="h-5 w-5" />
          </Button>
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

      <div className="hidden h-full min-h-0 flex-1 overflow-hidden md:grid md:grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px]">
        <section className="flex min-h-0 flex-col overflow-hidden bg-background">
          <div className="sticky top-0 z-20 shrink-0 border-b border-border/50 bg-background/95 p-2 md:p-3 backdrop-blur-xl">
            <div className="rounded-xl border border-border/60 bg-card/80 p-2.5 shadow-sm backdrop-blur-xl md:rounded-2xl md:p-3">
              <div className="space-y-1.5 md:space-y-2">
                <div className="flex items-center gap-2">
                  <div className="min-w-0 flex-1">
                    <SearchBar />
                  </div>
                  <Button variant="outline" className="h-10 rounded-xl" onClick={() => setScannerOpen(true)}>
                    <Barcode className="mr-2 h-4 w-4" />
                    Scan Barcode
                  </Button>
                </div>
                <CategoryFilter />
              </div>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-3 pr-3.5 md:p-4 md:pr-5">
            <ProductGrid />
          </div>
        </section>

        <aside className="hidden h-full min-h-0 overflow-hidden border-l border-border/50 bg-card/50 backdrop-blur-xl lg:flex lg:w-[380px] lg:flex-col">
          <CartPanel />
        </aside>
      </div>

      <BarcodeScannerModal
        open={scannerOpen}
        onOpenChange={setScannerOpen}
        onScan={handleCameraBarcodeScan}
      />
    </div>
  )
}
