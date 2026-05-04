/**
 * Demo Seed Data
 *
 * Inserts default categories and sample products for a newly registered store.
 * All data is scoped to the given storeId (multi-tenant safe).
 *
 * Must be called inside a better-sqlite3 sync transaction.
 */

import { categories, products } from './schema'
import { generateId } from '@/lib/utils'

// =============================================================================
// Category definitions
// =============================================================================

interface DemoCategory {
  name: string
  color: string
  icon: string
  sortOrder: number
}

const DEMO_CATEGORIES: DemoCategory[] = [
  { name: 'Minuman',  color: '#3b82f6', icon: 'coffee',        sortOrder: 0 },
  { name: 'Makanan',  color: '#f97316', icon: 'utensils',      sortOrder: 1 },
  { name: 'Sembako',  color: '#22c55e', icon: 'shopping-basket', sortOrder: 2 },
  { name: 'Snack',    color: '#a855f7', icon: 'candy',         sortOrder: 3 },
  { name: 'Lainnya',  color: '#6b7280', icon: 'package',       sortOrder: 4 },
]

// =============================================================================
// Product definitions (categoryIndex references DEMO_CATEGORIES array index)
// =============================================================================

interface DemoProduct {
  name: string
  barcode: string
  sku: string
  costPrice: number
  sellingPrice: number
  stock: number
  minStock: number
  unit: string
  categoryIndex: number // index into DEMO_CATEGORIES
}

const DEMO_PRODUCTS: DemoProduct[] = [
  // Minuman (index 0)
  { name: 'Aqua 600ml',          barcode: '8886008101053', sku: 'MNM-001', costPrice: 2500,  sellingPrice: 4000,  stock: 48, minStock: 12, unit: 'botol', categoryIndex: 0 },
  { name: 'Teh Botol Sosro',     barcode: '8886008101060', sku: 'MNM-002', costPrice: 3000,  sellingPrice: 5000,  stock: 24, minStock: 6,  unit: 'botol', categoryIndex: 0 },
  { name: 'Kopi Kapal Api Sachet', barcode: '8886008101077', sku: 'MNM-003', costPrice: 1000,  sellingPrice: 2000,  stock: 100, minStock: 20, unit: 'sachet', categoryIndex: 0 },
  { name: 'Sprite 390ml',        barcode: '8886008101084', sku: 'MNM-004', costPrice: 3500,  sellingPrice: 5500,  stock: 24, minStock: 6,  unit: 'botol', categoryIndex: 0 },

  // Makanan (index 1)
  { name: 'Indomie Goreng',      barcode: '8886008101091', sku: 'MKN-001', costPrice: 2800,  sellingPrice: 3500,  stock: 60, minStock: 12, unit: 'pcs', categoryIndex: 1 },
  { name: 'Indomie Kuah Soto',   barcode: '8886008101107', sku: 'MKN-002', costPrice: 2800,  sellingPrice: 3500,  stock: 36, minStock: 12, unit: 'pcs', categoryIndex: 1 },
  { name: 'Nasi Bungkus',        barcode: '',              sku: 'MKN-003', costPrice: 5000,  sellingPrice: 8000,  stock: 20, minStock: 5,  unit: 'pcs', categoryIndex: 1 },

  // Sembako (index 2)
  { name: 'Beras 5kg',           barcode: '8886008101114', sku: 'SMB-001', costPrice: 55000, sellingPrice: 65000, stock: 10, minStock: 3,  unit: 'karung', categoryIndex: 2 },
  { name: 'Minyak Goreng 1L',    barcode: '8886008101121', sku: 'SMB-002', costPrice: 14000, sellingPrice: 18000, stock: 15, minStock: 5,  unit: 'botol', categoryIndex: 2 },
  { name: 'Gula Pasir 1kg',      barcode: '8886008101138', sku: 'SMB-003', costPrice: 12000, sellingPrice: 15000, stock: 20, minStock: 5,  unit: 'kg',    categoryIndex: 2 },
  { name: 'Telur 1kg',           barcode: '',              sku: 'SMB-004', costPrice: 25000, sellingPrice: 28000, stock: 10, minStock: 3,  unit: 'kg',    categoryIndex: 2 },

  // Snack (index 3)
  { name: 'Chitato 68g',         barcode: '8886008101145', sku: 'SNK-001', costPrice: 7000,  sellingPrice: 10000, stock: 24, minStock: 6,  unit: 'pcs', categoryIndex: 3 },
  { name: 'Oreo 133g',           barcode: '8886008101152', sku: 'SNK-002', costPrice: 6000,  sellingPrice: 9000,  stock: 18, minStock: 6,  unit: 'pcs', categoryIndex: 3 },
]

// =============================================================================
// Seed function — call inside a sync transaction (better-sqlite3)
// =============================================================================

/**
 * Insert demo categories and products for a new store.
 * `tx` must be a Drizzle transaction object from better-sqlite3 (sync).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function seedDemoData(tx: any, storeId: string) {
  // 1. Insert categories and collect their IDs
  const categoryIds: string[] = DEMO_CATEGORIES.map((cat) => {
    const id = generateId()
    tx.insert(categories).values({
      id,
      storeId,
      name: cat.name,
      color: cat.color,
      icon: cat.icon,
      sortOrder: cat.sortOrder,
    }).run()
    return id
  })

  // 2. Insert products linked to their categories
  for (const product of DEMO_PRODUCTS) {
    tx.insert(products).values({
      id: generateId(),
      storeId,
      name: product.name,
      barcode: product.barcode || null,
      sku: product.sku,
      categoryId: categoryIds[product.categoryIndex],
      costPrice: product.costPrice,
      sellingPrice: product.sellingPrice,
      stock: product.stock,
      minStock: product.minStock,
      unit: product.unit,
    }).run()
  }
}
