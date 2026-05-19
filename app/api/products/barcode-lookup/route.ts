import { NextRequest, NextResponse } from 'next/server'
import { and, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { products } from '@/lib/db/schema'
import { handleTenantError, requireTenant } from '@/lib/db/tenant'

interface OpenFoodFactsProduct {
  product_name?: string
  product_name_id?: string
  generic_name?: string
  brands?: string
  quantity?: string
  image_front_url?: string
  image_url?: string
}

interface OpenFoodFactsResponse {
  status?: number
  product?: OpenFoodFactsProduct
}

export async function GET(request: NextRequest) {
  try {
    const { storeId } = await requireTenant()
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')?.trim()

    if (!code || code.length < 4 || code.length > 64) {
      return NextResponse.json({ error: 'Barcode tidak valid' }, { status: 400 })
    }

    const existing = await db.query.products.findFirst({
      where: and(
        eq(products.storeId, storeId),
        eq(products.barcode, code),
        eq(products.isActive, true)
      ),
      columns: { id: true, name: true, barcode: true, imageUrl: true },
    })

    if (existing) {
      return NextResponse.json({
        found: true,
        duplicate: true,
        source: 'store',
        product: existing,
      })
    }

    const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json`, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'WarungMaduraPOS/1.0 (https://warungmadura-pos.web.id)',
      },
      next: { revalidate: 60 * 60 * 24 },
    })

    if (!res.ok) {
      return NextResponse.json({ found: false, duplicate: false })
    }

    const data = await res.json().catch(() => null) as OpenFoodFactsResponse | null
    const product = data?.status === 1 ? data.product : null
    if (!product) {
      return NextResponse.json({ found: false, duplicate: false })
    }

    const nameParts = [
      product.product_name || product.product_name_id || product.generic_name || '',
      product.quantity || '',
    ].filter(Boolean)

    const name = nameParts.join(' ').trim()
    if (!name) {
      return NextResponse.json({ found: false, duplicate: false })
    }

    return NextResponse.json({
      found: true,
      duplicate: false,
      source: 'open_food_facts',
      product: {
        name,
        barcode: code,
        brand: product.brands || null,
        imageUrl: product.image_front_url || product.image_url || null,
      },
    })
  } catch (error) {
    return handleTenantError(error)
  }
}
