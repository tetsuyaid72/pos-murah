import { NextRequest, NextResponse } from 'next/server'
import { demoTransactions } from '@/data/demo'
import { generateId } from '@/lib/utils'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const status = searchParams.get('status')
  const limit = parseInt(searchParams.get('limit') || '100')

  let filtered = [...demoTransactions]

  if (from) {
    filtered = filtered.filter(t => t.createdAt >= from)
  }
  if (to) {
    filtered = filtered.filter(t => t.createdAt <= to)
  }
  if (status) {
    filtered = filtered.filter(t => t.status === status)
  }

  // Sort by date descending
  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return NextResponse.json({
    transactions: filtered.slice(0, limit),
    total: filtered.length,
  })
}

// POST — fake transaction creation (return a fake success response)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Build a fake transaction response (in-memory only)
    const fakeTransaction = {
      id: `demo-tx-${generateId()}`,
      invoiceNumber: `INV-DEMO-${Date.now().toString(36).toUpperCase()}`,
      ...body,
      status: 'COMPLETED',
      createdAt: new Date().toISOString(),
    }

    return NextResponse.json({ transaction: fakeTransaction })
  } catch {
    return NextResponse.json(
      { error: 'Mode demo: gagal memproses transaksi' },
      { status: 400 }
    )
  }
}
