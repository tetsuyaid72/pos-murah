'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Calendar,
  X,
  Filter,
  ChevronDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ActivityLog {
  id: string
  action: string
  entity: string | null
  entityId: string | null
  metadata: Record<string, unknown> | null
  createdAt: string
  userName: string | null
  userEmail: string | null
  storeName: string | null
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

const ACTION_COLORS: Record<string, string> = {
  LOGIN: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
  CREATE: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  UPDATE: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  DELETE: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400',
  REGISTER: 'bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400',
}

export default function AdminActivityPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 50, total: 0, totalPages: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [actionFilter, setActionFilter] = useState('')
  const [entityFilter, setEntityFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const fetchLogs = useCallback(async (page = 1) => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', page.toString())
      if (search) params.set('search', search)
      if (actionFilter) params.set('action', actionFilter)
      if (entityFilter) params.set('entity', entityFilter)
      if (dateFrom) params.set('dateFrom', dateFrom)
      if (dateTo) params.set('dateTo', dateTo)

      const res = await fetch(`/api/admin/activity?${params.toString()}`)
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      setLogs(data.logs || [])
      setPagination(data.pagination || { page: 1, limit: 50, total: 0, totalPages: 0 })
    } catch {
      setLogs([])
    } finally {
      setIsLoading(false)
    }
  }, [search, actionFilter, entityFilter, dateFrom, dateTo])

  useEffect(() => {
    const timeout = setTimeout(() => fetchLogs(1), 300)
    return () => clearTimeout(timeout)
  }, [fetchLogs])

  const activeFilterCount = [actionFilter, entityFilter, dateFrom, dateTo].filter(Boolean).length

  return (
    <div className="p-4 sm:p-6 space-y-4">
      {/* Search - always visible */}
      <div className="flex flex-col gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari user..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-background pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
        </div>

        {/* Mobile filter toggle button */}
        <div className="md:hidden">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="w-full justify-between"
          >
            <span className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filter
              {activeFilterCount > 0 && (
                <span className="inline-flex items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 text-[11px] font-medium h-5 w-5">
                  {activeFilterCount}
                </span>
              )}
            </span>
            <ChevronDown className={cn('h-4 w-4 transition-transform', showFilters && 'rotate-180')} />
          </Button>
        </div>

        {/* Collapsible filters on mobile, always visible on desktop */}
        <div className={cn(
          'flex-col gap-3',
          showFilters ? 'flex md:flex' : 'hidden md:flex'
        )}>
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <option value="">Semua Action</option>
              <option value="LOGIN">Login</option>
              <option value="CREATE">Create</option>
              <option value="UPDATE">Update</option>
              <option value="DELETE">Delete</option>
              <option value="REGISTER">Register</option>
            </select>
            <select
              value={entityFilter}
              onChange={(e) => setEntityFilter(e.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <option value="">Semua Entity</option>
              <option value="product">Product</option>
              <option value="transaction">Transaction</option>
              <option value="user">User</option>
              <option value="store">Store</option>
              <option value="category">Category</option>
              <option value="customer">Customer</option>
            </select>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                placeholder="From"
              />
              <span className="text-muted-foreground text-sm">—</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                placeholder="To"
              />
            </div>
            {(search || actionFilter || entityFilter || dateFrom || dateTo) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setSearch(''); setActionFilter(''); setEntityFilter(''); setDateFrom(''); setDateTo('') }}
                className="text-muted-foreground"
              >
                <X className="h-4 w-4 mr-1" /> Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {isLoading ? (
          [...Array(5)].map((_, i) => (
            <div key={i} className="rounded-xl border border-border/50 bg-card p-4 shadow-sm">
              <div className="h-4 w-24 rounded bg-muted/50 animate-pulse mb-3" />
              <div className="h-4 w-32 rounded bg-muted/50 animate-pulse mb-2" />
              <div className="h-4 w-20 rounded bg-muted/50 animate-pulse" />
            </div>
          ))
        ) : logs.length === 0 ? (
          <div className="rounded-xl border border-border/50 bg-card p-8 text-center text-muted-foreground text-sm">
            Tidak ada activity log ditemukan
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="rounded-xl border border-border/50 bg-card p-4 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs">
                  {new Date(log.createdAt).toLocaleString('id-ID', {
                    day: 'numeric', month: 'short', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </span>
                <span className={cn(
                  'inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium',
                  ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-700 dark:bg-gray-500/10 dark:text-gray-400'
                )}>
                  {log.action}
                </span>
              </div>
              <div>
                <p className="text-foreground text-sm font-medium">{log.userName || '—'}</p>
                {log.userEmail && (
                  <p className="text-muted-foreground text-xs">{log.userEmail}</p>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-medium">Entity:</span>
                <span>
                  {log.entity || '—'}
                  {log.entityId && <span className="text-[10px] ml-1 opacity-60">#{log.entityId.slice(0, 8)}</span>}
                </span>
              </div>
              {log.metadata && (
                <div className="text-xs text-muted-foreground bg-muted/30 rounded-lg px-3 py-2 break-all">
                  {JSON.stringify(log.metadata).slice(0, 120)}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block rounded-xl border border-border/50 bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Timestamp</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">User</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Store</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Action</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Entity</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Detail</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(10)].map((_, i) => (
                  <tr key={i} className="border-b border-border/30">
                    <td colSpan={6} className="px-4 py-3">
                      <div className="h-5 rounded bg-muted/50 animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    Tidak ada activity log ditemukan
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString('id-ID', {
                        day: 'numeric', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-foreground text-xs">{log.userName || '—'}</p>
                        <p className="text-muted-foreground text-[11px]">{log.userEmail || ''}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{log.storeName || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        'inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium',
                        ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-700 dark:bg-gray-500/10 dark:text-gray-400'
                      )}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {log.entity || '—'}
                      {log.entityId && <span className="text-[10px] ml-1 opacity-60">#{log.entityId.slice(0, 8)}</span>}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs max-w-[200px] truncate">
                      {log.metadata ? JSON.stringify(log.metadata).slice(0, 60) : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border/50 px-4 py-3 rounded-xl border border-border/50 bg-card shadow-sm">
          <p className="text-xs text-muted-foreground">
            Showing {((pagination.page - 1) * pagination.limit) + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => fetchLogs(pagination.page - 1)}
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
              onClick={() => fetchLogs(pagination.page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
