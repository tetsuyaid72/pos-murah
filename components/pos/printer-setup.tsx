'use client'

import { useState, useCallback } from 'react'
import {
  Bluetooth,
  BluetoothConnected,
  BluetoothOff,
  Printer,
  Unplug,
  TestTube2,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { Dialog, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { useSettingsStore } from '@/stores/settings-store'
import {
  getPrinter,
  isBluetoothSupported,
  type PrinterDevice,
} from '@/lib/printer/bluetooth'
import { buildTestReceipt } from '@/lib/printer/receipt-builder'
import type { PaperSize } from '@/lib/printer/escpos'

interface PrinterSetupProps {
  open: boolean
  onClose: () => void
}

export function PrinterSetup({ open, onClose }: PrinterSetupProps) {
  const {
    printerPaperSize,
    printerDeviceId,
    printerDeviceName,
    autoPrint,
    storeName,
    setPrinterPaperSize,
    setPrinterDevice,
    setAutoPrint,
  } = useSettingsStore()

  const [isConnecting, setIsConnecting] = useState(false)
  const [isPrinting, setIsPrinting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [connectedName, setConnectedName] = useState<string | null>(null)

  const printer = getPrinter()
  const isConnected = printer.isConnected
  const supported = isBluetoothSupported()

  const handlePairAndConnect = useCallback(async () => {
    setError(null)
    setIsConnecting(true)

    try {
      const device = await printer.requestDevice()
      if (!device) {
        setIsConnecting(false)
        return // User cancelled
      }

      await printer.connect()

      // Save device info to settings for reconnection
      setPrinterDevice(device.id, device.name)
      setConnectedName(device.name)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menghubungkan printer.')
    } finally {
      setIsConnecting(false)
    }
  }, [printer, setPrinterDevice])

  const handleDisconnect = useCallback(() => {
    printer.disconnect()
    setConnectedName(null)
    setError(null)
  }, [printer])

  const handleTestPrint = useCallback(async () => {
    setError(null)
    setIsPrinting(true)

    try {
      const data = buildTestReceipt({
        paperSize: printerPaperSize,
        storeName,
      })
      await printer.print(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mencetak test page.')
    } finally {
      setIsPrinting(false)
    }
  }, [printer, printerPaperSize, storeName])

  const displayName = connectedName || printerDeviceName

  return (
    <Dialog open={open} onClose={onClose} className="max-w-md">
      <DialogHeader>
        <DialogTitle>Pengaturan Printer</DialogTitle>
        <DialogClose onClose={onClose} />
      </DialogHeader>

      {/* Browser support warning */}
      {!supported && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-500/20 dark:bg-amber-500/10">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <div className="text-sm text-amber-800 dark:text-amber-300">
            <p className="font-medium">Browser tidak didukung</p>
            <p className="mt-0.5 text-xs">
              Web Bluetooth hanya tersedia di Chrome dan Edge. Gunakan salah satu browser tersebut untuk menghubungkan printer Bluetooth.
            </p>
          </div>
        </div>
      )}

      {/* Connection status */}
      <div className="mb-5 flex items-center gap-3 rounded-xl border p-4">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full ${
            isConnected
              ? 'bg-emerald-50 dark:bg-emerald-500/10'
              : 'bg-muted'
          }`}
        >
          {isConnected ? (
            <BluetoothConnected className="h-5 w-5 text-emerald-500" />
          ) : (
            <BluetoothOff className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">
            {isConnected ? 'Terhubung' : 'Tidak Terhubung'}
          </p>
          {isConnected && displayName && (
            <p className="text-xs text-muted-foreground">{displayName}</p>
          )}
          {!isConnected && printerDeviceName && (
            <p className="text-xs text-muted-foreground">
              Terakhir: {printerDeviceName}
            </p>
          )}
        </div>
        <div
          className={`h-2.5 w-2.5 rounded-full ${
            isConnected ? 'bg-emerald-500' : 'bg-muted-foreground/30'
          }`}
        />
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <p className="text-xs text-destructive">{error}</p>
        </div>
      )}

      {/* Connect / Disconnect buttons */}
      <div className="mb-5 flex gap-2">
        {!isConnected ? (
          <Button
            onClick={handlePairAndConnect}
            disabled={!supported || isConnecting}
            className="flex-1"
          >
            {isConnecting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Bluetooth className="mr-2 h-4 w-4" />
            )}
            {isConnecting ? 'Menghubungkan...' : 'Hubungkan Printer'}
          </Button>
        ) : (
          <>
            <Button
              variant="outline"
              onClick={handleTestPrint}
              disabled={isPrinting}
              className="flex-1"
            >
              {isPrinting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <TestTube2 className="mr-2 h-4 w-4" />
              )}
              {isPrinting ? 'Mencetak...' : 'Test Print'}
            </Button>
            <Button
              variant="outline"
              onClick={handleDisconnect}
              className="text-destructive hover:text-destructive"
            >
              <Unplug className="mr-2 h-4 w-4" />
              Putuskan
            </Button>
          </>
        )}
      </div>

      {/* Settings */}
      <div className="space-y-4 border-t pt-4">
        {/* Paper size */}
        <div className="space-y-2">
          <Label htmlFor="paperSize">Ukuran Kertas</Label>
          <Select
            id="paperSize"
            value={printerPaperSize}
            onChange={(e) =>
              setPrinterPaperSize(e.target.value as PaperSize)
            }
          >
            <option value="58mm">58mm (32 karakter/baris)</option>
            <option value="80mm">80mm (48 karakter/baris)</option>
          </Select>
          <p className="text-xs text-muted-foreground">
            Pilih sesuai lebar kertas printer thermal Anda.
          </p>
        </div>

        {/* Auto-print toggle */}
        <div className="flex items-center justify-between rounded-xl border p-3">
          <div>
            <p className="text-sm font-medium">Auto-Print</p>
            <p className="text-xs text-muted-foreground">
              Cetak struk otomatis setelah transaksi berhasil
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={autoPrint}
            onClick={() => setAutoPrint(!autoPrint)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
              autoPrint ? 'bg-primary' : 'bg-input'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow-lg ring-0 transition duration-200 ease-in-out ${
                autoPrint ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
    </Dialog>
  )
}
