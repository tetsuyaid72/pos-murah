import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SettingsState {
  // Store profile
  storeName: string
  storeAddress: string
  storePhone: string
  storeLogo: string | null
  receiptFooter: string

  // User profile
  userName: string
  userEmail: string
  userAvatar: string | null

  // Printer
  printerPaperSize: '58mm' | '80mm'
  printerDeviceId: string | null
  printerDeviceName: string | null
  autoPrint: boolean
}

interface SettingsActions {
  setStoreName: (name: string) => void
  setStoreAddress: (address: string) => void
  setStorePhone: (phone: string) => void
  setStoreLogo: (url: string | null) => void
  setReceiptFooter: (footer: string) => void
  setUserName: (name: string) => void
  setUserEmail: (email: string) => void
  setUserAvatar: (url: string | null) => void
  setPrinterPaperSize: (size: '58mm' | '80mm') => void
  setPrinterDevice: (id: string | null, name: string | null) => void
  setAutoPrint: (auto: boolean) => void
}

export const useSettingsStore = create<SettingsState & SettingsActions>()(
  persist(
    (set) => ({
      // Default values — populated from /api/auth/me via AuthProvider
      storeName: '',
      storeAddress: '',
      storePhone: '',
      storeLogo: null,
      receiptFooter: 'Terima kasih telah berbelanja!',

      userName: '',
      userEmail: '',
      userAvatar: null,

      // Printer defaults
      printerPaperSize: '58mm',
      printerDeviceId: null,
      printerDeviceName: null,
      autoPrint: false,

      // Actions
      setStoreName: (name) => set({ storeName: name }),
      setStoreAddress: (address) => set({ storeAddress: address }),
      setStorePhone: (phone) => set({ storePhone: phone }),
      setStoreLogo: (url) => set({ storeLogo: url }),
      setReceiptFooter: (footer) => set({ receiptFooter: footer }),
      setUserName: (name) => set({ userName: name }),
      setUserEmail: (email) => set({ userEmail: email }),
      setUserAvatar: (url) => set({ userAvatar: url }),
      setPrinterPaperSize: (size) => set({ printerPaperSize: size }),
      setPrinterDevice: (id, name) =>
        set({ printerDeviceId: id, printerDeviceName: name }),
      setAutoPrint: (auto) => set({ autoPrint: auto }),
    }),
    {
      name: 'pos-settings',
    }
  )
)
