import type { Metadata } from 'next'
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

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      <LandingNavbar />
      <main className="flex-1">{children}</main>

      <footer className="border-t border-slate-200 bg-white/80">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-center text-sm text-slate-500 sm:flex-row sm:px-6 sm:text-left">
          <p>Product by Hasbuna</p>
          <p className="text-xs">Warung Madura POS</p>
        </div>
      </footer>
    </div>
  )
}
