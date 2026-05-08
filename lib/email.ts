/**
 * Email Utility — Nodemailer + Gmail SMTP
 *
 * Handles sending transactional emails (password reset, etc.)
 * Uses Gmail SMTP with App Password for authentication.
 *
 * Setup:
 * 1. Enable 2-Step Verification on your Google account
 * 2. Create App Password at https://myaccount.google.com/apppasswords
 * 3. Set GMAIL_USER and GMAIL_APP_PASSWORD in .env
 */

import nodemailer from 'nodemailer'

const APP_NAME = 'Warung Madura POS'

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

/**
 * Send a password reset email with a tokenized link.
 */
export async function sendPasswordResetEmail(
  email: string,
  token: string
): Promise<{ success: boolean; error?: string }> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const resetUrl = `${appUrl}/reset-password?token=${token}`

  try {
    const info = await transporter.sendMail({
      from: `${APP_NAME} <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `Reset Password — ${APP_NAME}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          </head>
          <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <div style="max-width: 480px; margin: 40px auto; padding: 32px; background: #ffffff; border-radius: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
              <!-- Header -->
              <div style="text-align: center; margin-bottom: 32px;">
                <h1 style="font-size: 20px; font-weight: 600; color: #1e293b; margin: 0;">
                  ${APP_NAME}
                </h1>
              </div>

              <!-- Content -->
              <div style="margin-bottom: 32px;">
                <h2 style="font-size: 18px; font-weight: 600; color: #1e293b; margin: 0 0 12px;">
                  Reset Password
                </h2>
                <p style="font-size: 14px; color: #64748b; line-height: 1.6; margin: 0 0 24px;">
                  Kami menerima permintaan untuk mereset password akun Anda. Klik tombol di bawah untuk membuat password baru.
                </p>

                <!-- Button -->
                <div style="text-align: center;">
                  <a href="${resetUrl}" style="display: inline-block; padding: 12px 32px; background-color: #10B981; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 10px;">
                    Reset Password
                  </a>
                </div>
              </div>

              <!-- Info -->
              <div style="padding: 16px; background: #f1f5f9; border-radius: 10px; margin-bottom: 24px;">
                <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin: 0;">
                  Link ini akan kedaluwarsa dalam <strong>1 jam</strong>. Jika Anda tidak meminta reset password, abaikan email ini.
                </p>
              </div>

              <!-- Fallback URL -->
              <div style="margin-bottom: 24px;">
                <p style="font-size: 12px; color: #94a3b8; margin: 0 0 4px;">
                  Jika tombol tidak berfungsi, salin link berikut:
                </p>
                <p style="font-size: 11px; color: #10B981; word-break: break-all; margin: 0;">
                  ${resetUrl}
                </p>
              </div>

              <!-- Footer -->
              <div style="border-top: 1px solid #e2e8f0; padding-top: 16px;">
                <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">
                  &copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    })

    console.log('Email sent successfully:', info.messageId)
    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown email error'
    console.error('Gmail SMTP error:', message)
    return { success: false, error: message }
  }
}
