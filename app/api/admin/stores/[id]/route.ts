/**
 * PATCH /api/admin/stores/[id] — Update store (isActive, name)
 */

import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { stores } from '@/lib/db/schema'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { isActive, name } = body

    const existing = await db.query.stores.findFirst({
      where: eq(stores.id, id),
    })

    if (!existing) {
      return NextResponse.json({ error: 'Store tidak ditemukan' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    if (typeof isActive === 'boolean') {
      updateData.isActive = isActive
    }
    if (name && typeof name === 'string') {
      updateData.name = name
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'Tidak ada data yang diubah' }, { status: 400 })
    }

    await db.update(stores).set(updateData).where(eq(stores.id, id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin update store error:', error)
    return NextResponse.json({ error: 'Gagal mengupdate store' }, { status: 500 })
  }
}
