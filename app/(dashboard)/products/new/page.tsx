'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useProductStore } from '@/stores/product-store'
import { ProductForm } from '@/components/products/product-form'

export default function NewProductPage() {
  const { fetchCategories } = useProductStore()
  const searchParams = useSearchParams()
  const barcode = searchParams.get('barcode') || ''

  // Ensure categories are loaded for the form dropdown
  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  return (
    <div className="flex-1 overflow-y-auto p-3 md:p-6">
      <ProductForm initialBarcode={barcode} />
    </div>
  )
}
