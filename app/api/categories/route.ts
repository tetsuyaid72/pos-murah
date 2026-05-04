/**
 * GET  /api/categories — List categories (scoped to store)
 * POST /api/categories — Create a category
 */

import { NextRequest, NextResponse } from 'next/server'
import { eq, asc } from 'drizzle-orm'
import { db } from '@/lib/db'
import { categories } from '@/lib/db/schema'
import { requireTenant, handleTenantError } from '@/lib/db/tenant'
import { logActivityAsync } from '@/lib/activity'

export async function GET() {
  try {
    const { storeId } = await requireTenant()

    const result = await db.query.categories.findMany({
      where: eq(categories.storeId, storeId),
      orderBy: asc(categories.sortOrder),
    })

    return NextResponse.json({ categories: result })
  } catch (error) {
    return handleTenantError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { session, storeId } = await requireTenant()
    const body = await request.json()

    const { name, description, color, icon, sortOrder } = body

    if (!name) {
      return NextResponse.json({ error: 'Nama kategori wajib diisi' }, { status: 400 })
    }

    const [category] = await db.insert(categories).values({
      storeId,
      name: name.trim(),
      description: description || null,
      color: color || '#6366f1',
      icon: icon || null,
      sortOrder: sortOrder ?? 0,
    }).returning()

    logActivityAsync({
      storeId,
      userId: session.userId,
      action: 'category.create',
      entity: 'category',
      entityId: category.id,
      metadata: { categoryName: category.name },
    })

    return NextResponse.json({ category }, { status: 201 })
  } catch (error) {
    return handleTenantError(error)
  }
}
