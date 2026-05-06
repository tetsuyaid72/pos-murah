'use client'

import { Suspense } from 'react'
import { RegisterIllustration } from '@/components/auth/register-illustration'
import { RegisterForm } from '@/components/auth/register-form'

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-[1100px] grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        {/* Left - Visual */}
        <div className="hidden lg:block">
          <RegisterIllustration />
        </div>

        {/* Right - Form */}
        <div className="w-full max-w-[440px] mx-auto lg:mx-0 lg:ml-auto">
          <Suspense fallback={null}>
            <RegisterForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
