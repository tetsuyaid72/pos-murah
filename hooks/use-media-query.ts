'use client'

import { useState, useEffect } from 'react'

/**
 * Hook to detect media query matches.
 * Returns true if the media query matches.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => (
    typeof window === 'undefined' ? false : window.matchMedia(query).matches
  ))

  useEffect(() => {
    const media = window.matchMedia(query)

    const listener = (e: MediaQueryListEvent) => {
      setMatches(e.matches)
    }

    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [query])

  return matches
}
