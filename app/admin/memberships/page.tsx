'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Crown,
  Loader2,
  X,
  Calendar,
  ArrowUpCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Membership {
  id: string
  storeId: string
  plan: string
  isTrial: boolean
  trialStartAt: string
  trialEndAt: string
  createdAt: string
  storeName: string
  ownerName: string
  ownerEmail: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

const PLAN_BADGE: Record<string, string> = {
  BASIC: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
  PRO: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  BUSINESS: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  ENTERPRISE: 'bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400',
}

export default function AdminMembershipsPage() {
  const [memberships, setMemberships] = useState<Membership[]>([])
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [planFilter, setPlanFilter] = useState('')
  const [trialFilter, setTrialFilter] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [editingMembership, setEditingMembership] = useState<Membership | null>(null)
  const [editPlan, setEditPlan] = useState('')

  const fetchMemberships = useCallback(async (page = 1) => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', page.toString())
      if (planFilter) params.set('plan', planFilter)
      if (trialFilter) params.set('trial', trialFilter)

      const res = await fetch(`/api/admin/memberships?${params.toString()}`)
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      setMemberships(data.memberships || [])
      setPagination(data.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 })
    } catch {
      setMemberships([])
    } finally {
      setIsLoading(false)
    }
  }, [planFilter, trialFilter])

  useEffect(() => {
    const timeout = setTimeout(() => fetchMemberships(1), 300)
    return () => clearTimeout(timeout)
  }, [fetchMemberships])

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(t)
    }
  }, [toast])

  const handleChangePlan = async () => {
    if (!editingMembership || !editPlan) return
    setActionLoading(editingMembership.id)
    try {
      const res = await fetch(`/api/admin/memberships/${editingMembership.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: editPlan }),
      })
      if (!res.ok) throw new Error('Failed')
      setToast({ message: `Plan diubah ke ${editPlan}`, type: 'success' })
      setEditingMembership(null)
      fetchMemberships(pagination.page)
    } catch {
      setToast({ message: 'Gagal mengubah plan', type: 'error' })
    } finally {
      setActionLoading(null)
    }
  }

  const handleExtendTrial = async (membership: Membership, days: number) => {
    setActionLoading(membership.id)
    try {
      const res = await fetch(`/api/admin/memberships/${membership.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ extendDays: days }),
      })
      if (!res.ok) throw new Error('Failed')
      setToast({ message: `Trial diperpanjang ${days} hari`, type: 'success' })
      fetchMemberships(pagination.page)
    } catch {
      setToast({ message: 'Gagal memperpanjang trial', type: 'error' })
    } finally {
      setActionLoading(null)
    }
  }

  const handleEndTrial = async (membership: Membership) => {
    setActionLoading(membership.id)
    try {
      const res = await fetch(`/api/admin/memberships/${membership.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endTrial: true }),
      })
      if (!res.ok) throw new Error('Failed')
      setToast({ message: 'Trial diakhiri', type: 'success' })
      fetchMemberships(pagination.page)
    } catch {
      setToast({ message: 'Gagal mengakhiri trial', type: 'error' })
    } finally {
      setActionLoading(null)
    }
  }

  const getTrialStatus = (m: Membership) => {
    if (!m.isTrial) return { label: 'Paid', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' }
    const daysLeft = Math.ceil((new Date(m.trialEndAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    if (daysLeft <= 0) return { label: 'Expired', color: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400' }
    return { label: `${daysLeft}d left`, color: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' }
  }

  return (
    <div className="p-4 sm:p-6 space-y-4">
      {/* Toast */}
      {toast && (
        <div className={cn(
          'fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium shadow-lg',
          toast.type === 'success'
            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300'
            : 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300'
        )}>
          {toast.message}
          <button onClick={() => setToast(null)} className="ml-2"><X className="h-4 w-4" /></button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <select
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
        >
          <option value="">Semua Plan</option>
          <option value="BASIC">Basic</option>
          <option value="PRO">Pro</option>
          <option value="BUSINESS">Business</option>
          <option value="ENTERPRISE">Enterprise</option>
        </select>
        <select
          value={trialFilter}
          onChange={(e) => setTrialFilter(e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
        >
          <option value="">Semua Status</option>
          <option value="active">Active Trial</option>
          <option value="paid">Paid</option>
        </select>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {isLoading ? (
          [...Array(5)].map((_, i) => (
            <div key={i} className="rounded-xl border border-border/50 bg-card p-4 shadow-sm">
              <div className="h-5 rounded bg-muted/50 animate-pulse mb-2" />
              <div className="h-4 rounded bg-muted/50 animate-pulse w-2/3" />
            </div>
          ))
        ) : memberships.length === 0 ? (
          <div className="rounded-xl border border-border/50 bg-card p-8 text-center text-muted-foreground shadow-sm">
            Tidak ada membership ditemukan
          </div>
        ) : (
          memberships.map((m) => {
            const trialStatus = getTrialStatus(m)
            return (
              <div key={m.id} className="rounded-xl border border-border/50 bg-card p-4 shadow-sm space-y-3">
                {/* Store name & Plan badge */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium text-foreground text-sm truncate">{m.storeName}</p>
                    <p className="text-xs text-muted-foreground truncate">{m.ownerName}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{m.ownerEmail}</p>
                  </div>
                  <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium shrink-0', PLAN_BADGE[m.plan] || '')}>
                    <Crown className="h-3 w-3" />
                    {m.plan}
                  </span>
                </div>

                {/* Trial status & end date */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={cn('inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium', trialStatus.color)}>
                    {trialStatus.label}
                  </span>
                  {m.isTrial && (
                    <span className="text-xs text-muted-foreground">
                      ends {new Date(m.trialEndAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1 border-t border-border/30">
                  <button
                    onClick={() => { setEditingMembership(m); setEditPlan(m.plan) }}
                    className="rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors border border-border/50"
                    title="Change Plan"
                  >
                    <ArrowUpCircle className="h-3.5 w-3.5 inline mr-1" />
                    Change Plan
                  </button>
                  {m.isTrial && (
                    <>
                      <button
                        onClick={() => handleExtendTrial(m, 7)}
                        disabled={actionLoading === m.id}
                        className="rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground hover:bg-blue-100 hover:text-blue-700 dark:hover:bg-blue-500/10 transition-colors border border-border/50"
                        title="Extend +7 days"
                      >
                        {actionLoading === m.id ? <Loader2 className="h-3 w-3 animate-spin" /> : '+7d'}
                      </button>
                      <button
                        onClick={() => handleEndTrial(m)}
                        disabled={actionLoading === m.id}
                        className="rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-500/10 transition-colors border border-border/50"
                        title="End Trial"
                      >
                        End
                      </button>
                    </>
                  )}
                </div>
              </div>
            )
          })
        )}

        {/* Mobile Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between rounded-xl border border-border/50 bg-card px-4 py-3 shadow-sm">
            <p className="text-xs text-muted-foreground">
              {((pagination.page - 1) * pagination.limit) + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => fetchMemberships(pagination.page - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="px-2 text-xs text-muted-foreground">
                {pagination.page} / {pagination.totalPages}
              </span>
              <Button
                variant="ghost"
                size="sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchMemberships(pagination.page + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block rounded-xl border border-border/50 bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Store</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Owner</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Plan</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Trial Status</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Trial End</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-border/30">
                    <td colSpan={6} className="px-4 py-3">
                      <div className="h-5 rounded bg-muted/50 animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : memberships.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    Tidak ada membership ditemukan
                  </td>
                </tr>
              ) : (
                memberships.map((m) => {
                  const trialStatus = getTrialStatus(m)
                  return (
                    <tr key={m.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 font-medium text-foreground">{m.storeName}</td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-foreground text-xs">{m.ownerName}</p>
                          <p className="text-muted-foreground text-[11px]">{m.ownerEmail}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium', PLAN_BADGE[m.plan] || '')}>
                          <Crown className="h-3 w-3" />
                          {m.plan}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn('inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium', trialStatus.color)}>
                          {trialStatus.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {m.isTrial
                          ? new Date(m.trialEndAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                          : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => { setEditingMembership(m); setEditPlan(m.plan) }}
                            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                            title="Change Plan"
                          >
                            <ArrowUpCircle className="h-3.5 w-3.5" />
                          </button>
                          {m.isTrial && (
                            <>
                              <button
                                onClick={() => handleExtendTrial(m, 7)}
                                disabled={actionLoading === m.id}
                                className="rounded-lg px-2 py-1 text-[11px] text-muted-foreground hover:bg-blue-100 hover:text-blue-700 dark:hover:bg-blue-500/10 transition-colors"
                                title="Extend +7 days"
                              >
                                {actionLoading === m.id ? <Loader2 className="h-3 w-3 animate-spin" /> : '+7d'}
                              </button>
                              <button
                                onClick={() => handleEndTrial(m)}
                                disabled={actionLoading === m.id}
                                className="rounded-lg px-2 py-1 text-[11px] text-muted-foreground hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-500/10 transition-colors"
                                title="End Trial"
                              >
                                End
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border/50 px-4 py-3">
            <p className="text-xs text-muted-foreground">
              Showing {((pagination.page - 1) * pagination.limit) + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => fetchMemberships(pagination.page - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="px-2 text-xs text-muted-foreground">
                {pagination.page} / {pagination.totalPages}
              </span>
              <Button
                variant="ghost"
                size="sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchMemberships(pagination.page + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Change Plan Modal */}
      {editingMembership && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-card border border-border p-6 shadow-xl mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Change Plan</h3>
              <button onClick={() => setEditingMembership(null)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Store: <span className="text-foreground font-medium">{editingMembership.storeName}</span></p>
                <p className="text-sm text-muted-foreground">Current Plan: <span className="text-foreground font-medium">{editingMembership.plan}</span></p>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">New Plan</label>
                <select
                  value={editPlan}
                  onChange={(e) => setEditPlan(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  <option value="BASIC">Basic</option>
                  <option value="PRO">Pro</option>
                  <option value="BUSINESS">Business</option>
                  <option value="ENTERPRISE">Enterprise</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setEditingMembership(null)}>
                  Batal
                </Button>
                <Button
                  size="sm"
                  onClick={handleChangePlan}
                  disabled={actionLoading === editingMembership.id || editPlan === editingMembership.plan}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {actionLoading === editingMembership.id ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : null}
                  Simpan
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
