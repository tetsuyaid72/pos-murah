/**
 * GET /api/auth/me
 *
 * Get the current authenticated user's info, store, and membership.
 * Used by the frontend to check auth state on page load.
 */

import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Tidak terautentikasi' },
        { status: 401 }
      )
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, session.userId),
      with: {
        store: {
          with: {
            membership: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        googleId: user.googleId,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
      },
      store: user.store
        ? {
            id: user.store.id,
            name: user.store.name,
            address: user.store.address,
            phone: user.store.phone,
            logoUrl: user.store.logoUrl,
          }
        : null,
      membership: user.store?.membership
        ? {
            plan: user.store.membership.plan,
            isTrial: user.store.membership.isTrial,
            trialStartAt: user.store.membership.trialStartAt,
            trialEndAt: user.store.membership.trialEndAt,
          }
        : null,
    })
  } catch (error) {
    console.error('Get me error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan' },
      { status: 500 }
    )
  }
}
