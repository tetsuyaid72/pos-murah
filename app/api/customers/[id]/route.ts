/**
 * GET    /api/customers/:id — Get single customer with debt info
 * PATCH  /api/customers/:id — Update customer
 * DELETE /api/customers/:id — Delete customer
 */

import { NextRequest, NextResponse } from 'next/server'
import { eq, and } from 'drizzle-orm'
import { db } from '@/lib/db'
import { customers } from '@/lib/db/schema'
import { requireTenant, assertOwnership, handleTenantError } from '@/lib/db/tenant'
import { logActivityAsync } from '@/lib/activity'

type Params = { params: Promise<{ id: string }> }

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { storeId } = await requireTenant()
    const { id } = await params

    const customer = await db.query.customers.findFirst({
      where: and(eq(customers.id, id), eq(customers.storeId, storeId)),
      with: {
        debtRecords: {
          orderBy: (dr, { desc }) => desc(dr.createdAt),
          limit: 20,
        },
      },
    })

    if (!customer) {
      return NextResponse.json({ error: 'Pelanggan tidak ditemukan' }, { status: 404 })
    }

    return NextResponse.json({ customer })
  } catch (error) {
    return handleTenantError(error)
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { session, storeId } = await requireTenant()
    const { id } = await params
    const body = await request.json()

    const existing = await db.query.customers.findFirst({
      where: eq(customers.id, id),
      columns: { id: true, storeId: true },
    })
    assertOwnership(existing, existing?.storeId, storeId)

    const [updated] = await db
      .update(customers)
      .set({
        ...(body.name !== undefined && { name: body.name.trim() }),
        ...(body.phone !== undefined && { phone: body.phone || null }),
        ...(body.address !== undefined && { address: body.address || null }),
      })
      .where(and(eq(customers.id, id), eq(customers.storeId, storeId)))
      .returning()

    logActivityAsync({
      storeId,
      userId: session.userId,
      action: 'customer.update',
      entity: 'customer',
      entityId: id,
    })

    return NextResponse.json({ customer: updated })
  } catch (error) {
    return handleTenantError(error)
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { session, storeId } = await requireTenant()
    const { id } = await params

    const existing = await db.query.customers.findFirst({
      where: eq(customers.id, id),
      columns: { id: true, storeId: true, name: true },
    })
    assertOwnership(existing, existing?.storeId, storeId)

    await db
      .delete(customers)
      .where(and(eq(customers.id, id), eq(customers.storeId, storeId)))

    logActivityAsync({
      storeId,
      userId: session.userId,
      action: 'customer.delete',
      entity: 'customer',
      entityId: id,
      metadata: { customerName: existing!.name },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleTenantError(error)
  }
}
