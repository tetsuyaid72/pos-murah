'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Edit, Trash2, Power, PowerOff, TrendingUp, MoreHorizontal, Pencil, EyeOff, Eye } from 'lucide-react'
import { formatRupiah } from '@/lib/format'
import { cn } from '@/lib/utils'
import { useProductStore } from '@/stores/product-store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StockBadge } from './stock-badge'
import { ProductImage } from './product-image'
import { Dialog, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import type { Product } from '@/types'

interface ProductTableProps {
  products?: Product[]
}

export function ProductTable({ products: productItems }: ProductTableProps) {
  const { products, categories, deleteProduct, toggleActive } = useProductStore()
  const visibleProducts = productItems ?? products
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return '-'
    return categories.find((c) => c.id === categoryId)?.name || '-'
  }

  const getCategoryColor = (categoryId: string | null) => {
    if (!categoryId) return '#6b7280'
    return categories.find((c) => c.id === categoryId)?.color || '#6b7280'
  }

  const getMargin = (product: Product) => {
    if (product.costPrice === 0) return 0
    return ((product.sellingPrice - product.costPrice) / product.costPrice * 100).toFixed(0)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    await deleteProduct(deleteTarget.id)
    setDeleteTarget(null)
    setIsDeleting(false)
  }

  const handleToggleActive = async (product: Product) => {
    await toggleActive(product.id, !product.isActive)
  }

  if (visibleProducts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/80 mb-4">
          <TrendingUp className="h-7 w-7 text-muted-foreground/50" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">Belum ada produk.</p>
        <p className="mt-1 text-xs text-muted-foreground/60">
          Klik tombol &quot;Tambah Produk&quot; untuk memulai.
        </p>
      </div>
    )
  }

  return (
    <>
      {/* ===== MOBILE: Ultra-compact inventory row list ===== */}
      <div className="block space-y-2 md:hidden">
        {visibleProducts.map((product) => (
          <div
            key={product.id}
            className={cn(
              'relative grid min-h-[88px] grid-cols-[44px_1fr_84px_42px] items-center gap-2 rounded-xl border border-border bg-card text-card-foreground px-2.5 py-2 pr-9 shadow-sm min-[390px]:grid-cols-[48px_1fr_92px_46px]',
              !product.isActive && 'opacity-60'
            )}
          >
            {/* Product image */}
            <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-lg bg-muted/20 min-[390px]:h-12 min-[390px]:w-12">
              <ProductImage product={product} size="sm" className="h-9 w-9 rounded-lg object-contain min-[390px]:h-10 min-[390px]:w-10" />
            </div>

            {/* Product info */}
            <div className="min-w-0 self-start pt-0.5">
              <p className="line-clamp-2 text-[13px] font-semibold leading-tight text-foreground">
                {product.name}
              </p>
              <p className="mt-0.5 truncate text-[11px] leading-tight text-muted-foreground">
                SKU: {product.sku || '-'}
              </p>
              <Badge
                className="mt-1 h-5 rounded-full border-0 bg-emerald-50 px-2 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
              >
                {getCategoryName(product.categoryId)}
              </Badge>
            </div>

            {/* Price & Stock */}
            <div className="min-w-0 self-start pt-0.5">
              <p className="whitespace-nowrap text-[11px] leading-tight text-muted-foreground">Harga Jual</p>
              <p className="mt-0.5 whitespace-nowrap text-[13px] font-semibold leading-tight tabular-nums text-foreground min-[390px]:text-[14px]">
                {formatRupiah(product.sellingPrice)}
              </p>
            </div>

            {/* Stock */}
            <div className="min-w-0 self-start pt-0.5 text-center">
              <p className="whitespace-nowrap text-[11px] leading-tight text-muted-foreground">Stok</p>
              <Badge
                className={cn(
                  'mt-0.5 h-5 min-w-7 rounded-full px-1.5 text-[11px] font-semibold',
                  product.stock <= 0
                    ? 'border border-rose-100 bg-rose-50 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400'
                    : product.stock <= product.minStock
                      ? 'border border-amber-100 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400'
                      : 'border border-emerald-100 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400'
                )}
              >
                {product.stock}
              </Badge>
            </div>

            {/* Menu titik tiga */}
            <div className="absolute right-2.5 top-2.5 z-20">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-full text-muted-foreground hover:bg-muted"
                  >
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" sideOffset={8} className="border-border bg-popover text-popover-foreground">
                  <DropdownMenuItem>
                    <Link href={`/products/${product.id}`} className="flex w-full items-center gap-2">
                      <Pencil className="h-4 w-4" />
                      Edit Produk
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleToggleActive(product)}>
                    {product.isActive ? (
                      <>
                        <EyeOff className="mr-2 h-4 w-4" />
                        Nonaktifkan
                      </>
                    ) : (
                      <>
                        <Eye className="mr-2 h-4 w-4" />
                        Aktifkan
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setDeleteTarget(product)}
                    className="text-rose-600 hover:!bg-rose-500/10 hover:!text-rose-600 dark:text-rose-400 dark:hover:!text-rose-400"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Hapus Produk
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden md:block">
        <div className="overflow-x-auto rounded-2xl border border-border/50 bg-card shadow-[var(--shadow-card)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Produk
                </th>
                <th className="hidden px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:table-cell">
                  Kategori
                </th>
                <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Harga Jual
                </th>
                <th className="hidden px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground md:table-cell">
                  Margin
                </th>
                <th className="px-5 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Stok
                </th>
                <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {visibleProducts.map((product, index) => (
                <tr
                  key={product.id}
                  className={cn(
                    'border-b border-border/30 transition-colors duration-150 hover:bg-muted/30',
                    !product.isActive && 'opacity-50',
                    index === visibleProducts.length - 1 && 'border-b-0'
                  )}
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <ProductImage product={product} size="sm" className="rounded-xl" />
                      <div>
                        <p className="font-medium text-foreground">{product.name}</p>
                        {product.sku && (
                          <p className="text-[11px] text-muted-foreground">SKU: {product.sku}</p>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="hidden px-5 py-3.5 sm:table-cell">
                    <span
                      className="inline-flex items-center rounded-lg px-2.5 py-1 text-[11px] font-semibold text-white"
                      style={{ backgroundColor: getCategoryColor(product.categoryId) }}
                    >
                      {getCategoryName(product.categoryId)}
                    </span>
                  </td>

                  <td className="px-5 py-3.5 text-right font-semibold tabular-nums text-foreground">
                    {formatRupiah(product.sellingPrice)}
                  </td>

                  <td className="hidden px-5 py-3.5 text-right md:table-cell">
                    <Badge variant={Number(getMargin(product)) >= 30 ? 'success' : Number(getMargin(product)) >= 15 ? 'info' : 'warning'} className="text-[10px]">
                      {getMargin(product)}%
                    </Badge>
                  </td>

                  <td className="px-5 py-3.5 text-center">
                    <StockBadge stock={product.stock} minStock={product.minStock} />
                  </td>

                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/products/${product.id}`}>
                        <Button variant="ghost" size="icon-sm" title="Edit" className="rounded-lg">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleToggleActive(product)}
                        title={product.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                        className="rounded-lg"
                      >
                        {product.isActive ? (
                          <PowerOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Power className="h-4 w-4 text-emerald-500" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setDeleteTarget(product)}
                        title="Hapus"
                        className="rounded-lg"
                      >
                        <Trash2 className="h-4 w-4 text-rose-500" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DialogHeader>
          <DialogTitle>Hapus Produk</DialogTitle>
          <DialogClose onClose={() => setDeleteTarget(null)} />
        </DialogHeader>
        <p className="mb-6 text-sm text-muted-foreground">
          Apakah Anda yakin ingin menghapus{' '}
          <span className="font-semibold text-foreground">{deleteTarget?.name}</span>?
          Tindakan ini tidak dapat dibatalkan.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeleteTarget(null)}>
            Batal
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            <Trash2 className="mr-2 h-4 w-4" />
            {isDeleting ? 'Menghapus...' : 'Hapus'}
          </Button>
        </div>
      </Dialog>
    </>
  )
}
