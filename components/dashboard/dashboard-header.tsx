'use client'

import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth-store'
import { cn } from '@/lib/utils'

export type DashboardPeriod = 'today' | '7days' | '30days'

interface DashboardHeaderProps {
  period: DashboardPeriod
  onPeriodChange: (period: DashboardPeriod) => void
  posHref?: string
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 11) return 'Selamat Pagi'
  if (hour >= 11 && hour < 15) return 'Selamat Siang'
  if (hour >= 15 && hour < 18) return 'Selamat Sore'
  return 'Selamat Malam'
}

const PERIOD_OPTIONS: { value: DashboardPeriod; label: string }[] = [
  { value: 'today', label: 'Hari Ini' },
  { value: '7days', label: '7 Hari' },
  { value: '30days', label: '30 Hari' },
]

export function DashboardHeader({ period, onPeriodChange, posHref = '/pos' }: DashboardHeaderProps) {
  const { user } = useAuthStore()

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Left: Greeting */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          {getGreeting()}, {user?.name || 'Pengguna'}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ringkasan performa toko Anda
        </p>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2.5">
        {/* Period filter pills */}
        <div className="flex rounded-xl border border-border/50 bg-muted/50 p-1">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onPeriodChange(opt.value)}
              className={cn(
                'rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all duration-200 cursor-pointer',
                period === opt.value
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Open POS */}
        <Link href={posHref}>
          <Button variant="premium">
            <ShoppingCart className="mr-2 h-4 w-4" />
            Buka Kasir
          </Button>
        </Link>
      </div>
    </div>
  )
}
