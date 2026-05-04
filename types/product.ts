export interface Product {
  id: string
  name: string
  barcode: string | null
  sku: string | null
  categoryId: string | null
  costPrice: number
  sellingPrice: number
  stock: number
  minStock: number
  unit: string
  imageUrl: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  category?: { id: string; name: string; color: string } | null
}

export interface Category {
  id: string
  name: string
  description: string | null
  color: string
  icon: string | null
  sortOrder: number
  createdAt: string
}
