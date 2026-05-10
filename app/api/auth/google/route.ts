/**
 * GET /api/auth/google
 *
 * Initiates Google OAuth 2.0 flow.
 * Redirects user to Google consent screen.
 * Stores state parameter in httpOnly cookie for CSRF protection.
 */

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAppUrl } from '@/lib/app-url'

export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID
  if (!clientId) {
    return NextResponse.json(
      { error: 'Google OAuth belum dikonfigurasi' },
      { status: 500 }
    )
  }

  const appUrl = getAppUrl()
  const redirectUri = `${appUrl}/api/auth/google/callback`

  // Generate random state for CSRF protection
  const state = crypto.randomUUID()

  // Store state in httpOnly cookie (expires in 10 minutes)
  const cookieStore = await cookies()
  cookieStore.set('google-oauth-state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600, // 10 minutes
    path: '/',
  })

  // Build Google OAuth URL
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    access_type: 'offline',
    prompt: 'select_account',
  })

  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`

  return NextResponse.redirect(googleAuthUrl)
}
