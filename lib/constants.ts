import type { PaymentMethod } from '@/types'

export const APP_NAME = 'Warung Madura POS'
export const APP_DESCRIPTION = 'Sistem Point of Sale modern untuk UMKM'

/**
 * Payment method options
 */
export const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'cash', label: 'Tunai' },
  { value: 'qris', label: 'QRIS' },
  { value: 'debt', label: 'Hutang' },
]

/**
 * Product unit options
 */
export const PRODUCT_UNITS = [
  { value: 'pcs', label: 'Pcs' },
  { value: 'kg', label: 'Kg' },
  { value: 'liter', label: 'Liter' },
  { value: 'pack', label: 'Pack' },
  { value: 'box', label: 'Box' },
  { value: 'botol', label: 'Botol' },
  { value: 'sachet', label: 'Sachet' },
  { value: 'bungkus', label: 'Bungkus' },
] as const

/**
 * Navigation items for sidebar
 */
export const NAV_ITEMS = [
  { href: '/pos', label: 'Kasir', icon: 'ShoppingCart' },
  { href: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { href: '/products', label: 'Produk', icon: 'Package' },
  { href: '/transactions', label: 'Transaksi', icon: 'Receipt' },
  { href: '/customers', label: 'Pelanggan', icon: 'Users' },
  { href: '/settings', label: 'Pengaturan', icon: 'Settings' },
] as const

/**
 * Stock level thresholds
 */
export const STOCK_LEVELS = {
  LOW: 5,
  CRITICAL: 2,
} as const
