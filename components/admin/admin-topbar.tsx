'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'
import { useUIStore } from '@/stores/ui-store'
import { Button } from '@/components/ui/button'

const BREADCRUMB_MAP: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/users': 'Manajemen User',
  '/admin/stores': 'Manajemen Toko',
  '/admin/memberships': 'Manajemen Membership',
  '/admin/activity': 'Activity Log',
  '/admin/payments': 'Manajemen Pembayaran',
  '/admin/settings': 'Settings',
}

export function AdminTopbar() {
  const pathname = usePathname()
  const { setSidebarOpen, setIsMobile, isMobile } = useUIStore()

  const title = BREADCRUMB_MAP[pathname] || 'Admin'

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [setIsMobile])

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border/50 bg-card/80 px-4 backdrop-blur-xl sm:px-6">
      {isMobile && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSidebarOpen(true)}
          className="shrink-0"
        >
          <Menu className="h-5 w-5" />
        </Button>
      )}
      <div className="flex items-center gap-2">
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
      </div>
    </header>
  )
}
