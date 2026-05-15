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
 * otherwise generates a stable DiceBear fallback.
 */
export function getAvatarUrl(avatarUrl: string | null | undefined, seed: string): string {
  if (avatarUrl) return avatarUrl
  const encoded = encodeURIComponent(seed || 'user')
  return `https://api.dicebear.com/9.x/notionists/svg?seed=${encoded}`
}
