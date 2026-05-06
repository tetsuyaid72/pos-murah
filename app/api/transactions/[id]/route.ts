/**
 * GET    /api/transactions/:id — Get single transaction with items
 * DELETE /api/transactions/:id — Soft delete a transaction (set deleted_at)
 */

import { NextRequest, NextResponse } from 'next/server'
import { eq, and, isNull } from 'drizzle-orm'
import { db } from '@/lib/db'
import { transactions } from '@/lib/db/schema'
import { requireTenant, handleTenantError } from '@/lib/db/tenant'
import { logActivityAsync } from '@/lib/activity'

type Params = { params: Promise<{ id: string }> }

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { storeId } = await requireTenant()
    const { id } = await params

    const transaction = await db.query.transactions.findFirst({
      where: and(
        eq(transactions.id, id),
        eq(transactions.storeId, storeId),
        isNull(transactions.deletedAt)
      ),
      with: {
        items: {
          with: {
            product: { columns: { id: true, name: true, imageUrl: true } },
          },
        },
        customer: { columns: { id: true, name: true, phone: true } },
      },
    })

    if (!transaction) {
      return NextResponse.json({ error: 'Transaksi tidak ditemukan' }, { status: 404 })
    }

    return NextResponse.json({ transaction })
  } catch (error) {
    return handleTenantError(error)
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { session, storeId } = await requireTenant()
    const { id } = await params

    // Verify transaction exists and belongs to this store
    const transaction = await db.query.transactions.findFirst({
      where: and(
        eq(transactions.id, id),
        eq(transactions.storeId, storeId),
        isNull(transactions.deletedAt)
      ),
      columns: { id: true, invoiceNumber: true },
    })

    if (!transaction) {
      return NextResponse.json({ error: 'Transaksi tidak ditemukan' }, { status: 404 })
    }

    // Soft delete: set deleted_at timestamp
    await db
      .update(transactions)
      .set({ deletedAt: new Date() })
      .where(and(eq(transactions.id, id), eq(transactions.storeId, storeId)))

    logActivityAsync({
      storeId,
      userId: session.userId,
      action: 'transaction.delete',
      entity: 'transaction',
      entityId: id,
      metadata: { invoiceNumber: transaction.invoiceNumber },
    })

    return NextResponse.json({ success: true, message: 'Transaksi berhasil dihapus' })
  } catch (error) {
    return handleTenantError(error)
  }
}
