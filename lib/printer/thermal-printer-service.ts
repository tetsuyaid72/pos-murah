import { getPrinter, isBluetoothSupported } from '@/lib/printer/bluetooth'
import { buildReceipt } from '@/lib/printer/receipt-builder'
import type { PaperSize } from '@/lib/printer/escpos'
import type { Transaction } from '@/types'

type ThermalBridgeStatus = {
  success?: boolean
  status: 'connected' | 'disconnected' | 'connecting' | 'error'
  device?: { id: string; name: string } | null
  message?: string
}

type ThermalBridgePayload = {
  header: {
    title: string
    subtitle?: string
    address?: string
    phone?: string
    receipt_no?: string
    cashier?: string
    date?: string
  }
  items: Array<{ name: string; qty: number; price: number }>
  subtotal?: number
  discount?: number
  tax?: number
  total: number
  payment: {
    method: string
    amount: number
    change: number
  }
  footer?: string
  width: 32
}

declare global {
  interface Window {
    ThermalBridge?: {
      connect: () => Promise<{ success: boolean; device?: { id: string; name: string } | null; message?: string }>
      disconnect: () => Promise<{ success: boolean; message?: string }>
      print: (payload: ThermalBridgePayload) => Promise<{ success: boolean; message?: string }>
      raw: (bytes: number[]) => Promise<{ success: boolean; message?: string }>
      status: () => Promise<ThermalBridgeStatus>
    }
  }
}

export interface ThermalReceiptOptions {
  paperSize: PaperSize
  storeName: string
  storeAddress: string
  storePhone: string
  receiptFooter: string
  cashierName: string
}

export type ThermalPrintSupport = {
  canPrintThermal: boolean
  mode: 'native-app' | 'web-bluetooth' | 'browser-only'
  message: string
}

export interface ThermalPrintResult {
  ok: boolean
  method: 'thermal-bridge' | 'bluetooth' | 'android-app' | 'browser-guidance'
  message: string
}

function isNativeAndroidApp(): boolean {
  if (typeof window === 'undefined') return false

  const ua = window.navigator.userAgent || ''
  return /wv|Android.*Version\/|Capacitor|Cordova|ReactNative/i.test(ua)
}

export function getThermalPrintSupport(): ThermalPrintSupport {
  if (isNativeAndroidApp()) {
    return {
      canPrintThermal: true,
      mode: 'native-app',
      message: 'Mode Android App terdeteksi. Printer thermal Bluetooth dapat digunakan untuk ESC/POS 58mm.',
    }
  }

  if (isBluetoothSupported()) {
    return {
      canPrintThermal: true,
      mode: 'web-bluetooth',
      message: 'Browser ini mendukung Web Bluetooth, tetapi printer thermal Bluetooth RPP02N lebih stabil jika digunakan melalui Android App / Bluetooth Printer.',
    }
  }

  return {
    canPrintThermal: false,
    mode: 'browser-only',
    message: 'Untuk mencetak ke printer thermal Bluetooth RPP02N, gunakan mode Android App / Bluetooth Printer. Print dari browser hanya mendukung PDF.',
  }
}

function formatReceiptDate(value: string): string {
  return new Date(value).toLocaleString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function normalizePaymentMethod(method: Transaction['paymentMethod']): string {
  switch (method) {
    case 'cash': return 'CASH'
    case 'qris': return 'QRIS'
    case 'debt': return 'HUTANG'
    default: return method.toUpperCase()
  }
}

export function buildThermalBridgeReceiptPayload(
  transaction: Transaction,
  options: ThermalReceiptOptions
): ThermalBridgePayload {
  return {
    header: {
      title: options.storeName || 'Warung Madura POS',
      subtitle: formatReceiptDate(transaction.createdAt),
      address: options.storeAddress || undefined,
      phone: options.storePhone || undefined,
      receipt_no: transaction.invoiceNumber,
      cashier: options.cashierName || undefined,
      date: formatReceiptDate(transaction.createdAt),
    },
    items: transaction.items.map((item) => ({
      name: item.productName,
      qty: item.quantity,
      price: item.unitPrice,
    })),
    subtotal: transaction.subtotal,
    discount: transaction.discountAmount || undefined,
    tax: transaction.taxAmount || undefined,
    total: transaction.totalAmount,
    payment: {
      method: normalizePaymentMethod(transaction.paymentMethod),
      amount: transaction.amountPaid,
      change: transaction.changeAmount,
    },
    footer: options.receiptFooter || 'Terima kasih sudah berbelanja',
    width: 32,
  }
}

function getThermalBridgeErrorMessage(message: string): string {
  if (/globally disabled|web bluetooth/i.test(message)) {
    return 'Web Bluetooth di browser masih nonaktif. Aktifkan Web Bluetooth di Chrome/Edge flags atau gunakan Chrome Desktop yang mendukung Web Bluetooth.'
  }

  if (/not detected|extension/i.test(message)) {
    return 'Thermal-Bridge extension belum terpasang/aktif. Install extension, reload halaman, lalu coba cetak lagi.'
  }

  if (/pair|connect|bluetooth|device|printer/i.test(message)) {
    return 'Printer belum terhubung. Pastikan RPP02N aktif, dekat, Bluetooth aktif, lalu ulangi pairing.'
  }

  return message
}

async function printWithThermalBridge(
  transaction: Transaction,
  options: ThermalReceiptOptions
): Promise<ThermalPrintResult> {
  if (typeof window === 'undefined' || !window.ThermalBridge) {
    return {
      ok: false,
      method: 'thermal-bridge',
      message: 'Thermal-Bridge extension belum terpasang/aktif. Install extension, reload halaman, lalu coba cetak lagi.',
    }
  }

  const status = await window.ThermalBridge.status().catch(() => null)
  if (!status || status.status !== 'connected') {
    const connected = await window.ThermalBridge.connect().catch((error) => ({
      success: false,
      message: error instanceof Error ? error.message : 'Gagal pairing ke printer.',
    }))

    if (!connected.success) {
      return {
        ok: false,
        method: 'thermal-bridge',
        message: getThermalBridgeErrorMessage(connected.message || 'Printer belum terhubung. Pastikan RPP02N aktif, dekat, lalu ulangi pairing.'),
      }
    }
  }

  const result = await window.ThermalBridge.print(buildThermalBridgeReceiptPayload(transaction, options))
  return {
    ok: result.success,
    method: 'thermal-bridge',
    message: result.success
      ? 'Struk berhasil dikirim ke Thermal-Bridge.'
      : getThermalBridgeErrorMessage(result.message || 'Gagal mencetak struk melalui Thermal-Bridge.'),
  }
}

export const thermalPrinterService = {
  isSupported(): ThermalPrintSupport {
    return getThermalPrintSupport()
  },

  isPrinterConnected(): boolean {
    const printer = getPrinter()
    return printer.isConnected
  },

  generateEscPosReceipt(
    transaction: Transaction,
    options: ThermalReceiptOptions
  ): Uint8Array {
    return buildReceipt(transaction, options)
  },

  async printThermalReceipt(
    transaction: Transaction,
    options: ThermalReceiptOptions
  ): Promise<ThermalPrintResult> {
    const bridgeResult = await printWithThermalBridge(transaction, options)
    if (typeof window !== 'undefined') {
      return bridgeResult
    }

    const support = getThermalPrintSupport()
    const data = this.generateEscPosReceipt(transaction, options)
    const printer = getPrinter()

    if (printer.isConnected) {
      await printer.print(data)
      return {
        ok: true,
        method: 'bluetooth',
        message: 'Struk thermal berhasil dikirim ke printer Bluetooth.',
      }
    }

    if (support.mode === 'native-app') {
      return {
        ok: false,
        method: 'android-app',
        message:
          'Printer belum bisa diakses dari browser. Jika RPP02N sudah dipairing/tersimpan di Bluetooth HP, lanjutkan cetak melalui Android App / Bluetooth Printer.',
      }
    }

    return {
      ok: false,
      method: 'browser-guidance',
      message:
        'Printer belum bisa diakses dari browser. Jika RPP02N sudah dipairing/tersimpan di Bluetooth HP, lanjutkan cetak melalui Android App / Bluetooth Printer.',
    }
  },
}
