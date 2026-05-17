'use client'

import { Suspense } from 'react'
import { RegisterForm } from '@/components/auth/register-form'
import { PublicHeader } from '@/components/public-header'

export default function RegisterPage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#F8FAFC] px-4 text-slate-950 dark:bg-slate-950 dark:text-slate-50 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.16),rgba(248,250,252,0)_58%)] dark:bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.16),rgba(15,23,42,0)_58%)]" />
        <div className="absolute left-1/2 top-28 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-200/25 blur-3xl dark:bg-emerald-500/10" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.035)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:linear-gradient(to_bottom,black,transparent_70%)] dark:bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)]" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col">
        <PublicHeader authHref="/login" authLabel="Masuk" />

        <section className="flex flex-1 items-center justify-center pb-10 pt-4 sm:pb-16 sm:pt-6">
          <Suspense fallback={null}>
            <RegisterForm />
          </Suspense>
        </section>

        <footer className="py-5 text-center text-sm text-slate-500 dark:text-slate-400 sm:py-6">
          Product by Hasbuna
        </footer>
      </div>
    </main>
  )
}
