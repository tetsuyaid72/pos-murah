/**
 * GET  /api/products — List products (scoped to store)
 * POST /api/products — Create a product
 */

import { NextRequest, NextResponse } from 'next/server'
import { eq, and, like, desc } from 'drizzle-orm'
import { db } from '@/lib/db'
import { products } from '@/lib/db/schema'
import { requireTenant, handleTenantError } from '@/lib/db/tenant'
import { logActivityAsync } from '@/lib/activity'

export async function GET(request: NextRequest) {
  try {
    const { storeId } = await requireTenant()
    const { searchParams } = new URL(request.url)

    const search = searchParams.get('search')
    const categoryId = searchParams.get('categoryId')
    const activeOnly = searchParams.get('active') !== 'false'

    const conditions = [eq(products.storeId, storeId)]

    if (activeOnly) {
      conditions.push(eq(products.isActive, true))
    }
    if (categoryId) {
      conditions.push(eq(products.categoryId, categoryId))
    }
    if (search) {
      conditions.push(like(products.name, `%${search}%`))
    }

    const result = await db.query.products.findMany({
      where: and(...conditions),
      with: { category: { columns: { id: true, name: true, color: true } } },
      orderBy: desc(products.createdAt),
    })

    return NextResponse.json({ products: result })
  } catch (error) {
    return handleTenantError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { session, storeId } = await requireTenant()
    const body = await request.json()

    const { name, barcode, sku, categoryId, costPrice, sellingPrice, stock, minStock, unit, imageUrl } = body

    if (!name) {
      return NextResponse.json({ error: 'Nama produk wajib diisi' }, { status: 400 })
    }

    const [product] = await db.insert(products).values({
      storeId,
      name: name.trim(),
      barcode: barcode || null,
      sku: sku || null,
      categoryId: categoryId || null,
      costPrice: costPrice ?? 0,
      sellingPrice: sellingPrice ?? 0,
      stock: stock ?? 0,
      minStock: minStock ?? 0,
      unit: unit || 'pcs',
      imageUrl: imageUrl || null,
    }).returning()

    logActivityAsync({
      storeId,
      userId: session.userId,
      action: 'product.create',
      entity: 'product',
      entityId: product.id,
      metadata: { productName: product.name },
    })

    return NextResponse.json({ product }, { status: 201 })
  } catch (error) {
    return handleTenantError(error)
  }
}
