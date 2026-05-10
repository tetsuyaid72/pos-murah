import Link from 'next/link'
import { Store } from 'lucide-react'
import { LandingNavbar } from '@/components/landing/landing-navbar'
import { HeroSection } from '@/components/landing/hero-section'
import { StatsSection } from '@/components/landing/stats-section'
import { FeaturesSection } from '@/components/landing/features-section'
import { HowItWorksSection } from '@/components/landing/how-it-works-section'
import { PricingSection } from '@/components/landing/pricing-section'
import { CTASection } from '@/components/landing/cta-section'

export const metadata = {
  title: 'Warung Madura POS — Aplikasi Kasir Online Murah untuk UMKM Indonesia',
  description:
    'Aplikasi kasir (POS) online terbaik untuk UMKM Indonesia. Kelola transaksi, stok, dan laporan bisnis dalam satu aplikasi. Mulai gratis, tanpa ribet.',
}

const footerLinks = [
  {
    title: 'Produk',
    links: [
      { label: 'Fitur', href: '#fitur' },
      { label: 'Harga', href: '#harga' },
      { label: 'Demo', href: '/demo' },
    ],
  },
  {
    title: 'Perusahaan',
    links: [
      { label: 'Tentang Kami', href: '#' },
      { label: 'Kontak', href: '#' },
      { label: 'Kebijakan Privasi', href: '#' },
    ],
  },
  {
    title: 'Akun',
    links: [
      { label: 'Masuk', href: '/login' },
      { label: 'Daftar', href: '/register' },
    ],
  },
]

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <LandingNavbar />
      <main className="flex-1">
        <HeroSection />
        <StatsSection />
        <FeaturesSection />
        <HowItWorksSection />
        <PricingSection />
        <CTASection />
      </main>

      <footer className="border-t border-slate-100 bg-white">
        <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-12 md:py-16">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white">
                  <Store className="h-4.5 w-4.5" />
                </div>
                <span className="text-lg font-bold text-slate-900">
                  Warung Madura <span className="text-emerald-600">POS</span>
                </span>
              </div>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-500">
                Aplikasi kasir online untuk UMKM Indonesia. Mudah digunakan, harga terjangkau, dan siap pakai dari mana saja.
              </p>
            </div>

            {footerLinks.map((col) => (
              <div key={col.title}>
                <h4 className="text-sm font-semibold text-slate-900">{col.title}</h4>
                <ul className="mt-3 space-y-2.5">
                  {col.links.map((link) =>
                    link.href.startsWith('/') ? (
                      <li key={link.label}>
                        <Link
                          href={link.href}
                          className="text-sm text-slate-500 transition-colors hover:text-slate-900"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ) : (
                      <li key={link.label}>
                        <a
                          href={link.href}
                          className="text-sm text-slate-500 transition-colors hover:text-slate-900"
                        >
                          {link.label}
                        </a>
                      </li>
                    )
                  )}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-8 sm:flex-row">
            <p className="text-xs text-slate-400">
              &copy; {new Date().getFullYear()} Warung Madura POS. All rights reserved.
            </p>
            <p className="text-xs text-slate-400">
              Aplikasi kasir online terbaik untuk warung, kedai kopi, restoran, dan retail di Indonesia.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
