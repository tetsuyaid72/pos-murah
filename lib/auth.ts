/**
 * Authentication Utilities
 *
 * Handles password hashing, JWT session tokens, and request authentication.
 * Uses jose for Edge-compatible JWT (works in Next.js middleware).
 * Uses bcryptjs for password hashing (server-side only).
 */

import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'

// =============================================================================
// Configuration
// =============================================================================

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'warung-madura-pos-secret-change-in-production'
)

const SESSION_COOKIE = 'pos-session'
const SESSION_DURATION = 7 * 24 * 60 * 60 // 7 days in seconds

// =============================================================================
// Password Hashing
// =============================================================================

/**
 * Hash a plain-text password.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

/**
 * Verify a password against a hash.
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// =============================================================================
// JWT Session
// =============================================================================

/** JWT payload shape */
export interface SessionPayload {
  userId: string
  email: string
  role: string
  storeId: string | null
}

/**
 * Create a signed JWT token.
 */
export async function createToken(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(JWT_SECRET)
}

/**
 * Verify and decode a JWT token.
 * Returns null if the token is invalid or expired.
 */
export async function verifyToken(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as unknown as SessionPayload
  } catch {
    return null
  }
}

// =============================================================================
// Cookie-based Session
// =============================================================================

/**
 * Set the session cookie after login.
 */
export async function setSessionCookie(payload: SessionPayload): Promise<void> {
  const token = await createToken(payload)
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION,
    path: '/',
  })
}

/**
 * Get the current session from the cookie.
 * Returns null if not authenticated.
 */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return null
  return verifyToken(token)
}

/**
 * Clear the session cookie (logout).
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}

/**
 * Require authentication — throws if not logged in.
 * Use in API routes and server components.
 */
export async function requireAuth(): Promise<SessionPayload> {
  const session = await getSession()
  if (!session) {
    throw new Error('Unauthorized')
  }
  return session
}

/**
 * Require a specific role.
 */
export async function requireRole(
  ...roles: string[]
): Promise<SessionPayload> {
  const session = await requireAuth()
  if (!roles.includes(session.role)) {
    throw new Error('Forbidden')
  }
  return session
}
