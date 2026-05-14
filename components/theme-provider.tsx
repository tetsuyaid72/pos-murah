'use client'

import * as React from 'react'

type Theme = 'light' | 'dark'

type ThemeContextValue = {
  theme: Theme
  resolvedTheme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null)
const STORAGE_KEY = 'theme'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<Theme>('light')

  const setTheme = React.useCallback((nextTheme: Theme) => {
    setThemeState(nextTheme)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, nextTheme)
    }
  }, [])

  React.useEffect(() => {
    const timeout = window.setTimeout(() => {
      const savedTheme = window.localStorage.getItem(STORAGE_KEY) === 'dark' ? 'dark' : 'light'
      setThemeState(savedTheme)
    }, 0)

    return () => window.clearTimeout(timeout)
  }, [])

  React.useLayoutEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.documentElement.style.colorScheme = theme
  }, [theme])

  const value = React.useMemo(
    () => ({ theme, resolvedTheme: theme, setTheme }),
    [theme, setTheme]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = React.useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
