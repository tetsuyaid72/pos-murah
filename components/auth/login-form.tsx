'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

export function LoginForm() {
  const searchParams = useSearchParams()
  const oauthError = searchParams.get('error')

  return (
    <motion.div
      className="w-full max-w-[420px] text-center"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <motion.h1
        className="text-4xl font-black tracking-[-0.045em] text-slate-950 sm:text-5xl"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.08 }}
      >
        Masuk
      </motion.h1>
      <motion.p
        className="mx-auto mt-4 max-w-sm text-sm leading-6 text-slate-500 sm:text-base"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.16 }}
      >
        Gunakan akun Google untuk masuk atau daftar otomatis
      </motion.p>

      <AnimatePresence>
        {oauthError && (
          <motion.div
            className="mt-7 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-left"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <p className="text-sm text-red-600">{oauthError}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <a
        href="/api/auth/google"
        className="mx-auto mt-8 flex h-14 w-full max-w-[420px] items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 text-[15px] font-semibold text-slate-800 shadow-[0_12px_30px_rgba(15,23,42,0.05)] transition-all duration-200 hover:border-emerald-200 hover:bg-emerald-50/70 hover:shadow-[0_16px_38px_rgba(16,185,129,0.12)] active:scale-[0.98]"
      >
        <GoogleIcon className="h-5 w-5" />
        Masuk dengan Google
      </a>

      <p className="mt-6 text-center text-sm text-slate-500">
        Belum punya akun?{' '}
        <Link href="/register" className="font-semibold text-emerald-600 transition-colors hover:text-emerald-700">
          Daftar
        </Link>
      </p>
    </motion.div>
  )
}
