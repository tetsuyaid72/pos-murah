/**
 * Drizzle ORM Schema — Warung Madura POS
 *
 * Multi-tenant architecture: semua data terisolasi per Store (storeId).
 * SQLite/Turso dialect — no native enums, no native JSON columns.
 */

import { sqliteTable, text, integer, index, uniqueIndex } from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'
import { generateId } from '@/lib/utils'

// =============================================================================
// CORE: Users, Stores, Memberships
// =============================================================================

export const users = sqliteTable('users', {
  id: text('id').primaryKey().$defaultFn(() => generateId()),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  passwordHash: text('password_hash').notNull(),
  avatarUrl: text('avatar_url'),
  role: text('role', { enum: ['OWNER', 'CASHIER', 'SUPER_ADMIN'] }).notNull().default('OWNER'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  lastLoginAt: integer('last_login_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()).$onUpdateFn(() => new Date()),
})

export const stores = sqliteTable('stores', {
  id: text('id').primaryKey().$defaultFn(() => generateId()),
  name: text('name').notNull(),
  address: text('address'),
  phone: text('phone'),
  logoUrl: text('logo_url'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  ownerId: text('owner_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()).$onUpdateFn(() => new Date()),
})

export const memberships = sqliteTable('memberships', {
  id: text('id').primaryKey().$defaultFn(() => generateId()),
  storeId: text('store_id').notNull().unique().references(() => stores.id, { onDelete: 'cascade' }),
  plan: text('plan', { enum: ['FREE', 'STARTER', 'PRO', 'ENTERPRISE'] }).notNull().default('FREE'),
  isTrial: integer('is_trial', { mode: 'boolean' }).notNull().default(true),
  trialStartAt: integer('trial_start_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  trialEndAt: integer('trial_end_at', { mode: 'timestamp' }).notNull(),
  features: text('features').notNull().default('{}'), // JSON string
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()).$onUpdateFn(() => new Date()),
})

// =============================================================================
// FEATURE FLAGS
// =============================================================================

export const featureFlags = sqliteTable('feature_flags', {
  id: text('id').primaryKey().$defaultFn(() => generateId()),
  key: text('key').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  planDefaults: text('plan_defaults').notNull().default('{}'), // JSON string
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()).$onUpdateFn(() => new Date()),
})

// =============================================================================
// BUSINESS DATA (all scoped to store_id)
// =============================================================================

export const categories = sqliteTable('categories', {
  id: text('id').primaryKey().$defaultFn(() => generateId()),
  storeId: text('store_id').notNull().references(() => stores.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  color: text('color').notNull().default('#6366f1'),
  icon: text('icon'),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()).$onUpdateFn(() => new Date()),
}, (table) => [
  index('categories_store_id_idx').on(table.storeId),
])

export const products = sqliteTable('products', {
  id: text('id').primaryKey().$defaultFn(() => generateId()),
  storeId: text('store_id').notNull().references(() => stores.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  barcode: text('barcode'),
  sku: text('sku'),
  categoryId: text('category_id').references(() => categories.id, { onDelete: 'set null' }),
  costPrice: integer('cost_price').notNull().default(0),
  sellingPrice: integer('selling_price').notNull().default(0),
  stock: integer('stock').notNull().default(0),
  minStock: integer('min_stock').notNull().default(0),
  unit: text('unit').notNull().default('pcs'),
  imageUrl: text('image_url'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()).$onUpdateFn(() => new Date()),
}, (table) => [
  index('products_store_id_idx').on(table.storeId),
  index('products_store_barcode_idx').on(table.storeId, table.barcode),
  index('products_store_category_idx').on(table.storeId, table.categoryId),
])

export const customers = sqliteTable('customers', {
  id: text('id').primaryKey().$defaultFn(() => generateId()),
  storeId: text('store_id').notNull().references(() => stores.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  phone: text('phone'),
  address: text('address'),
  totalDebt: integer('total_debt').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()).$onUpdateFn(() => new Date()),
}, (table) => [
  index('customers_store_id_idx').on(table.storeId),
])

export const transactions = sqliteTable('transactions', {
  id: text('id').primaryKey().$defaultFn(() => generateId()),
  storeId: text('store_id').notNull().references(() => stores.id, { onDelete: 'cascade' }),
  invoiceNumber: text('invoice_number').notNull(),
  subtotal: integer('subtotal').notNull().default(0),
  discountAmount: integer('discount_amount').notNull().default(0),
  discountType: text('discount_type', { enum: ['PERCENTAGE', 'FIXED'] }).notNull().default('FIXED'),
  taxAmount: integer('tax_amount').notNull().default(0),
  totalAmount: integer('total_amount').notNull().default(0),
  paymentMethod: text('payment_method', { enum: ['CASH', 'QRIS', 'DEBT'] }).notNull().default('CASH'),
  amountPaid: integer('amount_paid').notNull().default(0),
  changeAmount: integer('change_amount').notNull().default(0),
  customerId: text('customer_id').references(() => customers.id, { onDelete: 'set null' }),
  status: text('status', { enum: ['COMPLETED', 'PENDING', 'VOIDED'] }).notNull().default('COMPLETED'),
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
}, (table) => [
  index('transactions_store_id_idx').on(table.storeId),
  index('transactions_store_created_idx').on(table.storeId, table.createdAt),
  index('transactions_store_invoice_idx').on(table.storeId, table.invoiceNumber),
])

export const transactionItems = sqliteTable('transaction_items', {
  id: text('id').primaryKey().$defaultFn(() => generateId()),
  transactionId: text('transaction_id').notNull().references(() => transactions.id, { onDelete: 'cascade' }),
  productId: text('product_id').references(() => products.id, { onDelete: 'set null' }),
  productName: text('product_name').notNull(),
  quantity: integer('quantity').notNull(),
  unitPrice: integer('unit_price').notNull(),
  costPrice: integer('cost_price').notNull().default(0),
  discountAmount: integer('discount_amount').notNull().default(0),
  subtotal: integer('subtotal').notNull(),
}, (table) => [
  index('transaction_items_transaction_id_idx').on(table.transactionId),
])

export const debtRecords = sqliteTable('debt_records', {
  id: text('id').primaryKey().$defaultFn(() => generateId()),
  storeId: text('store_id').notNull(),
  customerId: text('customer_id').notNull().references(() => customers.id, { onDelete: 'cascade' }),
  transactionId: text('transaction_id').references(() => transactions.id, { onDelete: 'set null' }),
  amount: integer('amount').notNull(),
  paidAmount: integer('paid_amount').notNull().default(0),
  status: text('status', { enum: ['UNPAID', 'PARTIAL', 'PAID'] }).notNull().default('UNPAID'),
  dueDate: integer('due_date', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()).$onUpdateFn(() => new Date()),
}, (table) => [
  index('debt_records_store_id_idx').on(table.storeId),
  index('debt_records_customer_id_idx').on(table.customerId),
])

// =============================================================================
// ACTIVITY LOG
// =============================================================================

export const activityLogs = sqliteTable('activity_logs', {
  id: text('id').primaryKey().$defaultFn(() => generateId()),
  storeId: text('store_id').references(() => stores.id, { onDelete: 'cascade' }),
  userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
  action: text('action').notNull(),
  entity: text('entity'),
  entityId: text('entity_id'),
  metadata: text('metadata'), // JSON string
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
}, (table) => [
  index('activity_logs_store_id_idx').on(table.storeId),
  index('activity_logs_user_id_idx').on(table.userId),
  index('activity_logs_store_action_idx').on(table.storeId, table.action),
  index('activity_logs_created_at_idx').on(table.createdAt),
])

// =============================================================================
// RELATIONS (for Drizzle relational queries)
// =============================================================================

export const usersRelations = relations(users, ({ one, many }) => ({
  store: one(stores, { fields: [users.id], references: [stores.ownerId] }),
  activityLogs: many(activityLogs),
}))

export const storesRelations = relations(stores, ({ one, many }) => ({
  owner: one(users, { fields: [stores.ownerId], references: [users.id] }),
  membership: one(memberships),
  products: many(products),
  categories: many(categories),
  transactions: many(transactions),
  customers: many(customers),
  activityLogs: many(activityLogs),
}))

export const membershipsRelations = relations(memberships, ({ one }) => ({
  store: one(stores, { fields: [memberships.storeId], references: [stores.id] }),
}))

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  store: one(stores, { fields: [categories.storeId], references: [stores.id] }),
  products: many(products),
}))

export const productsRelations = relations(products, ({ one, many }) => ({
  store: one(stores, { fields: [products.storeId], references: [stores.id] }),
  category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
  transactionItems: many(transactionItems),
}))

export const customersRelations = relations(customers, ({ one, many }) => ({
  store: one(stores, { fields: [customers.storeId], references: [stores.id] }),
  transactions: many(transactions),
  debtRecords: many(debtRecords),
}))

export const transactionsRelations = relations(transactions, ({ one, many }) => ({
  store: one(stores, { fields: [transactions.storeId], references: [stores.id] }),
  customer: one(customers, { fields: [transactions.customerId], references: [customers.id] }),
  items: many(transactionItems),
  debtRecords: many(debtRecords),
}))

export const transactionItemsRelations = relations(transactionItems, ({ one }) => ({
  transaction: one(transactions, { fields: [transactionItems.transactionId], references: [transactions.id] }),
  product: one(products, { fields: [transactionItems.productId], references: [products.id] }),
}))

export const debtRecordsRelations = relations(debtRecords, ({ one }) => ({
  customer: one(customers, { fields: [debtRecords.customerId], references: [customers.id] }),
  transaction: one(transactions, { fields: [debtRecords.transactionId], references: [transactions.id] }),
}))

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  store: one(stores, { fields: [activityLogs.storeId], references: [stores.id] }),
  user: one(users, { fields: [activityLogs.userId], references: [users.id] }),
}))
