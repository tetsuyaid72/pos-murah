const PRODUCTION_APP_URL = 'https://pos-murah.vercel.app'

export function getAppUrl(): string {
  const configuredUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL

  if (!configuredUrl) {
    return process.env.NODE_ENV === 'production' ? PRODUCTION_APP_URL : 'http://localhost:3000'
  }

  const normalizedUrl = configuredUrl.startsWith('http')
    ? configuredUrl
    : `https://${configuredUrl}`

  if (normalizedUrl.includes('warungmadura.com')) {
    return PRODUCTION_APP_URL
  }

  return normalizedUrl.replace(/\/$/, '')
}
