/**
 * GET    /api/products/:id — Get single product
 * PATCH  /api/products/:id — Update product
 * DELETE /api/products/:id — Soft-delete product (isActive = false)
 */

import { NextRequest, NextResponse } from 'next/server'
import { eq, and } from 'drizzle-orm'
import { db } from '@/lib/db'
import { products } from '@/lib/db/schema'
import { requireTenant, assertOwnership, handleTenantError } from '@/lib/db/tenant'
import { logActivityAsync } from '@/lib/activity'

type Params = { params: Promise<{ id: string }> }

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { storeId } = await requireTenant()
    const { id } = await params

    const product = await db.query.products.findFirst({
      where: and(eq(products.id, id), eq(products.storeId, storeId)),
      with: { category: { columns: { id: true, name: true, color: true } } },
    })

    if (!product) {
      return NextResponse.json({ error: 'Produk tidak ditemukan' }, { status: 404 })
    }

    return NextResponse.json({ product })
  } catch (error) {
    return handleTenantError(error)
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { session, storeId } = await requireTenant()
    const { id } = await params
    const body = await request.json()

    // Verify ownership first
    const existing = await db.query.products.findFirst({
      where: eq(products.id, id),
      columns: { id: true, storeId: true },
    })
    assertOwnership(existing, existing?.storeId, storeId)

    const [updated] = await db
      .update(products)
      .set({
        ...(body.name !== undefined && { name: body.name.trim() }),
        ...(body.barcode !== undefined && { barcode: body.barcode || null }),
        ...(body.sku !== undefined && { sku: body.sku || null }),
        ...(body.categoryId !== undefined && { categoryId: body.categoryId || null }),
        ...(body.costPrice !== undefined && { costPrice: body.costPrice }),
        ...(body.sellingPrice !== undefined && { sellingPrice: body.sellingPrice }),
        ...(body.stock !== undefined && { stock: body.stock }),
        ...(body.minStock !== undefined && { minStock: body.minStock }),
        ...(body.unit !== undefined && { unit: body.unit }),
        ...(body.imageUrl !== undefined && { imageUrl: body.imageUrl || null }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      })
      .where(and(eq(products.id, id), eq(products.storeId, storeId)))
      .returning()

    logActivityAsync({
      storeId,
      userId: session.userId,
      action: 'product.update',
      entity: 'product',
      entityId: id,
    })

    return NextResponse.json({ product: updated })
  } catch (error) {
    return handleTenantError(error)
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { session, storeId } = await requireTenant()
    const { id } = await params

    // Verify ownership
    const existing = await db.query.products.findFirst({
      where: eq(products.id, id),
      columns: { id: true, storeId: true, name: true },
    })
    assertOwnership(existing, existing?.storeId, storeId)

    // Soft delete — set isActive to false
    await db
      .update(products)
      .set({ isActive: false })
      .where(and(eq(products.id, id), eq(products.storeId, storeId)))

    logActivityAsync({
      storeId,
      userId: session.userId,
      action: 'product.delete',
      entity: 'product',
      entityId: id,
      metadata: { productName: existing!.name },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleTenantError(error)
  }
}
