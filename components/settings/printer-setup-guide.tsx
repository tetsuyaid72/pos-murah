'use client'

import { AlertCircle, Bluetooth, CheckCircle2, Download, Monitor, Printer } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const setupSteps = [
  'Gunakan Microsoft Edge atau Google Chrome Desktop.',
  'Download Thermal-Bridge (.zip) dan ekstrak.',
  'Drop Folder Thermal-Bridge ke edge://extensions/.',
  'Nyalakan Printer RPP02N.',
  'Klik Cetak Struk dari POS, lalu pilih RPP02N saat pairing pertama.',
]

export function PrinterSetupGuide() {
  return (
    <Card className="rounded-2xl border border-emerald-200/70 bg-gradient-to-br from-emerald-50 via-white to-white shadow-sm dark:border-emerald-500/20 dark:from-emerald-500/10 dark:via-slate-900 dark:to-slate-900">
      <CardHeader className="space-y-1 px-4 pb-0 pt-4 sm:px-5 sm:pt-5">
        <CardTitle className="flex items-center gap-2 text-sm font-bold text-slate-950 dark:text-slate-50">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm shadow-emerald-600/20">
            <Printer className="h-4 w-4" />
          </div>
          Tutorial Setup Printer Thermal
        </CardTitle>
        <CardDescription className="text-xs text-slate-600 dark:text-slate-400">
          Panduan singkat agar RPP02N 58mm bisa cetak struk lewat Thermal-Bridge.
        </CardDescription>
      </CardHeader>

      <CardContent className="px-4 py-4 sm:px-5 sm:py-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
          <div className="rounded-2xl border border-emerald-100 bg-white/80 p-4 dark:border-emerald-500/15 dark:bg-slate-950/50">
            <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4" />
              Langkah Utama
            </div>
            <ol className="space-y-3">
              {setupSteps.map((step, index) => (
                <li key={step} className="flex gap-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-bold text-white">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>

            <a
              href="/thermal-bridge.zip"
              download
              className="mt-4 inline-flex h-10 items-center justify-center rounded-xl bg-emerald-600 px-4 text-sm font-bold text-white shadow-sm shadow-emerald-600/20 transition-colors hover:bg-emerald-700"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Extension
            </a>
          </div>

          <div className="space-y-3">
            <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 dark:border-slate-800 dark:bg-slate-950/50">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-950 dark:text-slate-50">
                <Monitor className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                Browser Disarankan
              </div>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                Pakai Edge atau Chrome Desktop. Hindari Brave untuk printer BLE karena Web Bluetooth sering diblokir.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 dark:border-slate-800 dark:bg-slate-950/50">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-950 dark:text-slate-50">
                <Bluetooth className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                Troubleshooting Cepat
              </div>
              <a
                href="https://wa.me/6289691268646"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:hover:bg-emerald-500/15"
              >
                <AlertCircle className="h-4 w-4" />
                Hubungi admin
              </a>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
