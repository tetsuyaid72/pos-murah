'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect')
  const emailRef = useRef<HTMLInputElement>(null)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
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

      if (redirectTo) {
        router.push(redirectTo)
      } else if (data.user?.role === 'SUPER_ADMIN') {
        router.push('/admin')
      } else {
        router.push('/dashboard')
      }
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
              placeholder="you@example.com"
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
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-rose-400 hover:text-rose-500 transition-colors"
              tabIndex={-1}
            >
              Forgot Password?
            </Link>
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
