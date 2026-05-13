import { getPrinter, isBluetoothSupported } from '@/lib/printer/bluetooth'
import { buildReceipt } from '@/lib/printer/receipt-builder'
import type { PaperSize } from '@/lib/printer/escpos'
import type { Transaction } from '@/types'

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
  method: 'bluetooth' | 'android-app' | 'browser-guidance'
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
