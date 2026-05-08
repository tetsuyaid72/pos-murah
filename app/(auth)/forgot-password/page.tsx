'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Loader2, Mail, CheckCircle2 } from 'lucide-react'
import CloudflareTurnstile from '@/components/cloudflare-turnstile'

export default function ForgotPasswordPage() {
  const emailRef = useRef<HTMLInputElement>(null)
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [devResetUrl, setDevResetUrl] = useState('')
  const [turnstileToken, setTurnstileToken] = useState('')

  useEffect(() => {
    emailRef.current?.focus()
  }, [])

  const handleTurnstileVerify = useCallback((token: string) => {
    setTurnstileToken(token)
  }, [])

  const handleTurnstileExpire = useCallback(() => {
    setTurnstileToken('')
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, turnstileToken }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Terjadi kesalahan. Silakan coba lagi.')
        return
      }

      // In development, save the reset URL for display
      if (data._dev_reset_url) {
        setDevResetUrl(data._dev_reset_url)
      }

      setSuccess(true)
    } catch {
      setError('Tidak dapat terhubung ke server')
    } finally {
      setLoading(false)
    }
  }

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

        {!success ? (
          <>
            {/* Heading */}
            <div className="mb-10">
              <motion.h1
                className="text-2xl sm:text-3xl font-semibold text-gray-800 leading-relaxed"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                Lupa Password?
              </motion.h1>
              <motion.p
                className="text-sm sm:text-base text-slate-500 leading-relaxed mt-2"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
              >
                Masukkan email Anda dan kami akan mengirim link untuk mereset password.
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

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                  Email
                </label>
                <div className="relative">
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
                    className="w-full h-12 px-4 pr-11 rounded-xl border border-gray-300 bg-white text-[15px] text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:outline-none focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 disabled:opacity-50"
                  />
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                </div>
              </div>

              {/* Cloudflare Turnstile */}
              <div className="flex justify-center">
                <CloudflareTurnstile
                  onVerify={handleTurnstileVerify}
                  onExpire={handleTurnstileExpire}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !turnstileToken}
                className="w-full h-13 rounded-xl bg-[#10B981] text-white text-[15px] font-semibold transition-all duration-200 hover:bg-[#059669] hover:shadow-lg hover:shadow-emerald-500/25 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4.5 w-4.5 animate-spin" />
                    Mengirim...
                  </>
                ) : (
                  'Kirim Link Reset'
                )}
              </button>
            </form>
          </>
        ) : (
          /* Success State */
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
              Email Terkirim!
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed mb-8">
              Jika email <span className="font-medium text-slate-700">{email}</span> terdaftar di sistem kami, Anda akan menerima link untuk mereset password. Cek inbox dan folder spam Anda.
            </p>

            {/* Development mode: show reset link directly */}
            {devResetUrl && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-left">
                <p className="text-xs font-semibold text-amber-700 mb-1">
                  Development Mode
                </p>
                <p className="text-xs text-amber-600 mb-3">
                  Email tidak terkirim (Resend free tier). Klik link di bawah untuk reset password:
                </p>
                <a
                  href={devResetUrl}
                  className="inline-block w-full text-center px-4 py-2.5 bg-amber-100 hover:bg-amber-200 text-amber-800 text-sm font-medium rounded-lg transition-colors break-all"
                >
                  Reset Password Sekarang
                </a>
              </div>
            )}

            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#10B981] hover:text-[#059669] transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Login
            </Link>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
