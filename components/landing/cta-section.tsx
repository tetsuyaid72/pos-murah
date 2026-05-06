import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function CTASection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-600 px-8 py-16 text-center sm:px-16 sm:py-20">
          {/* Background decoration */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          </div>

          <div className="relative">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Mulai Kelola Bisnis Anda Sekarang
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-emerald-100">
              Bergabung dengan ratusan UMKM yang sudah menggunakan Warung Madura POS. Gratis, tanpa kartu kredit.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/register">
                <Button
                  size="lg"
                  className="bg-white text-emerald-700 shadow-xl hover:bg-emerald-50 text-base px-8"
                >
                  Mulai Gratis Sekarang
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/demo">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white text-base px-8"
                >
                  Lihat Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
