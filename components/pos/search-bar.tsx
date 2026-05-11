'use client'

import { useRef, useEffect, useCallback } from 'react'
import { Search, X, Grid3X3, List, ScanBarcode } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
    <div className="px-4 pt-2 md:px-0 md:pt-0">
      <div className="flex items-center gap-1.5 md:gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground md:left-3 md:h-3.5 md:w-3.5" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Cari produk atau scan barcode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 rounded-2xl border-border bg-card pl-10 pr-10 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-0 md:h-10 md:rounded-xl md:border-0 md:bg-muted/30 md:pl-9 md:pr-12 md:text-sm md:shadow-none"
          />
          {searchQuery ? (
            <button
              onClick={handleClear}
              className="absolute right-9 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-muted-foreground transition-all duration-200 hover:text-foreground cursor-pointer md:right-9"
              aria-label="Hapus pencarian"
            >
              <X className="h-3.5 w-3.5 md:h-4 md:w-4" />
            </button>
          ) : null}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1.5 top-1/2 h-8 w-8 -translate-y-1/2 rounded-xl text-muted-foreground hover:bg-accent md:hidden"
            aria-label="Scan barcode"
          >
            <ScanBarcode className="h-4 w-4" />
          </Button>
          <kbd className="absolute right-2 top-1/2 hidden -translate-y-1/2 rounded-md border border-border/60 bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground shadow-sm sm:block">
            F2
          </kbd>
        </div>

      <div className="hidden items-center rounded-xl border border-border/60 bg-muted/40 p-1 shadow-sm sm:flex">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setViewMode('grid')}
          className={cn(
            'h-9 w-9 rounded-xl bg-muted/40 transition-all hover:bg-muted',
            viewMode === 'grid' && 'bg-card text-foreground shadow-sm'
          )}
          aria-label="Tampilan grid"
        >
          <Grid3X3 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setViewMode('list')}
          className={cn(
            'h-9 w-9 rounded-xl bg-muted/40 transition-all hover:bg-muted',
            viewMode === 'list' && 'bg-card text-foreground shadow-sm'
          )}
          aria-label="Tampilan list"
        >
          <List className="h-4 w-4" />
        </Button>
        </div>
      </div>
    </div>
  )
}
