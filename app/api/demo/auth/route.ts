import { NextResponse } from 'next/server'

/**
 * Demo auth endpoint — returns fake user/store/membership data
 * so the AuthProvider and sidebar render correctly.
 */
export async function GET() {
  return NextResponse.json({
    user: {
      id: 'demo-user',
      name: 'Demo User',
      email: 'demo@warungmadura.pos',
      role: 'OWNER',
      avatarUrl: null,
    },
    store: {
      id: 'demo-store',
      name: 'Warung Madura Demo',
      address: 'Jl. Contoh No. 123, Jakarta',
      phone: '08123456789',
      logoUrl: null,
    },
    membership: {
      plan: 'PRO',
      isTrial: false,
      trialEndAt: null,
    },
  })
}
