'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/components/theme-provider'
import { Button } from '@/components/ui/button'
import { useUIStore } from '@/stores/ui-store'

export function ThemeToggleButton() {
  const { resolvedTheme, setTheme: applyTheme } = useTheme()
  const { setTheme } = useUIStore()
  const isDark = resolvedTheme === 'dark'

  const toggleTheme = () => {
    const nextTheme = isDark ? 'light' : 'dark'
    setTheme(nextTheme)
    applyTheme(nextTheme)
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={isDark ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'}
      className="flex h-10 w-10 items-center justify-center rounded-full bg-transparent text-slate-700 shadow-none transition-colors hover:bg-slate-100 hover:text-emerald-600 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-emerald-400"
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  )
}
