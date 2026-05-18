import { NextRequest, NextResponse } from 'next/server'
import { and, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { products } from '@/lib/db/schema'
import { handleTenantError, requireTenant } from '@/lib/db/tenant'

export async function GET(request: NextRequest) {
  try {
    const { storeId } = await requireTenant()
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')?.trim()

    if (!code || code.length < 4 || code.length > 64) {
      return NextResponse.json({ error: 'Barcode tidak valid' }, { status: 400 })
    }

    const product = await db.query.products.findFirst({
      where: and(
        eq(products.storeId, storeId),
        eq(products.barcode, code),
        eq(products.isActive, true)
      ),
      with: { category: { columns: { id: true, name: true, color: true } } },
    })

    return NextResponse.json({ product: product ?? null })
  } catch (error) {
    return handleTenantError(error)
  }
}
