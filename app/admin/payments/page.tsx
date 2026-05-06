'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  Loader2,
  ShieldCheck,
  AlertTriangle,
  ImageIcon,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatRupiah } from '@/lib/format'

interface Payment {
  id: string
  amount: number
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  method: 'BANK_TRANSFER' | 'QRIS'
  proofUrl: string | null
  notes: string | null
  createdAt: string
  approvedAt: string | null
  userName: string
  userEmail: string
  storeName: string
}

type StatusFilter = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'

const STATUS_CONFIG = {
  PENDING: { label: 'Pending', icon: Clock, color: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' },
  APPROVED: { label: 'Approved', icon: CheckCircle2, color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' },
  REJECTED: { label: 'Rejected', icon: XCircle, color: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400' },
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<StatusFilter>('PENDING')
  const [search, setSearch] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [proofModal, setProofModal] = useState<string | null>(null)

  const fetchPayments = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter !== 'ALL') params.set('status', filter)
      if (search) params.set('search', search)

      const res = await fetch(`/api/admin/payments?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setPayments(data.payments || [])
    } catch {
      setPayments([])
    } finally {
      setIsLoading(false)
    }
  }, [filter, search])

  useEffect(() => {
    const timeout = setTimeout(() => { fetchPayments() }, 0)
    return () => clearTimeout(timeout)
  }, [fetchPayments])

  // Read initial filter from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const status = params.get('status')
    if (status && ['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
      const timeout = setTimeout(() => setFilter(status as StatusFilter), 0)
      return () => clearTimeout(timeout)
    }
  }, [])

  const handleAction = async (paymentId: string, action: 'approve' | 'reject') => {
    const confirmMsg = action === 'approve'
      ? 'Yakin ingin approve pembayaran ini? User akan di-upgrade ke Pro.'
      : 'Yakin ingin reject pembayaran ini?'

    if (!window.confirm(confirmMsg)) return

    setActionLoading(paymentId)
    try {
      const res = await fetch(`/api/admin/payments/${paymentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Gagal memproses')
      }

      setToast({
        message: action === 'approve' ? 'User berhasil di-approve ke Pro!' : 'Pembayaran ditolak.',
        type: action === 'approve' ? 'success' : 'error',
      })

      fetchPayments()
    } catch (err) {
      setToast({
        message: err instanceof Error ? err.message : 'Terjadi kesalahan',
        type: 'error',
      })
    } finally {
      setActionLoading(null)
      setTimeout(() => setToast(null), 3000)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/50 bg-card">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-500/10">
                <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground sm:text-2xl">Manajemen Pembayaran</h1>
                <p className="text-sm text-muted-foreground">Approve atau reject pembayaran upgrade Pro</p>
              </div>
            </div>
            <Link href="/admin">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 space-y-6">
        {/* Filters & Search */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex rounded-xl border border-border/50 bg-muted/50 p-1">
            {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as StatusFilter[]).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
                  filter === status
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {status === 'ALL' ? 'Semua' : status.charAt(0) + status.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Cari nama atau email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full rounded-lg border border-border/50 bg-card pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 sm:w-64"
            />
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-border/50 bg-card shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : payments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Filter className="h-8 w-8 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">Tidak ada pembayaran ditemukan</p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50 bg-muted/30">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">User</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Toko</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Bukti</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Metode</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Jumlah</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Tanggal</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Status</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => {
                      const statusConfig = STATUS_CONFIG[payment.status]
                      const StatusIcon = statusConfig.icon

                      return (
                        <tr key={payment.id} className="border-b border-border/30 last:border-0 hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-sm font-medium text-foreground">{payment.userName}</p>
                              <p className="text-xs text-muted-foreground">{payment.userEmail}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-foreground">{payment.storeName}</td>
                          <td className="px-4 py-3">
                            {payment.proofUrl ? (
                              <button
                                onClick={() => setProofModal(payment.proofUrl)}
                                className="relative h-10 w-10 overflow-hidden rounded-lg border border-border/50 hover:ring-2 hover:ring-emerald-500/50 transition-all cursor-pointer"
                              >
                                <Image
                                  src={payment.proofUrl}
                                  alt="Bukti"
                                  fill
                                  className="object-cover"
                                  sizes="40px"
                                />
                              </button>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">
                            {payment.method === 'BANK_TRANSFER' ? 'Transfer Bank' : 'QRIS'}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-foreground">
                            {formatRupiah(payment.amount)}
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">
                            {formatDate(payment.createdAt)}
                          </td>
                          <td className="px-4 py-3">
                            <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium', statusConfig.color)}>
                              <StatusIcon className="h-3 w-3" />
                              {statusConfig.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            {payment.status === 'PENDING' && (
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  size="sm"
                                  className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700"
                                  onClick={() => handleAction(payment.id, 'approve')}
                                  disabled={actionLoading === payment.id}
                                >
                                  {actionLoading === payment.id ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <CheckCircle2 className="mr-1 h-3 w-3" />
                                  )}
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-500/10"
                                  onClick={() => handleAction(payment.id, 'reject')}
                                  disabled={actionLoading === payment.id}
                                >
                                  <XCircle className="mr-1 h-3 w-3" />
                                  Reject
                                </Button>
                              </div>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile card list */}
              <div className="sm:hidden divide-y divide-border/30">
                {payments.map((payment) => {
                  const statusConfig = STATUS_CONFIG[payment.status]
                  const StatusIcon = statusConfig.icon

                  return (
                    <div key={payment.id} className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-foreground">{payment.userName}</p>
                          <p className="text-xs text-muted-foreground">{payment.userEmail}</p>
                        </div>
                        <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium', statusConfig.color)}>
                          <StatusIcon className="h-3 w-3" />
                          {statusConfig.label}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{payment.storeName}</span>
                        <span>{formatRupiah(payment.amount)}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{payment.method === 'BANK_TRANSFER' ? 'Transfer Bank' : 'QRIS'}</span>
                        <span>{formatDate(payment.createdAt)}</span>
                      </div>
                      {payment.proofUrl && (
                        <button
                          onClick={() => setProofModal(payment.proofUrl)}
                          className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
                        >
                          <ImageIcon className="h-3.5 w-3.5" />
                          Lihat bukti pembayaran
                        </button>
                      )}
                      {payment.status === 'PENDING' && (
                        <div className="flex gap-2 pt-1">
                          <Button
                            size="sm"
                            className="flex-1 h-8 text-xs bg-emerald-600 hover:bg-emerald-700"
                            onClick={() => handleAction(payment.id, 'approve')}
                            disabled={actionLoading === payment.id}
                          >
                            {actionLoading === payment.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <CheckCircle2 className="mr-1 h-3 w-3" />
                            )}
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 h-8 text-xs text-red-600"
                            onClick={() => handleAction(payment.id, 'reject')}
                            disabled={actionLoading === payment.id}
                          >
                            <XCircle className="mr-1 h-3 w-3" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slideUp">
          <div className={cn(
            'flex items-center gap-3 rounded-xl border px-5 py-3 shadow-lg',
            toast.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950'
              : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950'
          )}>
            {toast.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            )}
            <span className={cn(
              'text-sm font-medium',
              toast.type === 'success'
                ? 'text-emerald-700 dark:text-emerald-300'
                : 'text-red-700 dark:text-red-300'
            )}>
              {toast.message}
            </span>
          </div>
        </div>
      )}

      {/* Proof image modal */}
      {proofModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setProofModal(null)}
          />
          <div className="relative z-10 mx-4 max-w-lg w-full">
            <div className="overflow-hidden rounded-2xl border border-border/50 bg-card shadow-2xl">
              <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
                <h3 className="text-sm font-semibold text-foreground">Bukti Pembayaran</h3>
                <button
                  onClick={() => setProofModal(null)}
                  className="rounded-full p-1.5 hover:bg-muted transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="relative aspect-[4/3] w-full bg-muted/20">
                <Image
                  src={proofModal}
                  alt="Bukti pembayaran"
                  fill
                  className="object-contain"
                  sizes="(max-width: 512px) 100vw, 512px"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
