/**
 * Next.js Proxy (formerly Middleware)
 *
 * Protects dashboard routes — redirects to /login if not authenticated.
 * Public routes (login, register, landing, API) are not protected.
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

/** Routes that don't require authentication */
const PUBLIC_PATHS = [
  '/',
  '/login',
  '/sign-in',
  '/pricing',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/logout',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/auth/google',
  '/api/auth/google/callback',
]

/** Path prefixes that are fully public (demo mode) */
const PUBLIC_PREFIXES = [
  '/demo',
  '/api/demo',
]

/** Auth pages — redirect to dashboard if already logged in */
const AUTH_PAGES = ['/login', '/sign-in', '/register']

/** Routes that require SUPER_ADMIN role */
const ADMIN_PATHS = ['/admin', '/api/admin']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // If user is on auth pages and already logged in, redirect to dashboard
  if (AUTH_PAGES.includes(pathname)) {
    const token = request.cookies.get('pos-session')?.value
    if (token) {
      const session = await verifyToken(token)
      if (session) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }
    return NextResponse.next()
  }

  // Allow public paths
  if (PUBLIC_PATHS.some((path) => pathname === path)) {
    return NextResponse.next()
  }

  // Allow demo routes (no auth required)
  if (PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next()
  }

  // Allow static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/uploads') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Check session token
  const token = request.cookies.get('pos-session')?.value
  if (!token) {
    // API routes return 401, page routes redirect to login
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Tidak terautentikasi' },
        { status: 401 }
      )
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Verify token
  const session = await verifyToken(token)
  if (!session) {
    // Invalid/expired token
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Sesi telah berakhir' },
        { status: 401 }
      )
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Check admin routes — require SUPER_ADMIN role
  if (ADMIN_PATHS.some((path) => pathname.startsWith(path))) {
    if (session.role !== 'SUPER_ADMIN') {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Akses ditolak' },
          { status: 403 }
        )
      }
      // Redirect non-admin to home, not /dashboard (avoids /upgrade chain)
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
