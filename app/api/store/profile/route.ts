/**
 * PUT /api/store/profile
 *
 * Update current tenant store profile data.
 */

import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { stores } from '@/lib/db/schema'
import { requireTenant, handleTenantError } from '@/lib/db/tenant'

export async function PUT(request: NextRequest) {
  try {
    const { storeId } = await requireTenant()
    const body = await request.json()
    const { name, address, phone, logoUrl } = body

    const updates: Partial<typeof stores.$inferInsert> = {
      updatedAt: new Date(),
    }

    if (typeof name === 'string') updates.name = name.trim()
    if (typeof address === 'string' || address === null) updates.address = address
    if (typeof phone === 'string' || phone === null) updates.phone = phone
    if (typeof logoUrl === 'string' || logoUrl === null) updates.logoUrl = logoUrl

    const [updatedStore] = await db
      .update(stores)
      .set(updates)
      .where(eq(stores.id, storeId))
      .returning({
        id: stores.id,
        name: stores.name,
        address: stores.address,
        phone: stores.phone,
        logoUrl: stores.logoUrl,
      })

    return NextResponse.json({ store: updatedStore })
  } catch (error) {
    return handleTenantError(error)
  }
}
