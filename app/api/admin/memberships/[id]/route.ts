/**
 * PATCH /api/admin/memberships/[id] — Change plan, toggle trial, extend trial
 */

import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { memberships } from '@/lib/db/schema'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { plan, extendDays, endTrial } = body

    const existing = await db.query.memberships.findFirst({
      where: eq(memberships.id, id),
    })

    if (!existing) {
      return NextResponse.json({ error: 'Membership tidak ditemukan' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}

    // Change plan
    if (plan && ['BASIC', 'PRO', 'BUSINESS', 'ENTERPRISE'].includes(plan)) {
      updateData.plan = plan
    }

    // Extend trial
    if (extendDays && typeof extendDays === 'number' && extendDays > 0) {
      const currentEnd = new Date(existing.trialEndAt)
      const now = new Date()
      // If trial already expired, extend from now; otherwise extend from current end
      const baseDate = currentEnd > now ? currentEnd : now
      const newEnd = new Date(baseDate.getTime() + extendDays * 24 * 60 * 60 * 1000)
      updateData.trialEndAt = newEnd
      updateData.isTrial = true
    }

    // End trial
    if (endTrial === true) {
      updateData.isTrial = false
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'Tidak ada data yang diubah' }, { status: 400 })
    }

    await db.update(memberships).set(updateData).where(eq(memberships.id, id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin update membership error:', error)
    return NextResponse.json({ error: 'Gagal mengupdate membership' }, { status: 500 })
  }
}
