'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Menu } from 'lucide-react'
import { useProductStore } from '@/stores/product-store'
import { ProductForm } from '@/components/products/product-form'
import { Button } from '@/components/ui/button'
import { useUIStore } from '@/stores/ui-store'

export default function NewProductPage() {
  const { fetchCategories } = useProductStore()
  const searchParams = useSearchParams()
  const barcode = searchParams.get('barcode') || ''
  const { setSidebarOpen } = useUIStore()

  // Ensure categories are loaded for the form dropdown
  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  return (
    <div className="flex-1 overflow-y-auto px-3 pb-3 pt-2 md:p-6">
      <div className="mb-3 flex items-start gap-2 md:hidden">
        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 rounded-lg" onClick={() => setSidebarOpen(true)}>
          <Menu className="h-4 w-4" />
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="text-[20px] font-bold leading-tight tracking-tight text-foreground">Tambah Produk</h1>
          <p className="mt-0.5 text-[12px] leading-tight text-muted-foreground">Isi data produk baru untuk ditambahkan ke inventori</p>
        </div>
      </div>
      <ProductForm initialBarcode={barcode} />
    </div>
  )
}
