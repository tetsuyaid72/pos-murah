import { NextResponse } from 'next/server'
import { demoProducts, demoCategories } from '@/data/demo'

export async function GET() {
  // Return products with category info attached (matching real API shape)
  const products = demoProducts.map(p => ({
    ...p,
    category: demoCategories.find(c => c.id === p.categoryId) ?? null,
  }))

  return NextResponse.json({ products })
}

// POST — fake create (return success without saving)
export async function POST() {
  return NextResponse.json(
    { error: 'Mode demo: data tidak disimpan' },
    { status: 403 }
  )
}
