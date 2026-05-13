'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { Store } from 'lucide-react'
import { RegisterForm } from '@/components/auth/register-form'

export default function RegisterPage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#F8FAFC] px-4 text-slate-950 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.16),rgba(248,250,252,0)_58%)]" />
        <div className="absolute left-1/2 top-28 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-200/25 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.035)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:linear-gradient(to_bottom,black,transparent_70%)]" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col">
        <header className="flex h-16 items-center justify-between gap-3 sm:h-20">
          <Link href="/" className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-[0_12px_28px_rgba(16,185,129,0.25)]">
              <Store className="h-4.5 w-4.5" />
            </div>
            <span className="truncate text-sm font-black tracking-tight text-slate-900 sm:text-base">
              Warung Madura <span className="text-emerald-600">POS</span>
            </span>
          </Link>
        </header>

        <section className="flex flex-1 items-center justify-center pb-10 pt-4 sm:pb-16 sm:pt-6">
          <Suspense fallback={null}>
            <RegisterForm />
          </Suspense>
        </section>

        <footer className="py-5 text-center text-sm text-slate-500 sm:py-6">
          Product by Hasbuna
        </footer>
      </div>
    </main>
  )
}
