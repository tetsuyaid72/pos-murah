'use client'

import { useEffect } from 'react'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUIStore } from '@/stores/ui-store'

export function Topbar() {
  const { theme, isMobile, setSidebarOpen, setIsMobile } = useUIStore()

  // Detect mobile breakpoint
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [setIsMobile])

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement

    if (theme === 'system') {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.classList.toggle('dark', systemDark)
    } else {
      root.classList.toggle('dark', theme === 'dark')
    }
  }, [theme])

  // Return null on desktop since we removed all desktop elements
  if (!isMobile) return null

  return (
    <header className="sticky top-0 z-30 flex h-[72px] items-center gap-4 border-b border-border/50 bg-card/80 backdrop-blur-xl px-4">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setSidebarOpen(true)}
        aria-label="Buka menu"
        className="rounded-xl"
      >
        <Menu className="h-5 w-5" />
      </Button>
    </header>
  )
}
