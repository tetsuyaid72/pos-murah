'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Dialog, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Zap } from 'lucide-react'

interface PlanLimitModalProps {
  open: boolean
  onClose: () => void
  /** Type of limit reached */
  type: 'products' | 'transactions' | 'customers' | 'feature' | 'trialExpired'
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
    description: 'Anda telah mencapai batas maksimal produk untuk paket saat ini.',
    cta: 'Upgrade paket untuk menambah limit produk',
  },
  transactions: {
    title: 'Batas Transaksi Harian Tercapai',
    description: 'Anda telah mencapai batas maksimal transaksi hari ini.',
    cta: 'Upgrade paket untuk menambah limit transaksi',
  },
  customers: {
    title: 'Batas Pelanggan Tercapai',
    description: 'Anda telah mencapai batas maksimal pelanggan untuk paket saat ini.',
    cta: 'Upgrade paket untuk menambah limit pelanggan',
  },
  feature: {
    title: 'Fitur Premium',
    description: 'Fitur ini memerlukan paket yang lebih tinggi.',
    cta: 'Upgrade paket untuk akses fitur ini',
  },
  trialExpired: {
    title: 'Masa Trial Berakhir',
    description: 'Upgrade paket untuk melanjutkan menggunakan fitur POS.',
    cta: 'Upgrade paket untuk melanjutkan',
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
      <DialogHeader className="justify-center">
        <DialogTitle className="w-full text-center">
          <span className="flex w-full items-center justify-center text-center">
            {config.title}
          </span>
        </DialogTitle>
      </DialogHeader>

      <div className="mt-2">
        <p className="text-center text-sm text-muted-foreground">
          {type === 'feature' && featureName
            ? `Fitur "${featureName}" hanya tersedia di paket Pro.`
            : config.description}
        </p>

        {/* Usage indicator for countable limits */}
        {(type === 'products' || type === 'transactions' || type === 'customers') && current !== undefined && limit !== undefined && (
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
      </div>

      {/* CTA buttons */}
      <div className="mt-6 flex flex-col gap-2.5">
        <Link href="/pricing" onClick={onClose}>
          <Button variant="premium" size="lg" className="w-full">
            <Zap className="mr-2 h-4 w-4" />
            Lihat Paket Upgrade
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

