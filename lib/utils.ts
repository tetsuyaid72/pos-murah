import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind CSS classes with clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generate a unique ID (simple nanoid-like)
 */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9)
}

/**
 * Get avatar URL — returns the user's avatar if available,
 * otherwise generates a fallback from ui-avatars.com.
 */
export function getAvatarUrl(avatarUrl: string | null | undefined, name: string): string {
  if (avatarUrl) return avatarUrl
  const encoded = encodeURIComponent(name || '?')
  return `https://ui-avatars.com/api/?name=${encoded}&background=059669&color=fff&size=128&bold=true`
}
