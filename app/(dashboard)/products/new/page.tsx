'use client'

import { useEffect } from 'react'
import { useProductStore } from '@/stores/product-store'
import { ProductForm } from '@/components/products/product-form'

export default function NewProductPage() {
  const { fetchCategories } = useProductStore()

  // Ensure categories are loaded for the form dropdown
  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6">
      <ProductForm />
    </div>
  )
}
