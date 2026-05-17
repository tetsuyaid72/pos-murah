/**
 * Drizzle ORM Schema — Warung Madura POS
 *
 * Multi-tenant architecture: semua data terisolasi per Store (storeId).
 * PostgreSQL dialect (Supabase).
 */

import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  index,
  jsonb,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { generateId } from '@/lib/utils'

// =============================================================================
// CORE: Users, Stores, Memberships
// =============================================================================

export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => generateId()),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  passwordHash: text('password_hash'),  // nullable for Google OAuth users
  googleId: text('google_id').unique(), // Google OAuth subject ID
  avatarUrl: text('avatar_url'),
  role: text('role', { enum: ['OWNER', 'CASHIER', 'SUPER_ADMIN'] }).notNull().default('OWNER'),
  isActive: boolean('is_active').notNull().default(true),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().$onUpdateFn(() => new Date()),
})

export const stores = pgTable('stores', {
  id: text('id').primaryKey().$defaultFn(() => generateId()),
  name: text('name').notNull(),
  address: text('address'),
  phone: text('phone'),
  logoUrl: text('logo_url'),
  isActive: boolean('is_active').notNull().default(true),
  ownerId: text('owner_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().$onUpdateFn(() => new Date()),
})

export const memberships = pgTable('memberships', {
  id: text('id').primaryKey().$defaultFn(() => generateId()),
  storeId: text('store_id').notNull().unique().references(() => stores.id, { onDelete: 'cascade' }),
  plan: text('plan', { enum: ['FREE', 'PRO', 'BUSINESS'] }).notNull().default('FREE'),
  isTrial: boolean('is_trial').notNull().default(true),
  trialStartAt: timestamp('trial_start_at').notNull().defaultNow(),
  trialEndAt: timestamp('trial_end_at').notNull(),
  billingPeriod: text('billing_period', { enum: ['monthly', 'lifetime'] }),
  subscriptionStartAt: timestamp('subscription_start_at'),
  subscriptionEndAt: timestamp('subscription_end_at'),
  features: jsonb('features').notNull().default({}),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().$onUpdateFn(() => new Date()),
})

// =============================================================================
// FEATURE FLAGS
// =============================================================================

export const featureFlags = pgTable('feature_flags', {
  id: text('id').primaryKey().$defaultFn(() => generateId()),
  key: text('key').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  planDefaults: jsonb('plan_defaults').notNull().default({}),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().$onUpdateFn(() => new Date()),
})

// =============================================================================
// BUSINESS DATA (all scoped to store_id)
// =============================================================================

export const categories = pgTable('categories', {
  id: text('id').primaryKey().$defaultFn(() => generateId()),
  storeId: text('store_id').notNull().references(() => stores.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  color: text('color').notNull().default('#6366f1'),
  icon: text('icon'),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().$onUpdateFn(() => new Date()),
}, (table) => [
  index('categories_store_id_idx').on(table.storeId),
])

export const products = pgTable('products', {
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
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().$onUpdateFn(() => new Date()),
}, (table) => [
  index('products_store_id_idx').on(table.storeId),
  index('products_store_barcode_idx').on(table.storeId, table.barcode),
  index('products_store_category_idx').on(table.storeId, table.categoryId),
])

export const customers = pgTable('customers', {
  id: text('id').primaryKey().$defaultFn(() => generateId()),
  storeId: text('store_id').notNull().references(() => stores.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  phone: text('phone'),
  address: text('address'),
  totalDebt: integer('total_debt').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().$onUpdateFn(() => new Date()),
}, (table) => [
  index('customers_store_id_idx').on(table.storeId),
])

export const transactions = pgTable('transactions', {
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
  createdAt: timestamp('created_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
}, (table) => [
  index('transactions_store_id_idx').on(table.storeId),
  index('transactions_store_created_idx').on(table.storeId, table.createdAt),
  index('transactions_store_invoice_idx').on(table.storeId, table.invoiceNumber),
])

export const transactionItems = pgTable('transaction_items', {
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

export const debtRecords = pgTable('debt_records', {
  id: text('id').primaryKey().$defaultFn(() => generateId()),
  storeId: text('store_id').notNull(),
  customerId: text('customer_id').notNull().references(() => customers.id, { onDelete: 'cascade' }),
  transactionId: text('transaction_id').references(() => transactions.id, { onDelete: 'set null' }),
  amount: integer('amount').notNull(),
  paidAmount: integer('paid_amount').notNull().default(0),
  status: text('status', { enum: ['UNPAID', 'PARTIAL', 'PAID'] }).notNull().default('UNPAID'),
  dueDate: timestamp('due_date'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().$onUpdateFn(() => new Date()),
}, (table) => [
  index('debt_records_store_id_idx').on(table.storeId),
  index('debt_records_customer_id_idx').on(table.customerId),
])

// =============================================================================
// PAYMENTS (Manual upgrade requests)
// =============================================================================

export const payments = pgTable('payments', {
  id: text('id').primaryKey().$defaultFn(() => generateId()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  storeId: text('store_id').notNull().references(() => stores.id, { onDelete: 'cascade' }),
  amount: integer('amount').notNull().default(50000),
  plan: text('plan', { enum: ['PRO', 'BUSINESS'] }).notNull().default('PRO'),
  billingPeriod: text('billing_period', { enum: ['monthly', 'lifetime'] }).notNull().default('lifetime'),
  originalPrice: integer('original_price').notNull().default(50000),
  discountPercent: integer('discount_percent').notNull().default(0),
  discountAmount: integer('discount_amount').notNull().default(0),
  finalAmount: integer('final_amount').notNull().default(50000),
  promoCode: text('promo_code'),
  promoType: text('promo_type'),
  status: text('status', { enum: ['PENDING', 'APPROVED', 'REJECTED'] }).notNull().default('PENDING'),
  method: text('method', { enum: ['BANK_TRANSFER', 'QRIS'] }).notNull().default('BANK_TRANSFER'),
  proofUrl: text('proof_url'),
  notes: text('notes'),
  approvedBy: text('approved_by').references(() => users.id, { onDelete: 'set null' }),
  approvedAt: timestamp('approved_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => [
  index('payments_user_id_idx').on(table.userId),
  index('payments_status_idx').on(table.status),
])

export const paymentsRelations = relations(payments, ({ one }) => ({
  user: one(users, { fields: [payments.userId], references: [users.id] }),
  store: one(stores, { fields: [payments.storeId], references: [stores.id] }),
}))

// =============================================================================
// PASSWORD RESET TOKENS
// =============================================================================

export const passwordResetTokens = pgTable('password_reset_tokens', {
  id: text('id').primaryKey().$defaultFn(() => generateId()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  usedAt: timestamp('used_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => [
  index('password_reset_tokens_token_idx').on(table.token),
  index('password_reset_tokens_user_id_idx').on(table.userId),
])

// =============================================================================
// ACTIVITY LOG
// =============================================================================

export const activityLogs = pgTable('activity_logs', {
  id: text('id').primaryKey().$defaultFn(() => generateId()),
  storeId: text('store_id').references(() => stores.id, { onDelete: 'cascade' }),
  userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
  action: text('action').notNull(),
  entity: text('entity'),
  entityId: text('entity_id'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
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

export const passwordResetTokensRelations = relations(passwordResetTokens, ({ one }) => ({
  user: one(users, { fields: [passwordResetTokens.userId], references: [users.id] }),
}))
