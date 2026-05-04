'use client'

import { useEffect } from 'react'

interface ShortcutConfig {
  key: string
  ctrlKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  action: () => void
  enabled?: boolean
}

/**
 * Hook to register keyboard shortcuts.
 * Automatically ignores shortcuts when user is typing in inputs.
 */
export function useKeyboardShortcut(shortcuts: ShortcutConfig[]) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore when typing in inputs (unless it's a function key)
      const target = e.target as HTMLElement
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA'
      const isFunctionKey = e.key.startsWith('F') && e.key.length <= 3

      if (isInput && !isFunctionKey) return

      for (const shortcut of shortcuts) {
        if (shortcut.enabled === false) continue

        const keyMatch = e.key === shortcut.key
        const ctrlMatch = !!shortcut.ctrlKey === e.ctrlKey
        const shiftMatch = !!shortcut.shiftKey === e.shiftKey
        const altMatch = !!shortcut.altKey === e.altKey

        if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
          e.preventDefault()
          shortcut.action()
          return
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [shortcuts])
}
