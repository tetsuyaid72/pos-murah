import type { Metadata } from 'next'
import Link from 'next/link'
import { Store } from 'lucide-react'
import { LandingNavbar } from '@/components/landing/landing-navbar'

export const metadata: Metadata = {
  title: 'Warung Madura POS — Aplikasi Kasir Online Murah untuk UMKM Indonesia',
  description:
    'Aplikasi kasir (POS) online terbaik untuk UMKM Indonesia. Kelola transaksi, stok, dan laporan bisnis dalam satu aplikasi. Mulai gratis, tanpa ribet.',
  keywords: [
    'aplikasi kasir',
    'POS UMKM',
    'kasir online murah',
    'aplikasi kasir online',
    'point of sale indonesia',
    'kasir digital',
    'aplikasi toko',
    'software kasir',
  ],
  openGraph: {
    title: 'Warung Madura POS — Aplikasi Kasir Online untuk UMKM',
    description: 'Kelola transaksi, stok, dan laporan bisnis dalam satu aplikasi kasir online. Mulai gratis.',
    type: 'website',
  },
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

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <LandingNavbar />
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
            {/* Brand column */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white">
                  <Store className="h-4.5 w-4.5" />
                </div>
                <span className="text-lg font-bold text-foreground">
                  Warung Madura <span className="gradient-text">POS</span>
                </span>
              </div>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
                Aplikasi kasir online untuk UMKM Indonesia. Mudah digunakan, harga terjangkau, dan siap pakai dari mana saja.
              </p>
            </div>

            {/* Link columns */}
            {footerLinks.map((col) => (
              <div key={col.title}>
                <h4 className="text-sm font-semibold text-foreground">{col.title}</h4>
                <ul className="mt-3 space-y-2.5">
                  {col.links.map((link) =>
                    link.href.startsWith('/') ? (
                      <li key={link.label}>
                        <Link
                          href={link.href}
                          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ) : (
                      <li key={link.label}>
                        <a
                          href={link.href}
                          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
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

          {/* Bottom */}
          <div className="mt-12 border-t border-border/50 pt-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} Warung Madura POS. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground">
              Aplikasi kasir online terbaik untuk warung, kedai kopi, restoran, dan retail di Indonesia.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
