/**
 * POST /api/auth/register
 *
 * Register a new user + create their store + initialize a 6-hour quick trial membership.
 * After registration, user is redirected to /dashboard.
 *
 * Body: { name, email, password, storeName }
 */

import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { users, stores, memberships, activityLogs } from '@/lib/db/schema'
import { hashPassword, setSessionCookie } from '@/lib/auth'
import { generateId } from '@/lib/utils'
import { seedDemoData } from '@/lib/db/demo-seed'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, storeName } = body

    // Validate input
    if (!name || !email || !password || !storeName) {
      return NextResponse.json(
        { error: 'Semua field wajib diisi: name, email, password, storeName' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password minimal 6 karakter' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase().trim()),
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar' },
        { status: 409 }
      )
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Quick trial gives new users 6 hours to try the core POS flow.
    const trialStartAt = new Date()
    const trialEndAt = new Date(Date.now() + 6 * 60 * 60 * 1000)

    // Generate IDs upfront for the transaction
    const userId = generateId()
    const storeId = generateId()
    const membershipId = generateId()

    // Create user + store + membership in an async transaction (PostgreSQL)
    await db.transaction(async (tx) => {
      await tx.insert(users).values({
        id: userId,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        passwordHash,
        role: 'OWNER',
        lastLoginAt: new Date(),
      })

      await tx.insert(stores).values({
        id: storeId,
        name: storeName.trim(),
        ownerId: userId,
      })

      await tx.insert(memberships).values({
        id: membershipId,
        storeId,
        plan: 'BASIC',
        isTrial: true,
        trialStartAt,
        trialEndAt,
      })

      await seedDemoData(tx, storeId)
    })

    try {
      await db.insert(activityLogs).values({
        storeId,
        userId,
        action: 'user.register',
        entity: 'user',
        entityId: userId,
        metadata: {
          storeName: storeName.trim(),
          plan: 'BASIC',
          requiresPayment: true,
        },
      })
    } catch (logError) {
      console.warn('Register activity log failed:', logError)
    }

    // Set session cookie
    await setSessionCookie({
      userId,
      email: email.toLowerCase().trim(),
      role: 'OWNER',
      storeId,
    })

    return NextResponse.json(
      {
        user: {
          id: userId,
          name: name.trim(),
          email: email.toLowerCase().trim(),
          role: 'OWNER',
        },
        store: {
          id: storeId,
          name: storeName.trim(),
        },
        membership: {
          plan: 'BASIC',
          isTrial: true,
          trialEndAt,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mendaftar' },
      { status: 500 }
    )
  }
}

