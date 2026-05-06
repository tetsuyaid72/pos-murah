'use client'

import { Suspense } from 'react'
import { LoginIllustration } from '@/components/auth/login-illustration'
import { LoginForm } from '@/components/auth/login-form'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-[1100px] grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        {/* Left - Form */}
        <div className="w-full max-w-[440px] mx-auto lg:mx-0">
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>

        {/* Right - Visual */}
        <div className="hidden lg:block">
          <LoginIllustration />
        </div>
      </div>
    </div>
  )
}
