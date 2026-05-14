'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

function Avatar({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('relative flex h-8 w-8 shrink-0 overflow-hidden rounded-full', className)}
      {...props}
    />
  )
}

function AvatarImage({ className, alt = '', ...props }: React.ImgHTMLAttributes<HTMLImageElement>) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img className={cn('aspect-square h-full w-full object-cover', className)} alt={alt} {...props} />
}

function AvatarFallback({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex h-full w-full items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600', className)}
      {...props}
    />
  )
}

export { Avatar, AvatarImage, AvatarFallback }
