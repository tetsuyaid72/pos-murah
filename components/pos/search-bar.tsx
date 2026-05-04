'use client'

import { useRef, useEffect, useCallback } from 'react'
import { Search, X, Grid3X3, List, ScanBarcode } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useProductStore } from '@/stores/product-store'
import { cn } from '@/lib/utils'

export function SearchBar() {
  const inputRef = useRef<HTMLInputElement>(null)
  const { searchQuery, setSearchQuery, viewMode, setViewMode } = useProductStore()

  // Keyboard shortcut: F2 to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleClear = useCallback(() => {
    setSearchQuery('')
    inputRef.current?.focus()
  }, [setSearchQuery])

  return (
    <div className="flex items-center gap-3">
      {/* Search input */}
      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Cari produk atau scan barcode... (F2)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-11 w-full rounded-xl border border-border/50 bg-muted/30 pl-11 pr-10 text-sm text-foreground placeholder:text-muted-foreground/60 transition-all duration-200 focus:border-primary/50 focus:bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:shadow-lg focus:shadow-primary/5"
        />
        {searchQuery ? (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
            aria-label="Hapus pencarian"
          >
            <X className="h-4 w-4" />
          </button>
        ) : (
          <ScanBarcode className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
        )}
      </div>

      {/* View mode toggle */}
      <div className="hidden items-center rounded-xl border border-border/50 bg-muted/30 p-1 sm:flex">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setViewMode('grid')}
          className={cn(
            'rounded-lg transition-all',
            viewMode === 'grid' && 'bg-card text-foreground shadow-sm'
          )}
          aria-label="Tampilan grid"
        >
          <Grid3X3 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setViewMode('list')}
          className={cn(
            'rounded-lg transition-all',
            viewMode === 'list' && 'bg-card text-foreground shadow-sm'
          )}
          aria-label="Tampilan list"
        >
          <List className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
