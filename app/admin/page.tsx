'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Users,
  Clock,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  LayoutDashboard,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Stats {
  totalUsers: number
  pendingPayments: number
  approvedPayments: number
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    pendingPayments: 0,
    approvedPayments: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch admin stats and payments in parallel
        const [statsRes, paymentsRes] = await Promise.all([
          fetch('/api/admin/stats'),
          fetch('/api/admin/payments'),
        ])

        let totalUsers = 0
        if (statsRes.ok) {
          const data = await statsRes.json()
          totalUsers = data.overview?.totalUsers ?? 0
        }

        let pendingPayments = 0
        let approvedPayments = 0
        if (paymentsRes.ok) {
          const data = await paymentsRes.json()
          const allPayments = data.payments || []
          pendingPayments = allPayments.filter((p: { status: string }) => p.status === 'PENDING').length
          approvedPayments = allPayments.filter((p: { status: string }) => p.status === 'APPROVED').length
        }

        setStats({ totalUsers, pendingPayments, approvedPayments })
      } catch {
        // Fallback to zeros
      } finally {
        setIsLoading(false)
      }
    }

    const timeout = setTimeout(fetchStats, 0)
    return () => clearTimeout(timeout)
  }, [])

  const cards = [
    {
      label: 'Total User',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      label: 'Pending Payment',
      value: stats.pendingPayments,
      icon: Clock,
      color: 'bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
      iconColor: 'text-amber-600 dark:text-amber-400',
    },
    {
      label: 'Total Approved',
      value: stats.approvedPayments,
      icon: CheckCircle2,
      color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/50 bg-card">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-500/10">
                <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground sm:text-2xl">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">Kelola user dan pembayaran</p>
              </div>
            </div>
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard Utama
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {/* Stats cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          {cards.map((card) => (
            <div
              key={card.label}
              className="rounded-xl border border-border/50 bg-card p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{card.label}</p>
                  <p className={cn(
                    'mt-2 text-3xl font-bold text-foreground',
                    isLoading && 'animate-pulse'
                  )}>
                    {isLoading ? '—' : card.value}
                  </p>
                </div>
                <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl', card.color)}>
                  <card.icon className={cn('h-6 w-6', card.iconColor)} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">Menu Admin</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Link href="/admin/payments" className="block">
              <div className="group rounded-xl border border-border/50 bg-card p-6 shadow-sm transition-all hover:border-emerald-200 hover:shadow-md dark:hover:border-emerald-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-500/10">
                      <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Manajemen Pembayaran</p>
                      <p className="text-xs text-muted-foreground">Approve / reject pembayaran user</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>

            <Link href="/admin/payments?status=APPROVED" className="block">
              <div className="group rounded-xl border border-border/50 bg-card p-6 shadow-sm transition-all hover:border-emerald-200 hover:shadow-md dark:hover:border-emerald-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-500/10">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">User Pro</p>
                      <p className="text-xs text-muted-foreground">Lihat semua user yang sudah upgrade</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
