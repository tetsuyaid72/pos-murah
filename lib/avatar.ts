import type { AuthUser } from '@/stores/auth-store'

function diceBearAvatar(seed: string): string {
  return `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(seed)}`
}

export function getUserAvatar(user: AuthUser | null | undefined): string {
  const googleAvatar =
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture ||
    (user?.googleId ? user.avatarUrl : null)

  if (googleAvatar) return googleAvatar

  return diceBearAvatar(user?.email || user?.id || 'user')
}
