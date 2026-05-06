import { NextRequest, NextResponse } from 'next/server'
import { getDemoDashboard } from '@/data/demo'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const range = (searchParams.get('range') || '7days') as 'today' | '7days' | '30days'

  const data = getDemoDashboard(range)
  return NextResponse.json(data)
}
