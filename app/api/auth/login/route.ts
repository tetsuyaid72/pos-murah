/**
 * POST /api/auth/login
 *
 * Authenticate user with email + password.
 * Updates lastLoginAt and logs the activity.
 *
 * Body: { email, password }
 */

import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { users, activityLogs } from '@/lib/db/schema'
import { verifyPassword, setSessionCookie } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email dan password wajib diisi' },
        { status: 400 }
      )
    }

    // Find user with store and membership (relational query)
    const user = await db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase().trim()),
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
        { error: 'Email atau password salah' },
        { status: 401 }
      )
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Akun Anda telah dinonaktifkan' },
        { status: 403 }
      )
    }

    // Check if user is Google-only (no password set)
    if (!user.passwordHash) {
      return NextResponse.json(
        { error: 'Akun ini terdaftar via Google. Gunakan tombol "Login dengan Google" untuk masuk.' },
        { status: 400 }
      )
    }

    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash)
    if (!isValid) {
      return NextResponse.json(
        { error: 'Email atau password salah' },
        { status: 401 }
      )
    }

    // Update last login
    await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id))

    // Log login activity
    if (user.store) {
      await db.insert(activityLogs).values({
        storeId: user.store.id,
        userId: user.id,
        action: 'user.login',
        entity: 'user',
        entityId: user.id,
      })
    }

    // Set session cookie
    await setSessionCookie({
      userId: user.id,
      email: user.email,
      role: user.role,
      storeId: user.store?.id ?? null,
    })

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      store: user.store
        ? {
            id: user.store.id,
            name: user.store.name,
          }
        : null,
      membership: user.store?.membership
        ? {
            plan: user.store.membership.plan,
            isTrial: user.store.membership.isTrial,
            trialEndAt: user.store.membership.trialEndAt,
          }
        : null,
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat login' },
      { status: 500 }
    )
  }
}
