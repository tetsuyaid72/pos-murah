/**
 * Backup File Validation Schema — Zod v4
 *
 * Validates the structure of a JSON backup file before import.
 * Ensures all required fields exist and have correct types.
 */

import { z } from 'zod'

// =============================================================================
// Sub-schemas for each entity
// =============================================================================

const storeSchema = z.object({
  name: z.string(),
  address: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
})

const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  color: z.string().optional(),
  icon: z.string().nullable().optional(),
  sortOrder: z.number().optional(),
})

const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  barcode: z.string().nullable().optional(),
  sku: z.string().nullable().optional(),
  categoryId: z.string().nullable().optional(),
  costPrice: z.number(),
  sellingPrice: z.number(),
  stock: z.number(),
  minStock: z.number().optional(),
  unit: z.string().optional(),
  imageUrl: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
})

const customerSchema = z.object({
  id: z.string(),
  name: z.string(),
  phone: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  totalDebt: z.number().optional(),
})

const transactionItemSchema = z.object({
  id: z.string().optional(),
  productId: z.string().nullable().optional(),
  productName: z.string(),
  quantity: z.number(),
  unitPrice: z.number(),
  costPrice: z.number().optional(),
  discountAmount: z.number().optional(),
  subtotal: z.number(),
})

const transactionSchema = z.object({
  id: z.string(),
  invoiceNumber: z.string(),
  subtotal: z.number(),
  discountAmount: z.number().optional(),
  discountType: z.string().optional(),
  taxAmount: z.number().optional(),
  totalAmount: z.number(),
  paymentMethod: z.string(),
  amountPaid: z.number(),
  changeAmount: z.number().optional(),
  customerId: z.string().nullable().optional(),
  status: z.string(),
  notes: z.string().nullable().optional(),
  createdAt: z.string(),
  items: z.array(transactionItemSchema),
})

const debtRecordSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  transactionId: z.string().nullable().optional(),
  amount: z.number(),
  paidAmount: z.number().optional(),
  status: z.string().optional(),
  dueDate: z.string().nullable().optional(),
  createdAt: z.string().optional(),
})

// =============================================================================
// Main backup file schema
// =============================================================================

export const backupFileSchema = z.object({
  version: z.string(),
  appName: z.literal('warung-madura-pos'),
  exportedAt: z.string(),
  store: storeSchema,
  categories: z.array(categorySchema),
  products: z.array(productSchema),
  customers: z.array(customerSchema),
  transactions: z.array(transactionSchema),
  debtRecords: z.array(debtRecordSchema),
})

export type BackupFile = z.infer<typeof backupFileSchema>
export type BackupCategory = z.infer<typeof categorySchema>
export type BackupProduct = z.infer<typeof productSchema>
export type BackupCustomer = z.infer<typeof customerSchema>
export type BackupTransaction = z.infer<typeof transactionSchema>
export type BackupTransactionItem = z.infer<typeof transactionItemSchema>
export type BackupDebtRecord = z.infer<typeof debtRecordSchema>
