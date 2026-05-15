'use client'

import Link from 'next/link'
import { Crown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePlanLimit } from '@/hooks/use-plan-limit'

export function TrialExpiredBanner() {
  const { trialExpired } = usePlanLimit()

  if (!trialExpired) return null

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm dark:border-amber-800 dark:bg-amber-950/20">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold text-amber-900 dark:text-amber-200">
            Quick Trial Anda telah berakhir
          </p>
          <p className="mt-1 text-xs leading-5 text-amber-800/80 dark:text-amber-300/80">
            Dashboard tetap bisa dilihat, tetapi transaksi dan aksi utama dikunci sampai Anda upgrade paket.
          </p>
        </div>
        <Link href="/pricing" className="shrink-0">
          <Button className="h-10 rounded-xl bg-emerald-600 px-4 text-sm font-bold text-white hover:bg-emerald-700">
            <Crown className="mr-2 h-4 w-4" />
            Upgrade Paket Sekarang
          </Button>
        </Link>
      </div>
    </div>
  )
}
