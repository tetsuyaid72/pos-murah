'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

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
  const router = useRouter()
  const searchParams = useSearchParams()
  const rawRedirectTo = searchParams.get('redirect')
  const redirectTo = rawRedirectTo?.startsWith('/') && !rawRedirectTo.startsWith('//')
    ? rawRedirectTo
    : null
  const oauthError = searchParams.get('error')
  const emailRef = useRef<HTMLInputElement>(null)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState(oauthError || '')
  const [loading, setLoading] = useState(false)
  const [shake, setShake] = useState(false)

  useEffect(() => {
    emailRef.current?.focus()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Terjadi kesalahan saat login')
        setShake(true)
        setTimeout(() => setShake(false), 500)
        return
      }

      const destination = redirectTo || (data.user?.role === 'SUPER_ADMIN' ? '/admin' : '/dashboard')
      router.replace(destination)
      router.refresh()
    } catch {
      setError('Tidak dapat terhubung ke server')
      setShake(true)
      setTimeout(() => setShake(false), 500)
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {/* Heading */}
      <div className="mb-10">
        <motion.h1
          className="text-2xl sm:text-3xl font-semibold text-gray-800 leading-relaxed"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Selamat datang kembali
        </motion.h1>
        <motion.p
          className="text-sm sm:text-base text-slate-500 leading-relaxed mt-2"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
        >
          Pantau penjualan, stok, dan transaksi dalam satu dashboard
        </motion.p>
      </div>

      {/* Form */}
      <div className={shake ? 'animate-shake' : ''}>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                className="rounded-xl bg-red-50 border border-red-100 px-4 py-3"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <p className="text-sm text-red-600">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
              Email
            </label>
            <input
              ref={emailRef}
              id="email"
              type="email"
              placeholder="your@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              disabled={loading}
              className="w-full h-12 px-4 rounded-xl border border-gray-300 bg-white text-[15px] text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:outline-none focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 disabled:opacity-50"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                disabled={loading}
                className="w-full h-12 px-4 pr-11 rounded-xl border border-gray-300 bg-white text-[15px] text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:outline-none focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
              </button>
            </div>
          </div>

          {/* Remember Me + Forgot Password */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-[#10B981] focus:ring-[#10B981]/20 cursor-pointer"
              />
              <span className="text-sm text-slate-600">Remember Me</span>
            </label>
            <a
              href="/forgot-password"
              className="relative z-10 text-sm font-medium text-rose-400 hover:text-rose-500 hover:underline cursor-pointer transition-colors duration-200"
            >
              Lupa Password?
            </a>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-13 rounded-xl bg-[#10B981] text-white text-[15px] font-semibold transition-all duration-200 hover:bg-[#059669] hover:shadow-lg hover:shadow-emerald-500/25 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4.5 w-4.5 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-3 text-slate-400">atau</span>
          </div>
        </div>

        {/* Google Login Button */}
        <a
          href="/api/auth/google"
          className="w-full h-12 rounded-xl border border-gray-300 bg-white text-[15px] font-medium text-slate-700 transition-all duration-200 hover:bg-gray-50 hover:border-gray-400 hover:shadow-sm active:scale-[0.98] flex items-center justify-center gap-3"
        >
          <GoogleIcon className="h-5 w-5" />
          Login dengan Google
        </a>

        {/* Footer */}
        <p className="text-center text-sm text-slate-500 mt-8">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-[#10B981] font-semibold hover:text-[#059669] transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </motion.div>
  )
}
