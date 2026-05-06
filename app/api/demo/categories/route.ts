import { NextResponse } from 'next/server'
import { demoCategories } from '@/data/demo'

export async function GET() {
  return NextResponse.json({ categories: demoCategories })
}

export async function POST() {
  return NextResponse.json(
    { error: 'Mode demo: data tidak disimpan' },
    { status: 403 }
  )
}
