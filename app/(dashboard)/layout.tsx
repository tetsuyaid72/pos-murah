'use client'

import { Sidebar } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'
import { MobileNav } from '@/components/layout/mobile-nav'
import { ToastProvider } from '@/components/ui/toast'
import { AuthProvider } from '@/components/auth-provider'
import { useUIStore } from '@/stores/ui-store'
import { useStoreHydration } from '@/hooks/use-store-hydration'
import { cn } from '@/lib/utils'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { sidebarCollapsed, isMobile } = useUIStore()
  const hydrated = useStoreHydration()

  if (!hydrated) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          <p className="text-sm text-muted-foreground">Memuat...</p>
        </div>
      </div>
    )
  }

  return (
    <AuthProvider>
      <ToastProvider>
        <div className="flex h-screen overflow-hidden bg-background">
          {/* Sidebar */}
          <Sidebar />

          {/* Main area */}
          <div
            className={cn(
              'flex flex-1 flex-col overflow-hidden transition-all duration-300 ease-out',
            )}
          >
            {/* Topbar */}
            <Topbar />

            {/* Main content */}
            <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
              {children}
            </main>
          </div>

          {/* Mobile bottom navigation */}
          {isMobile && <MobileNav />}
        </div>
      </ToastProvider>
    </AuthProvider>
  )
}
