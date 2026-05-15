'use client'

import { useCallback } from 'react'
import { usePlanLimit } from '@/hooks/use-plan-limit'
import { usePlanLimitModal } from '@/components/plan-limit-modal'
import type { FeatureKey } from '@/lib/features'

/**
 * Feature name mapping for display in the modal.
 */
const FEATURE_DISPLAY_NAMES: Record<string, string> = {
  export_pdf: 'Export PDF',
  export_excel: 'Export Excel',
  advanced_reports: 'Laporan Lanjutan',
  auto_promo: 'Promo Otomatis',
  voucher_coupon: 'Voucher & Kupon',
  bulk_import: 'Import Massal',
  product_variant: 'Variasi Produk',
  shift_management: 'Manajemen Shift',
  multi_outlet: 'Multi-Toko',
  wa_notification: 'Notifikasi WhatsApp',
  wa_debt_reminder: 'Reminder Hutang WhatsApp',
  auto_backup: 'Backup Otomatis',
  loyalty_points: 'Loyalty Points',
  stock_prediction: 'Prediksi Stok',
  peak_hour_analysis: 'Analisis Jam Ramai',
  multi_payment_split: 'Multi-Payment Split',
  batch_price_update: 'Update Harga Massal',
  api_access: 'Akses API',
  per_cashier_report: 'Laporan Per Kasir',
  per_category_report: 'Laporan Per Kategori',
  per_customer_report: 'Laporan Per Pelanggan',
  period_comparison: 'Perbandingan Periode',
  email_report: 'Laporan Email Otomatis',
  stock_transfer: 'Transfer Stok',
  multi_staff_role: 'Role & Permission',
}

/**
 * Hook that combines plan limit checking with the plan limit modal.
 * Provides a simple `gate(feature)` function that either allows the action
 * or shows the upgrade modal and returns false.
 *
 * Usage:
 *   const { gate, canUse, plan, modalProps } = usePlanGate()
 *
 *   function handleExportPDF() {
 *     if (!gate('export_pdf')) return  // Shows modal if not allowed
 *     // ... proceed with export
 *   }
 *
 *   return (
 *     <>
 *       <button onClick={handleExportPDF}>Export PDF</button>
 *       <PlanLimitModal {...modalProps} />
 *     </>
 *   )
 */
export function usePlanGate() {
  const planLimit = usePlanLimit()
  const { openLimitModal, closeLimitModal, limitModalProps } = usePlanLimitModal()

  /**
   * Gate a feature action. Returns true if allowed, false if blocked.
   * When blocked, automatically opens the plan limit modal.
   */
  const gate = useCallback(
    (feature: FeatureKey): boolean => {
      if (planLimit.trialExpired) {
        openLimitModal('trialExpired')
        return false
      }

      const access = planLimit.canUse(feature)
      if (access === true || (typeof access === 'number' && access > 0)) {
        return true
      }

      // Feature is blocked — show modal
      const featureName = FEATURE_DISPLAY_NAMES[feature] || feature
      openLimitModal('feature', { featureName })
      return false
    },
    [planLimit, openLimitModal]
  )

  /**
   * Gate a resource limit action (products, transactions, customers).
   * Pass current count and limit to show usage in the modal.
   */
  const gateLimit = useCallback(
    (type: 'products' | 'transactions' | 'customers', current: number, limit: number): boolean => {
      if (planLimit.trialExpired) {
        openLimitModal('trialExpired')
        return false
      }

      if (current < limit) return true

      openLimitModal(type, { current, limit })
      return false
    },
    [planLimit.trialExpired, openLimitModal]
  )

  return {
    ...planLimit,
    gate,
    gateLimit,
    closeLimitModal,
    modalProps: limitModalProps,
  }
}
