/**
 * PUT /api/auth/profile
 *
 * Update the current user's profile (name, avatarUrl).
 * Protected: requires authentication.
 *
 * Body: { name?, avatarUrl? }
 */

import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { requireAuth } from '@/lib/auth'

export async function PUT(request: NextRequest) {
  try {
    const session = await requireAuth()
    const body = await request.json()
    const { name, avatarUrl } = body

    // Build update object — only include fields that were provided
    const updates: Record<string, unknown> = {}
    if (typeof name === 'string' && name.trim()) {
      updates.name = name.trim()
    }
    if (typeof avatarUrl === 'string' || avatarUrl === null) {
      updates.avatarUrl = avatarUrl
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'Tidak ada data yang diubah' },
        { status: 400 }
      )
    }

    // Update user in database
    db.update(users)
      .set(updates)
      .where(eq(users.id, session.userId))
      .run()

    // Fetch updated user
    const updatedUser = await db.query.users.findFirst({
      where: eq(users.id, session.userId),
    })

    return NextResponse.json({
      user: {
        id: updatedUser!.id,
        name: updatedUser!.name,
        email: updatedUser!.email,
        role: updatedUser!.role,
        avatarUrl: updatedUser!.avatarUrl,
      },
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Tidak terautentikasi' },
        { status: 401 }
      )
    }
    console.error('Update profile error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat memperbarui profil' },
      { status: 500 }
    )
  }
}
