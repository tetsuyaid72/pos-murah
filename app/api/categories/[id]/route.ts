/**
 * PATCH  /api/categories/:id — Update category
 * DELETE /api/categories/:id — Delete category
 */

import { NextRequest, NextResponse } from 'next/server'
import { eq, and } from 'drizzle-orm'
import { db } from '@/lib/db'
import { categories } from '@/lib/db/schema'
import { requireTenant, assertOwnership, handleTenantError } from '@/lib/db/tenant'
import { logActivityAsync } from '@/lib/activity'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { session, storeId } = await requireTenant()
    const { id } = await params
    const body = await request.json()

    const existing = await db.query.categories.findFirst({
      where: eq(categories.id, id),
      columns: { id: true, storeId: true },
    })
    assertOwnership(existing, existing?.storeId, storeId)

    const [updated] = await db
      .update(categories)
      .set({
        ...(body.name !== undefined && { name: body.name.trim() }),
        ...(body.description !== undefined && { description: body.description || null }),
        ...(body.color !== undefined && { color: body.color }),
        ...(body.icon !== undefined && { icon: body.icon || null }),
        ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
      })
      .where(and(eq(categories.id, id), eq(categories.storeId, storeId)))
      .returning()

    logActivityAsync({
      storeId,
      userId: session.userId,
      action: 'category.update',
      entity: 'category',
      entityId: id,
    })

    return NextResponse.json({ category: updated })
  } catch (error) {
    return handleTenantError(error)
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { session, storeId } = await requireTenant()
    const { id } = await params

    const existing = await db.query.categories.findFirst({
      where: eq(categories.id, id),
      columns: { id: true, storeId: true, name: true },
    })
    assertOwnership(existing, existing?.storeId, storeId)

    // Hard delete — products with this categoryId will have it set to null (onDelete: 'set null')
    await db
      .delete(categories)
      .where(and(eq(categories.id, id), eq(categories.storeId, storeId)))

    logActivityAsync({
      storeId,
      userId: session.userId,
      action: 'category.delete',
      entity: 'category',
      entityId: id,
      metadata: { categoryName: existing!.name },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleTenantError(error)
  }
}
