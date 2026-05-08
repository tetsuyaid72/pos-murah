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
  Bluetooth,
  BluetoothConnected,
  BluetoothOff,
  TestTube2,
  Unplug,
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
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Dialog, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog'
import { useUIStore } from '@/stores/ui-store'
import { useSettingsStore } from '@/stores/settings-store'
import { useAuthStore } from '@/stores/auth-store'
import { AvatarUpload } from '@/components/settings/avatar-upload'
import { LogoUpload } from '@/components/settings/logo-upload'
import { PlanLimitModal, usePlanLimitModal } from '@/components/plan-limit-modal'
import { cn } from '@/lib/utils'
import {
  getPrinter,
  isBluetoothSupported,
} from '@/lib/printer/bluetooth'
import { buildTestReceipt } from '@/lib/printer/receipt-builder'
import type { PaperSize } from '@/lib/printer/escpos'

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
  const { theme, setTheme } = useUIStore()
  const {
    storeName, setStoreName,
    storeAddress, setStoreAddress,
    storePhone, setStorePhone,
    storeLogo, setStoreLogo,
    receiptFooter, setReceiptFooter,
    userName, setUserName,
    userEmail, setUserEmail,
    userAvatar, setUserAvatar,
    printerPaperSize, setPrinterPaperSize,
    printerDeviceName, setPrinterDevice,
    autoPrint, setAutoPrint,
  } = useSettingsStore()
  const { logout, membership } = useAuthStore()

  const [activeTab, setActiveTab] = useState<SettingsTab>('general')
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [resetDone, setResetDone] = useState(false)

  // Printer state
  const [isConnecting, setIsConnecting] = useState(false)
  const [isPrintingTest, setIsPrintingTest] = useState(false)
  const [printerError, setPrinterError] = useState<string | null>(null)
  const [connectedName, setConnectedName] = useState<string | null>(null)

  // Plan limit modal
  const { openLimitModal, limitModalProps } = usePlanLimitModal()

  // Check if user has Pro access — trial does NOT grant backup access
  const hasBackupAccess = (() => {
    if (!membership) return false
    const plan = membership.plan?.toUpperCase()
    return plan === 'PRO' || plan === 'ENTERPRISE'
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

  const bluetoothPrinter = getPrinter()
  const isPrinterConnected = bluetoothPrinter.isConnected
  const bluetoothSupported = isBluetoothSupported()
  const printerDisplayName = connectedName || printerDeviceName

  // Handlers
  const handleSave = async () => {
    setSaving(true)
    try {
      await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: userName, avatarUrl: userAvatar }),
      })
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

  const handlePairPrinter = useCallback(async () => {
    setPrinterError(null)
    setIsConnecting(true)
    try {
      const device = await bluetoothPrinter.requestDevice()
      if (!device) { setIsConnecting(false); return }
      await bluetoothPrinter.connect()
      setPrinterDevice(device.id, device.name)
      setConnectedName(device.name)
    } catch (err) {
      setPrinterError(err instanceof Error ? err.message : 'Gagal menghubungkan printer.')
    } finally {
      setIsConnecting(false)
    }
  }, [bluetoothPrinter, setPrinterDevice])

  const handleDisconnectPrinter = useCallback(() => {
    bluetoothPrinter.disconnect()
    setConnectedName(null)
    setPrinterError(null)
  }, [bluetoothPrinter])

  const handleTestPrint = useCallback(async () => {
    setPrinterError(null)
    setIsPrintingTest(true)
    try {
      const data = buildTestReceipt({ paperSize: printerPaperSize, storeName })
      await bluetoothPrinter.print(data)
    } catch (err) {
      setPrinterError(err instanceof Error ? err.message : 'Gagal mencetak test page.')
    } finally {
      setIsPrintingTest(false)
    }
  }, [bluetoothPrinter, printerPaperSize, storeName])

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
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

              {/* ── Connection ── */}
              <Card className="transition-shadow hover:shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-500/10">
                      <Bluetooth className="h-4 w-4 text-blue-500" />
                    </div>
                    Koneksi Printer
                  </CardTitle>
                  <CardDescription>Hubungkan printer thermal Bluetooth</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!bluetoothSupported && (
                    <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-500/20 dark:bg-amber-500/10">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                      <div className="text-sm text-amber-800 dark:text-amber-300">
                        <p className="font-medium">Browser tidak didukung</p>
                        <p className="mt-0.5 text-xs">Web Bluetooth hanya tersedia di Chrome dan Edge.</p>
                      </div>
                    </div>
                  )}

                  {/* Status */}
                  <div className="flex items-center gap-3 rounded-xl border p-4">
                    <div className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-full',
                      isPrinterConnected ? 'bg-emerald-50 dark:bg-emerald-500/10' : 'bg-muted'
                    )}>
                      {isPrinterConnected
                        ? <BluetoothConnected className="h-5 w-5 text-emerald-500" />
                        : <BluetoothOff className="h-5 w-5 text-muted-foreground" />
                      }
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{isPrinterConnected ? 'Terhubung' : 'Tidak Terhubung'}</p>
                      {isPrinterConnected && printerDisplayName && (
                        <p className="text-xs text-muted-foreground">{printerDisplayName}</p>
                      )}
                      {!isPrinterConnected && printerDeviceName && (
                        <p className="text-xs text-muted-foreground">Terakhir: {printerDeviceName}</p>
                      )}
                    </div>
                    <div className={cn('h-2.5 w-2.5 rounded-full', isPrinterConnected ? 'bg-emerald-500' : 'bg-muted-foreground/30')} />
                  </div>

                  {printerError && (
                    <div className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                      <p className="text-xs text-destructive">{printerError}</p>
                    </div>
                  )}

                  {/* Buttons */}
                  <div className="flex gap-2">
                    {!isPrinterConnected ? (
                      <Button onClick={handlePairPrinter} disabled={!bluetoothSupported || isConnecting} className="flex-1">
                        {isConnecting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bluetooth className="mr-2 h-4 w-4" />}
                        {isConnecting ? 'Menghubungkan...' : 'Hubungkan Printer'}
                      </Button>
                    ) : (
                      <>
                        <Button variant="outline" onClick={handleTestPrint} disabled={isPrintingTest} className="flex-1">
                          {isPrintingTest ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <TestTube2 className="mr-2 h-4 w-4" />}
                          {isPrintingTest ? 'Mencetak...' : 'Test Print'}
                        </Button>
                        <Button variant="outline" onClick={handleDisconnectPrinter} className="text-destructive hover:text-destructive">
                          <Unplug className="mr-2 h-4 w-4" />Putuskan
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* ── Printer Settings ── */}
              <Card className="transition-shadow hover:shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-50 dark:bg-violet-500/10">
                      <Printer className="h-4 w-4 text-violet-500" />
                    </div>
                    Pengaturan Cetak
                  </CardTitle>
                  <CardDescription>Ukuran kertas dan opsi cetak otomatis</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-1.5">
                    <Label htmlFor="printerPaperSize">Ukuran Kertas</Label>
                    <Select id="printerPaperSize" value={printerPaperSize} onChange={(e) => setPrinterPaperSize(e.target.value as PaperSize)}>
                      <option value="58mm">58mm (32 karakter/baris)</option>
                      <option value="80mm">80mm (48 karakter/baris)</option>
                    </Select>
                  </div>

                  {/* Auto-print toggle */}
                  <div className="flex items-center justify-between rounded-xl border p-4">
                    <div>
                      <p className="text-sm font-medium">Auto-Print</p>
                      <p className="text-xs text-muted-foreground">Cetak struk otomatis setelah transaksi</p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={autoPrint}
                      onClick={() => setAutoPrint(!autoPrint)}
                      className={cn(
                        'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                        autoPrint ? 'bg-primary' : 'bg-input'
                      )}
                    >
                      <span className={cn(
                        'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow-lg ring-0 transition duration-200 ease-in-out',
                        autoPrint ? 'translate-x-5' : 'translate-x-0'
                      )} />
                    </button>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Mendukung printer thermal Bluetooth 58mm dan 80mm (Xprinter, GOOJPRT, Zjiang, dll).
                  </p>
                </CardContent>
              </Card>
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
                        dragOver
                          ? 'border-primary bg-primary/5'
                          : 'border-border/50 hover:border-primary/30 hover:bg-muted/30'
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
