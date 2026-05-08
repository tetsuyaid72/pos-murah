'use client'

import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { AdminTopbar } from '@/components/admin/admin-topbar'
import { ToastProvider } from '@/components/ui/toast'

/**
 * Admin Layout
 *
 * Auth guard dilakukan di proxy.ts (middleware) — hanya SUPER_ADMIN
 * yang bisa mengakses /admin/*. Tidak perlu client-side auth check.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ToastProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        <AdminSidebar />
        <div className="flex flex-1 flex-col overflow-hidden transition-all duration-300 ease-out">
          <AdminTopbar />
          <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  )
}
