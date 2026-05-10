'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { Product, Category } from '@/types'
import { cn } from '@/lib/utils'
import { getCategoryIcon } from '@/lib/category-icons'
import { useProductStore } from '@/stores/product-store'

interface ProductImageProps {
  product: Product
  size?: 'sm' | 'md' | 'lg' | 'card'
  className?: string
}

const SIZE_MAP = {
  sm: { container: 'h-10 w-10', icon: 'h-5 w-5', image: 40 },
  md: { container: 'h-16 w-16', icon: 'h-7 w-7', image: 64 },
  lg: { container: 'h-[120px] w-[120px]', icon: 'h-12 w-12', image: 120 },
  card: { container: 'h-24 w-full', icon: 'h-9 w-9', image: 80 },
}

export function ProductImage({ product, size = 'md', className }: ProductImageProps) {
  const [imageError, setImageError] = useState(false)
  const categories = useProductStore((s) => s.categories)

  const sizeConfig = SIZE_MAP[size]
  const category = categories.find((c) => c.id === product.categoryId)
  const hasImage = product.imageUrl && !imageError

  if (hasImage) {
    return (
      <div
        className={cn(
          'relative shrink-0 overflow-hidden rounded-lg bg-muted',
          sizeConfig.container,
          className
        )}
      >
        <Image
          src={product.imageUrl!}
          alt={product.name}
          width={sizeConfig.image}
          height={sizeConfig.image}
          className="max-h-20 w-full object-contain transition-transform duration-200 group-hover:scale-105"
          onError={() => setImageError(true)}
        />
      </div>
    )
  }

  // Fallback: category icon with category color
  return (
    <CategoryFallback
      category={category || null}
      size={size}
      className={className}
    />
  )
}

interface CategoryFallbackProps {
  category: Category | null
  size: 'sm' | 'md' | 'lg' | 'card'
  className?: string
}

function CategoryFallback({ category, size, className }: CategoryFallbackProps) {
  const sizeConfig = SIZE_MAP[size]
  const Icon = getCategoryIcon(category?.icon || null)
  const color = category?.color || '#6b7280'

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-lg',
        sizeConfig.container,
        className
      )}
      style={{ backgroundColor: `${color}15` }}
    >
      <Icon
        className={sizeConfig.icon}
        style={{ color }}
      />
    </div>
  )
}
