/**
 * GET  /api/customers — List customers (scoped to store)
 * POST /api/customers — Create a customer
 */

import { NextRequest, NextResponse } from 'next/server'
import { eq, like, and, desc } from 'drizzle-orm'
import { db } from '@/lib/db'
import { customers } from '@/lib/db/schema'
import { requireTenant, handleTenantError } from '@/lib/db/tenant'
import { logActivityAsync } from '@/lib/activity'
import { checkCustomerLimit } from '@/lib/plan-guard'

export async function GET(request: NextRequest) {
  try {
    const { storeId } = await requireTenant()
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')

    const conditions = [eq(customers.storeId, storeId)]
    if (search) {
      conditions.push(like(customers.name, `%${search}%`))
    }

    const result = await db.query.customers.findMany({
      where: and(...conditions),
      orderBy: desc(customers.createdAt),
    })

    return NextResponse.json({ customers: result })
  } catch (error) {
    return handleTenantError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { session, storeId } = await requireTenant()

    // Check plan limit before creating customer
    const planCheck = await checkCustomerLimit(storeId)
    if (!planCheck.allowed) {
      return NextResponse.json(
        {
          error: planCheck.message,
          code: 'PLAN_LIMIT_REACHED',
          limit: planCheck.limit,
          current: planCheck.current,
        },
        { status: 403 }
      )
    }

    const body = await request.json()

    const { name, phone, address } = body

    if (!name) {
      return NextResponse.json({ error: 'Nama pelanggan wajib diisi' }, { status: 400 })
    }

    const [customer] = await db.insert(customers).values({
      storeId,
      name: name.trim(),
      phone: phone || null,
      address: address || null,
    }).returning()

    logActivityAsync({
      storeId,
      userId: session.userId,
      action: 'customer.create',
      entity: 'customer',
      entityId: customer.id,
      metadata: { customerName: customer.name },
    })

    return NextResponse.json({ customer }, { status: 201 })
  } catch (error) {
    return handleTenantError(error)
  }
}
