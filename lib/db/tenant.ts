/**
 * Multi-Tenant Helpers
 *
 * Core isolation layer for the SaaS POS system.
 * Every business-data query MUST go through these helpers to guarantee
 * that data never leaks between tenants.
 *
 * Pattern:
 *   const storeId = await requireStoreId()
 *   const rows = await db.select().from(products).where(eq(products.storeId, storeId))
 *
 * Or use the higher-level guard:
 *   const { session, storeId } = await requireTenant()
 */

import { NextResponse } from 'next/server'
import { getSession, type SessionPayload } from '@/lib/auth'

// =============================================================================
// Core helpers
// =============================================================================

/**
 * Get the current store ID from the session.
 * Returns null if not authenticated or user has no store (e.g. SUPER_ADMIN).
 */
export async function getCurrentStoreId(): Promise<string | null> {
  const session = await getSession()
  return session?.storeId ?? null
}

/**
 * Require a valid store ID. Throws a structured error if:
 * - User is not authenticated
 * - User has no associated store
 *
 * Use in API routes where store context is mandatory.
 */
export async function requireStoreId(): Promise<string> {
  const session = await getSession()

  if (!session) {
    throw new TenantError('Tidak terautentikasi', 401)
  }

  if (!session.storeId) {
    throw new TenantError('Akun tidak terhubung dengan toko', 403)
  }

  return session.storeId
}

/**
 * Full tenant guard — returns both session and storeId.
 * Most convenient for API routes that need user info + store scope.
 */
export async function requireTenant(): Promise<{
  session: SessionPayload
  storeId: string
}> {
  const session = await getSession()

  if (!session) {
    throw new TenantError('Tidak terautentikasi', 401)
  }

  if (!session.storeId) {
    throw new TenantError('Akun tidak terhubung dengan toko', 403)
  }

  return { session, storeId: session.storeId }
}

// =============================================================================
// Ownership verification
// =============================================================================

/**
 * Verify that a record belongs to the given store.
 * Use after fetching a single record to prevent IDOR attacks.
 *
 * Example:
 *   const product = await db.query.products.findFirst({ where: eq(products.id, id) })
 *   assertOwnership(product, product?.storeId, storeId)
 */
export function assertOwnership(
  record: unknown,
  recordStoreId: string | null | undefined,
  currentStoreId: string
): void {
  if (!record) {
    throw new TenantError('Data tidak ditemukan', 404)
  }
  if (recordStoreId !== currentStoreId) {
    // Log this — it could be an attack attempt
    console.warn(
      `[TENANT] Ownership violation: record store=${recordStoreId}, request store=${currentStoreId}`
    )
    throw new TenantError('Data tidak ditemukan', 404) // 404, not 403 — don't reveal existence
  }
}

// =============================================================================
// Error handling
// =============================================================================

/**
 * Structured error for tenant violations.
 * API route catch blocks can check `instanceof TenantError` to return proper HTTP responses.
 */
export class TenantError extends Error {
  public readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'TenantError'
    this.status = status
  }
}

/**
 * Convert a TenantError (or any error) into a NextResponse.
 * Use in the catch block of every API route.
 *
 * Example:
 *   try { ... } catch (error) { return handleTenantError(error) }
 */
export function handleTenantError(error: unknown): NextResponse {
  if (error instanceof TenantError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.status }
    )
  }

  const errorMessage = error instanceof Error ? error.message : String(error)
  const errorStack = error instanceof Error ? error.stack : undefined
  console.error('Unexpected error:', errorMessage, errorStack)

  // In development, return the actual error message for debugging
  const isDev = process.env.NODE_ENV !== 'production'
  return NextResponse.json(
    {
      error: isDev ? errorMessage : 'Terjadi kesalahan server',
      ...(isDev && { stack: errorStack }),
    },
    { status: 500 }
  )
}
