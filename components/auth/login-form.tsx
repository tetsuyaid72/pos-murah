'use client'

import { FormEvent, useEffect, useState } from 'react'
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

export function LoginForm() {
  const [mounted, setMounted] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const oauthError = searchParams.get('error')
  const nextPath = getSafeNextPath(searchParams.get('next'))

  useEffect(() => {
    const timeout = window.setTimeout(() => setMounted(true), 0)
    return () => window.clearTimeout(timeout)
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setError(data.error || 'Gagal masuk. Periksa email dan password Anda.')
        return
      }

      router.push(nextPath)
      router.refresh()
    } catch {
      setError('Tidak dapat terhubung ke server. Coba lagi.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!mounted) {
    return <div className="mx-auto h-[420px] w-full max-w-md" aria-hidden="true" />
  }

  return (
    <motion.div className="mx-auto flex w-full max-w-md flex-col items-center text-center" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}>
      <motion.h1 className="text-4xl font-black tracking-[-0.045em] text-emerald-600 dark:text-emerald-400 sm:text-5xl" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.08 }}>
        Masuk
      </motion.h1>
      <motion.p className="relative -left-2 mt-4 w-full text-center text-sm leading-6 text-muted-foreground sm:-left-4 sm:whitespace-nowrap sm:text-base" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.16 }}>
        Masuk dengan email dan password, atau lanjutkan dengan Google.
      </motion.p>

      <AnimatePresence>
        {(oauthError || error) && (
          <motion.div className="mt-7 w-full rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-left dark:border-red-500/20 dark:bg-red-500/10" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <p className="text-sm text-red-600 dark:text-red-400">{error || oauthError}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="mt-8 w-full space-y-4 text-left">
        <label className="block text-sm font-semibold text-foreground">
          Email
          <input className="mt-2 h-12 w-full rounded-2xl border border-border bg-card px-4 text-sm text-card-foreground outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 dark:focus:ring-emerald-500/20" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nama@email.com" required />
        </label>
        <label className="block text-sm font-semibold text-foreground">
          Password
          <input className="mt-2 h-12 w-full rounded-2xl border border-border bg-card px-4 text-sm text-card-foreground outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 dark:focus:ring-emerald-500/20" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Minimal 6 karakter" required />
        </label>
        <button className="flex h-13 w-full items-center justify-center rounded-2xl bg-emerald-600 px-5 text-[15px] font-bold text-white shadow-[0_16px_38px_rgba(16,185,129,0.22)] transition hover:bg-emerald-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Memproses...' : 'Masuk dengan Email'}
        </button>
      </form>

      <div className="my-6 flex w-full items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        <span className="h-px flex-1 bg-border" /> atau <span className="h-px flex-1 bg-border" />
      </div>

      <a href="/api/auth/google" className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl border border-border bg-card px-5 text-[15px] font-semibold text-card-foreground shadow-[0_12px_30px_rgba(15,23,42,0.05)] transition-all duration-200 hover:border-emerald-200 hover:bg-emerald-50/70 hover:shadow-[0_16px_38px_rgba(16,185,129,0.12)] active:scale-[0.98] dark:shadow-none dark:hover:border-emerald-500/40 dark:hover:bg-slate-800">
        <GoogleIcon className="h-5 w-5" />
        Masuk dengan Google
      </a>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Belum punya akun?{' '}
        <Link href={`/register${nextPath !== '/dashboard' ? `?next=${encodeURIComponent(nextPath)}` : ''}`} className="font-semibold text-emerald-600 transition-colors hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300">
          Daftar
        </Link>
      </p>
    </motion.div>
  )
}

function getSafeNextPath(next: string | null): string {
  if (!next || !next.startsWith('/') || next.startsWith('//')) return '/dashboard'
  return next
}
