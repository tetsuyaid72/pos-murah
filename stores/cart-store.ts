import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Product, PaymentMethod } from '@/types'

export interface CartItem {
  id: string
  productId: string
  productName: string
  imageUrl: string | null
  categoryId: string | null
  unitPrice: number
  costPrice: number
  quantity: number
  discountAmount: number
  subtotal: number
}

interface CartState {
  items: CartItem[]
  discountAmount: number
  discountType: 'percentage' | 'fixed'
  paymentMethod: PaymentMethod
  customerId: string | null
  notes: string | null
  storeId: string | null
}

interface CartActions {
  addItem: (product: Product) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  setItemDiscount: (itemId: string, discount: number) => void
  setDiscount: (amount: number, type: 'percentage' | 'fixed') => void
  setPaymentMethod: (method: PaymentMethod) => void
  setCustomerId: (id: string | null) => void
  setNotes: (notes: string | null) => void
  setStoreContext: (storeId: string | null) => void
  removeMissingProducts: (validProductIds: string[]) => void
  clearCart: () => void
  getSubtotal: () => number
  getTotal: () => number
  getItemCount: () => number
}

const initialState: CartState = {
  items: [],
  discountAmount: 0,
  discountType: 'fixed',
  paymentMethod: 'cash',
  customerId: null,
  notes: null,
  storeId: null,
}

export const useCartStore = create<CartState & CartActions>()(persist((set, get) => ({
  ...initialState,

  addItem: (product: Product) => {
    set((state) => {
      const existingItem = state.items.find((item) => item.productId === product.id)

      if (existingItem) {
        return {
          items: state.items.map((item) =>
            item.productId === product.id
              ? {
                  ...item,
                  quantity: item.quantity + 1,
                  subtotal: (item.quantity + 1) * item.unitPrice - item.discountAmount,
                }
              : item
          ),
        }
      }

      const newItem: CartItem = {
        id: Date.now().toString(36) + Math.random().toString(36).substring(2, 9),
        productId: product.id,
        productName: product.name,
        imageUrl: product.imageUrl,
        categoryId: product.categoryId,
        unitPrice: product.sellingPrice,
        costPrice: product.costPrice,
        quantity: 1,
        discountAmount: 0,
        subtotal: product.sellingPrice,
      }

      return { items: [...state.items, newItem] }
    })
  },

  removeItem: (itemId: string) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== itemId),
    }))
  },

  updateQuantity: (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      get().removeItem(itemId)
      return
    }

    set((state) => ({
      items: state.items.map((item) =>
        item.id === itemId
          ? {
              ...item,
              quantity,
              subtotal: quantity * item.unitPrice - item.discountAmount,
            }
          : item
      ),
    }))
  },

  setItemDiscount: (itemId: string, discount: number) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.id === itemId
          ? {
              ...item,
              discountAmount: discount,
              subtotal: item.quantity * item.unitPrice - discount,
            }
          : item
      ),
    }))
  },

  setDiscount: (amount: number, type: 'percentage' | 'fixed') => {
    set({ discountAmount: amount, discountType: type })
  },

  setPaymentMethod: (method: PaymentMethod) => {
    set({ paymentMethod: method })
  },

  setCustomerId: (id: string | null) => {
    set({ customerId: id })
  },

  setNotes: (notes: string | null) => {
    set({ notes })
  },

  setStoreContext: (storeId: string | null) => {
    set((state) => {
      if (state.storeId === storeId) return state
      return {
        ...initialState,
        storeId,
      }
    })
  },

  removeMissingProducts: (validProductIds: string[]) => {
    const validIds = new Set(validProductIds)
    set((state) => ({
      items: state.items.filter((item) => validIds.has(item.productId)),
    }))
  },

  clearCart: () => {
    set((state) => ({
      ...initialState,
      storeId: state.storeId,
    }))
  },

  getSubtotal: () => {
    return get().items.reduce((sum, item) => sum + item.subtotal, 0)
  },

  getTotal: () => {
    const subtotal = get().getSubtotal()
    const { discountAmount, discountType } = get()

    if (discountType === 'percentage') {
      return subtotal - (subtotal * discountAmount) / 100
    }
    return subtotal - discountAmount
  },

  getItemCount: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0)
  },
}), {
  name: 'pos-cart',
}))
