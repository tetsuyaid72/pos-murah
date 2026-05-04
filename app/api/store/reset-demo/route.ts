/**
 * POST /api/store/reset-demo
 *
 * Delete ALL products, categories, transactions, and customers for the current store.
 * This gives the user a clean slate to start fresh.
 *
 * Protected: requires authentication + OWNER role.
 */

import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import {
  products,
  categories,
  transactions,
  transactionItems,
  customers,
  debtRecords,
  activityLogs,
} from '@/lib/db/schema'
import { requireTenant, handleTenantError } from '@/lib/db/tenant'

export async function POST() {
  try {
    const { session, storeId } = await requireTenant()

    // Only store owner can reset data
    if (session.role !== 'OWNER' && session.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Hanya pemilik toko yang dapat mereset data' },
        { status: 403 }
      )
    }

    // Delete all store data in a transaction (order matters due to FK constraints)
    db.transaction((tx) => {
      // 1. Delete transaction items (FK → transactions)
      // Get all transaction IDs for this store first
      const storeTxns = tx
        .select({ id: transactions.id })
        .from(transactions)
        .where(eq(transactions.storeId, storeId))
        .all()

      for (const txn of storeTxns) {
        tx.delete(transactionItems)
          .where(eq(transactionItems.transactionId, txn.id))
          .run()
      }

      // 2. Delete debt records
      tx.delete(debtRecords).where(eq(debtRecords.storeId, storeId)).run()

      // 3. Delete transactions
      tx.delete(transactions).where(eq(transactions.storeId, storeId)).run()

      // 4. Delete customers
      tx.delete(customers).where(eq(customers.storeId, storeId)).run()

      // 5. Delete products (FK → categories via categoryId, but set null on delete)
      tx.delete(products).where(eq(products.storeId, storeId)).run()

      // 6. Delete categories
      tx.delete(categories).where(eq(categories.storeId, storeId)).run()

      // 7. Log the reset action
      tx.insert(activityLogs).values({
        storeId,
        userId: session.userId,
        action: 'store.reset_demo',
        entity: 'store',
        entityId: storeId,
      }).run()
    })

    return NextResponse.json({
      success: true,
      message: 'Semua data demo telah dihapus',
    })
  } catch (error) {
    return handleTenantError(error)
  }
}
