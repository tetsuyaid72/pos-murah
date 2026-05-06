'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Dialog, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Zap, Lock } from 'lucide-react'

interface PlanLimitModalProps {
  open: boolean
  onClose: () => void
  /** Type of limit reached */
  type: 'products' | 'transactions' | 'feature'
  /** Current usage count (for countable limits) */
  current?: number
  /** Maximum allowed (for countable limits) */
  limit?: number
  /** Feature name (for feature-type limits) */
  featureName?: string
}

const LIMIT_MESSAGES = {
  products: {
    title: 'Batas Produk Tercapai',
    description: 'Anda telah mencapai batas maksimal produk untuk paket Free.',
    cta: 'Upgrade untuk produk unlimited',
  },
  transactions: {
    title: 'Batas Transaksi Bulanan Tercapai',
    description: 'Anda telah mencapai batas maksimal transaksi bulan ini untuk paket Free.',
    cta: 'Upgrade untuk transaksi unlimited',
  },
  feature: {
    title: 'Fitur Pro',
    description: 'Fitur ini hanya tersedia di paket Pro.',
    cta: 'Upgrade untuk akses semua fitur',
  },
}

/**
 * Reusable modal that appears when a user hits a plan limit.
 * Shows the limit info and a CTA to upgrade.
 *
 * Usage:
 *   <PlanLimitModal
 *     open={showModal}
 *     onClose={() => setShowModal(false)}
 *     type="products"
 *     current={20}
 *     limit={20}
 *   />
 */
export function PlanLimitModal({
  open,
  onClose,
  type,
  current,
  limit,
  featureName,
}: PlanLimitModalProps) {
  const config = LIMIT_MESSAGES[type]

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogHeader>
        <DialogTitle>
          <span className="flex items-center gap-2">
            {type === 'feature' ? (
              <Lock className="h-5 w-5 text-amber-500" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            )}
            {config.title}
          </span>
        </DialogTitle>
        <DialogClose onClose={onClose} />
      </DialogHeader>

      <div className="mt-2">
        <p className="text-sm text-muted-foreground">
          {type === 'feature' && featureName
            ? `Fitur "${featureName}" hanya tersedia di paket Pro.`
            : config.description}
        </p>

        {/* Usage indicator for countable limits */}
        {(type === 'products' || type === 'transactions') && current !== undefined && limit !== undefined && (
          <div className="mt-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
                Penggunaan
              </span>
              <span className="text-sm font-bold text-amber-700 dark:text-amber-400">
                {current}/{limit}
              </span>
            </div>
            <div className="h-2 rounded-full bg-amber-200 dark:bg-amber-900 overflow-hidden">
              <div
                className="h-full rounded-full bg-amber-500 transition-all"
                style={{ width: `${Math.min(100, (current / limit) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Upgrade benefits */}
        <div className="mt-5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-2">
            Paket Pro
          </p>
          <p className="text-sm text-muted-foreground">{config.cta}</p>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-lg font-bold text-foreground">Rp 49.900</span>
            <span className="text-xs text-muted-foreground">/ bulan</span>
          </div>
        </div>
      </div>

      {/* CTA buttons */}
      <div className="mt-6 flex flex-col gap-2.5">
        <Link href="/upgrade" onClick={onClose}>
          <Button variant="premium" size="lg" className="w-full">
            <Zap className="mr-2 h-4 w-4" />
            Upgrade ke Pro
          </Button>
        </Link>
        <Button
          variant="ghost"
          size="lg"
          className="w-full text-muted-foreground"
          onClick={onClose}
        >
          Nanti Saja
        </Button>
      </div>
    </Dialog>
  )
}

/**
 * Hook helper to manage plan limit modal state.
 *
 * Usage:
 *   const { showLimitModal, openLimitModal, limitModalProps } = usePlanLimitModal()
 *   openLimitModal('products', { current: 20, limit: 20 })
 *   <PlanLimitModal {...limitModalProps} />
 */
export function usePlanLimitModal() {
  const [state, setState] = useState<{
    open: boolean
    type: PlanLimitModalProps['type']
    current?: number
    limit?: number
    featureName?: string
  }>({
    open: false,
    type: 'products',
  })

  const openLimitModal = (
    type: PlanLimitModalProps['type'],
    opts?: { current?: number; limit?: number; featureName?: string }
  ) => {
    setState({
      open: true,
      type,
      current: opts?.current,
      limit: opts?.limit,
      featureName: opts?.featureName,
    })
  }

  const closeLimitModal = () => {
    setState((prev) => ({ ...prev, open: false }))
  }

  return {
    showLimitModal: state.open,
    openLimitModal,
    closeLimitModal,
    limitModalProps: {
      open: state.open,
      onClose: closeLimitModal,
      type: state.type,
      current: state.current,
      limit: state.limit,
      featureName: state.featureName,
    } as PlanLimitModalProps,
  }
}
