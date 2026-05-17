'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUIStore } from '@/stores/ui-store'

export function Topbar() {
  const { isMobile, setSidebarOpen, setIsMobile } = useUIStore()
  const pathname = usePathname()

  // Pages that render their own mobile header with hamburger
  const hasOwnMobileHeader = [
    '/dashboard',
    '/products',
    '/hpp',
    '/transactions',
    '/reports',
    '/settings',
    '/pos',
    '/demo',
    '/demo/products',
    '/demo/transactions',
    '/demo/pos',
  ].includes(pathname)

  // Detect mobile breakpoint
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [setIsMobile])

  // Return null on desktop since we removed all desktop elements
  if (!isMobile) return null

  // Hide topbar on pages that have their own mobile header
  if (hasOwnMobileHeader) return null

  return (
    <header className="sticky top-0 z-30 flex h-[72px] items-center gap-4 border-b border-border bg-card/80 text-card-foreground backdrop-blur-xl px-4 supports-[backdrop-filter]:bg-card/75">
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
