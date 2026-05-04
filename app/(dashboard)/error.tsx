'use client'

import { useEffect } from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Dashboard error:', error)
  }, [error])

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-50 dark:bg-rose-500/10">
        <AlertTriangle className="h-9 w-9 text-rose-500" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-foreground">Terjadi Kesalahan</h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-sm">
          Maaf, terjadi kesalahan saat memuat halaman ini. Silakan coba lagi.
        </p>
      </div>
      <Button onClick={reset} variant="outline" className="rounded-xl">
        <RotateCcw className="mr-2 h-4 w-4" />
        Coba Lagi
      </Button>
    </div>
  )
}
