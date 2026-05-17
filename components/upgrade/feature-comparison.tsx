'use client'

import { useState } from 'react'
import { Check, X, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FeatureRow {
  name: string
  pro: string | boolean
  business: string | boolean
}

interface FeatureGroup {
  category: string
  features: FeatureRow[]
}

const FEATURE_GROUPS: FeatureGroup[] = [
  {
    category: 'Kuota & Limit',
    features: [
      { name: 'Produk', pro: '200', business: 'Unlimited' },
      { name: 'Transaksi/hari', pro: '500', business: 'Unlimited' },
      { name: 'Kasir', pro: '5', business: 'Unlimited' },
      { name: 'Pelanggan', pro: '100', business: 'Unlimited' },
      { name: 'Riwayat laporan', pro: '1 tahun', business: 'Unlimited' },
    ],
  },
  {
    category: 'Fitur Kasir',
    features: [
      { name: 'Cetak struk Bluetooth', pro: true, business: true },
      { name: 'Promo & voucher otomatis', pro: true, business: true },
      { name: 'Shift management', pro: true, business: true },
      { name: 'Multi-payment split', pro: false, business: true },
    ],
  },
  {
    category: 'Laporan & Analytics',
    features: [
      { name: 'Dashboard + grafik profit', pro: true, business: true },
      { name: 'Export Excel', pro: true, business: true },
      { name: 'Export PDF', pro: true, business: true },
      { name: 'Laporan per kasir', pro: true, business: true },
      { name: 'Prediksi stok + jam ramai', pro: false, business: true },
      { name: 'Email laporan otomatis', pro: false, business: true },
    ],
  },
  {
    category: 'Operasional',
    features: [
      { name: 'Backup & restore', pro: true, business: true },
      { name: 'Multi-toko / outlet', pro: false, business: true },
      { name: 'Transfer stok antar toko', pro: false, business: true },
      { name: 'API access & webhook', pro: false, business: true },
    ],
  },
]

function CellValue({ value }: { value: string | boolean }) {
  if (typeof value === 'string') {
    return <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{value}</span>
  }
  if (value) {
    return <Check className="mx-auto h-4 w-4 text-emerald-500" />
  }
  return <X className="mx-auto h-4 w-4 text-slate-300 dark:text-slate-600" />
}

export function FeatureComparison() {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="mt-8">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-5 py-4 text-left transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:bg-slate-800"
      >
        <span className="text-sm font-semibold text-slate-900 dark:text-white">
          Perbandingan Fitur Lengkap
        </span>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-slate-400 transition-transform duration-200',
            isExpanded && 'rotate-180'
          )}
        />
      </button>

      <div
        className={cn(
          'overflow-hidden transition-all duration-300',
          isExpanded ? 'max-h-[2000px] mt-3' : 'max-h-0'
        )}
      >
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden dark:border-slate-700 dark:bg-slate-800/50">
          {/* Table header */}
          <div className="grid grid-cols-3 border-b border-slate-100 bg-slate-50/80 px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Fitur</div>
            <div className="text-center text-xs font-medium text-emerald-600 dark:text-emerald-400">Pro</div>
            <div className="text-center text-xs font-medium text-slate-500 dark:text-slate-400">Business</div>
          </div>

          {/* Feature groups */}
          {FEATURE_GROUPS.map((group) => (
            <div key={group.category}>
              {/* Category header */}
              <div className="border-b border-slate-100 bg-slate-50/50 px-4 py-2 dark:border-slate-700 dark:bg-slate-800/80">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {group.category}
                </span>
              </div>

              {/* Feature rows */}
              {group.features.map((feature) => (
                <div
                  key={feature.name}
                  className="grid grid-cols-3 items-center border-b border-slate-50 px-4 py-2.5 last:border-0 dark:border-slate-700/50"
                >
                  <span className="text-xs text-slate-600 dark:text-slate-300">{feature.name}</span>
                  <div className="text-center"><CellValue value={feature.pro} /></div>
                  <div className="text-center"><CellValue value={feature.business} /></div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
