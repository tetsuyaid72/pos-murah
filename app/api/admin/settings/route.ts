/**
 * GET /api/admin/settings — Get feature flags
 * PATCH /api/admin/settings — Update feature flags
 */

import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { featureFlags } from '@/lib/db/schema'

export async function GET() {
  try {
    const session = await getSession()
    if (!session || session.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 })
    }

    const flags = await db.select().from(featureFlags)

    return NextResponse.json({ flags })
  } catch (error) {
    console.error('Admin settings GET error:', error)
    return NextResponse.json({ error: 'Gagal mengambil data' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 })
    }

    const body = await request.json()
    const { flags } = body

    if (!flags || !Array.isArray(flags)) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }

    // Update each flag
    for (const flag of flags) {
      if (flag.id && typeof flag.isActive === 'boolean') {
        await db
          .update(featureFlags)
          .set({ isActive: flag.isActive })
          .where(eq(featureFlags.id, flag.id))
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin settings PATCH error:', error)
    return NextResponse.json({ error: 'Gagal menyimpan settings' }, { status: 500 })
  }
}
