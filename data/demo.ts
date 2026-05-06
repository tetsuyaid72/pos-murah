/**
 * Demo Mode — Complete in-memory data for /demo route
 *
 * This file provides all the data needed to render the dashboard, POS,
 * transactions, and products pages without touching the database.
 * Dates are generated dynamically relative to "now" so charts always look fresh.
 */

import type { Product, Category, Transaction, Customer } from '@/types'
import type { DashboardKpi } from '@/components/dashboard/kpi-grid'
import type { TrendDataPoint } from '@/components/dashboard/sales-trend-chart'
import type { TopProductData } from '@/components/dashboard/top-products'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

function dateStr(daysAgo: number): string {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return d.toISOString().slice(0, 10)
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export const demoCategories: Category[] = [
  { id: 'cat-1', name: 'Rokok', description: 'Berbagai merek rokok', color: '#ef4444', icon: 'Cigarette', sortOrder: 1, createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 'cat-2', name: 'Minuman', description: 'Minuman dingin dan hangat', color: '#3b82f6', icon: 'Coffee', sortOrder: 2, createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 'cat-3', name: 'Makanan Ringan', description: 'Snack dan cemilan', color: '#f59e0b', icon: 'Cookie', sortOrder: 3, createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 'cat-4', name: 'Sembako', description: 'Kebutuhan pokok sehari-hari', color: '#22c55e', icon: 'ShoppingBasket', sortOrder: 4, createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 'cat-5', name: 'Obat & Kesehatan', description: 'Obat-obatan dan kebutuhan kesehatan', color: '#8b5cf6', icon: 'Pill', sortOrder: 5, createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 'cat-6', name: 'Perawatan', description: 'Sabun, shampo, dan perawatan tubuh', color: '#ec4899', icon: 'Sparkles', sortOrder: 6, createdAt: '2024-01-01T00:00:00.000Z' },
]

// ---------------------------------------------------------------------------
// Products (20 items)
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Demo Product Image Map
// Mapping berdasarkan product ID → image path di /public/uploads/products/
// Produk tanpa gambar asli → null (fallback ke icon kategori)
// ---------------------------------------------------------------------------
const DEMO_PRODUCT_IMAGES: Record<string, string | null> = {
  'p-1': '/uploads/products/gudang-garam-surya-16.jpg',
  'p-2': '/uploads/products/sampoerna-mild-16.jpg',
  'p-3': '/uploads/products/aqua-600ml.webp',
  'p-4': '/uploads/products/teh-botol-sosro-450ml.jpg',
  'p-5': '/uploads/products/indomie-goreng.png',
  'p-6': '/uploads/products/chitato-sapi-panggang.png',
  'p-7': '/uploads/products/beras-premium-5kg.jpg',
  'p-8': '/uploads/products/gula-pasir-1kg.png',
  'p-9': '/uploads/products/minyak-goreng-bimoli-1l.jpg',
  'p-10': '/uploads/products/paracetamol 500mg.png',
  'p-11': '/uploads/products/kapal api special 165g.png',
  'p-12': '/uploads/products/sabun lifebuoy 100g.png',
  'p-13': '/uploads/products/sprite 390ml.jpg',
  'p-14': '/uploads/products/indomie soto.avif',
  'p-15': '/uploads/products/telur ayam 1kg.png',
  'p-16': '/uploads/products/oreo original 133g.jpg',
  'p-17': '/uploads/products/sampo pantene 160ml.webp',
  'p-18': '/uploads/products/pocari sweat 50ml.webp',
  'p-19': '/uploads/products/djarum super 16.webp',
  'p-20': '/uploads/products/tolak angin cair.webp',
}

function getDemoImage(productId: string): string | null {
  return DEMO_PRODUCT_IMAGES[productId] ?? null
}

export const demoProducts: Product[] = [
  { id: 'p-1', name: 'Gudang Garam Surya 16', barcode: '8991002527003', sku: 'GGS-16', categoryId: 'cat-1', costPrice: 28000, sellingPrice: 31000, stock: 48, minStock: 10, unit: 'bungkus', imageUrl: getDemoImage('p-1'), isActive: true, createdAt: '2024-01-15T00:00:00.000Z', updatedAt: daysAgo(0) },
  { id: 'p-2', name: 'Sampoerna Mild 16', barcode: '8991002525009', sku: 'SM-16', categoryId: 'cat-1', costPrice: 29000, sellingPrice: 32000, stock: 42, minStock: 10, unit: 'bungkus', imageUrl: getDemoImage('p-2'), isActive: true, createdAt: '2024-01-15T00:00:00.000Z', updatedAt: daysAgo(0) },
  { id: 'p-3', name: 'Aqua 600ml', barcode: '8886008101053', sku: 'AQ-600', categoryId: 'cat-2', costPrice: 3000, sellingPrice: 4000, stock: 115, minStock: 20, unit: 'botol', imageUrl: getDemoImage('p-3'), isActive: true, createdAt: '2024-01-15T00:00:00.000Z', updatedAt: daysAgo(0) },
  { id: 'p-4', name: 'Teh Botol Sosro 450ml', barcode: '8886008600013', sku: 'TBS-450', categoryId: 'cat-2', costPrice: 3500, sellingPrice: 5000, stock: 76, minStock: 15, unit: 'botol', imageUrl: getDemoImage('p-4'), isActive: true, createdAt: '2024-01-15T00:00:00.000Z', updatedAt: daysAgo(0) },
  { id: 'p-5', name: 'Indomie Goreng', barcode: '8996001600016', sku: 'IM-GRG', categoryId: 'cat-3', costPrice: 2800, sellingPrice: 3500, stock: 185, minStock: 30, unit: 'pcs', imageUrl: getDemoImage('p-5'), isActive: true, createdAt: '2024-01-15T00:00:00.000Z', updatedAt: daysAgo(0) },
  { id: 'p-6', name: 'Chitato Sapi Panggang 68g', barcode: '8886008101060', sku: 'CHT-SP68', categoryId: 'cat-3', costPrice: 8000, sellingPrice: 10000, stock: 32, minStock: 10, unit: 'pcs', imageUrl: getDemoImage('p-6'), isActive: true, createdAt: '2024-01-15T00:00:00.000Z', updatedAt: daysAgo(0) },
  { id: 'p-7', name: 'Beras Premium 5kg', barcode: '8991102311001', sku: 'BRS-5KG', categoryId: 'cat-4', costPrice: 62000, sellingPrice: 70000, stock: 22, minStock: 5, unit: 'pcs', imageUrl: getDemoImage('p-7'), isActive: true, createdAt: '2024-01-15T00:00:00.000Z', updatedAt: daysAgo(0) },
  { id: 'p-8', name: 'Gula Pasir 1kg', barcode: '8991102311002', sku: 'GLP-1KG', categoryId: 'cat-4', costPrice: 14000, sellingPrice: 16000, stock: 38, minStock: 10, unit: 'pcs', imageUrl: getDemoImage('p-8'), isActive: true, createdAt: '2024-01-15T00:00:00.000Z', updatedAt: daysAgo(0) },
  { id: 'p-9', name: 'Minyak Goreng Bimoli 1L', barcode: '8991102311003', sku: 'MG-BML1L', categoryId: 'cat-4', costPrice: 17000, sellingPrice: 20000, stock: 28, minStock: 8, unit: 'botol', imageUrl: getDemoImage('p-9'), isActive: true, createdAt: '2024-01-15T00:00:00.000Z', updatedAt: daysAgo(0) },
  { id: 'p-10', name: 'Paracetamol 500mg', barcode: '8991102311004', sku: 'PCT-500', categoryId: 'cat-5', costPrice: 8000, sellingPrice: 12000, stock: 14, minStock: 5, unit: 'strip', imageUrl: getDemoImage('p-10'), isActive: true, createdAt: '2024-01-15T00:00:00.000Z', updatedAt: daysAgo(0) },
  { id: 'p-11', name: 'Kopi Kapal Api Special 165g', barcode: '8991102311005', sku: 'KKA-165', categoryId: 'cat-2', costPrice: 9000, sellingPrice: 12000, stock: 3, minStock: 5, unit: 'pcs', imageUrl: getDemoImage('p-11'), isActive: true, createdAt: '2024-01-15T00:00:00.000Z', updatedAt: daysAgo(0) },
  { id: 'p-12', name: 'Sabun Lifebuoy 100g', barcode: '8991102311006', sku: 'SLB-100', categoryId: 'cat-6', costPrice: 4000, sellingPrice: 5500, stock: 1, minStock: 5, unit: 'pcs', imageUrl: getDemoImage('p-12'), isActive: true, createdAt: '2024-01-15T00:00:00.000Z', updatedAt: daysAgo(0) },
  { id: 'p-13', name: 'Sprite 390ml', barcode: '8886001200013', sku: 'SPR-390', categoryId: 'cat-2', costPrice: 4000, sellingPrice: 5500, stock: 60, minStock: 15, unit: 'botol', imageUrl: getDemoImage('p-13'), isActive: true, createdAt: '2024-02-01T00:00:00.000Z', updatedAt: daysAgo(0) },
  { id: 'p-14', name: 'Indomie Soto', barcode: '8996001600023', sku: 'IM-STO', categoryId: 'cat-3', costPrice: 2800, sellingPrice: 3500, stock: 150, minStock: 30, unit: 'pcs', imageUrl: getDemoImage('p-14'), isActive: true, createdAt: '2024-02-01T00:00:00.000Z', updatedAt: daysAgo(0) },
  { id: 'p-15', name: 'Telur Ayam 1kg', barcode: '0000000000015', sku: 'TLR-1KG', categoryId: 'cat-4', costPrice: 26000, sellingPrice: 30000, stock: 18, minStock: 5, unit: 'kg', imageUrl: getDemoImage('p-15'), isActive: true, createdAt: '2024-02-01T00:00:00.000Z', updatedAt: daysAgo(0) },
  { id: 'p-16', name: 'Oreo Original 133g', barcode: '8992760221011', sku: 'ORE-133', categoryId: 'cat-3', costPrice: 7500, sellingPrice: 10000, stock: 25, minStock: 8, unit: 'pcs', imageUrl: getDemoImage('p-16'), isActive: true, createdAt: '2024-02-10T00:00:00.000Z', updatedAt: daysAgo(0) },
  { id: 'p-17', name: 'Shampo Pantene 160ml', barcode: '4902430888011', sku: 'SHP-160', categoryId: 'cat-6', costPrice: 18000, sellingPrice: 23000, stock: 12, minStock: 4, unit: 'botol', imageUrl: getDemoImage('p-17'), isActive: true, createdAt: '2024-02-10T00:00:00.000Z', updatedAt: daysAgo(0) },
  { id: 'p-18', name: 'Pocari Sweat 500ml', barcode: '8996001600030', sku: 'PCR-500', categoryId: 'cat-2', costPrice: 5500, sellingPrice: 7500, stock: 40, minStock: 10, unit: 'botol', imageUrl: getDemoImage('p-18'), isActive: true, createdAt: '2024-03-01T00:00:00.000Z', updatedAt: daysAgo(0) },
  { id: 'p-19', name: 'Djarum Super 16', barcode: '8991002521001', sku: 'DJS-16', categoryId: 'cat-1', costPrice: 26000, sellingPrice: 29000, stock: 35, minStock: 10, unit: 'bungkus', imageUrl: getDemoImage('p-19'), isActive: true, createdAt: '2024-03-01T00:00:00.000Z', updatedAt: daysAgo(0) },
  { id: 'p-20', name: 'Tolak Angin Cair', barcode: '8991102311020', sku: 'TA-CIR', categoryId: 'cat-5', costPrice: 3500, sellingPrice: 5000, stock: 20, minStock: 5, unit: 'sachet', imageUrl: getDemoImage('p-20'), isActive: true, createdAt: '2024-03-01T00:00:00.000Z', updatedAt: daysAgo(0) },
]

// ---------------------------------------------------------------------------
// Customers
// ---------------------------------------------------------------------------

export const demoCustomers: Customer[] = [
  { id: 'cust-1', name: 'Pak Budi', phone: '08123456001', address: 'Jl. Melati No. 5', totalDebt: 20000, createdAt: '2024-02-01T00:00:00.000Z' },
  { id: 'cust-2', name: 'Bu Siti', phone: '08123456002', address: 'Jl. Mawar No. 12', totalDebt: 55000, createdAt: '2024-02-10T00:00:00.000Z' },
  { id: 'cust-3', name: 'Mas Agus', phone: '08123456003', address: null, totalDebt: 0, createdAt: '2024-03-05T00:00:00.000Z' },
  { id: 'cust-4', name: 'Mbak Rina', phone: '08123456004', address: 'Jl. Kenanga No. 8', totalDebt: 35000, createdAt: '2024-03-15T00:00:00.000Z' },
  { id: 'cust-5', name: 'Pak Hendra', phone: null, address: 'Jl. Dahlia No. 3', totalDebt: 0, createdAt: '2024-04-01T00:00:00.000Z' },
]

// ---------------------------------------------------------------------------
// Transactions (15 realistic transactions over the past 7 days)
// ---------------------------------------------------------------------------

export const demoTransactions: Transaction[] = [
  // Today — 4 transactions
  {
    id: 'dt-1', invoiceNumber: 'INV-DEMO-001',
    items: [
      { id: 'di-1', productId: 'p-3', productName: 'Aqua 600ml', quantity: 3, unitPrice: 4000, costPrice: 3000, discountAmount: 0, subtotal: 12000 },
      { id: 'di-2', productId: 'p-5', productName: 'Indomie Goreng', quantity: 5, unitPrice: 3500, costPrice: 2800, discountAmount: 0, subtotal: 17500 },
    ],
    subtotal: 29500, discountAmount: 0, discountType: 'fixed', taxAmount: 0, totalAmount: 29500,
    paymentMethod: 'cash', amountPaid: 50000, changeAmount: 20500,
    customerId: null, cashierId: 'demo-user', outletId: 'demo-outlet', status: 'completed', notes: null, createdAt: daysAgo(0),
  },
  {
    id: 'dt-2', invoiceNumber: 'INV-DEMO-002',
    items: [
      { id: 'di-3', productId: 'p-1', productName: 'Gudang Garam Surya 16', quantity: 2, unitPrice: 31000, costPrice: 28000, discountAmount: 0, subtotal: 62000 },
      { id: 'di-4', productId: 'p-4', productName: 'Teh Botol Sosro 450ml', quantity: 2, unitPrice: 5000, costPrice: 3500, discountAmount: 0, subtotal: 10000 },
    ],
    subtotal: 72000, discountAmount: 2000, discountType: 'fixed', taxAmount: 0, totalAmount: 70000,
    paymentMethod: 'cash', amountPaid: 100000, changeAmount: 30000,
    customerId: null, cashierId: 'demo-user', outletId: 'demo-outlet', status: 'completed', notes: null, createdAt: daysAgo(0),
  },
  {
    id: 'dt-3', invoiceNumber: 'INV-DEMO-003',
    items: [
      { id: 'di-5', productId: 'p-7', productName: 'Beras Premium 5kg', quantity: 1, unitPrice: 70000, costPrice: 62000, discountAmount: 0, subtotal: 70000 },
      { id: 'di-6', productId: 'p-8', productName: 'Gula Pasir 1kg', quantity: 2, unitPrice: 16000, costPrice: 14000, discountAmount: 0, subtotal: 32000 },
      { id: 'di-7', productId: 'p-9', productName: 'Minyak Goreng Bimoli 1L', quantity: 1, unitPrice: 20000, costPrice: 17000, discountAmount: 0, subtotal: 20000 },
    ],
    subtotal: 122000, discountAmount: 0, discountType: 'fixed', taxAmount: 0, totalAmount: 122000,
    paymentMethod: 'qris', amountPaid: 122000, changeAmount: 0,
    customerId: null, cashierId: 'demo-user', outletId: 'demo-outlet', status: 'completed', notes: null, createdAt: daysAgo(0),
  },
  {
    id: 'dt-4', invoiceNumber: 'INV-DEMO-004',
    items: [
      { id: 'di-8', productId: 'p-18', productName: 'Pocari Sweat 500ml', quantity: 2, unitPrice: 7500, costPrice: 5500, discountAmount: 0, subtotal: 15000 },
      { id: 'di-9', productId: 'p-16', productName: 'Oreo Original 133g', quantity: 1, unitPrice: 10000, costPrice: 7500, discountAmount: 0, subtotal: 10000 },
    ],
    subtotal: 25000, discountAmount: 0, discountType: 'fixed', taxAmount: 0, totalAmount: 25000,
    paymentMethod: 'cash', amountPaid: 25000, changeAmount: 0,
    customerId: null, cashierId: 'demo-user', outletId: 'demo-outlet', status: 'completed', notes: null, createdAt: daysAgo(0),
  },
  // Yesterday — 3 transactions
  {
    id: 'dt-5', invoiceNumber: 'INV-DEMO-005',
    items: [
      { id: 'di-10', productId: 'p-2', productName: 'Sampoerna Mild 16', quantity: 3, unitPrice: 32000, costPrice: 29000, discountAmount: 0, subtotal: 96000 },
    ],
    subtotal: 96000, discountAmount: 0, discountType: 'fixed', taxAmount: 0, totalAmount: 96000,
    paymentMethod: 'cash', amountPaid: 100000, changeAmount: 4000,
    customerId: null, cashierId: 'demo-user', outletId: 'demo-outlet', status: 'completed', notes: null, createdAt: daysAgo(1),
  },
  {
    id: 'dt-6', invoiceNumber: 'INV-DEMO-006',
    items: [
      { id: 'di-11', productId: 'p-6', productName: 'Chitato Sapi Panggang 68g', quantity: 2, unitPrice: 10000, costPrice: 8000, discountAmount: 0, subtotal: 20000 },
      { id: 'di-12', productId: 'p-3', productName: 'Aqua 600ml', quantity: 4, unitPrice: 4000, costPrice: 3000, discountAmount: 0, subtotal: 16000 },
      { id: 'di-13', productId: 'p-11', productName: 'Kopi Kapal Api Special 165g', quantity: 1, unitPrice: 12000, costPrice: 9000, discountAmount: 0, subtotal: 12000 },
    ],
    subtotal: 48000, discountAmount: 0, discountType: 'fixed', taxAmount: 0, totalAmount: 48000,
    paymentMethod: 'cash', amountPaid: 50000, changeAmount: 2000,
    customerId: null, cashierId: 'demo-user', outletId: 'demo-outlet', status: 'completed', notes: null, createdAt: daysAgo(1),
  },
  {
    id: 'dt-7', invoiceNumber: 'INV-DEMO-007',
    items: [
      { id: 'di-14', productId: 'p-15', productName: 'Telur Ayam 1kg', quantity: 2, unitPrice: 30000, costPrice: 26000, discountAmount: 0, subtotal: 60000 },
      { id: 'di-15', productId: 'p-13', productName: 'Sprite 390ml', quantity: 3, unitPrice: 5500, costPrice: 4000, discountAmount: 0, subtotal: 16500 },
    ],
    subtotal: 76500, discountAmount: 0, discountType: 'fixed', taxAmount: 0, totalAmount: 76500,
    paymentMethod: 'qris', amountPaid: 76500, changeAmount: 0,
    customerId: null, cashierId: 'demo-user', outletId: 'demo-outlet', status: 'completed', notes: null, createdAt: daysAgo(1),
  },
  // 2 days ago
  {
    id: 'dt-8', invoiceNumber: 'INV-DEMO-008',
    items: [
      { id: 'di-16', productId: 'p-10', productName: 'Paracetamol 500mg', quantity: 1, unitPrice: 12000, costPrice: 8000, discountAmount: 0, subtotal: 12000 },
      { id: 'di-17', productId: 'p-3', productName: 'Aqua 600ml', quantity: 2, unitPrice: 4000, costPrice: 3000, discountAmount: 0, subtotal: 8000 },
    ],
    subtotal: 20000, discountAmount: 0, discountType: 'fixed', taxAmount: 0, totalAmount: 20000,
    paymentMethod: 'debt', amountPaid: 0, changeAmount: 0,
    customerId: 'cust-1', cashierId: 'demo-user', outletId: 'demo-outlet', status: 'completed', notes: 'Hutang Pak Budi', createdAt: daysAgo(2),
  },
  // 3 days ago
  {
    id: 'dt-9', invoiceNumber: 'INV-DEMO-009',
    items: [
      { id: 'di-18', productId: 'p-1', productName: 'Gudang Garam Surya 16', quantity: 1, unitPrice: 31000, costPrice: 28000, discountAmount: 0, subtotal: 31000 },
      { id: 'di-19', productId: 'p-5', productName: 'Indomie Goreng', quantity: 10, unitPrice: 3500, costPrice: 2800, discountAmount: 0, subtotal: 35000 },
      { id: 'di-20', productId: 'p-4', productName: 'Teh Botol Sosro 450ml', quantity: 3, unitPrice: 5000, costPrice: 3500, discountAmount: 0, subtotal: 15000 },
    ],
    subtotal: 81000, discountAmount: 1000, discountType: 'fixed', taxAmount: 0, totalAmount: 80000,
    paymentMethod: 'cash', amountPaid: 100000, changeAmount: 20000,
    customerId: null, cashierId: 'demo-user', outletId: 'demo-outlet', status: 'completed', notes: null, createdAt: daysAgo(3),
  },
  // 4 days ago
  {
    id: 'dt-10', invoiceNumber: 'INV-DEMO-010',
    items: [
      { id: 'di-21', productId: 'p-9', productName: 'Minyak Goreng Bimoli 1L', quantity: 2, unitPrice: 20000, costPrice: 17000, discountAmount: 0, subtotal: 40000 },
      { id: 'di-22', productId: 'p-8', productName: 'Gula Pasir 1kg', quantity: 1, unitPrice: 16000, costPrice: 14000, discountAmount: 0, subtotal: 16000 },
    ],
    subtotal: 56000, discountAmount: 0, discountType: 'fixed', taxAmount: 0, totalAmount: 56000,
    paymentMethod: 'qris', amountPaid: 56000, changeAmount: 0,
    customerId: null, cashierId: 'demo-user', outletId: 'demo-outlet', status: 'completed', notes: null, createdAt: daysAgo(4),
  },
  // 5 days ago
  {
    id: 'dt-11', invoiceNumber: 'INV-DEMO-011',
    items: [
      { id: 'di-23', productId: 'p-2', productName: 'Sampoerna Mild 16', quantity: 1, unitPrice: 32000, costPrice: 29000, discountAmount: 0, subtotal: 32000 },
      { id: 'di-24', productId: 'p-6', productName: 'Chitato Sapi Panggang 68g', quantity: 3, unitPrice: 10000, costPrice: 8000, discountAmount: 0, subtotal: 30000 },
    ],
    subtotal: 62000, discountAmount: 0, discountType: 'fixed', taxAmount: 0, totalAmount: 62000,
    paymentMethod: 'cash', amountPaid: 62000, changeAmount: 0,
    customerId: null, cashierId: 'demo-user', outletId: 'demo-outlet', status: 'completed', notes: null, createdAt: daysAgo(5),
  },
  {
    id: 'dt-12', invoiceNumber: 'INV-DEMO-012',
    items: [
      { id: 'di-25', productId: 'p-17', productName: 'Shampo Pantene 160ml', quantity: 1, unitPrice: 23000, costPrice: 18000, discountAmount: 0, subtotal: 23000 },
      { id: 'di-26', productId: 'p-20', productName: 'Tolak Angin Cair', quantity: 2, unitPrice: 5000, costPrice: 3500, discountAmount: 0, subtotal: 10000 },
    ],
    subtotal: 33000, discountAmount: 0, discountType: 'fixed', taxAmount: 0, totalAmount: 33000,
    paymentMethod: 'cash', amountPaid: 50000, changeAmount: 17000,
    customerId: null, cashierId: 'demo-user', outletId: 'demo-outlet', status: 'completed', notes: null, createdAt: daysAgo(5),
  },
  // 6 days ago
  {
    id: 'dt-13', invoiceNumber: 'INV-DEMO-013',
    items: [
      { id: 'di-27', productId: 'p-7', productName: 'Beras Premium 5kg', quantity: 2, unitPrice: 70000, costPrice: 62000, discountAmount: 0, subtotal: 140000 },
      { id: 'di-28', productId: 'p-12', productName: 'Sabun Lifebuoy 100g', quantity: 3, unitPrice: 5500, costPrice: 4000, discountAmount: 0, subtotal: 16500 },
    ],
    subtotal: 156500, discountAmount: 0, discountType: 'fixed', taxAmount: 0, totalAmount: 156500,
    paymentMethod: 'cash', amountPaid: 200000, changeAmount: 43500,
    customerId: null, cashierId: 'demo-user', outletId: 'demo-outlet', status: 'completed', notes: null, createdAt: daysAgo(6),
  },
  {
    id: 'dt-14', invoiceNumber: 'INV-DEMO-014',
    items: [
      { id: 'di-29', productId: 'p-19', productName: 'Djarum Super 16', quantity: 2, unitPrice: 29000, costPrice: 26000, discountAmount: 0, subtotal: 58000 },
      { id: 'di-30', productId: 'p-14', productName: 'Indomie Soto', quantity: 5, unitPrice: 3500, costPrice: 2800, discountAmount: 0, subtotal: 17500 },
    ],
    subtotal: 75500, discountAmount: 500, discountType: 'fixed', taxAmount: 0, totalAmount: 75000,
    paymentMethod: 'cash', amountPaid: 75000, changeAmount: 0,
    customerId: null, cashierId: 'demo-user', outletId: 'demo-outlet', status: 'completed', notes: null, createdAt: daysAgo(6),
  },
  {
    id: 'dt-15', invoiceNumber: 'INV-DEMO-015',
    items: [
      { id: 'di-31', productId: 'p-3', productName: 'Aqua 600ml', quantity: 6, unitPrice: 4000, costPrice: 3000, discountAmount: 0, subtotal: 24000 },
      { id: 'di-32', productId: 'p-5', productName: 'Indomie Goreng', quantity: 3, unitPrice: 3500, costPrice: 2800, discountAmount: 0, subtotal: 10500 },
      { id: 'di-33', productId: 'p-16', productName: 'Oreo Original 133g', quantity: 2, unitPrice: 10000, costPrice: 7500, discountAmount: 0, subtotal: 20000 },
    ],
    subtotal: 54500, discountAmount: 0, discountType: 'fixed', taxAmount: 0, totalAmount: 54500,
    paymentMethod: 'qris', amountPaid: 54500, changeAmount: 0,
    customerId: null, cashierId: 'demo-user', outletId: 'demo-outlet', status: 'completed', notes: null, createdAt: daysAgo(6),
  },
]

// ---------------------------------------------------------------------------
// Dashboard KPI — computed from demoTransactions
// ---------------------------------------------------------------------------

function computeKpi(transactions: Transaction[], days: number): DashboardKpi {
  const now = new Date()
  const cutoff = new Date(now)
  cutoff.setDate(cutoff.getDate() - days)
  cutoff.setHours(0, 0, 0, 0)

  const prevCutoff = new Date(cutoff)
  prevCutoff.setDate(prevCutoff.getDate() - days)

  const current = transactions.filter(t => {
    const d = new Date(t.createdAt)
    return d >= cutoff && t.status === 'completed'
  })

  const previous = transactions.filter(t => {
    const d = new Date(t.createdAt)
    return d >= prevCutoff && d < cutoff && t.status === 'completed'
  })

  const revenue = current.reduce((s, t) => s + t.totalAmount, 0)
  const prevRevenue = previous.reduce((s, t) => s + t.totalAmount, 0)

  const profit = current.reduce((s, t) =>
    s + t.items.reduce((is, item) => is + (item.unitPrice - item.costPrice) * item.quantity - item.discountAmount, 0), 0)
  const prevProfit = previous.reduce((s, t) =>
    s + t.items.reduce((is, item) => is + (item.unitPrice - item.costPrice) * item.quantity - item.discountAmount, 0), 0)

  const pctChange = (curr: number, prev: number) =>
    prev === 0 ? (curr > 0 ? 100 : 0) : Math.round(((curr - prev) / prev) * 100)

  // Build sparkline for last 7 days
  const revenueSparkline: number[] = []
  const countSparkline: number[] = []
  const profitSparkline: number[] = []

  for (let i = 6; i >= 0; i--) {
    const dayStart = new Date(now)
    dayStart.setDate(dayStart.getDate() - i)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(dayStart)
    dayEnd.setDate(dayEnd.getDate() + 1)

    const dayTxs = transactions.filter(t => {
      const d = new Date(t.createdAt)
      return d >= dayStart && d < dayEnd && t.status === 'completed'
    })

    revenueSparkline.push(dayTxs.reduce((s, t) => s + t.totalAmount, 0))
    countSparkline.push(dayTxs.length)
    profitSparkline.push(dayTxs.reduce((s, t) =>
      s + t.items.reduce((is, item) => is + (item.unitPrice - item.costPrice) * item.quantity - item.discountAmount, 0), 0))
  }

  return {
    revenue,
    transactions: current.length,
    profit,
    activeProducts: demoProducts.filter(p => p.isActive).length,
    revenueTrend: pctChange(revenue, prevRevenue),
    transactionsTrend: pctChange(current.length, previous.length),
    profitTrend: pctChange(profit, prevProfit),
    revenueSparkline,
    countSparkline,
    profitSparkline,
  }
}

function computeTrend(transactions: Transaction[], days: number): TrendDataPoint[] {
  const result: TrendDataPoint[] = []
  const now = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const dayStart = new Date(now)
    dayStart.setDate(dayStart.getDate() - i)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(dayStart)
    dayEnd.setDate(dayEnd.getDate() + 1)

    const dayTxs = transactions.filter(t => {
      const d = new Date(t.createdAt)
      return d >= dayStart && d < dayEnd && t.status === 'completed'
    })

    const revenue = dayTxs.reduce((s, t) => s + t.totalAmount, 0)
    const profit = dayTxs.reduce((s, t) =>
      s + t.items.reduce((is, item) => is + (item.unitPrice - item.costPrice) * item.quantity - item.discountAmount, 0), 0)

    result.push({
      date: dayStart.toISOString().slice(0, 10),
      revenue,
      transactions: dayTxs.length,
      profit,
    })
  }

  return result
}

function computeTopProducts(transactions: Transaction[]): TopProductData[] {
  const map = new Map<string, { productName: string; totalQty: number; totalRevenue: number }>()

  for (const t of transactions) {
    if (t.status !== 'completed') continue
    for (const item of t.items) {
      const existing = map.get(item.productId)
      if (existing) {
        existing.totalQty += item.quantity
        existing.totalRevenue += item.subtotal
      } else {
        map.set(item.productId, {
          productName: item.productName,
          totalQty: item.quantity,
          totalRevenue: item.subtotal,
        })
      }
    }
  }

  return Array.from(map.entries())
    .map(([productId, data]) => ({ productId, ...data }))
    .sort((a, b) => b.totalQty - a.totalQty)
    .slice(0, 5)
}

// ---------------------------------------------------------------------------
// Pre-computed dashboard data for each period
// ---------------------------------------------------------------------------

type DashboardPeriod = 'today' | '7days' | '30days'

const PERIOD_DAYS: Record<DashboardPeriod, number> = {
  today: 1,
  '7days': 7,
  '30days': 30,
}

export function getDemoDashboard(period: DashboardPeriod = '7days') {
  const days = PERIOD_DAYS[period]
  return {
    kpi: computeKpi(demoTransactions, days),
    trend: computeTrend(demoTransactions, days),
    topProducts: computeTopProducts(demoTransactions),
  }
}
