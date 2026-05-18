'use client'

import { useRef, useState } from 'react'
import { Download, FileSpreadsheet, Loader2, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ImportRow {
  row: number
  name: string
  categoryName: string
  sellingPrice: number
  stock: number
  status: 'valid' | 'error' | 'duplicate'
  notes: string[]
}

interface ProductImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImported: () => void
}

export function ProductImportDialog({ open, onOpenChange, onImported }: ProductImportDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{
    imported: number
    skipped: number
    errors: number
    totalRows: number
    rows: ImportRow[]
  } | null>(null)

  if (!open) return null

  const reset = () => {
    setFile(null)
    setError(null)
    setResult(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  const handleClose = () => {
    reset()
    onOpenChange(false)
  }

  const handleImport = async () => {
    if (!file) {
      setError('Pilih file CSV terlebih dahulu.')
      return
    }

    setIsUploading(true)
    setError(null)
    setResult(null)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/products/import', { method: 'POST', body: formData })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Import produk gagal')
      setResult(data)
      if (data.imported > 0) onImported()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import produk gagal')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" aria-label="Tutup import" className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-foreground">Import Produk dari Excel</h2>
            <p className="text-xs text-muted-foreground">Upload CSV dari Excel/Google Sheets. Produk duplikat otomatis dilewati.</p>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="max-h-[calc(90vh-76px)] space-y-4 overflow-y-auto p-5">
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 dark:border-emerald-500/20 dark:bg-emerald-500/10">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">Gunakan template agar kolom terbaca rapi.</p>
                <p className="mt-1 text-xs text-emerald-700/80 dark:text-emerald-300/80">Isi produk di Excel, simpan sebagai CSV, lalu upload di sini.</p>
              </div>
              <button
                type="button"
                onClick={() => { window.location.href = '/api/products/import-template' }}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-emerald-200 bg-white px-4 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 dark:border-emerald-500/30 dark:bg-transparent dark:text-emerald-300"
              >
                <Download className="mr-2 h-4 w-4" />
                Download Template
              </button>
            </div>
          </div>

          <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 px-4 py-8 text-center transition hover:border-emerald-300 hover:bg-emerald-50/40 dark:hover:bg-emerald-500/10">
            <FileSpreadsheet className="h-9 w-9 text-emerald-600" />
            <span className="mt-3 text-sm font-semibold text-foreground">{file ? file.name : 'Pilih file CSV produk'}</span>
            <span className="mt-1 text-xs text-muted-foreground">Maksimal 2MB. Simpan file Excel sebagai .csv</span>
            <input
              ref={inputRef}
              type="file"
              accept=".csv,text/csv"
              className="sr-only"
              onChange={(event) => {
                setFile(event.target.files?.[0] || null)
                setError(null)
                setResult(null)
              }}
            />
          </label>

          {error && <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">{error}</p>}

          {result && (
            <div className="space-y-3">
              <div className="grid grid-cols-4 gap-2 text-center">
                <Summary label="Total" value={result.totalRows} />
                <Summary label="Import" value={result.imported} tone="success" />
                <Summary label="Duplikat" value={result.skipped} tone="warning" />
                <Summary label="Error" value={result.errors} tone="danger" />
              </div>
              <div className="overflow-hidden rounded-2xl border border-border">
                <div className="max-h-72 overflow-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="sticky top-0 bg-muted text-muted-foreground">
                      <tr>
                        <th className="px-3 py-2">Baris</th>
                        <th className="px-3 py-2">Produk</th>
                        <th className="px-3 py-2">Harga</th>
                        <th className="px-3 py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.rows.map((row) => (
                        <tr key={`${row.row}-${row.name}`} className="border-t border-border/50">
                          <td className="px-3 py-2 text-muted-foreground">{row.row}</td>
                          <td className="px-3 py-2">
                            <p className="font-medium text-foreground">{row.name || '-'}</p>
                            <p className="text-muted-foreground">{row.categoryName || '-'}</p>
                          </td>
                          <td className="px-3 py-2 text-muted-foreground">Rp{row.sellingPrice.toLocaleString('id-ID')} · stok {row.stock}</td>
                          <td className="px-3 py-2">
                            <span className={cn(
                              'rounded-full px-2 py-0.5 text-[10px] font-semibold',
                              row.status === 'valid' && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
                              row.status === 'duplicate' && 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
                              row.status === 'error' && 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-300'
                            )}>
                              {row.status}
                            </span>
                            {row.notes.length > 0 && <p className="mt-1 text-muted-foreground">{row.notes.join(', ')}</p>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={handleClose}>Tutup</Button>
            <Button onClick={handleImport} disabled={isUploading} className="bg-emerald-600 text-white hover:bg-emerald-700">
              {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
              {isUploading ? 'Mengimport...' : 'Import Produk'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Summary({ label, value, tone }: { label: string; value: number; tone?: 'success' | 'warning' | 'danger' }) {
  return (
    <div className={cn(
      'rounded-xl border bg-muted/30 px-3 py-2',
      tone === 'success' && 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300',
      tone === 'warning' && 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300',
      tone === 'danger' && 'border-red-200 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300'
    )}>
      <p className="text-lg font-bold leading-none">{value}</p>
      <p className="mt-1 text-[10px] font-medium text-muted-foreground">{label}</p>
    </div>
  )
}
