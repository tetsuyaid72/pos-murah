'use client'

import { useProductStore } from '@/stores/product-store'
import { cn } from '@/lib/utils'

export function CategoryFilter() {
  const { categories, selectedCategoryId, setSelectedCategory } = useProductStore()

  return (
    <div className="mt-3 flex gap-2 overflow-x-auto whitespace-nowrap px-4 pb-1 scrollbar-hide md:mt-3 md:px-0">
      {/* All categories chip */}
      <button
        onClick={() => setSelectedCategory(null)}
        className={cn(
          'h-8 shrink-0 rounded-full border border-border bg-card px-4 text-xs font-semibold text-muted-foreground transition-all duration-200 cursor-pointer hover:bg-accent hover:text-accent-foreground md:h-8 md:border-transparent md:bg-secondary md:text-[13px] md:hover:bg-muted md:hover:text-foreground',
          !selectedCategoryId
            ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm hover:bg-emerald-600 hover:text-white dark:bg-emerald-500 dark:text-slate-950 md:bg-emerald-500 md:shadow-emerald-500/20 md:ring-1 md:ring-emerald-400/30'
            : undefined
        )}
      >
        Semua
      </button>

      {/* Category chips */}
      {categories.map((category) => {
        const isActive = selectedCategoryId === category.id
        return (
          <button
            key={category.id}
            onClick={() =>
              setSelectedCategory(
                selectedCategoryId === category.id ? null : category.id
              )
            }
            className={cn(
              'h-8 shrink-0 rounded-full border border-border bg-card px-4 text-xs font-semibold text-muted-foreground transition-all duration-200 cursor-pointer hover:bg-accent hover:text-accent-foreground md:h-8 md:border-transparent md:bg-secondary md:text-[13px] md:hover:bg-muted md:hover:text-foreground',
              isActive
                ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm hover:bg-emerald-600 hover:text-white dark:bg-emerald-500 dark:text-slate-950 md:bg-emerald-500 md:shadow-emerald-500/20 md:ring-1 md:ring-emerald-400/30'
                : undefined
            )}
            style={undefined}
          >
            {category.name}
          </button>
        )
      })}
    </div>
  )
}
