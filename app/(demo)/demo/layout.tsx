'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { DemoSidebar } from '@/components/layout/demo-sidebar'
import { Topbar } from '@/components/layout/topbar'
import { DemoMobileNav } from '@/components/layout/demo-mobile-nav'
import { ToastProvider } from '@/components/ui/toast'
import { DemoProvider } from '@/components/demo-provider'
import { DemoBanner, DemoBadge } from '@/components/demo-banner'
import { useUIStore } from '@/stores/ui-store'
import { useStoreHydration } from '@/hooks/use-store-hydration'

function DemoLayoutInner({ children }: { children: React.ReactNode }) {
  const { isMobile } = useUIStore()
  const hydrated = useStoreHydration()
  const searchParams = useSearchParams()
  const isEmbed = searchParams.get('embed') === 'true'

  if (!hydrated) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          <p className="text-sm text-muted-foreground">Memuat demo...</p>
        </div>
      </div>
    )
  }

  // Embed mode: no sidebar, no banner, no badge — just the content
  if (isEmbed) {
    return (
      <DemoProvider>
        <ToastProvider>
          <div className="h-screen overflow-y-auto bg-background">
            {children}
          </div>
        </ToastProvider>
      </DemoProvider>
    )
  }

  return (
    <DemoProvider>
      <ToastProvider>
        <div className="flex h-screen flex-col overflow-hidden bg-background">
          {/* Demo banner at the top */}
          <DemoBanner />

          <div className="flex flex-1 overflow-hidden">
            {/* Demo Sidebar with /demo prefixed links */}
            <DemoSidebar />

            {/* Main area */}
            <div className="flex flex-1 flex-col overflow-hidden transition-all duration-300 ease-out">
              {/* Topbar */}
              <Topbar />

              {/* Main content */}
              <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
                {children}
              </main>
            </div>

            {/* Mobile bottom navigation */}
            {isMobile && <DemoMobileNav />}
          </div>

          {/* Floating demo badge */}
          <DemoBadge />
        </div>
      </ToastProvider>
    </DemoProvider>
  )
}

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
            <p className="text-sm text-muted-foreground">Memuat demo...</p>
          </div>
        </div>
      }
    >
      <DemoLayoutInner>{children}</DemoLayoutInner>
    </Suspense>
  )
}
