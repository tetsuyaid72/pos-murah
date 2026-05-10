const PRODUCTION_APP_URL = 'http://warungmadura-pos.web.id'

export function getAppUrl(): string {
  const configuredUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL

  if (!configuredUrl) {
    return process.env.NODE_ENV === 'production'
      ? PRODUCTION_APP_URL
      : 'http://localhost:3000'
  }

  const normalizedUrl = configuredUrl.startsWith('http')
    ? configuredUrl
    : `https://${configuredUrl}`

  return normalizedUrl.replace(/\/$/, '')
}

export function isSecureAppUrl(): boolean {
  return getAppUrl().startsWith('https://')
}

