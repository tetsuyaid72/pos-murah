import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function CTASection() {
  return (
    <section className="bg-white py-14 sm:py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-600 px-6 py-12 text-center sm:rounded-3xl sm:px-12 sm:py-16 md:px-16 md:py-20">
          {/* Background decoration */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-3xl sm:-right-24 sm:-top-24 sm:h-64 sm:w-64" />
            <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-white/10 blur-3xl sm:-bottom-24 sm:-left-24 sm:h-64 sm:w-64" />
          </div>

          <div className="relative">
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl">
              Mulai Kelola Bisnis Anda Sekarang
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-emerald-100 sm:mt-4 sm:text-base md:text-lg">
              Bergabung dengan ratusan UMKM yang sudah menggunakan Warung Madura POS. Gratis, tanpa kartu kredit.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:mt-8 sm:flex-row sm:gap-4">
              <Link href="/register" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full bg-white px-8 text-sm text-emerald-700 shadow-xl hover:bg-emerald-50 sm:w-auto sm:text-base"
                >
                  Mulai Gratis Sekarang
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/demo" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full border-white/30 bg-white/10 px-8 text-sm text-white hover:bg-white/20 hover:text-white sm:w-auto sm:text-base"
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
