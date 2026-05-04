/**
 * GET /api/transactions/:id — Get single transaction with items
 */

import { NextRequest, NextResponse } from 'next/server'
import { eq, and } from 'drizzle-orm'
import { db } from '@/lib/db'
import { transactions } from '@/lib/db/schema'
import { requireTenant, handleTenantError } from '@/lib/db/tenant'

type Params = { params: Promise<{ id: string }> }

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { storeId } = await requireTenant()
    const { id } = await params

    const transaction = await db.query.transactions.findFirst({
      where: and(eq(transactions.id, id), eq(transactions.storeId, storeId)),
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
