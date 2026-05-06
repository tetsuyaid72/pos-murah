'use client'

import { useEffect, useState } from 'react'
import { Search, Package } from 'lucide-react'
import { useProductStore } from '@/stores/product-store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ProductTable } from '@/components/products/product-table'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/toast'

export default function DemoProductsPage() {
  const {
    products, categories, isLoading,
    fetchProducts, fetchCategories,
  } = useProductStore()
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const { toast } = useToast()

  // Fetch from demo API
  useEffect(() => {
    const originalFetch = window.fetch
    const demoFetch: typeof fetch = (input, init) => {
      if (typeof input === 'string') {
        if (input.startsWith('/api/products')) {
          return originalFetch(input.replace('/api/products', '/api/demo/products'), init)
        }
        if (input.startsWith('/api/categories')) {
          return originalFetch(input.replace('/api/categories', '/api/demo/categories'), init)
        }
      }
      return originalFetch(input, init)
    }
    window.fetch = demoFetch

    fetchProducts()
    fetchCategories()

    return () => {
      window.fetch = originalFetch
    }
  }, [fetchProducts, fetchCategories])

  const activeCount = products.filter(p => p.isActive).length
  const lowStockCount = products.filter(p => p.isActive && p.stock <= p.minStock).length

  const handleDemoAction = () => {
    toast('Mode Demo: fitur ini tidak tersedia dalam demo', 'warning')
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/50 backdrop-blur-sm px-5 py-5 md:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Produk</h1>
            <div className="mt-1.5 flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                {products.length} produk terdaftar
              </span>
              <Badge variant="success" className="text-[10px]">
                {activeCount} aktif
              </Badge>
              {lowStockCount > 0 && (
                <Badge variant="warning" className="text-[10px]">
                  {lowStockCount} stok rendah
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <Button variant="outline" size="sm" className="rounded-xl" onClick={handleDemoAction}>
              <Package className="mr-2 h-4 w-4" />
              Kategori
            </Button>
            <Button variant="premium" size="sm" className="rounded-xl" onClick={handleDemoAction}>
              Tambah Produk
            </Button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Cari produk, SKU, barcode..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-xl border border-border/50 bg-muted/30 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 transition-all duration-200 focus:border-primary/50 focus:bg-card focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Category filter chips */}
          <div className="flex gap-2 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setSelectedCategory(null)}
              className={cn(
                'shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 cursor-pointer',
                !selectedCategory
                  ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              )}
            >
              Semua
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                className={cn(
                  'shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 cursor-pointer',
                  selectedCategory === cat.id
                    ? 'text-white shadow-sm'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                )}
                style={
                  selectedCategory === cat.id
                    ? { backgroundColor: cat.color }
                    : undefined
                }
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto p-5 md:p-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-sm text-muted-foreground">Memuat produk...</p>
          </div>
        ) : (
          <ProductTable />
        )}
      </div>
    </div>
  )
}
