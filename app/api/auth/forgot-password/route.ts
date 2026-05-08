/**
 * POST /api/auth/forgot-password
 *
 * Request a password reset email.
 * Always returns success to prevent email enumeration.
 * Requires Cloudflare Turnstile verification.
 *
 * Body: { email, turnstileToken }
 */

import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { users, passwordResetTokens } from '@/lib/db/schema'
import { sendPasswordResetEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, turnstileToken } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email wajib diisi' },
        { status: 400 }
      )
    }

    if (!turnstileToken) {
      return NextResponse.json(
        { error: 'Verifikasi keamanan diperlukan' },
        { status: 400 }
      )
    }

    // Verify Cloudflare Turnstile token
    const turnstileSecret = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY
    if (turnstileSecret) {
      const turnstileRes = await fetch(
        'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            secret: turnstileSecret,
            response: turnstileToken,
          }),
        }
      )

      const turnstileData = await turnstileRes.json()

      if (!turnstileData.success) {
        console.error('Turnstile verification failed:', turnstileData)
        return NextResponse.json(
          { error: 'Verifikasi keamanan gagal. Silakan coba lagi.' },
          { status: 400 }
        )
      }
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Find user by email
    const user = await db.query.users.findFirst({
      where: eq(users.email, normalizedEmail),
    })

    // Always return success (don't reveal if email exists)
    if (!user) {
      return NextResponse.json({
        message: 'Jika email terdaftar, kami telah mengirim link reset password.',
      })
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json({
        message: 'Jika email terdaftar, kami telah mengirim link reset password.',
      })
    }

    // Generate a secure random token
    const token = crypto.randomUUID()

    // Token expires in 1 hour
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

    // Save token to database
    await db.insert(passwordResetTokens).values({
      userId: user.id,
      token,
      expiresAt,
    })

    // Build reset URL for logging in development
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const resetUrl = `${appUrl}/reset-password?token=${token}`

    // Always log reset link in development for easy testing
    if (process.env.NODE_ENV === 'development') {
      console.log('\n========================================')
      console.log('PASSWORD RESET LINK (dev only):')
      console.log(resetUrl)
      console.log('========================================\n')
    }

    // Send reset email
    const emailResult = await sendPasswordResetEmail(user.email, token)

    if (!emailResult.success) {
      console.error('Failed to send reset email:', emailResult.error)
      // In development, still return success since we logged the link
      if (process.env.NODE_ENV === 'development') {
        return NextResponse.json({
          message: 'Jika email terdaftar, kami telah mengirim link reset password.',
          // Include reset URL in dev mode for easy testing
          _dev_reset_url: resetUrl,
        })
      }
      return NextResponse.json(
        { error: `Gagal mengirim email. Silakan coba lagi.` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Jika email terdaftar, kami telah mengirim link reset password.',
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan. Silakan coba lagi.' },
      { status: 500 }
    )
  }
}
