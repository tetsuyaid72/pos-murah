'use client'

import { useEffect, useRef, useCallback } from 'react'

interface UseBarcodeScanner {
  onScan: (barcode: string) => void
  enabled?: boolean
  minLength?: number
  maxDelay?: number
}

/**
 * Hook to detect barcode scanner input.
 * Barcode scanners typically type characters very fast (< 50ms between chars)
 * and end with Enter key. This hook detects that pattern.
 */
export function useBarcodeScanner({
  onScan,
  enabled = true,
  minLength = 4,
  maxDelay = 50,
}: UseBarcodeScanner) {
  const bufferRef = useRef('')
  const lastKeyTimeRef = useRef(0)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const resetBuffer = useCallback(() => {
    bufferRef.current = ''
  }, [])

  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input/textarea (unless it's the search bar)
      const target = e.target as HTMLElement
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA'
      const isSearchBar = target.getAttribute('data-barcode-target') === 'true'

      // Allow barcode scanning even in search input marked with data-barcode-target
      if (isInput && !isSearchBar) return

      const now = Date.now()
      const timeDiff = now - lastKeyTimeRef.current
      lastKeyTimeRef.current = now

      // If too much time passed, reset buffer (user is typing normally)
      if (timeDiff > maxDelay && bufferRef.current.length > 0) {
        resetBuffer()
      }

      // Enter key = end of barcode scan
      if (e.key === 'Enter') {
        if (bufferRef.current.length >= minLength) {
          e.preventDefault()
          onScan(bufferRef.current)
        }
        resetBuffer()
        return
      }

      // Only accept printable characters
      if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        bufferRef.current += e.key

        // Auto-reset after a delay (in case Enter is never pressed)
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
        timeoutRef.current = setTimeout(() => {
          resetBuffer()
        }, 200)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [enabled, minLength, maxDelay, onScan, resetBuffer])
}
