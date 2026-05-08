/**
 * PATCH /api/admin/users/[id] — Update user (role, isActive, name)
 * DELETE /api/admin/users/[id] — Deactivate user
 */

import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'

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
    const { role, isActive, name } = body

    // Validate
    const existing = await db.query.users.findFirst({
      where: eq(users.id, id),
    })

    if (!existing) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 })
    }

    // Prevent self-demotion
    if (id === session.userId && role && role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Tidak bisa mengubah role sendiri' }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {}
    if (role && ['OWNER', 'CASHIER', 'SUPER_ADMIN'].includes(role)) {
      updateData.role = role
    }
    if (typeof isActive === 'boolean') {
      updateData.isActive = isActive
    }
    if (name && typeof name === 'string') {
      updateData.name = name
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'Tidak ada data yang diubah' }, { status: 400 })
    }

    await db.update(users).set(updateData).where(eq(users.id, id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin update user error:', error)
    return NextResponse.json({ error: 'Gagal mengupdate user' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 })
    }

    const { id } = await params

    // Prevent self-deletion
    if (id === session.userId) {
      return NextResponse.json({ error: 'Tidak bisa menonaktifkan diri sendiri' }, { status: 400 })
    }

    await db.update(users).set({ isActive: false }).where(eq(users.id, id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin delete user error:', error)
    return NextResponse.json({ error: 'Gagal menonaktifkan user' }, { status: 500 })
  }
}
