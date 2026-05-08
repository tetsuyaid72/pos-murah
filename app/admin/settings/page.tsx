'use client'

import { useState, useEffect } from 'react'
import {
  Settings,
  Save,
  Loader2,
  ToggleLeft,
  ToggleRight,
  Crown,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { FEATURE_DEFAULTS } from '@/lib/features'
import { PLANS, PRICING, formatPrice } from '@/lib/pricing'

interface FeatureFlag {
  id: string
  key: string
  name: string
  description: string | null
  planDefaults: Record<string, unknown>
  isActive: boolean
  createdAt: string
}

// Group features by category for display
const FEATURE_CATEGORIES: Record<string, string[]> = {
  'POS / Kasir': ['thermal_printer', 'barcode_scanner', 'custom_receipt_logo', 'auto_promo', 'voucher_coupon', 'multi_payment_split'],
  'Produk': ['bulk_import', 'product_variant', 'batch_price_update'],
  'Pelanggan & Hutang': ['customer_management', 'debt_tracking', 'debt_reminder_manual', 'wa_debt_reminder', 'loyalty_points'],
  'Laporan & Analytics': ['basic_dashboard', 'profit_report', 'period_comparison', 'per_cashier_report', 'per_category_report', 'per_customer_report', 'advanced_reports', 'stock_prediction', 'peak_hour_analysis', 'export_excel', 'export_pdf', 'email_report'],
  'Operasional': ['shift_management', 'cash_flow', 'expense_tracking', 'multi_outlet', 'stock_transfer', 'multi_staff_role'],
  'Integrasi & Teknis': ['backup_restore', 'auto_backup', 'wa_notification', 'api_access', 'webhook'],
}

export default function AdminSettingsPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/admin/settings')
        if (res.ok) {
          const data = await res.json()
          setFlags(data.flags || [])
        }
      } catch {
        // Fallback
      } finally {
        setIsLoading(false)
      }
    }
    fetchSettings()
  }, [])

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(t)
    }
  }, [toast])

  const toggleFlag = (flagId: string) => {
    setFlags((prev) =>
      prev.map((f) => f.id === flagId ? { ...f, isActive: !f.isActive } : f)
    )
    setHasChanges(true)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flags: flags.map((f) => ({ id: f.id, isActive: f.isActive })),
        }),
      })
      if (!res.ok) throw new Error('Failed')
      setToast({ message: 'Settings berhasil disimpan', type: 'success' })
      setHasChanges(false)
    } catch {
      setToast({ message: 'Gagal menyimpan settings', type: 'error' })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
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

      {/* Feature Flags Section */}
      <div className="rounded-xl border border-border/50 bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border/50 px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Settings className="h-4 w-4 text-muted-foreground" />
              Feature Flags
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">Toggle fitur global on/off</p>
          </div>
          {hasChanges && (
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}
              Simpan
            </Button>
          )}
        </div>
        <div className="p-6">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-10 rounded-lg bg-muted/50 animate-pulse" />
              ))}
            </div>
          ) : flags.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Belum ada feature flags di database. Jalankan seed untuk menambahkan.
            </p>
          ) : (
            <div className="space-y-3">
              {flags.map((flag) => (
                <div
                  key={flag.id}
                  className="flex items-center justify-between rounded-lg border border-border/30 px-4 py-3 hover:bg-muted/20 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{flag.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{flag.description || flag.key}</p>
                  </div>
                  <button
                    onClick={() => toggleFlag(flag.id)}
                    className="shrink-0 ml-4"
                  >
                    {flag.isActive ? (
                      <ToggleRight className="h-6 w-6 text-emerald-600" />
                    ) : (
                      <ToggleLeft className="h-6 w-6 text-muted-foreground" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Plan Limits Section (read-only from code) */}
      <div className="rounded-xl border border-border/50 bg-card shadow-sm">
        <div className="border-b border-border/50 px-6 py-4">
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Crown className="h-4 w-4 text-amber-500" />
            Plan Limits & Pricing
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">Konfigurasi dari kode (read-only)</p>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">Plan</th>
                  <th className="px-3 py-2 text-right font-medium text-muted-foreground">Monthly</th>
                  <th className="px-3 py-2 text-right font-medium text-muted-foreground">Yearly</th>
                  <th className="px-3 py-2 text-right font-medium text-muted-foreground">Products</th>
                  <th className="px-3 py-2 text-right font-medium text-muted-foreground">Tx/Month</th>
                  <th className="px-3 py-2 text-right font-medium text-muted-foreground">Cashiers</th>
                </tr>
              </thead>
              <tbody>
                {(Object.entries(PLANS) as [string, typeof PLANS.BASIC][]).map(([key, plan]) => (
                  <tr key={key} className="border-b border-border/30">
                    <td className="px-3 py-2">
                      <span className={cn(
                        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium',
                        key === 'BASIC' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' :
                        key === 'PRO' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' :
                        'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                      )}>
                        {plan.name}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right text-foreground">{formatPrice(plan.pricing.monthly)}</td>
                    <td className="px-3 py-2 text-right text-foreground">{formatPrice(plan.pricing.yearly)}</td>
                    <td className="px-3 py-2 text-right text-muted-foreground">
                      {plan.limits.products === 'unlimited' ? '∞' : plan.limits.products}
                    </td>
                    <td className="px-3 py-2 text-right text-muted-foreground">
                      {plan.limits.transactionsMonthly === 'unlimited' ? '∞' : plan.limits.transactionsMonthly.toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-right text-muted-foreground">
                      {plan.limits.cashiers === 'unlimited' ? '∞' : plan.limits.cashiers}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Feature Defaults (from code) */}
      <div className="rounded-xl border border-border/50 bg-card shadow-sm">
        <div className="border-b border-border/50 px-6 py-4">
          <h2 className="text-base font-semibold text-foreground">Feature Defaults per Plan</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Definisi dari kode — ubah di lib/features.ts</p>
        </div>
        <div className="p-6 space-y-6">
          {Object.entries(FEATURE_CATEGORIES).map(([category, featureKeys]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-foreground mb-2">{category}</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border/30">
                      <th className="px-2 py-1.5 text-left font-medium text-muted-foreground">Feature</th>
                      <th className="px-2 py-1.5 text-center font-medium text-muted-foreground">Basic</th>
                      <th className="px-2 py-1.5 text-center font-medium text-muted-foreground">Pro</th>
                      <th className="px-2 py-1.5 text-center font-medium text-muted-foreground">Business</th>
                    </tr>
                  </thead>
                  <tbody>
                    {featureKeys.map((key) => {
                      const defaults = FEATURE_DEFAULTS[key]
                      if (!defaults) return null
                      return (
                        <tr key={key} className="border-b border-border/20">
                          <td className="px-2 py-1.5 text-muted-foreground">{key.replace(/_/g, ' ')}</td>
                          <td className="px-2 py-1.5 text-center">
                            {renderFeatureValue(defaults.BASIC)}
                          </td>
                          <td className="px-2 py-1.5 text-center">
                            {renderFeatureValue(defaults.PRO)}
                          </td>
                          <td className="px-2 py-1.5 text-center">
                            {renderFeatureValue(defaults.BUSINESS)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function renderFeatureValue(value: boolean | number) {
  if (typeof value === 'boolean') {
    return value ? (
      <span className="text-emerald-600 dark:text-emerald-400 font-medium">✓</span>
    ) : (
      <span className="text-muted-foreground">—</span>
    )
  }
  if (value >= 999999) return <span className="text-emerald-600 dark:text-emerald-400 font-medium">∞</span>
  return <span className="text-foreground">{value.toLocaleString()}</span>
}
