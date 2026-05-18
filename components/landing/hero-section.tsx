import type { CSSProperties } from 'react'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

const trustPoints = ['Mudah digunakan', 'Data aman', 'Bisa dipakai dari HP']

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">

      {/* ══════════════════════════════════════════
          LAYER 0 — Ambient background
          Dominan putih, hint hijau sangat halus
          ══════════════════════════════════════════ */}
      <div className="pointer-events-none absolute inset-0">
        {/* Base — putih bersih dengan hint hijau sangat subtle */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #f8fffb 45%, #f3fff8 100%)' }} />

        {/* Ambient glow — center-right, sangat soft */}
        <div className="absolute right-[-5%] top-[10%] h-[48rem] w-[48rem] rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.05)_0%,rgba(167,243,208,0.06)_35%,transparent_70%)] blur-[100px]" />

        {/* Secondary glow — lower-right */}
        <div className="absolute -bottom-20 right-[10%] h-[32rem] w-[32rem] rounded-full bg-[radial-gradient(circle,rgba(110,231,183,0.04)_0%,transparent_70%)] blur-[80px]" />

        {/* Dot pattern — sangat tipis */}
        <div
          className="absolute right-[12%] top-[20%] h-52 w-52 opacity-[0.02]"
          style={{ backgroundImage: 'radial-gradient(circle, #065f46 1.2px, transparent 1.2px)', backgroundSize: '22px 22px' }}
        />
      </div>

      {/* ══════════════════════════════════════════
          MAIN GRID — 2 kolom, vertical center
          ══════════════════════════════════════════ */}
      <div className="relative mx-auto grid max-w-7xl items-center px-5 pb-12 pt-24 sm:px-6 sm:pb-20 sm:pt-28 md:pb-24 md:pt-32 lg:min-h-[calc(100vh-4rem)] lg:grid-cols-[1fr_1.1fr] lg:gap-12 lg:px-8 lg:pb-0 lg:pt-0 xl:gap-16">

        {/* ════ KOLOM KIRI: Copywriting ════ */}
        <div className="relative z-10 max-w-[540px]">

          {/* Badge */}
          <span className="inline-flex items-center gap-2.5 rounded-full border border-emerald-200/70 bg-white/80 px-4 py-2 text-[13px] font-semibold tracking-wide text-emerald-700 shadow-[0_2px_8px_rgba(16,185,129,0.06)] backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            POS untuk Warung & UMKM
          </span>

          {/* Headline */}
          <h1 className="mt-6 text-[1.75rem] font-extrabold leading-[1.12] tracking-tight text-slate-900 sm:mt-8 sm:text-[2.25rem] md:text-[2.75rem] lg:text-[3.25rem] xl:text-[3.5rem]">
            Kelola Warung{' '}
            <span className="relative inline-block text-emerald-600">
              Lebih Rapi
              <svg className="absolute -bottom-1.5 left-0 w-full" viewBox="0 0 200 8" fill="none" aria-hidden="true">
                <path d="M2 6C50 2 150 2 198 6" stroke="rgba(16,185,129,0.35)" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </span>{' '}
            dalam Satu Aplikasi
          </h1>

          {/* Subheadline */}
          <p className="mt-4 max-w-[480px] text-[14px] leading-[1.65] text-slate-500 sm:mt-6 sm:text-[15.5px] sm:leading-[1.7]">
            Catat penjualan, pantau stok, kelola kasir, dan lihat laporan harian
            tanpa ribet.
          </p>

          {/* CTA Buttons */}
          <div className="mt-7 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:items-center">
            <Link href="/register" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="h-12 w-full rounded-2xl bg-emerald-600 px-8 text-[14px] font-semibold text-white shadow-[0_14px_36px_rgba(16,185,129,0.28)] transition-all hover:bg-emerald-700 hover:shadow-[0_18px_44px_rgba(16,185,129,0.34)] active:scale-[0.98] sm:h-[52px] sm:w-auto sm:text-[15px]"
              >
                Coba Gratis
              </Button>
            </Link>
            <Link href="/demo" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="h-12 w-full rounded-2xl border-slate-200/80 bg-white/90 px-8 text-[14px] font-semibold text-slate-800 shadow-[0_2px_10px_rgba(15,23,42,0.04)] backdrop-blur-sm transition-all hover:border-emerald-300 hover:bg-emerald-50/50 hover:shadow-[0_4px_16px_rgba(15,23,42,0.06)] sm:h-[52px] sm:w-auto sm:text-[15px]"
              >
                Lihat Demo
              </Button>
            </Link>
          </div>

          {/* Trust Points */}
          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2.5 sm:mt-9 sm:gap-x-6 sm:gap-y-3">
            {trustPoints.map((p) => (
              <span key={p} className="inline-flex items-center gap-1.5 text-[12px] font-medium text-slate-500 sm:gap-2 sm:text-sm">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100/80">
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                </span>
                {p}
              </span>
            ))}
          </div>
        </div>

        {/* ════ KOLOM KANAN: Hero Visual ════ */}
        <div className="relative mt-8 flex items-end justify-center sm:mt-12 md:mt-14 lg:mt-0 lg:justify-end">

          {/* Glow utama — radial besar di belakang karakter */}
          <div className="pointer-events-none absolute left-1/2 top-[45%] -translate-x-1/2 -translate-y-1/2">
            <div
              className="h-[26rem] w-[26rem] rounded-full blur-[100px] sm:h-[32rem] sm:w-[32rem] lg:h-[38rem] lg:w-[38rem]"
              style={{ background: 'radial-gradient(circle at center, rgba(243,255,247,0.7) 0%, rgba(16,185,129,0.04) 50%, transparent 80%)' }}
            />
          </div>

          {/* Glow bawah — grounding halus di bawah meja */}
          <div className="pointer-events-none absolute bottom-[0%] left-1/2 -translate-x-1/2">
            <div className="h-[6rem] w-[24rem] rounded-full bg-[radial-gradient(ellipse,rgba(16,185,129,0.03)_0%,transparent_80%)] blur-[40px] sm:h-[8rem] sm:w-[32rem]" />
          </div>

          {/* Dot pattern kanan — sangat subtle */}
          <div
            className="pointer-events-none absolute right-[5%] top-[15%] hidden h-36 w-36 opacity-[0.018] lg:block"
            style={{ backgroundImage: 'radial-gradient(circle, #065f46 1px, transparent 1px)', backgroundSize: '20px 20px' }}
          />

          {/* Image container */}
          <div className="relative z-10 mx-auto w-full max-w-[360px] sm:max-w-[440px] md:max-w-[540px] lg:mx-0 lg:max-w-[620px]">

            {/* Hero image */}
            <div className="relative aspect-[1330/1183] w-full">
              {/* Mobile/tablet: fade kiri-kanan + atas-bawah */}
              <img
                src="/myhero.png"
                alt="Pemilik Warung Madura dengan apron hijau Warung Madura POS berdiri di belakang perangkat kasir modern"
                className="absolute inset-0 z-10 h-full w-full object-contain lg:hidden"
                width={1330}
                height={1183}
                loading="eager"
                style={{
                  maskImage: [
                    'linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)',
                    'linear-gradient(to bottom, transparent 0%, black 6%, black 92%, transparent 100%)',
                  ].join(', '),
                  WebkitMaskImage: [
                    'linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)',
                    'linear-gradient(to bottom, transparent 0%, black 6%, black 92%, transparent 100%)',
                  ].join(', '),
                  maskComposite: 'intersect',
                  WebkitMaskComposite: 'source-in' as CSSProperties['maskComposite'],
                }}
              />
              {/* Desktop: radial ellipse mask */}
              <img
                src="/myhero.png"
                alt="Pemilik Warung Madura dengan apron hijau Warung Madura POS berdiri di belakang perangkat kasir modern"
                className="absolute inset-0 z-10 hidden h-full w-full object-contain lg:block"
                width={1330}
                height={1183}
                loading="eager"
                style={{
                  maskImage: 'radial-gradient(ellipse 88% 82% at 50% 46%, black 50%, transparent 100%)',
                  WebkitMaskImage: 'radial-gradient(ellipse 88% 82% at 50% 46%, black 50%, transparent 100%)',
                }}
              />
            </div>

            {/* Shadow bawah meja */}
            <div className="pointer-events-none absolute -bottom-2 left-[10%] right-[10%] z-[5] h-6 rounded-[50%] bg-gradient-to-b from-black/[0.03] to-transparent blur-md" />

            {/* Tagline */}
            <p className="pointer-events-none mt-2 text-center text-[11px] font-medium tracking-wide text-slate-400 sm:text-xs">
              Warung Lebih Rapi, Usaha Makin Berkembang
            </p>

          </div>
        </div>
      </div>
    </section>
  )
}
