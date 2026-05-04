'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useProductStore } from '@/stores/product-store'
import { ProductForm } from '@/components/products/product-form'
import type { Product } from '@/types'

export default function EditProductPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { fetchCategories } = useProductStore()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  // Fetch single product from API
  useEffect(() => {
    async function loadProduct() {
      try {
        const res = await fetch(`/api/products/${params.id}`)
        if (!res.ok) {
          router.push('/products')
          return
        }
        const data = await res.json()
        setProduct(data.product)
      } catch {
        router.push('/products')
      } finally {
        setLoading(false)
      }
    }
    loadProduct()
  }, [params.id, router])

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-muted-foreground">Memuat produk...</p>
      </div>
    )
  }

  if (!product) {
    return null
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6">
      <ProductForm product={product} />
    </div>
  )
}
