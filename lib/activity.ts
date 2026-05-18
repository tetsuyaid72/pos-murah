/**
 * Activity Logging Utility
 *
 * Provides a simple API to log user activities for tracking and analytics.
 * All logs are scoped to a store (multi-tenant safe).
 *
 * Usage:
 *   import { logActivity } from '@/lib/activity'
 *   await logActivity({
 *     storeId: 'store_123',
 *     userId: 'user_456',
 *     action: 'product.create',
 *     entity: 'product',
 *     entityId: 'prod_789',
 *     metadata: { productName: 'Aqua 600ml' },
 *   })
 */

import { db } from '@/lib/db'
import { activityLogs } from '@/lib/db/schema'

/** Standard activity action types */
export type ActivityAction =
  // Auth
  | 'user.register'
  | 'user.login'
  | 'user.logout'
  | 'user.update_profile'
  // Products
  | 'product.create'
  | 'product.update'
  | 'product.delete'
  | 'product.import'
  // Categories
  | 'category.create'
  | 'category.update'
  | 'category.delete'
  // Transactions
  | 'transaction.create'
  | 'transaction.delete'
  | 'transaction.void'
  // Customers
  | 'customer.create'
  | 'customer.update'
  | 'customer.delete'
  // Debt
  | 'debt.create'
  | 'debt.payment'
  // Store
  | 'store.update'
  // Backup
  | 'backup.export'
  | 'backup.import'
  // Admin
  | 'admin.view_stats'

interface LogActivityParams {
  storeId?: string | null
  userId?: string | null
  action: ActivityAction
  entity?: string
  entityId?: string
  metadata?: Record<string, string | number | boolean | null>
}

/**
 * Log an activity. Fire-and-forget — errors are caught and logged to console.
 */
export async function logActivity(params: LogActivityParams): Promise<void> {
  try {
    await db.insert(activityLogs).values({
      storeId: params.storeId ?? null,
      userId: params.userId ?? null,
      action: params.action,
      entity: params.entity ?? null,
      entityId: params.entityId ?? null,
      metadata: params.metadata ?? null,
    })
  } catch (error) {
    // Don't throw — activity logging should never break the main flow
    console.error('Failed to log activity:', error)
  }
}

/**
 * Log activity without awaiting (fire-and-forget).
 * Use this when you don't want to slow down the response.
 */
export function logActivityAsync(params: LogActivityParams): void {
  logActivity(params).catch(() => {
    // Silently ignore
  })
}
