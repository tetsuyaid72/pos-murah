'use client'

import { useProductStore } from '@/stores/product-store'
import { cn } from '@/lib/utils'

export function CategoryFilter() {
  const { categories, selectedCategoryId, setSelectedCategory } = useProductStore()

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      {/* All categories chip */}
      <button
        onClick={() => setSelectedCategory(null)}
        className={cn(
          'shrink-0 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 cursor-pointer',
          !selectedCategoryId
            ? 'bg-emerald-50 text-emerald-700 shadow-sm ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20'
            : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
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
              'shrink-0 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 cursor-pointer',
              isActive
                ? 'text-white shadow-sm'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
            style={
              isActive
                ? { backgroundColor: category.color, boxShadow: `0 2px 8px ${category.color}40` }
                : undefined
            }
          >
            {category.name}
          </button>
        )
      })}
    </div>
  )
}
