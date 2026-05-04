/**
 * Web Bluetooth Printer Connection Manager
 *
 * Manages Bluetooth connections to thermal printers using the Web Bluetooth API.
 * Handles device discovery, connection, reconnection, and data transmission.
 *
 * Known service UUIDs for common thermal printers:
 * - 0000ff00-0000-1000-8000-00805f9b34fb (Generic / Xprinter / GOOJPRT)
 * - e7810a71-73ae-499d-8c15-faa9aef0c3f2 (Alternate)
 * - 49535343-fe7d-4ae5-8fa9-9fafd205e455 (ISSC / MiPOS)
 * - 000018f0-0000-1000-8000-00805f9b34fb (Zjiang)
 */

/** Saved printer device info for reconnection */
export interface PrinterDevice {
  id: string
  name: string
}

/** Known Bluetooth GATT service UUIDs for thermal printers */
const PRINTER_SERVICE_UUIDS = [
  '0000ff00-0000-1000-8000-00805f9b34fb',
  'e7810a71-73ae-499d-8c15-faa9aef0c3f2',
  '49535343-fe7d-4ae5-8fa9-9fafd205e455',
  '000018f0-0000-1000-8000-00805f9b34fb',
]

/** Known characteristic UUIDs for writing data to printers */
const PRINTER_CHARACTERISTIC_UUIDS = [
  '0000ff02-0000-1000-8000-00805f9b34fb',
  'bef8d6c9-9c21-4c9e-b632-bd58c1009f9f',
  '49535343-8841-43f4-a8d4-ecbe34729bb3',
  '000018f2-0000-1000-8000-00805f9b34fb',
]

/** Maximum bytes per write operation (some BLE devices limit to ~512 bytes) */
const MAX_CHUNK_SIZE = 512

/** Delay between chunks in milliseconds */
const CHUNK_DELAY_MS = 50

/**
 * Check if Web Bluetooth API is available in the current browser.
 */
export function isBluetoothSupported(): boolean {
  return typeof navigator !== 'undefined' && 'bluetooth' in navigator
}

/**
 * BluetoothPrinter manages the lifecycle of a Bluetooth printer connection.
 */
export class BluetoothPrinter {
  private device: BluetoothDevice | null = null
  private server: BluetoothRemoteGATTServer | null = null
  private characteristic: BluetoothRemoteGATTCharacteristic | null = null
  private _isConnected = false
  private _deviceName: string | null = null
  private _deviceId: string | null = null

  /** Whether the printer is currently connected */
  get isConnected(): boolean {
    return this._isConnected && this.server?.connected === true
  }

  /** Name of the connected device */
  get deviceName(): string | null {
    return this._deviceName
  }

  /** ID of the connected device */
  get deviceId(): string | null {
    return this._deviceId
  }

  /**
   * Open the browser's Bluetooth device picker and pair with a printer.
   * Must be called from a user gesture (click handler).
   *
   * @returns The paired device info, or null if the user cancelled.
   */
  async requestDevice(): Promise<PrinterDevice | null> {
    if (!isBluetoothSupported()) {
      throw new Error('Web Bluetooth tidak didukung di browser ini. Gunakan Chrome atau Edge.')
    }

    try {
      const device = await navigator.bluetooth.requestDevice({
        // Accept all devices — thermal printers have inconsistent names
        acceptAllDevices: true,
        optionalServices: PRINTER_SERVICE_UUIDS,
      })

      if (!device) return null

      this.device = device

      // Listen for disconnection
      device.addEventListener('gattserverdisconnected', () => {
        this._isConnected = false
        this.characteristic = null
        this.server = null
      })

      return {
        id: device.id,
        name: device.name || 'Printer Tidak Dikenal',
      }
    } catch (err) {
      // User cancelled the picker
      if (err instanceof DOMException && err.name === 'NotFoundError') {
        return null
      }
      throw err
    }
  }

  /**
   * Connect to the printer's GATT server and find the writable characteristic.
   * If a device was previously paired via `requestDevice()`, it will use that device.
   */
  async connect(): Promise<void> {
    if (!this.device) {
      throw new Error('Tidak ada printer yang dipilih. Panggil requestDevice() terlebih dahulu.')
    }

    if (!this.device.gatt) {
      throw new Error('Printer tidak mendukung GATT.')
    }

    try {
      // Connect to GATT server
      this.server = await this.device.gatt.connect()

      // Try each known service UUID until we find one that works
      let service: BluetoothRemoteGATTService | null = null
      for (const uuid of PRINTER_SERVICE_UUIDS) {
        try {
          service = await this.server.getPrimaryService(uuid)
          break
        } catch {
          // This service UUID doesn't exist on this printer, try next
          continue
        }
      }

      if (!service) {
        throw new Error(
          'Tidak dapat menemukan service printer. Pastikan printer thermal Bluetooth Anda kompatibel.'
        )
      }

      // Find the writable characteristic
      let characteristic: BluetoothRemoteGATTCharacteristic | null = null

      // First try known characteristic UUIDs
      for (const uuid of PRINTER_CHARACTERISTIC_UUIDS) {
        try {
          characteristic = await service.getCharacteristic(uuid)
          break
        } catch {
          continue
        }
      }

      // If none of the known UUIDs worked, scan all characteristics for a writable one
      if (!characteristic) {
        const characteristics = await service.getCharacteristics()
        for (const c of characteristics) {
          if (
            c.properties.writeWithoutResponse ||
            c.properties.write
          ) {
            characteristic = c
            break
          }
        }
      }

      if (!characteristic) {
        throw new Error(
          'Tidak dapat menemukan characteristic untuk menulis ke printer.'
        )
      }

      this.characteristic = characteristic
      this._isConnected = true
      this._deviceName = this.device.name || 'Printer Tidak Dikenal'
      this._deviceId = this.device.id
    } catch (err) {
      this._isConnected = false
      this.characteristic = null
      this.server = null
      throw err
    }
  }

  /**
   * Disconnect from the printer.
   */
  disconnect(): void {
    if (this.server?.connected) {
      this.server.disconnect()
    }
    this._isConnected = false
    this.characteristic = null
    this.server = null
  }

  /**
   * Send data to the printer.
   * Automatically chunks the data to avoid exceeding BLE write limits.
   *
   * @param data The ESC/POS encoded byte array to send.
   */
  async print(data: Uint8Array): Promise<void> {
    if (!this.characteristic) {
      throw new Error('Printer tidak terhubung.')
    }

    // Split data into chunks
    const chunks: Uint8Array[] = []
    for (let i = 0; i < data.length; i += MAX_CHUNK_SIZE) {
      chunks.push(data.slice(i, i + MAX_CHUNK_SIZE))
    }

    // Send each chunk with a small delay
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]
      try {
        // Create a DataView from the chunk for type compatibility
        const dataView = new DataView(chunk.buffer, chunk.byteOffset, chunk.byteLength)
        if (this.characteristic.properties.writeWithoutResponse) {
          await this.characteristic.writeValueWithoutResponse(dataView)
        } else {
          await this.characteristic.writeValueWithResponse(dataView)
        }
      } catch (err) {
        throw new Error(
          `Gagal mengirim data ke printer (chunk ${i + 1}/${chunks.length}): ${err instanceof Error ? err.message : String(err)}`
        )
      }

      // Delay between chunks (skip delay for last chunk)
      if (i < chunks.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, CHUNK_DELAY_MS))
      }
    }
  }
}

/** Singleton printer instance shared across the app */
let printerInstance: BluetoothPrinter | null = null

/**
 * Get the shared BluetoothPrinter instance.
 * Creates one if it doesn't exist yet.
 */
export function getPrinter(): BluetoothPrinter {
  if (!printerInstance) {
    printerInstance = new BluetoothPrinter()
  }
  return printerInstance
}
