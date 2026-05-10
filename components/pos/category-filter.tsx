'use client'

import { useProductStore } from '@/stores/product-store'
import { cn } from '@/lib/utils'

export function CategoryFilter() {
  const { categories, selectedCategoryId, setSelectedCategory } = useProductStore()

  return (
    <div className="mt-3 flex items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-none">
      {/* All categories chip */}
      <button
        onClick={() => setSelectedCategory(null)}
        className={cn(
          'h-8 shrink-0 rounded-full border border-transparent bg-muted/40 px-4 text-[13px] font-medium text-muted-foreground transition-all duration-200 cursor-pointer hover:bg-muted hover:text-foreground',
          !selectedCategoryId
            ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/20 ring-1 ring-emerald-400/30 hover:bg-emerald-500 hover:text-white'
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
              'h-8 shrink-0 rounded-full border border-transparent bg-muted/40 px-4 text-[13px] font-medium text-muted-foreground transition-all duration-200 cursor-pointer hover:bg-muted hover:text-foreground',
              isActive
                ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/20 ring-1 ring-emerald-400/30 hover:bg-emerald-500 hover:text-white'
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
