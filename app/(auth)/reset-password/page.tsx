'use client'

import { useState, useRef, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Loader2, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react'

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const passwordRef = useRef<HTMLInputElement>(null)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    passwordRef.current?.focus()
  }, [])

  // If no token in URL, show error
  if (!token) {
    return (
      <motion.div
        className="text-center"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 rounded-full bg-red-50 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-3">
          Link Tidak Valid
        </h2>
        <p className="text-sm text-slate-500 leading-relaxed mb-8">
          Link reset password tidak valid atau sudah kedaluwarsa. Silakan request ulang.
        </p>
        <Link
          href="/forgot-password"
          className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-[#10B981] text-white text-[15px] font-semibold transition-all duration-200 hover:bg-[#059669] hover:shadow-lg hover:shadow-emerald-500/25 active:scale-[0.98]"
        >
          Request Reset Ulang
        </Link>
      </motion.div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Password dan konfirmasi password tidak cocok')
      return
    }

    if (password.length < 6) {
      setError('Password minimal 6 karakter')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Terjadi kesalahan. Silakan coba lagi.')
        return
      }

      setSuccess(true)
    } catch {
      setError('Tidak dapat terhubung ke server')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <motion.div
        className="text-center"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 rounded-full bg-emerald-50 flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-[#10B981]" />
          </div>
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-3">
          Password Berhasil Direset!
        </h2>
        <p className="text-sm text-slate-500 leading-relaxed mb-8">
          Password Anda telah berhasil diperbarui. Silakan login dengan password baru Anda.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-[#10B981] text-white text-[15px] font-semibold transition-all duration-200 hover:bg-[#059669] hover:shadow-lg hover:shadow-emerald-500/25 active:scale-[0.98]"
        >
          Login Sekarang
        </Link>
      </motion.div>
    )
  }

  return (
    <>
      {/* Heading */}
      <div className="mb-10">
        <motion.h1
          className="text-2xl sm:text-3xl font-semibold text-gray-800 leading-relaxed"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Buat Password Baru
        </motion.h1>
        <motion.p
          className="text-sm sm:text-base text-slate-500 leading-relaxed mt-2"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
        >
          Masukkan password baru untuk akun Anda.
        </motion.p>
      </div>

      {/* Form */}
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

        {/* New Password */}
        <div>
          <label htmlFor="password" className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
            Password Baru
          </label>
          <div className="relative">
            <input
              ref={passwordRef}
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Minimal 6 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
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

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
            Konfirmasi Password
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Ulangi password baru"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
              disabled={loading}
              className="w-full h-12 px-4 pr-11 rounded-xl border border-gray-300 bg-white text-[15px] text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:outline-none focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              tabIndex={-1}
            >
              {showConfirmPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
            </button>
          </div>
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
              Menyimpan...
            </>
          ) : (
            'Reset Password'
          )}
        </button>
      </form>

      {/* Footer */}
      <p className="text-center text-sm text-slate-500 mt-8">
        Ingat password Anda?{' '}
        <Link href="/login" className="text-[#10B981] font-semibold hover:text-[#059669] transition-colors">
          Login
        </Link>
      </p>
    </>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <motion.div
        className="w-full max-w-[440px]"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {/* Back link */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
        >
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Login
          </Link>
        </motion.div>

        <Suspense fallback={null}>
          <ResetPasswordForm />
        </Suspense>
      </motion.div>
    </div>
  )
}
