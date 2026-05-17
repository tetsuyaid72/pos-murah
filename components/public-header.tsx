import Link from 'next/link'
import { Store } from 'lucide-react'
import { PricingAuthAction } from '@/components/pricing/pricing-auth-action'

interface PublicHeaderProps {
  authHref?: string
  authLabel?: string
}

export function PublicHeader({ authHref, authLabel }: PublicHeaderProps) {
  return (
    <header className="relative left-1/2 z-[100] flex h-14 w-screen -translate-x-1/2 items-center justify-between gap-3 px-4 sm:h-16 sm:px-8">
      <Link href="/" className="flex min-w-0 items-center gap-2.5 justify-self-start">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-[0_12px_28px_rgba(16,185,129,0.25)] sm:h-9 sm:w-9 sm:rounded-2xl">
          <Store className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
        </div>
        <span className="truncate text-sm font-black tracking-tight text-slate-900 dark:text-white sm:text-base">
          Warung Madura <span className="text-emerald-600 dark:text-emerald-400">POS</span>
        </span>
      </Link>

      <PricingAuthAction authHref={authHref} authLabel={authLabel} />
    </header>
  )
}
