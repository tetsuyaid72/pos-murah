import { create } from 'zustand'
import type { Product, Category } from '@/types'

type ViewMode = 'grid' | 'list'

interface ProductState {
  products: Product[]
  categories: Category[]
  searchQuery: string
  selectedCategoryId: string | null
  viewMode: ViewMode
  isLoading: boolean
  error: string | null
}

interface ProductActions {
  // Data fetching
  fetchProducts: () => Promise<void>
  fetchCategories: () => Promise<void>

  // CRUD via API
  createProduct: (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'isActive'>) => Promise<Product | null>
  updateProduct: (id: string, data: Partial<Product>) => Promise<Product | null>
  deleteProduct: (id: string) => Promise<boolean>
  toggleActive: (id: string, isActive: boolean) => Promise<boolean>

  // Local state
  setSearchQuery: (query: string) => void
  setSelectedCategory: (categoryId: string | null) => void
  setViewMode: (mode: ViewMode) => void
  getFilteredProducts: () => Product[]
}

export const useProductStore = create<ProductState & ProductActions>()((set, get) => ({
  products: [],
  categories: [],
  searchQuery: '',
  selectedCategoryId: null,
  viewMode: 'grid',
  isLoading: false,
  error: null,

  fetchProducts: async () => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch('/api/products?active=false')
      if (!res.ok) {
        // 401/403 means no store context — return empty instead of error
        if (res.status === 401 || res.status === 403) {
          set({ products: [], isLoading: false })
          return
        }
        throw new Error('Gagal memuat produk')
      }
      const data = await res.json()
      set({ products: data.products, isLoading: false })
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false })
    }
  },

  fetchCategories: async () => {
    try {
      const res = await fetch('/api/categories')
      if (!res.ok) {
        // 401/403 means no store context — return empty instead of error
        if (res.status === 401 || res.status === 403) {
          set({ categories: [] })
          return
        }
        throw new Error('Gagal memuat kategori')
      }
      const data = await res.json()
      set({ categories: data.categories })
    } catch (err) {
      console.error('Failed to fetch categories:', err)
    }
  },

  createProduct: async (data) => {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Gagal menambah produk')
      }
      const { product } = await res.json()
      set((state) => ({ products: [product, ...state.products] }))
      return product
    } catch (err) {
      set({ error: (err as Error).message })
      return null
    }
  },

  updateProduct: async (id, data) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Gagal mengupdate produk')
      }
      const { product } = await res.json()
      set((state) => ({
        products: state.products.map((p) => (p.id === id ? product : p)),
      }))
      return product
    } catch (err) {
      set({ error: (err as Error).message })
      return null
    }
  },

  deleteProduct: async (id) => {
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Gagal menghapus produk')
      }
      set((state) => ({
        products: state.products.filter((p) => p.id !== id),
      }))
      return true
    } catch (err) {
      set({ error: (err as Error).message })
      return false
    }
  },

  toggleActive: async (id, isActive) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      })
      if (!res.ok) return false
      const { product } = await res.json()
      set((state) => ({
        products: state.products.map((p) => (p.id === id ? product : p)),
      }))
      return true
    } catch {
      return false
    }
  },

  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedCategory: (categoryId) => set({ selectedCategoryId: categoryId }),
  setViewMode: (mode) => set({ viewMode: mode }),

  getFilteredProducts: () => {
    const { products, searchQuery, selectedCategoryId } = get()

    return products.filter((product) => {
      if (!product.isActive) return false

      const matchesSearch =
        !searchQuery ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.barcode?.includes(searchQuery) ||
        product.sku?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCategory =
        !selectedCategoryId || product.categoryId === selectedCategoryId

      return matchesSearch && matchesCategory
    })
  },
}))
