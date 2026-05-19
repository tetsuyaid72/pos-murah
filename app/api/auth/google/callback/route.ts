/**
 * GET /api/auth/google/callback
 *
 * Handles Google OAuth 2.0 callback.
 * Exchanges authorization code for tokens, gets user info,
 * then either logs in existing user or registers new user.
 */

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { users, stores, memberships, activityLogs } from '@/lib/db/schema'
import { setSessionCookie } from '@/lib/auth'
import { generateId } from '@/lib/utils'
import { seedDemoData } from '@/lib/db/demo-seed'
import { getAppUrl } from '@/lib/app-url'

interface GoogleTokenResponse {
  access_token: string
  id_token: string
  token_type: string
  expires_in: number
  refresh_token?: string
}

interface GoogleUserInfo {
  id: string
  email: string
  verified_email: boolean
  name: string
  given_name?: string
  family_name?: string
  picture?: string
}

export async function GET(request: NextRequest) {
  const appUrl = getAppUrl()

  try {
    const { searchParams } = request.nextUrl
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    // Handle Google errors (user denied access, etc.)
    if (error) {
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent('Login dengan Google dibatalkan')}`, appUrl)
      )
    }

    // Validate required params
    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/login?error=Parameter+tidak+valid', appUrl)
      )
    }

    // Verify state (CSRF protection)
    const cookieStore = await cookies()
    const storedState = cookieStore.get('google-oauth-state')?.value

    if (!storedState || storedState !== state) {
      return NextResponse.redirect(
        new URL('/login?error=Sesi+tidak+valid.+Silakan+coba+lagi', appUrl)
      )
    }

    // Clear the state cookie
    cookieStore.delete('google-oauth-state')

    // Exchange authorization code for tokens
    const clientId = process.env.GOOGLE_CLIENT_ID!
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET!
    const redirectUri = `${appUrl}/api/auth/google/callback`

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenResponse.ok) {
      console.error('Google token exchange failed:', await tokenResponse.text())
      return NextResponse.redirect(
        new URL('/login?error=Gagal+mendapatkan+token+dari+Google', appUrl)
      )
    }

    const tokens: GoogleTokenResponse = await tokenResponse.json()

    // Get user info from Google
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    })

    if (!userInfoResponse.ok) {
      console.error('Google userinfo failed:', await userInfoResponse.text())
      return NextResponse.redirect(
        new URL('/login?error=Gagal+mendapatkan+info+pengguna+dari+Google', appUrl)
      )
    }

    const googleUser: GoogleUserInfo = await userInfoResponse.json()

    if (!googleUser.email || !googleUser.verified_email) {
      return NextResponse.redirect(
        new URL('/login?error=Email+Google+tidak+terverifikasi', appUrl)
      )
    }

    // Check if user exists by googleId
    let existingUser = await db.query.users.findFirst({
      where: eq(users.googleId, googleUser.id),
      with: {
        store: {
          with: {
            membership: true,
          },
        },
      },
    })

    // If not found by googleId, check by email
    if (!existingUser) {
      existingUser = await db.query.users.findFirst({
        where: eq(users.email, googleUser.email.toLowerCase()),
        with: {
          store: {
            with: {
              membership: true,
            },
          },
        },
      })
    }

    if (existingUser) {
      // ===== EXISTING USER: Login =====

      // Check if user is active
      if (!existingUser.isActive) {
        return NextResponse.redirect(
          new URL('/login?error=Akun+Anda+telah+dinonaktifkan', appUrl)
        )
      }

      // Link Google account if not already linked
      if (!existingUser.googleId) {
        await db.update(users).set({
          googleId: googleUser.id,
          avatarUrl: existingUser.avatarUrl || googleUser.picture || null,
        }).where(eq(users.id, existingUser.id))
      }

      // Update last login
      await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, existingUser.id))

      // Log login activity
      if (existingUser.store) {
        await db.insert(activityLogs).values({
          storeId: existingUser.store.id,
          userId: existingUser.id,
          action: 'user.login',
          entity: 'user',
          entityId: existingUser.id,
          metadata: { method: 'google' },
        })
      }

      // Set session cookie
      await setSessionCookie({
        userId: existingUser.id,
        email: existingUser.email,
        role: existingUser.role,
        storeId: existingUser.store?.id ?? null,
      })

      return NextResponse.redirect(new URL('/dashboard', appUrl))
    }

    // ===== NEW USER: Register =====
    const userId = generateId()
    const storeId = generateId()
    const membershipId = generateId()

    // Generate store name from Google user's first name
    const firstName = googleUser.given_name || googleUser.name.split(' ')[0]
    const storeName = `Toko ${firstName}`

    const membershipCreatedAt = new Date()

    // Create user + store + membership in a transaction
    await db.transaction(async (tx) => {
      await tx.insert(users).values({
        id: userId,
        name: googleUser.name,
        email: googleUser.email.toLowerCase(),
        passwordHash: null,
        googleId: googleUser.id,
        avatarUrl: googleUser.picture || null,
        role: 'OWNER',
        lastLoginAt: new Date(),
      })

      await tx.insert(stores).values({
        id: storeId,
        name: storeName,
        ownerId: userId,
      })

      await tx.insert(memberships).values({
        id: membershipId,
        storeId,
        plan: 'FREE',
        isTrial: false,
        trialStartAt: membershipCreatedAt,
        trialEndAt: membershipCreatedAt,
      })

      await tx.insert(activityLogs).values({
        storeId,
        userId,
        action: 'user.register',
        entity: 'user',
        entityId: userId,
        metadata: {
          method: 'google',
          storeName,
          plan: 'FREE',
          requiresPayment: true,
        },
      })

      await seedDemoData(tx, storeId)
    })

    // Set session cookie
    await setSessionCookie({
      userId,
      email: googleUser.email.toLowerCase(),
      role: 'OWNER',
      storeId,
    })

    return NextResponse.redirect(new URL('/dashboard', appUrl))
  } catch (error) {
    console.error('Google OAuth callback error:', error)
    return NextResponse.redirect(
      new URL('/login?error=Terjadi+kesalahan+saat+login+dengan+Google', appUrl)
    )
  }
}

