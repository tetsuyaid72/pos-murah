'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Search, Package, Menu, ShieldCheck, SlidersHorizontal } from 'lucide-react'
import { useProductStore } from '@/stores/product-store'
import { useUIStore } from '@/stores/ui-store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ProductTable } from '@/components/products/product-table'
import { cn } from '@/lib/utils'

export default function ProductsPage() {
  const {
    products, categories, isLoading,
    fetchProducts, fetchCategories,
  } = useProductStore()
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const { setSidebarOpen } = useUIStore()

  // Fetch from database on mount
  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [fetchProducts, fetchCategories])

  const activeCount = products.filter(p => p.isActive).length
  const lowStockCount = products.filter(p => p.isActive && p.stock <= p.minStock).length

  const filteredProducts = products.filter((product) => {
    const searchQuery = search.toLowerCase()
    const matchesSearch =
      !searchQuery ||
      product.name.toLowerCase().includes(searchQuery) ||
      product.sku?.toLowerCase().includes(searchQuery) ||
      product.barcode?.toLowerCase().includes(searchQuery)

    const matchesCategory =
      !selectedCategory ||
      product.categoryId === selectedCategory ||
      product.category?.id === selectedCategory ||
      product.category?.name === selectedCategory

    return matchesSearch && matchesCategory
  })

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* ===== MOBILE LAYOUT ===== */}
      <div className="block md:hidden min-h-screen overflow-x-hidden overflow-y-auto bg-background px-3 pt-2 pb-18 space-y-2">
        {/* Mobile Header */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-4 w-4" />
            </Button>
            <h1 className="text-[20px] font-bold tracking-tight text-foreground">
              Produk
            </h1>
          </div>
          <Link href="/products/new">
            <Button className="h-8 rounded-full bg-emerald-500 px-3 text-[12px] font-semibold text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-600">
              <Plus className="mr-1 h-3.5 w-3.5" />
              Tambah
            </Button>
          </Link>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-2">
          <div className="h-[64px] rounded-xl border bg-card shadow-sm">
            <div className="flex h-full items-center gap-2 p-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-500/10">
                <Package className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-medium leading-none text-muted-foreground">Total Produk</p>
                <p className="mt-1 text-base font-bold leading-none text-foreground">{products.length}</p>
              </div>
            </div>
          </div>
          <div className="h-[64px] rounded-xl border bg-card shadow-sm">
            <div className="flex h-full items-center gap-2 p-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-500/10">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-medium leading-none text-muted-foreground">Produk Aktif</p>
                <p className="mt-1 text-base font-bold leading-none text-foreground">{activeCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search + Filter */}
        <div className="flex h-10 items-center gap-1.5 rounded-xl border bg-card p-1 shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Cari produk, SKU, barcode..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 w-full rounded-lg border-0 bg-transparent pl-8 pr-2 text-[13px] text-foreground placeholder:text-muted-foreground/60 shadow-none focus:outline-none focus-visible:ring-0"
            />
          </div>
          <Button variant="outline" size="icon" className="h-8 w-8 shrink-0 rounded-lg border-border bg-card text-foreground shadow-sm hover:bg-accent">
            <SlidersHorizontal className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Category Chips */}
        <div className="-mx-3 overflow-x-auto px-3 scrollbar-hide">
          <div className="flex w-max gap-1.5 pb-0.5">
            <button
              onClick={() => setSelectedCategory(null)}
              className={cn(
                'h-7 shrink-0 rounded-full px-3 text-[11px] font-semibold transition-all duration-200 cursor-pointer',
                !selectedCategory
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-sm dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/20'
                  : 'bg-card border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              Semua
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                className={cn(
                  'h-7 shrink-0 rounded-full px-3 text-[11px] font-semibold transition-all duration-200 cursor-pointer',
                  selectedCategory === cat.id
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-sm dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/20'
                    : 'bg-card border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground'

                )}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Product List */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-card/50 py-10 text-center">
            <div className="mb-2 h-6 w-6 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-500" />
            <p className="text-[12px] font-medium text-muted-foreground">Memuat produk...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <CategoryEmptyState mobile />
        ) : (
          <ProductTable products={filteredProducts} />
        )}
      </div>

      {/* ===== DESKTOP LAYOUT ===== */}
      <div className="hidden md:flex md:h-full md:flex-col">
        {/* Desktop Header */}
        <div className="border-b border-border/50 bg-card/50 px-8 py-5 backdrop-blur-sm">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
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
                <Link href="/categories">
                  <Button variant="outline" size="sm" className="rounded-xl">
                    <Package className="mr-2 h-4 w-4" />
                    Kategori
                  </Button>
                </Link>
                <Link href="/products/new">
                  <Button variant="premium" size="sm" className="rounded-xl">
                    <Plus className="mr-2 h-4 w-4" />
                    Tambah Produk
                  </Button>
                </Link>
              </div>
            </div>

            {/* Desktop Search & Filters */}
            <div className="flex items-center gap-3">
              <div className="relative max-w-md flex-1">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  placeholder="Cari produk, SKU, barcode..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-10 w-full rounded-xl border border-border/50 bg-muted/30 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 transition-all duration-200 focus:border-primary/50 focus:bg-card focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto scrollbar-none">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={cn(
                    'shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200 cursor-pointer',
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
                      'shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200 cursor-pointer',
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
        </div>

        {/* Desktop Table */}
        <div className="flex-1 overflow-y-auto p-8">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-sm text-muted-foreground">Memuat produk...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <CategoryEmptyState />
          ) : (
            <ProductTable products={filteredProducts} />
          )}
        </div>
      </div>
    </div>
  )
}

function CategoryEmptyState({ mobile = false }: { mobile?: boolean }) {
  if (mobile) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-card/50 py-10 text-center">
        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-muted/70">
          <Search className="h-4 w-4 text-muted-foreground/50" />
        </div>
        <p className="text-[13px] font-medium text-muted-foreground">
          Tidak ada produk
        </p>
        <p className="mt-1 max-w-[220px] text-[11px] leading-relaxed text-muted-foreground/60">
          Produk untuk kategori ini belum tersedia.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/80">
        <Search className="h-7 w-7 text-muted-foreground/50" />
      </div>
      <p className="text-sm font-medium text-muted-foreground">
        Tidak ada produk
      </p>
      <p className="mt-1 text-xs text-muted-foreground/60">
        Produk untuk kategori ini belum tersedia.
      </p>
    </div>
  )
}
