'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}

export function RegisterForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [storeName, setStoreName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const oauthError = searchParams.get('error')
  const nextPath = getSafeNextPath(searchParams.get('next'))

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, storeName }),
      })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setError(data.error || 'Gagal mendaftar. Periksa data Anda.')
        return
      }

      router.push(nextPath === '/dashboard' ? '/pricing' : nextPath)
      router.refresh()
    } catch {
      setError('Tidak dapat terhubung ke server. Coba lagi.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.div className="w-full max-w-[420px] text-center" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}>
      <motion.h1 className="text-4xl font-black tracking-[-0.045em] text-emerald-600 dark:text-emerald-400 sm:text-5xl" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.08 }}>
        Daftar
      </motion.h1>
      <motion.p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-300 sm:text-base" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.16 }}>
        Buat akun dengan email dan password, atau lanjutkan dengan Google.
      </motion.p>

      <AnimatePresence>
        {(oauthError || error) && (
          <motion.div className="mt-7 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-left dark:border-red-500/20 dark:bg-red-500/10" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <p className="text-sm text-red-600 dark:text-red-400">{error || oauthError}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4 text-left">
        <label className="block text-sm font-semibold text-slate-800 dark:text-slate-100">
          Nama
          <input className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 dark:placeholder:text-slate-500 dark:focus:border-emerald-400 dark:focus:ring-emerald-500/20" value={name} onChange={(event) => setName(event.target.value)} placeholder="Nama Anda" required />
        </label>
        <label className="block text-sm font-semibold text-slate-800 dark:text-slate-100">
          Email
          <input className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 dark:placeholder:text-slate-500 dark:focus:border-emerald-400 dark:focus:ring-emerald-500/20" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nama@email.com" required />
        </label>
        <label className="block text-sm font-semibold text-slate-800 dark:text-slate-100">
          Password
          <input className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 dark:placeholder:text-slate-500 dark:focus:border-emerald-400 dark:focus:ring-emerald-500/20" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Minimal 6 karakter" minLength={6} required />
        </label>
        <label className="block text-sm font-semibold text-slate-800 dark:text-slate-100">
          Nama Toko
          <input className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 dark:placeholder:text-slate-500 dark:focus:border-emerald-400 dark:focus:ring-emerald-500/20" value={storeName} onChange={(event) => setStoreName(event.target.value)} placeholder="Warung Anda" required />
        </label>
        <button className="flex h-13 w-full items-center justify-center rounded-2xl bg-emerald-600 px-5 text-[15px] font-bold text-white shadow-[0_16px_38px_rgba(16,185,129,0.22)] transition hover:bg-emerald-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Memproses...' : 'Daftar dengan Email'}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
        <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800" /> atau <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
      </div>

      <a href="/api/auth/google" className="mx-auto flex h-14 w-full max-w-[420px] items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 text-[15px] font-semibold text-slate-800 shadow-[0_12px_30px_rgba(15,23,42,0.05)] transition-all duration-200 hover:border-emerald-200 hover:bg-emerald-50/70 hover:shadow-[0_16px_38px_rgba(16,185,129,0.12)] active:scale-[0.98] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:shadow-none dark:hover:border-emerald-500/40 dark:hover:bg-slate-800">
        <GoogleIcon className="h-5 w-5" />
        Masuk dengan Google
      </a>

      <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
        Sudah punya akun?{' '}
        <Link href={`/sign-in${nextPath !== '/dashboard' ? `?next=${encodeURIComponent(nextPath)}` : ''}`} className="font-semibold text-emerald-600 transition-colors hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300">
          Masuk
        </Link>
      </p>
    </motion.div>
  )
}

function getSafeNextPath(next: string | null): string {
  if (!next || !next.startsWith('/') || next.startsWith('//')) return '/pricing'
  return next
}
