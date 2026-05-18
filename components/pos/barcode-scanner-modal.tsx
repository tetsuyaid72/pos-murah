'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { BrowserMultiFormatReader } from '@zxing/browser'
import { Barcode, Camera, Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BarcodeScannerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onScan: (code: string) => Promise<boolean> | boolean
}

export function BarcodeScannerModal({ open, onOpenChange, onScan }: BarcodeScannerModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const controlsRef = useRef<{ stop: () => void } | null>(null)
  const lastScanRef = useRef({ code: '', time: 0 })
  const audioContextRef = useRef<AudioContext | null>(null)
  const [status, setStatus] = useState('Arahkan kamera ke barcode produk.')
  const [error, setError] = useState<string | null>(null)
  const [notFoundCode, setNotFoundCode] = useState<string | null>(null)
  const [isStarting, setIsStarting] = useState(false)
  const [cameraRequested, setCameraRequested] = useState(false)

  const playBeep = useCallback(() => {
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioContextClass) return

    const context = audioContextRef.current ?? new AudioContextClass()
    audioContextRef.current = context
    if (context.state === 'suspended') context.resume()

    const now = context.currentTime
    const masterGain = context.createGain()
    masterGain.gain.setValueAtTime(0.0001, now)
    masterGain.gain.exponentialRampToValueAtTime(0.22, now + 0.006)
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18)
    masterGain.connect(context.destination)

    const firstTone = context.createOscillator()
    firstTone.type = 'square'
    firstTone.frequency.setValueAtTime(1040, now)
    firstTone.connect(masterGain)
    firstTone.start(now)
    firstTone.stop(now + 0.075)

    const secondTone = context.createOscillator()
    secondTone.type = 'square'
    secondTone.frequency.setValueAtTime(1560, now + 0.07)
    secondTone.connect(masterGain)
    secondTone.start(now + 0.07)
    secondTone.stop(now + 0.18)
  }, [])

  const startScanner = useCallback(async () => {
      const reader = new BrowserMultiFormatReader()
      setIsStarting(true)
      setError(null)
      setNotFoundCode(null)
      setStatus('Membuka kamera...')
      try {
        if (!videoRef.current) return
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error('Browser tidak mendukung akses kamera. Gunakan Chrome/Safari terbaru dan pastikan membuka lewat HTTPS.')
        }

        setStatus('Mohon izinkan akses kamera di browser.')
        const permissionStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        })
        permissionStream.getTracks().forEach((track) => track.stop())

        const devices = await BrowserMultiFormatReader.listVideoInputDevices()
        const backCamera = devices.find((device) => /back|rear|environment/i.test(device.label))
        const selectedDeviceId = backCamera?.deviceId || devices[0]?.deviceId

        if (!selectedDeviceId) {
          throw new Error('Kamera tidak ditemukan di perangkat ini. Pastikan izin kamera sudah diberikan.')
        }

        const controls = await reader.decodeFromVideoDevice(
          selectedDeviceId,
          videoRef.current,
          async (result, decodeError) => {
            if (decodeError || !result) return

            const code = result.getText().trim()
            const now = Date.now()
            if (code === lastScanRef.current.code && now - lastScanRef.current.time < 1500) return
            lastScanRef.current = { code, time: now }
            setStatus(`Barcode terbaca: ${code}`)
            navigator.vibrate?.(80)
            playBeep()
            const found = await onScan(code)
            if (!found) {
              setNotFoundCode(code)
              setStatus('Produk belum terdaftar.')
            } else {
              setNotFoundCode(null)
              setStatus('Produk ditambahkan. Silakan scan berikutnya.')
            }
          }
        )
        controlsRef.current = controls
        setStatus('Arahkan kamera ke barcode produk.')
      } catch (err) {
        if (err instanceof DOMException && (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError')) {
          setError('Akses kamera ditolak. Izinkan kamera di browser untuk memakai scan barcode.')
        } else if (err instanceof DOMException && err.name === 'NotFoundError') {
          setError('Kamera tidak ditemukan di perangkat ini.')
        } else {
          setError(err instanceof Error ? err.message : 'Gagal membuka kamera.')
        }
      } finally {
        setIsStarting(false)
      }
  }, [onScan, playBeep])

  useEffect(() => {
    if (!open) {
      const timer = window.setTimeout(() => setCameraRequested(false), 0)
      controlsRef.current?.stop()
      controlsRef.current = null
      return () => window.clearTimeout(timer)
    }
  }, [open])

  useEffect(() => {
    return () => {
      controlsRef.current?.stop()
      controlsRef.current = null
      audioContextRef.current?.close()
      audioContextRef.current = null
    }
  }, [])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/90 p-4 text-white">
      <div className="relative flex h-full w-full max-w-lg flex-col overflow-hidden rounded-[28px] border border-white/10 bg-slate-950 shadow-2xl sm:h-auto sm:max-h-[92vh]">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-300">
              <Barcode className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Scan Barcode</h2>
              <p className="text-xs text-white/60">Gunakan kamera belakang HP.</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full text-white hover:bg-white/10 hover:text-white" onClick={() => onOpenChange(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="relative aspect-[3/4] bg-black sm:aspect-video">
          <video ref={videoRef} className="h-full w-full object-cover" muted playsInline />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="relative h-36 w-72 max-w-[78vw] rounded-3xl border-2 border-emerald-300/80 shadow-[0_0_0_999px_rgba(2,6,23,0.42)]">
              <div className="absolute left-4 right-4 top-1/2 h-0.5 -translate-y-1/2 bg-emerald-300 shadow-[0_0_18px_rgba(110,231,183,0.9)]" />
            </div>
          </div>
          {!cameraRequested && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/70 px-6 text-center">
              <Camera className="h-10 w-10 text-emerald-300" />
              <p className="text-sm font-semibold">Izinkan kamera untuk mulai scan barcode.</p>
              <Button
                className="rounded-2xl bg-emerald-500 text-white hover:bg-emerald-600"
                onClick={() => {
                  setCameraRequested(true)
                  startScanner()
                }}
              >
                Izinkan Kamera
              </Button>
            </div>
          )}
          {isStarting && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <Loader2 className="h-7 w-7 animate-spin text-emerald-300" />
            </div>
          )}
        </div>

        <div className="space-y-3 p-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80">
            {error || status}
          </div>

          {notFoundCode && (
            <div className="rounded-2xl border border-amber-300/30 bg-amber-300/10 p-3 text-sm text-amber-100">
              <p className="font-semibold">Produk dengan barcode ini belum terdaftar.</p>
              <p className="mt-1 text-xs opacity-80">Barcode: {notFoundCode}</p>
              <Link href={`/products/new?barcode=${encodeURIComponent(notFoundCode)}`}>
                <Button className="mt-3 h-9 rounded-xl bg-amber-300 text-slate-950 hover:bg-amber-200">
                  Tambah Produk
                </Button>
              </Link>
            </div>
          )}

          <Button variant="outline" className="h-11 w-full rounded-2xl border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white" onClick={() => onOpenChange(false)}>
            <Camera className="mr-2 h-4 w-4" />
            Tutup Scanner
          </Button>
        </div>
      </div>
    </div>
  )
}
