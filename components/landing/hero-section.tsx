'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function HeroSection() {
  const [iframeLoaded, setIframeLoaded] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Trigger fade-in after mount
    const timer = setTimeout(() => setVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <section className="relative overflow-hidden pt-28 pb-20 sm:pt-36 sm:pb-28">
      {/* Subtle background gradient */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-emerald-50/50 via-transparent to-transparent dark:from-emerald-950/20" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        {/* Text content — centered */}
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Tanpa ribet, siap pakai
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Kelola Warung Anda{' '}
            <span className="gradient-text">Lebih Mudah</span>{' '}
            dalam 1 Aplikasi
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
            Aplikasi kasir online yang membantu UMKM mencatat transaksi, mengontrol stok, dan melihat laporan bisnis — langsung dari HP atau laptop.
          </p>

          {/* CTA buttons */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/register">
              <Button variant="premium" size="lg" className="text-base px-8">
                Coba Gratis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/demo">
              <Button variant="outline" size="lg" className="text-base px-8">
                <Play className="mr-2 h-4 w-4" />
                Lihat Demo
              </Button>
            </Link>
          </div>
        </div>

        {/* App Preview — Premium Browser Mockup */}
        <div
          className={cn(
            'mt-16 sm:mt-20 transition-all duration-1000 ease-out',
            visible
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-8'
          )}
        >
          <div className="relative mx-auto max-w-4xl">
            {/* Blurred background glow */}
            <div className="pointer-events-none absolute -inset-8 -z-10 rounded-3xl bg-gradient-to-br from-emerald-400/20 via-emerald-500/10 to-teal-400/20 blur-3xl" />

            {/* Floating animation wrapper */}
            <div className="animate-float">
              {/* Browser chrome frame */}
              <div className="overflow-hidden rounded-2xl border border-border/40 bg-card shadow-2xl shadow-emerald-900/10 dark:shadow-black/30">
                {/* Title bar */}
                <div className="flex items-center gap-3 border-b border-border/40 bg-muted/60 px-4 py-3">
                  <div className="flex gap-2">
                    <div className="h-3 w-3 rounded-full bg-[#FF5F57]" />
                    <div className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
                    <div className="h-3 w-3 rounded-full bg-[#28C840]" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="flex items-center gap-2 rounded-lg bg-background/80 border border-border/50 px-4 py-1.5 text-xs text-muted-foreground">
                      <svg className="h-3 w-3 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                      app.warungmadura.com/dashboard
                    </div>
                  </div>
                  <div className="w-[52px]" /> {/* Spacer for symmetry */}
                </div>

                {/* Iframe container — cropped to show key area */}
                <div className="relative h-[320px] sm:h-[400px] lg:h-[460px] w-full overflow-hidden bg-background">
                  {/* Loading skeleton */}
                  {!iframeLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-muted/30">
                      <div className="flex flex-col items-center gap-3">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
                        <span className="text-sm text-muted-foreground">Memuat preview...</span>
                      </div>
                    </div>
                  )}

                  <iframe
                    src="/demo?embed=true"
                    title="Warung Madura POS — Live Preview Aplikasi Kasir"
                    className={cn(
                      'absolute top-0 left-0 border-0 transition-opacity duration-700',
                      iframeLoaded ? 'opacity-100' : 'opacity-0'
                    )}
                    loading="lazy"
                    sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                    onLoad={() => setIframeLoaded(true)}
                    style={{
                      transform: 'scale(0.65)',
                      transformOrigin: 'top left',
                      width: '153.85%',   // 1/0.65
                      height: '153.85%',
                    }}
                  />

                  {/* Bottom fade overlay — hides the cut-off */}
                  <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent" />
                </div>
              </div>

              {/* Overlay badge — value text */}
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 z-10">
                <div className="flex items-center gap-2 rounded-full border border-border/50 bg-card px-5 py-2.5 shadow-lg">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-sm font-medium text-foreground">
                    Pantau penjualan secara real-time
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
