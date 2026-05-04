'use client'

import { cn, getAvatarUrl } from '@/lib/utils'

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl'

interface UserAvatarProps {
  name: string
  imageUrl?: string | null
  size?: AvatarSize
  className?: string
}

const SIZE_CLASSES: Record<AvatarSize, string> = {
  sm: 'h-6 w-6',
  md: 'h-8 w-8',
  lg: 'h-10 w-10',
  xl: 'h-24 w-24',
}

/**
 * Reusable avatar component.
 * Displays user's uploaded avatar or a generated fallback from ui-avatars.com.
 *
 * Props:
 * - name: user's display name (used for fallback generation)
 * - imageUrl: avatar URL from database (nullable)
 * - size: 'sm' | 'md' | 'lg' | 'xl'
 */
export function UserAvatar({ name, imageUrl, size = 'md', className }: UserAvatarProps) {
  const src = getAvatarUrl(imageUrl, name)

  return (
    <div
      className={cn(
        'relative shrink-0 overflow-hidden rounded-full bg-muted',
        SIZE_CLASSES[size],
        className
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={name || 'Avatar'}
        className="h-full w-full object-cover"
      />
    </div>
  )
}
