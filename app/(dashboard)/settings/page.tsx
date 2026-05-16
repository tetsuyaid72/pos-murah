'use client'

import { useState, useCallback } from 'react'
import {
  Save,
  Store,
  Printer,
  Moon,
  Sun,
  Monitor,
  User,
  CheckCircle2,
  Loader2,
  AlertCircle,
  LogOut,
  Trash2,
  TriangleAlert,
  Receipt,
  Palette,
  Info,
  Shield,
  HardDrive,
  Download,
  Upload,
  FileJson,
  FileSpreadsheet,
  X,
  Menu,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Dialog, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog'
import { useUIStore } from '@/stores/ui-store'
import { useSettingsStore } from '@/stores/settings-store'
import { useAuthStore } from '@/stores/auth-store'
import { AvatarUpload } from '@/components/settings/avatar-upload'
import { LogoUpload } from '@/components/settings/logo-upload'
import { PrinterSetupGuide } from '@/components/settings/printer-setup-guide'
import { PlanLimitModal, usePlanLimitModal } from '@/components/plan-limit-modal'
import { cn } from '@/lib/utils'


// =============================================================================
// Tab definitions
// =============================================================================

type SettingsTab = 'general' | 'printer' | 'appearance' | 'backup' | 'danger'

const TABS: { id: SettingsTab; label: string; icon: typeof User }[] = [
  { id: 'general',    label: 'Umum',       icon: User },
  { id: 'printer',    label: 'Printer',    icon: Printer },
  { id: 'appearance', label: 'Tampilan',   icon: Palette },
  { id: 'backup',     label: 'Backup',     icon: HardDrive },
  { id: 'danger',     label: 'Lainnya',    icon: Shield },
]

// =============================================================================
// Main component
// =============================================================================

export default function SettingsPage() {
  const { theme, setTheme, setSidebarOpen } = useUIStore()
  const {
    storeName, setStoreName,
    storeAddress, setStoreAddress,
    storePhone, setStorePhone,
    storeLogo, setStoreLogo,
    receiptFooter, setReceiptFooter,
        userName, setUserName,
    userEmail, setUserEmail,
    userAvatar, setUserAvatar,
  } = useSettingsStore()
  const { logout, membership } = useAuthStore()

  const [activeTab, setActiveTab] = useState<SettingsTab>('general')
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [resetDone, setResetDone] = useState(false)

  

  // Plan limit modal
  const { openLimitModal, limitModalProps } = usePlanLimitModal()

  // Check if user has Pro access — trial does NOT grant backup access
  const hasBackupAccess = (() => {
    if (!membership) return false
    const plan = membership.plan?.toUpperCase()
    return plan === 'PRO' || plan === 'BUSINESS'
  })()

  // Backup state
  const [exportingJson, setExportingJson] = useState(false)
  const [exportingCsv, setExportingCsv] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importPreview, setImportPreview] = useState<{
    categories: number
    products: number
    customers: number
    transactions: number
    debtRecords: number
    exportedAt: string
    storeName: string
  } | null>(null)
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<{
    success: boolean
    message: string
    imported?: Record<string, number>
  } | null>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const [showImportConfirm, setShowImportConfirm] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  

  // Handlers
  const handleSave = async () => {
    setSaving(true)
    try {
      await Promise.all([
        fetch('/api/auth/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: userName, avatarUrl: userAvatar }),
        }),
        fetch('/api/store/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: storeName,
            address: storeAddress || null,
            phone: storePhone || null,
            logoUrl: storeLogo,
          }),
        }),
      ])
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarChange = useCallback(async (url: string | null) => {
    setUserAvatar(url)
    try {
      await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatarUrl: url }),
      })
    } catch { /* local state still updated */ }
  }, [setUserAvatar])

  

  // Backup handlers
  const handleExportJson = useCallback(async () => {
    if (!hasBackupAccess) {
      openLimitModal('feature', { featureName: 'Backup & Restore' })
      return
    }
    setExportingJson(true)
    try {
      const res = await fetch('/api/backup/export')
      if (!res.ok) throw new Error('Gagal mengunduh backup')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = res.headers.get('Content-Disposition')?.match(/filename="(.+)"/)?.[1] || 'backup.json'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Gagal mengunduh backup')
    } finally {
      setExportingJson(false)
    }
  }, [hasBackupAccess, openLimitModal])

  const handleExportCsv = useCallback(async () => {
    if (!hasBackupAccess) {
      openLimitModal('feature', { featureName: 'Backup & Restore' })
      return
    }
    setExportingCsv(true)
    try {
      const res = await fetch('/api/backup/export-csv')
      if (!res.ok) throw new Error('Gagal mengunduh CSV')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = res.headers.get('Content-Disposition')?.match(/filename="(.+)"/)?.[1] || 'backup.zip'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Gagal mengunduh CSV')
    } finally {
      setExportingCsv(false)
    }
  }, [hasBackupAccess, openLimitModal])

  const handleFileSelect = useCallback(async (file: File) => {
    if (!hasBackupAccess) {
      openLimitModal('feature', { featureName: 'Backup & Restore' })
      return
    }
    setImportError(null)
    setImportResult(null)
    setImportPreview(null)

    if (!file.name.endsWith('.json')) {
      setImportError('Hanya file .json yang didukung untuk import.')
      return
    }

    if (file.size > 50 * 1024 * 1024) {
      setImportError('Ukuran file terlalu besar. Maksimal 50MB.')
      return
    }

    try {
      const text = await file.text()
      const data = JSON.parse(text)

      if (data.appName !== 'warung-madura-pos') {
        setImportError('File ini bukan backup Warung Madura POS yang valid.')
        return
      }

      setImportFile(file)
      setImportPreview({
        categories: data.categories?.length ?? 0,
        products: data.products?.length ?? 0,
        customers: data.customers?.length ?? 0,
        transactions: data.transactions?.length ?? 0,
        debtRecords: data.debtRecords?.length ?? 0,
        exportedAt: data.exportedAt ?? '',
        storeName: data.store?.name ?? '',
      })
    } catch {
      setImportError('File JSON tidak valid atau rusak.')
    }
  }, [hasBackupAccess, openLimitModal])

  const handleImport = useCallback(async () => {
    if (!importFile) return
    setImporting(true)
    setImportError(null)
    setShowImportConfirm(false)

    try {
      const formData = new FormData()
      formData.append('file', importFile)

      const res = await fetch('/api/backup/import', {
        method: 'POST',
        body: formData,
      })

      const result = await res.json()

      if (!res.ok) {
        setImportError(result.error || 'Gagal mengimport data.')
        return
      }

      setImportResult({
        success: true,
        message: result.message,
        imported: result.imported,
      })
      setImportFile(null)
      setImportPreview(null)

      // Reload page after successful import to refresh all stores
      setTimeout(() => window.location.reload(), 2000)
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Gagal mengimport data.')
    } finally {
      setImporting(false)
    }
  }, [importFile])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }, [handleFileSelect])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }, [])

  const clearImport = useCallback(() => {
    setImportFile(null)
    setImportPreview(null)
    setImportError(null)
    setImportResult(null)
  }, [])

  const themes = [
    { value: 'light' as const, label: 'Terang', icon: Sun, desc: 'Latar terang' },
    { value: 'dark' as const, label: 'Gelap', icon: Moon, desc: 'Latar gelap' },
    { value: 'system' as const, label: 'Sistem', icon: Monitor, desc: 'Ikuti perangkat' },
  ]

  // =========================================================================
  // Render
  // =========================================================================

  return (
    <div className="flex h-full flex-col">
      <div className="min-h-screen bg-slate-50 pb-32 text-slate-950 dark:bg-slate-950 dark:text-slate-50 md:hidden md:bg-background">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95 md:hidden">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="min-w-0">
                <h1 className="truncate text-lg font-bold leading-tight tracking-tight text-slate-950 dark:text-slate-50">Pengaturan</h1>
                <p className="line-clamp-1 text-[11px] text-slate-500 dark:text-slate-400">Kelola profil, toko, printer, dan tampilan</p>
              </div>
            </div>
            <Button
              onClick={handleSave}
              size="sm"
              className="h-9 shrink-0 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
              disabled={saving}
            >
              {saving ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Menyimpan</>
              ) : saved ? (
                <><CheckCircle2 className="mr-2 h-4 w-4" />Tersimpan</>
              ) : (
                <><Save className="mr-2 h-4 w-4" />Simpan</>
              )}
            </Button>
          </div>
        </header>

        <div className="sticky top-[57px] z-20 border-b border-slate-200 bg-white/95 px-4 py-2 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95 md:hidden">
          <div className="flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide">
              {TABS.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 shadow-sm transition-colors cursor-pointer dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300',
                      isActive && 'border-emerald-600 bg-emerald-600 text-white dark:border-emerald-500 dark:bg-emerald-500 dark:text-slate-950'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                )
              })}
            </div>
          </div>

        <div className="space-y-3 px-4 py-3 pb-32 md:hidden">


          {activeTab === 'general' && (
            <div className="space-y-3">
              <Card className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <CardHeader className="mb-4 flex-row items-start gap-3 space-y-0 px-0 pb-0 pt-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-bold text-slate-950 dark:text-slate-50">Profil Pengguna</CardTitle>
                    <CardDescription className="mt-1 text-xs text-slate-500 dark:text-slate-400">Foto dan informasi akun Anda</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 px-0 pb-0 pt-0">
                  <AvatarUpload
                    value={userAvatar}
                    onChange={handleAvatarChange}
                    fallbackInitial={userName ? userName.charAt(0).toUpperCase() : '?'}
                    className="mb-0 gap-1.5 [&>div:first-child_div]:mx-auto [&>div:first-child_div]:mb-2 [&>div:first-child_div]:h-16 [&>div:first-child_div]:w-16 [&>div:first-child_div]:border [&>div:first-child_div]:border-slate-200 dark:[&>div:first-child_div]:border-slate-800 [&>p]:mb-3 [&>p]:text-center [&>p]:text-[11px] [&>p]:text-slate-500 dark:[&>p]:text-slate-400 [&>div:first-child_div_button]:h-5 [&>div:first-child_div_button]:w-5 [&>div:first-child_div_button_svg]:h-3 [&>div:first-child_div_button_svg]:w-3"
                  />
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="userName" className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Nama Lengkap</Label>
                      <Input id="userName" value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="Nama Anda" className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-950 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-emerald-500/30 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="userEmail" className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Email</Label>
                      <Input id="userEmail" type="email" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} placeholder="email@contoh.com" className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-950 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-emerald-500/30 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <CardHeader className="mb-4 flex-row items-start gap-3 space-y-0 px-0 pb-0 pt-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
                    <Store className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-bold text-slate-950 dark:text-slate-50">Profil Toko</CardTitle>
                    <CardDescription className="mt-1 text-xs text-slate-500 dark:text-slate-400">Informasi toko di sidebar dan struk</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 px-0 pb-0 pt-0">
                  <LogoUpload value={storeLogo} onChange={setStoreLogo} className="mb-0 gap-1.5 [&>div:first-child_div]:mx-auto [&>div:first-child_div]:mb-2 [&>div:first-child_div]:h-16 [&>div:first-child_div]:w-16 [&>p]:mb-3 [&>p]:text-center [&>p]:text-[11px] [&>p]:text-slate-500 dark:[&>p]:text-slate-400 [&>div:first-child_div_button]:h-5 [&>div:first-child_div_button]:w-5 [&>div:first-child_div_button_svg]:h-3 [&>div:first-child_div_button_svg]:w-3" />
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="storeName" className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Nama Toko</Label>
                      <Input id="storeName" value={storeName} onChange={(e) => setStoreName(e.target.value)} placeholder="Nama toko Anda" className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-950 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-emerald-500/30 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="storePhone" className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Nomor Telepon</Label>
                      <Input id="storePhone" value={storePhone} onChange={(e) => setStorePhone(e.target.value)} placeholder="08xxxxxxxxxx" className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-950 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-emerald-500/30 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="storeAddress" className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Alamat</Label>
                      <Textarea id="storeAddress" value={storeAddress} onChange={(e) => setStoreAddress(e.target.value)} rows={3} placeholder="Alamat lengkap toko" className="min-h-[80px] rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-950 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-emerald-500/30 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <CardHeader className="mb-4 flex-row items-start gap-3 space-y-0 px-0 pb-0 pt-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
                    <Receipt className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-bold text-slate-950 dark:text-slate-50">Pengaturan Struk</CardTitle>
                    <CardDescription className="mt-1 text-xs text-slate-500 dark:text-slate-400">Kustomisasi tampilan struk pembayaran</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="px-0 pb-0 pt-0">
                  <div className="space-y-1.5">
                    <Label htmlFor="receiptFooter" className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Pesan di Bawah Struk</Label>
                    <Input id="receiptFooter" value={receiptFooter} onChange={(e) => setReceiptFooter(e.target.value)} placeholder="Terima kasih telah berbelanja!" className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-950 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-emerald-500/30 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'printer' && (
            <div className="space-y-4">
              <PrinterSetupGuide />
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-4">
              <Card className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <CardHeader className="space-y-1 px-4 pb-0 pt-4">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-pink-50 dark:bg-pink-500/10">
                      <Palette className="h-4 w-4 text-pink-500" />
                    </div>
                    Tema Tampilan
                  </CardTitle>
                  <CardDescription className="text-xs">Pilih tema yang nyaman untuk mata Anda</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 px-4 pb-4 pt-4">
                  <div className="grid grid-cols-3 gap-2">
                    {themes.map((t) => {
                      const Icon = t.icon
                      const isActive = theme === t.value
                      return (
                        <button
                          key={t.value}
                          onClick={() => setTheme(t.value)}
                          className={cn(
                            'flex flex-col items-center gap-1.5 rounded-2xl border p-3 text-center transition-all duration-200 cursor-pointer',
                            isActive
                              ? 'border-emerald-600 bg-emerald-600/10 text-emerald-700 shadow-sm ring-1 ring-emerald-500/20 dark:border-emerald-500 dark:bg-emerald-500/15 dark:text-emerald-300'
                              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-950/50'
                          )}
                        >
                          <div className={cn('flex h-9 w-9 items-center justify-center rounded-xl', isActive ? 'bg-primary/10' : 'bg-muted')}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <span className="text-xs font-semibold">{t.label}</span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">{t.desc}</span>
                        </button>
                      )
                    })}
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-950/50">
                    <p className="text-xs font-medium text-slate-950 dark:text-slate-50">Preview</p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">Card</div>
                      <div className="rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground">Button</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'backup' && (
            <div className="space-y-4">
              <Card className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <CardHeader className="space-y-1 px-4 pb-0 pt-4">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-500/10">
                      <Download className="h-4 w-4 text-emerald-500" />
                    </div>
                    Backup Manual
                  </CardTitle>
                  <CardDescription className="text-xs">Unduh backup data toko Anda</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 px-4 pb-4 pt-4">
                  <Button onClick={handleExportJson} disabled={exportingJson} className="h-10 w-full justify-start rounded-xl text-sm" variant="outline">
                    {exportingJson ? <Loader2 className="mr-3 h-4 w-4 animate-spin" /> : <FileJson className="mr-3 h-4 w-4 text-blue-500" />}
                    {exportingJson ? 'Mengunduh...' : 'Backup JSON'}
                  </Button>
                  <Button onClick={handleExportCsv} disabled={exportingCsv} className="h-10 w-full justify-start rounded-xl text-sm" variant="outline">
                    {exportingCsv ? <Loader2 className="mr-3 h-4 w-4 animate-spin" /> : <FileSpreadsheet className="mr-3 h-4 w-4 text-emerald-500" />}
                    {exportingCsv ? 'Mengunduh...' : 'Backup CSV'}
                  </Button>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <CardHeader className="space-y-1 px-4 pb-0 pt-4">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10">
                      <Upload className="h-4 w-4 text-blue-500" />
                    </div>
                    Restore Data
                  </CardTitle>
                  <CardDescription className="text-xs">Import data dari file backup JSON</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 px-4 pb-4 pt-4">
                  {importResult?.success && (
                    <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-500/20 dark:bg-emerald-500/10">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                      <div className="text-xs text-emerald-800 dark:text-emerald-300">
                        <p className="font-medium">{importResult.message}</p>
                        <p className="mt-1">Halaman akan dimuat ulang...</p>
                      </div>
                    </div>
                  )}
                  {importError && (
                    <div className="flex items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/5 p-3">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                      <p className="text-xs text-destructive">{importError}</p>
                    </div>
                  )}
                  {!importPreview && !importResult?.success && (
                    <div
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      className={cn(
                        'flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-5 text-center transition-colors cursor-pointer',
                        dragOver ? 'border-emerald-500 bg-emerald-500/5 dark:border-emerald-500 dark:bg-emerald-500/10' : 'border-slate-300 bg-white hover:border-emerald-500/30 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-950/50'
                      )}
                      onClick={() => {
                        const input = document.createElement('input')
                        input.type = 'file'
                        input.accept = '.json'
                        input.onchange = (e) => {
                          const file = (e.target as HTMLInputElement).files?.[0]
                          if (file) handleFileSelect(file)
                        }
                        input.click()
                      }}
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                        <Upload className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-950 dark:text-slate-50">Pilih file backup</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Drag & drop atau klik file .json</p>
                      </div>
                    </div>
                  )}
                  {importPreview && !importResult?.success && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-950 dark:text-slate-50">Preview Data</p>
                        <button onClick={clearImport} className="rounded-lg p-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-950/50 dark:hover:text-slate-50">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { label: 'Kategori', value: importPreview.categories },
                          { label: 'Produk', value: importPreview.products },
                          { label: 'Pelanggan', value: importPreview.customers },
                          { label: 'Transaksi', value: importPreview.transactions },
                        ].map((item) => (
                          <div key={item.label} className="rounded-xl bg-slate-50/80 px-3 py-2 dark:bg-slate-950/50">
                            <p className="text-[10px] text-slate-500 dark:text-slate-500">{item.label}</p>
                            <p className="text-sm font-semibold text-slate-950 dark:text-slate-50">{item.value}</p>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-500/20 dark:bg-amber-500/10">
                        <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                        <p className="text-xs text-amber-800 dark:text-amber-300"><strong>Perhatian:</strong> Semua data saat ini akan ditimpa.</p>
                      </div>
                      <Button onClick={() => setShowImportConfirm(true)} disabled={importing} className="h-10 w-full rounded-xl text-sm font-semibold" variant="premium">
                        {importing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Mengimport...</> : <><Upload className="mr-2 h-4 w-4" />Import Data</>}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'danger' && (
            <div className="space-y-4">
              <Card className="rounded-2xl border border-amber-200/50 bg-white p-4 shadow-sm dark:border-amber-500/20 dark:bg-slate-900">
                <CardHeader className="space-y-1 px-4 pb-0 pt-4">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-500/10">
                      <Trash2 className="h-4 w-4 text-amber-500" />
                    </div>
                    Reset Data
                  </CardTitle>
                  <CardDescription className="text-xs">Hapus semua produk, kategori, transaksi, dan pelanggan</CardDescription>
                </CardHeader>
                <CardContent className="px-4 pb-4 pt-4">
                  {resetDone ? (
                    <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      Semua data telah dihapus.
                    </div>
                  ) : (
                    <Button variant="outline" className="h-10 w-full rounded-xl border-destructive/50 text-sm text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => setShowResetDialog(true)}>
                      <Trash2 className="mr-2 h-4 w-4" />Reset Semua Data
                    </Button>
                  )}
                </CardContent>
              </Card>

              <Card className="rounded-2xl border border-red-200/50 bg-white p-4 shadow-sm dark:border-red-500/20 dark:bg-slate-900">
                <CardHeader className="space-y-1 px-4 pb-0 pt-4">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 dark:bg-red-500/10">
                      <LogOut className="h-4 w-4 text-red-500" />
                    </div>
                    Keluar
                  </CardTitle>
                  <CardDescription className="text-xs">Keluar dari akun Anda</CardDescription>
                </CardHeader>
                <CardContent className="px-4 pb-4 pt-4">
                  <Button variant="destructive" className="h-10 w-full rounded-xl text-sm" onClick={async () => { setLoggingOut(true); await logout() }} disabled={loggingOut}>
                    {loggingOut ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Keluar...</> : <><LogOut className="mr-2 h-4 w-4" />Keluar dari Akun</>}
                  </Button>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <CardHeader className="space-y-1 px-4 pb-0 pt-4">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 dark:bg-sky-500/10">
                      <Info className="h-4 w-4 text-sky-500" />
                    </div>
                    Tentang Aplikasi
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 px-4 pb-4 pt-4">
                  <div className="flex items-center justify-between rounded-xl bg-slate-50/80 px-3 py-2.5 dark:bg-slate-950/50">
                    <span className="text-xs text-slate-500 dark:text-slate-500">Versi</span>
                    <span className="text-sm font-semibold text-slate-950 dark:text-slate-50">1.0.0</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-slate-50/80 px-3 py-2.5 dark:bg-slate-950/50">
                    <span className="text-xs text-slate-500 dark:text-slate-500">Framework</span>
                    <span className="text-sm font-semibold text-slate-950 dark:text-slate-50">Next.js 16</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-slate-50/80 px-3 py-2.5 dark:bg-slate-950/50">
                    <span className="text-xs text-slate-500 dark:text-slate-500">Lisensi</span>
                    <span className="text-sm font-semibold text-slate-950 dark:text-slate-50">Warung Madura POS</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      <div className="hidden md:flex md:h-full md:flex-col">
        {/* ── Sticky Header ── */}
        <div className="sticky top-0 z-20 border-b border-border/50 bg-card/80 backdrop-blur-xl">
          <div className="flex items-center justify-between px-5 py-4 md:px-8">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">Pengaturan</h1>
              <p className="mt-0.5 text-xs text-muted-foreground md:text-sm">
                Kelola profil, toko, printer, dan tampilan
              </p>
            </div>
            <Button
              onClick={handleSave}
              variant={saved ? 'success' : 'premium'}
              size="sm"
              className="rounded-xl"
              disabled={saving}
            >
              {saving ? (
                <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />Menyimpan</>
              ) : saved ? (
                <><CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />Tersimpan!</>
              ) : (
                <><Save className="mr-1.5 h-3.5 w-3.5" />Simpan</>
              )}
            </Button>
          </div>

          {/* ── Tab Bar ── */}
          <div className="flex gap-1 px-5 md:px-8 -mb-px">
            {TABS.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-xs font-medium transition-colors cursor-pointer md:text-sm md:px-4',
                    isActive
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                  )}
                >
                  <Icon className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Content ── */}
        <div className="flex-1 overflow-y-auto p-5 md:p-8">
          <div className="mx-auto max-w-5xl">

          {/* ============================================================= */}
          {/* TAB: General                                                   */}
          {/* ============================================================= */}
          {activeTab === 'general' && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

              {/* ── User Profile ── */}
              <Card className="transition-shadow hover:shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-500/10">
                      <User className="h-4 w-4 text-indigo-500" />
                    </div>
                    Profil Pengguna
                  </CardTitle>
                  <CardDescription>Foto dan informasi akun Anda</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
                    <AvatarUpload
                      value={userAvatar}
                      onChange={handleAvatarChange}
                      fallbackInitial={userName ? userName.charAt(0).toUpperCase() : '?'}
                    />
                    <div className="flex-1 space-y-4 w-full">
                      <div className="space-y-1.5">
                        <Label htmlFor="userName">Nama Lengkap</Label>
                        <Input id="userName" value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="Nama Anda" />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="userEmail">Email</Label>
                        <Input id="userEmail" type="email" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} placeholder="email@contoh.com" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* ── Store Profile ── */}
              <Card className="transition-shadow hover:shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-500/10">
                      <Store className="h-4 w-4 text-emerald-500" />
                    </div>
                    Profil Toko
                  </CardTitle>
                  <CardDescription>Informasi toko di sidebar dan struk</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
                    <LogoUpload value={storeLogo} onChange={setStoreLogo} />
                    <div className="flex-1 space-y-4 w-full">
                      <div className="space-y-1.5">
                        <Label htmlFor="storeName">Nama Toko</Label>
                        <Input id="storeName" value={storeName} onChange={(e) => setStoreName(e.target.value)} placeholder="Nama toko Anda" />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="storePhone">Nomor Telepon</Label>
                        <Input id="storePhone" value={storePhone} onChange={(e) => setStorePhone(e.target.value)} placeholder="08xxxxxxxxxx" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="storeAddress">Alamat</Label>
                    <Textarea id="storeAddress" value={storeAddress} onChange={(e) => setStoreAddress(e.target.value)} rows={2} placeholder="Alamat lengkap toko" />
                  </div>
                </CardContent>
              </Card>

              {/* ── Receipt Settings (spans full width on lg) ── */}
              <Card className="transition-shadow hover:shadow-md lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-500/10">
                      <Receipt className="h-4 w-4 text-amber-500" />
                    </div>
                    Pengaturan Struk
                  </CardTitle>
                  <CardDescription>Kustomisasi tampilan struk pembayaran</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="max-w-md space-y-1.5">
                    <Label htmlFor="receiptFooter">Pesan di Bawah Struk</Label>
                    <Input id="receiptFooter" value={receiptFooter} onChange={(e) => setReceiptFooter(e.target.value)} placeholder="Terima kasih telah berbelanja!" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ============================================================= */}
          {/* TAB: Printer                                                   */}
          {/* ============================================================= */}
          {activeTab === 'printer' && (
                        <div className="grid grid-cols-1 gap-6">
              <PrinterSetupGuide />
            </div>
          )}

          {/* ============================================================= */}
          {/* TAB: Appearance                                                */}
          {/* ============================================================= */}
          {activeTab === 'appearance' && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card className="transition-shadow hover:shadow-md lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-pink-50 dark:bg-pink-500/10">
                      <Palette className="h-4 w-4 text-pink-500" />
                    </div>
                    Tema Tampilan
                  </CardTitle>
                  <CardDescription>Pilih tema yang nyaman untuk mata Anda</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3 max-w-lg">
                    {themes.map((t) => {
                      const Icon = t.icon
                      const isActive = theme === t.value
                      return (
                        <button
                          key={t.value}
                          onClick={() => setTheme(t.value)}
                          className={cn(
                            'group flex flex-col items-center gap-2 rounded-2xl border p-5 transition-all duration-200 cursor-pointer',
                            isActive
                              ? 'border-primary bg-primary/5 text-primary shadow-sm ring-1 ring-primary/20'
                              : 'border-border/50 hover:border-primary/30 hover:bg-muted/50 hover:shadow-sm'
                          )}
                        >
                          <div className={cn(
                            'flex h-10 w-10 items-center justify-center rounded-xl transition-colors',
                            isActive ? 'bg-primary/10' : 'bg-muted group-hover:bg-muted/80'
                          )}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <span className="text-xs font-semibold">{t.label}</span>
                          <span className="text-[10px] text-muted-foreground">{t.desc}</span>
                        </button>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ============================================================= */}
          {/* TAB: Backup & Restore                                          */}
          {/* ============================================================= */}
          {activeTab === 'backup' && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

              {/* ── Export Data ── */}
              <Card className="transition-shadow hover:shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-500/10">
                      <Download className="h-4 w-4 text-emerald-500" />
                    </div>
                    Export Data
                  </CardTitle>
                  <CardDescription>Unduh backup data toko Anda</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <Button
                      onClick={handleExportJson}
                      disabled={exportingJson}
                      className="w-full justify-start rounded-xl"
                      variant="outline"
                    >
                      {exportingJson ? (
                        <Loader2 className="mr-3 h-4 w-4 animate-spin" />
                      ) : (
                        <FileJson className="mr-3 h-4 w-4 text-blue-500" />
                      )}
                      <div className="text-left">
                        <p className="text-sm font-medium">{exportingJson ? 'Mengunduh...' : 'Download Backup (JSON)'}</p>
                        <p className="text-xs text-muted-foreground">Untuk restore ke akun lain</p>
                      </div>
                    </Button>

                    <Button
                      onClick={handleExportCsv}
                      disabled={exportingCsv}
                      className="w-full justify-start rounded-xl"
                      variant="outline"
                    >
                      {exportingCsv ? (
                        <Loader2 className="mr-3 h-4 w-4 animate-spin" />
                      ) : (
                        <FileSpreadsheet className="mr-3 h-4 w-4 text-emerald-500" />
                      )}
                      <div className="text-left">
                        <p className="text-sm font-medium">{exportingCsv ? 'Mengunduh...' : 'Download Backup (CSV)'}</p>
                        <p className="text-xs text-muted-foreground">Bisa dibuka di Excel / Google Sheets</p>
                      </div>
                    </Button>
                  </div>

                  <div className="rounded-xl bg-muted/30 p-3">
                    <p className="text-xs text-muted-foreground">
                      File JSON dapat di-import kembali ke akun manapun. File CSV hanya untuk dibaca, tidak bisa di-import.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* ── Import Data ── */}
              <Card className="transition-shadow hover:shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-500/10">
                      <Upload className="h-4 w-4 text-blue-500" />
                    </div>
                    Import Data
                  </CardTitle>
                  <CardDescription>Restore data dari file backup JSON</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Success message */}
                  {importResult?.success && (
                    <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-500/20 dark:bg-emerald-500/10">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                      <div className="text-sm text-emerald-800 dark:text-emerald-300">
                        <p className="font-medium">{importResult.message}</p>
                        {importResult.imported && (
                          <p className="mt-1 text-xs">
                            {importResult.imported.categories} kategori, {importResult.imported.products} produk, {importResult.imported.customers} pelanggan, {importResult.imported.transactions} transaksi
                          </p>
                        )}
                        <p className="mt-1 text-xs">Halaman akan dimuat ulang...</p>
                      </div>
                    </div>
                  )}

                  {/* Error message */}
                  {importError && (
                    <div className="flex items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/5 p-3">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                      <p className="text-xs text-destructive">{importError}</p>
                    </div>
                  )}

                  {/* Drop zone / File picker */}
                  {!importPreview && !importResult?.success && (
                    <div
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      className={cn(
                        'flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 transition-colors cursor-pointer',
                                                dragOver ? 'border-emerald-500 bg-emerald-500/5 dark:border-emerald-500 dark:bg-emerald-500/10' : 'border-slate-300 bg-white hover:border-emerald-500/30 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-950/50'

                      )}
                      onClick={() => {
                        const input = document.createElement('input')
                        input.type = 'file'
                        input.accept = '.json'
                        input.onchange = (e) => {
                          const file = (e.target as HTMLInputElement).files?.[0]
                          if (file) handleFileSelect(file)
                        }
                        input.click()
                      }}
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                        <Upload className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium">Drag & drop file backup</p>
                        <p className="text-xs text-muted-foreground">atau klik untuk memilih file (.json)</p>
                      </div>
                    </div>
                  )}

                  {/* Preview */}
                  {importPreview && !importResult?.success && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">Preview Data</p>
                        <button
                          onClick={clearImport}
                          className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      {importPreview.storeName && (
                        <div className="rounded-xl bg-muted/30 px-4 py-2">
                          <span className="text-xs text-muted-foreground">Toko: </span>
                          <span className="text-sm font-medium">{importPreview.storeName}</span>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { label: 'Kategori', value: importPreview.categories },
                          { label: 'Produk', value: importPreview.products },
                          { label: 'Pelanggan', value: importPreview.customers },
                          { label: 'Transaksi', value: importPreview.transactions },
                          { label: 'Catatan Hutang', value: importPreview.debtRecords },
                        ].map((item) => (
                          <div key={item.label} className="flex justify-between rounded-xl bg-muted/30 px-3 py-2">
                            <span className="text-xs text-muted-foreground">{item.label}</span>
                            <span className="text-sm font-semibold">{item.value}</span>
                          </div>
                        ))}
                      </div>

                      {importPreview.exportedAt && (
                        <p className="text-xs text-muted-foreground">
                          Backup dibuat: {new Date(importPreview.exportedAt).toLocaleString('id-ID')}
                        </p>
                      )}

                      {/* Warning */}
                      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-500/20 dark:bg-amber-500/10">
                        <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                        <p className="text-xs text-amber-800 dark:text-amber-300">
                          <strong>Perhatian:</strong> Semua data yang ada saat ini akan ditimpa dengan data dari file backup ini.
                        </p>
                      </div>

                      <Button
                        onClick={() => setShowImportConfirm(true)}
                        disabled={importing}
                        className="w-full rounded-xl"
                        variant="premium"
                      >
                        {importing ? (
                          <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Mengimport...</>
                        ) : (
                          <><Upload className="mr-2 h-4 w-4" />Import Data</>
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* ── Info Card ── */}
              <Card className="transition-shadow hover:shadow-md lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-50 dark:bg-sky-500/10">
                      <Info className="h-4 w-4 text-sky-500" />
                    </div>
                    Tentang Backup & Restore
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="rounded-xl bg-muted/30 p-4">
                        <p className="font-medium text-foreground">Data yang di-backup</p>
                        <ul className="mt-2 space-y-1 text-xs">
                          <li>- Pengaturan toko (nama, alamat, telepon)</li>
                          <li>- Kategori produk</li>
                          <li>- Produk (stok, harga, barcode)</li>
                          <li>- Pelanggan & catatan hutang</li>
                          <li>- Riwayat transaksi</li>
                        </ul>
                      </div>
                      <div className="rounded-xl bg-muted/30 p-4">
                        <p className="font-medium text-foreground">Tips</p>
                        <ul className="mt-2 space-y-1 text-xs">
                          <li>- Lakukan backup secara berkala</li>
                          <li>- File JSON bisa di-restore ke akun lain</li>
                          <li>- File CSV untuk dibuka di Excel</li>
                          <li>- Gambar produk tidak termasuk backup</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ============================================================= */}
          {/* TAB: Danger / Lainnya                                          */}
          {/* ============================================================= */}
          {activeTab === 'danger' && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

              {/* ── Reset Data ── */}
              <Card className="border-amber-200/50 transition-shadow hover:shadow-md dark:border-amber-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-500/10">
                      <Trash2 className="h-4 w-4 text-amber-500" />
                    </div>
                    Reset Data
                  </CardTitle>
                  <CardDescription>
                    Hapus semua produk, kategori, transaksi, dan pelanggan
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {resetDone ? (
                    <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      Semua data telah dihapus.
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full rounded-xl border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => setShowResetDialog(true)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Reset Semua Data
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* ── Logout ── */}
              <Card className="border-red-200/50 transition-shadow hover:shadow-md dark:border-red-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50 dark:bg-red-500/10">
                      <LogOut className="h-4 w-4 text-red-500" />
                    </div>
                    Keluar
                  </CardTitle>
                  <CardDescription>Keluar dari akun Anda</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="destructive"
                    className="w-full rounded-xl"
                    onClick={async () => { setLoggingOut(true); await logout() }}
                    disabled={loggingOut}
                  >
                    {loggingOut ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Keluar...</>
                    ) : (
                      <><LogOut className="mr-2 h-4 w-4" />Keluar dari Akun</>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* ── App Info ── */}
              <Card className="transition-shadow hover:shadow-md lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-50 dark:bg-sky-500/10">
                      <Info className="h-4 w-4 text-sky-500" />
                    </div>
                    Tentang Aplikasi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <div className="flex justify-between rounded-xl bg-muted/30 px-4 py-3 sm:flex-col sm:gap-1">
                      <span className="text-xs text-muted-foreground">Versi</span>
                      <span className="text-sm font-semibold text-foreground">1.0.0</span>
                    </div>
                    <div className="flex justify-between rounded-xl bg-muted/30 px-4 py-3 sm:flex-col sm:gap-1">
                      <span className="text-xs text-muted-foreground">Framework</span>
                      <span className="text-sm font-semibold text-foreground">Next.js 16</span>
                    </div>
                    <div className="flex justify-between rounded-xl bg-muted/30 px-4 py-3 sm:flex-col sm:gap-1">
                      <span className="text-xs text-muted-foreground">Lisensi</span>
                      <span className="text-sm font-semibold text-foreground">Warung Madura POS</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          </div>
        </div>
      </div>

      {/* ── Import Confirmation Dialog ── */}
      <Dialog open={showImportConfirm} onClose={() => !importing && setShowImportConfirm(false)}>
        <DialogHeader>
          <DialogTitle>Import Data Backup?</DialogTitle>
          <DialogClose onClose={() => !importing && setShowImportConfirm(false)} />
        </DialogHeader>
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/20 dark:bg-amber-500/10">
          <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <div className="text-sm text-amber-800 dark:text-amber-300">
            <p className="font-medium">Data saat ini akan ditimpa!</p>
            <p className="mt-1">
              Semua <strong>produk</strong>, <strong>kategori</strong>, <strong>transaksi</strong>, <strong>pelanggan</strong>, dan <strong>catatan hutang</strong> yang ada akan dihapus dan diganti dengan data dari file backup.
            </p>
          </div>
        </div>
        {importPreview && (
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between rounded-lg bg-muted/30 px-3 py-2">
              <span className="text-muted-foreground">Kategori</span>
              <span className="font-semibold">{importPreview.categories}</span>
            </div>
            <div className="flex justify-between rounded-lg bg-muted/30 px-3 py-2">
              <span className="text-muted-foreground">Produk</span>
              <span className="font-semibold">{importPreview.products}</span>
            </div>
            <div className="flex justify-between rounded-lg bg-muted/30 px-3 py-2">
              <span className="text-muted-foreground">Pelanggan</span>
              <span className="font-semibold">{importPreview.customers}</span>
            </div>
            <div className="flex justify-between rounded-lg bg-muted/30 px-3 py-2">
              <span className="text-muted-foreground">Transaksi</span>
              <span className="font-semibold">{importPreview.transactions}</span>
            </div>
          </div>
        )}
        <div className="mt-5 flex gap-3">
          <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setShowImportConfirm(false)} disabled={importing}>
            Batal
          </Button>
          <Button
            variant="premium"
            className="flex-1 rounded-xl"
            disabled={importing}
            onClick={handleImport}
          >
            {importing ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Mengimport...</>
            ) : (
              <><Upload className="mr-2 h-4 w-4" />Ya, Import Data</>
            )}
          </Button>
        </div>
      </Dialog>

      {/* ── Reset Confirmation Dialog ── */}
      <Dialog open={showResetDialog} onClose={() => !resetting && setShowResetDialog(false)}>
        <DialogHeader>
          <DialogTitle>Reset Semua Data?</DialogTitle>
          <DialogClose onClose={() => !resetting && setShowResetDialog(false)} />
        </DialogHeader>
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/20 dark:bg-amber-500/10">
          <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <div className="text-sm text-amber-800 dark:text-amber-300">
            <p className="font-medium">Tindakan ini tidak dapat dibatalkan!</p>
            <p className="mt-1">
              Semua <strong>produk</strong>, <strong>kategori</strong>, <strong>transaksi</strong>, dan <strong>pelanggan</strong> akan dihapus permanen.
            </p>
          </div>
        </div>
        <div className="mt-5 flex gap-3">
          <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setShowResetDialog(false)} disabled={resetting}>
            Batal
          </Button>
          <Button
            variant="destructive"
            className="flex-1 rounded-xl"
            disabled={resetting}
            onClick={async () => {
              setResetting(true)
              try {
                const res = await fetch('/api/store/reset-demo', { method: 'POST' })
                if (res.ok) { setResetDone(true); setShowResetDialog(false) }
              } catch { /* silently fail */ }
              finally { setResetting(false) }
            }}
          >
            {resetting ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Menghapus...</>
            ) : (
              <><Trash2 className="mr-2 h-4 w-4" />Ya, Hapus Semua</>
            )}
          </Button>
        </div>
      </Dialog>

      {/* ── Plan Limit Modal (Upgrade to Pro) ── */}
      <PlanLimitModal {...limitModalProps} />
    </div>
  )
}
