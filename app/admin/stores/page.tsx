'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ToggleLeft,
  ToggleRight,
  Loader2,
  Package,
  Receipt,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface StoreItem {
  id: string
  name: string
  isActive: boolean
  createdAt: string
  ownerName: string
  ownerEmail: string
  plan: string | null
  isTrial: boolean | null
  trialEndAt: string | null
  productCount: number
  transactionCount: number
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

export default function AdminStoresPage() {
  const [stores, setStores] = useState<StoreItem[]>([])
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [planFilter, setPlanFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const fetchStores = useCallback(async (page = 1) => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', page.toString())
      if (search) params.set('search', search)
      if (planFilter) params.set('plan', planFilter)
      if (statusFilter) params.set('status', statusFilter)

      const res = await fetch(`/api/admin/stores?${params.toString()}`)
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      setStores(data.stores || [])
      setPagination(data.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 })
    } catch {
      setStores([])
    } finally {
      setIsLoading(false)
    }
  }, [search, planFilter, statusFilter])

  useEffect(() => {
    const timeout = setTimeout(() => fetchStores(1), 300)
    return () => clearTimeout(timeout)
  }, [fetchStores])

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(t)
    }
  }, [toast])

  const handleToggleActive = async (store: StoreItem) => {
    setActionLoading(store.id)
    try {
      const res = await fetch(`/api/admin/stores/${store.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !store.isActive }),
      })
      if (!res.ok) throw new Error('Failed')
      setToast({ message: `Store ${store.isActive ? 'dinonaktifkan' : 'diaktifkan'}`, type: 'success' })
      fetchStores(pagination.page)
    } catch {
      setToast({ message: 'Gagal mengubah status', type: 'error' })
    } finally {
      setActionLoading(null)
    }
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
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari nama toko atau owner..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-background pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
        </div>
        <select
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
        >
          <option value="">Semua Plan</option>
          <option value="BASIC">Basic</option>
          <option value="PRO">Pro</option>
          <option value="BUSINESS">Business</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
        >
          <option value="">Semua Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {isLoading ? (
          [...Array(5)].map((_, i) => (
            <div key={i} className="rounded-xl border border-border/50 bg-card p-4 shadow-sm">
              <div className="h-5 rounded bg-muted/50 animate-pulse mb-3" />
              <div className="h-4 rounded bg-muted/50 animate-pulse w-2/3 mb-2" />
              <div className="h-4 rounded bg-muted/50 animate-pulse w-1/2" />
            </div>
          ))
        ) : stores.length === 0 ? (
          <div className="rounded-xl border border-border/50 bg-card p-8 text-center text-muted-foreground shadow-sm">
            Tidak ada store ditemukan
          </div>
        ) : (
          stores.map((store) => (
            <div key={store.id} className="rounded-xl border border-border/50 bg-card p-4 shadow-sm space-y-3">
              {/* Store name & status */}
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-medium text-foreground text-sm">{store.name}</h3>
                <span className={cn(
                  'inline-flex shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium',
                  store.isActive
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                    : 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400'
                )}>
                  {store.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Owner */}
              <div>
                <p className="text-foreground text-xs">{store.ownerName}</p>
                <p className="text-muted-foreground text-[11px]">{store.ownerEmail}</p>
              </div>

              {/* Plan & Counts */}
              <div className="flex items-center gap-3 flex-wrap">
                {store.plan ? (
                  <span className={cn('inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium', PLAN_BADGE[store.plan] || '')}>
                    {store.plan}
                    {store.isTrial && ' (Trial)'}
                  </span>
                ) : (
                  <span className="text-[11px] text-muted-foreground">—</span>
                )}
                <span className="inline-flex items-center gap-1 text-muted-foreground text-xs">
                  <Package className="h-3 w-3" />
                  {store.productCount}
                </span>
                <span className="inline-flex items-center gap-1 text-muted-foreground text-xs">
                  <Receipt className="h-3 w-3" />
                  {store.transactionCount}
                </span>
              </div>

              {/* Toggle Action */}
              <div className="flex items-center justify-end pt-1 border-t border-border/30">
                <button
                  onClick={() => handleToggleActive(store)}
                  disabled={actionLoading === store.id}
                  className={cn(
                    'rounded-lg p-1.5 transition-colors',
                    store.isActive
                      ? 'text-emerald-600 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-500/10'
                      : 'text-red-600 hover:bg-emerald-100 hover:text-emerald-600 dark:hover:bg-emerald-500/10'
                  )}
                  title={store.isActive ? 'Deactivate' : 'Activate'}
                >
                  {actionLoading === store.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : store.isActive ? (
                    <ToggleRight className="h-4 w-4" />
                  ) : (
                    <ToggleLeft className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          ))
        )}

        {/* Mobile Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-1 py-3">
            <p className="text-xs text-muted-foreground">
              Showing {((pagination.page - 1) * pagination.limit) + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => fetchStores(pagination.page - 1)}
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
                onClick={() => fetchStores(pagination.page + 1)}
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
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Products</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Transactions</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Created</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-border/30">
                    <td colSpan={8} className="px-4 py-3">
                      <div className="h-5 rounded bg-muted/50 animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : stores.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                    Tidak ada store ditemukan
                  </td>
                </tr>
              ) : (
                stores.map((store) => (
                  <tr key={store.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">{store.name}</td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-foreground text-xs">{store.ownerName}</p>
                        <p className="text-muted-foreground text-[11px]">{store.ownerEmail}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {store.plan ? (
                        <span className={cn('inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium', PLAN_BADGE[store.plan] || '')}>
                          {store.plan}
                          {store.isTrial && ' (Trial)'}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        <Package className="h-3 w-3" />
                        {store.productCount}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        <Receipt className="h-3 w-3" />
                        {store.transactionCount}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        'inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium',
                        store.isActive
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400'
                      )}>
                        {store.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {new Date(store.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleActive(store)}
                        disabled={actionLoading === store.id}
                        className={cn(
                          'rounded-lg p-1.5 transition-colors',
                          store.isActive
                            ? 'text-emerald-600 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-500/10'
                            : 'text-red-600 hover:bg-emerald-100 hover:text-emerald-600 dark:hover:bg-emerald-500/10'
                        )}
                        title={store.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {actionLoading === store.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : store.isActive ? (
                          <ToggleRight className="h-4 w-4" />
                        ) : (
                          <ToggleLeft className="h-4 w-4" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))
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
                onClick={() => fetchStores(pagination.page - 1)}
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
                onClick={() => fetchStores(pagination.page + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
