'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Loader2, Check, X } from 'lucide-react'

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

function getPasswordStrength(password: string): { level: 'weak' | 'medium' | 'strong'; score: number } {
  if (!password) return { level: 'weak', score: 0 }
  let score = 0
  if (password.length >= 6) score++
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  if (score <= 2) return { level: 'weak', score }
  if (score <= 3) return { level: 'medium', score }
  return { level: 'strong', score }
}

const strengthConfig = {
  weak: { label: 'Weak', color: 'bg-red-400', textColor: 'text-red-500', width: 'w-1/3' },
  medium: { label: 'Medium', color: 'bg-amber-400', textColor: 'text-amber-500', width: 'w-2/3' },
  strong: { label: 'Strong', color: 'bg-emerald-500', textColor: 'text-emerald-600', width: 'w-full' },
}

export function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect')
  const nameRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [shake, setShake] = useState(false)
  const [touched, setTouched] = useState({ email: false, password: false, confirmPassword: false })

  useEffect(() => {
    nameRef.current?.focus()
  }, [])

  const passwordStrength = useMemo(() => getPasswordStrength(password), [password])

  const isEmailValid = useMemo(() => {
    if (!email) return true
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }, [email])

  const passwordsMatch = useMemo(() => {
    if (!confirmPassword) return true
    return password === confirmPassword
  }, [password, confirmPassword])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('Password minimal 6 karakter')
      setShake(true)
      setTimeout(() => setShake(false), 500)
      return
    }

    if (password !== confirmPassword) {
      setError('Password tidak cocok')
      setShake(true)
      setTimeout(() => setShake(false), 500)
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, storeName: name }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Terjadi kesalahan saat mendaftar')
        setShake(true)
        setTimeout(() => setShake(false), 500)
        return
      }

      router.push(redirectTo || '/upgrade')
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
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 leading-tight">
          Create Account
        </h1>
        <p className="text-slate-500 text-sm mt-2">
          Daftar untuk mulai mengelola bisnis Anda
        </p>
      </div>

      {/* Form */}
      <div className={shake ? 'animate-shake' : ''}>
        <form onSubmit={handleSubmit} className="space-y-4">
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

          {/* Name - Full width */}
          <div>
            <label htmlFor="reg-name" className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
              Nama Lengkap
            </label>
            <input
              ref={nameRef}
              id="reg-name"
              type="text"
              placeholder="Pak De"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
              disabled={loading}
              className="w-full h-12 px-4 rounded-xl border border-gray-300 bg-white text-[15px] text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:outline-none focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 disabled:opacity-50"
            />
          </div>

          {/* Email - Full width with validation */}
          <div>
            <label htmlFor="reg-email" className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
              Email
            </label>
            <div className="relative">
              <input
                id="reg-email"
                type="email"
                placeholder="your@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched(t => ({ ...t, email: true }))}
                required
                autoComplete="email"
                disabled={loading}
                className={`w-full h-12 px-4 pr-10 rounded-xl border bg-white text-[15px] text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:outline-none focus:ring-2 disabled:opacity-50 ${
                  touched.email && !isEmailValid
                    ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                    : touched.email && email && isEmailValid
                    ? 'border-emerald-300 focus:border-[#10B981] focus:ring-[#10B981]/20'
                    : 'border-gray-300 focus:border-[#10B981] focus:ring-[#10B981]/20'
                }`}
              />
              {touched.email && email && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2">
                  {isEmailValid ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <X className="w-4 h-4 text-red-400" />
                  )}
                </span>
              )}
            </div>
            {touched.email && !isEmailValid && email && (
              <p className="text-xs text-red-500 mt-1.5">Format email tidak valid</p>
            )}
          </div>

          {/* Password Row - 2 columns on desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Password */}
            <div>
              <label htmlFor="reg-password" className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 6 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setTouched(t => ({ ...t, password: true }))}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  disabled={loading}
                  className="w-full h-12 px-4 pr-10 rounded-xl border border-gray-300 bg-white text-[15px] text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:outline-none focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="reg-confirm" className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                Konfirmasi
              </label>
              <div className="relative">
                <input
                  id="reg-confirm"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Ulangi password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onBlur={() => setTouched(t => ({ ...t, confirmPassword: true }))}
                  required
                  autoComplete="new-password"
                  disabled={loading}
                  className={`w-full h-12 px-4 pr-10 rounded-xl border bg-white text-[15px] text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:outline-none focus:ring-2 disabled:opacity-50 ${
                    touched.confirmPassword && !passwordsMatch
                      ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                      : touched.confirmPassword && confirmPassword && passwordsMatch
                      ? 'border-emerald-300 focus:border-[#10B981] focus:ring-[#10B981]/20'
                      : 'border-gray-300 focus:border-[#10B981] focus:ring-[#10B981]/20'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {touched.confirmPassword && !passwordsMatch && confirmPassword && (
                <p className="text-xs text-red-500 mt-1.5">Password tidak cocok</p>
              )}
            </div>
          </div>

          {/* Password Strength Indicator */}
          {password && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.2 }}
              className="pt-1"
            >
              <div className="flex items-center gap-3">
                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${strengthConfig[passwordStrength.level].color}`}
                    initial={{ width: 0 }}
                    animate={{ width: passwordStrength.level === 'weak' ? '33%' : passwordStrength.level === 'medium' ? '66%' : '100%' }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <span className={`text-xs font-medium ${strengthConfig[passwordStrength.level].textColor}`}>
                  {strengthConfig[passwordStrength.level].label}
                </span>
              </div>
            </motion.div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-13 rounded-xl bg-[#10B981] text-white text-[15px] font-semibold transition-all duration-200 hover:bg-[#059669] hover:shadow-lg hover:shadow-emerald-500/25 hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 mt-3"
          >
            {loading ? (
              <>
                <Loader2 className="h-4.5 w-4.5 animate-spin" />
                Membuat akun...
              </>
            ) : (
              'Buat Akun'
            )}
          </button>

          {/* Microcopy */}
          <p className="text-center text-xs text-slate-400 mt-2">
            Daftar dan pilih paket yang sesuai untuk bisnis Anda.
          </p>
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

        {/* Google Register Button */}
        <a
          href="/api/auth/google"
          className="w-full h-12 rounded-xl border border-gray-300 bg-white text-[15px] font-medium text-slate-700 transition-all duration-200 hover:bg-gray-50 hover:border-gray-400 hover:shadow-sm active:scale-[0.98] flex items-center justify-center gap-3"
        >
          <GoogleIcon className="h-5 w-5" />
          Daftar dengan Google
        </a>

        {/* Footer - Switch to Login */}
        <p className="text-center text-sm text-slate-500 mt-8">
          Sudah punya akun?{' '}
          <Link
            href={redirectTo ? `/login?redirect=${encodeURIComponent(redirectTo)}` : '/login'}
            className="text-[#10B981] font-semibold hover:text-[#059669] transition-colors"
          >
            Masuk
          </Link>
        </p>
      </div>
    </motion.div>
  )
}
