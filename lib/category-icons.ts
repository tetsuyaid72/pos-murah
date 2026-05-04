import {
  Box,
  Candy,
  Cigarette,
  Coffee,
  Cookie,
  Droplets,
  Egg,
  Fish,
  Flame,
  IceCream,
  Milk,
  Package,
  Pill,
  Pizza,
  Sandwich,
  ShoppingBasket,
  Soup,
  Utensils,
  Wheat,
  Wine,
  type LucideIcon,
} from 'lucide-react'

// =============================================================================
// Icon map — keyed by normalized lowercase name.
// Supports icon field values from the database (e.g. "coffee", "Coffee",
// "shopping-basket", "ShoppingBasket") and common category names in Bahasa.
// =============================================================================

const ICON_MAP: Record<string, LucideIcon> = {
  // --- By icon name (lowercase / kebab-case) ---
  box:              Box,
  candy:            Candy,
  cigarette:        Cigarette,
  coffee:           Coffee,
  cookie:           Cookie,
  droplets:         Droplets,
  egg:              Egg,
  fish:             Fish,
  flame:            Flame,
  'ice-cream':      IceCream,
  icecream:         IceCream,
  milk:             Milk,
  package:          Package,
  pill:             Pill,
  pizza:            Pizza,
  sandwich:         Sandwich,
  'shopping-basket': ShoppingBasket,
  shoppingbasket:   ShoppingBasket,
  soup:             Soup,
  utensils:         Utensils,
  wheat:            Wheat,
  wine:             Wine,

  // --- By category name (Bahasa Indonesia, lowercase) ---
  minuman:          Coffee,
  makanan:          Utensils,
  sembako:          ShoppingBasket,
  snack:            Cookie,
  jajanan:          Candy,
  rokok:            Cigarette,
  obat:             Pill,
  bumbu:            Flame,
  roti:             Sandwich,
  susu:             Milk,
  es:               IceCream,
  ikan:             Fish,
  beras:            Wheat,
  telur:            Egg,
  lainnya:          Box,
}

/**
 * Normalize a string for icon lookup:
 * "ShoppingBasket" → "shoppingbasket"
 * "shopping-basket" → "shopping-basket"
 * "Minuman" → "minuman"
 */
function normalize(s: string): string {
  return s.trim().toLowerCase()
}

/**
 * Get a Lucide icon component from an icon name string or category name.
 *
 * Lookup order:
 * 1. Exact normalized match in ICON_MAP
 * 2. Fallback → Package icon
 *
 * Usage:
 *   getCategoryIcon('coffee')          → Coffee
 *   getCategoryIcon('shopping-basket') → ShoppingBasket
 *   getCategoryIcon('Minuman')         → Coffee
 *   getCategoryIcon(null)              → Package
 */
export function getCategoryIcon(iconName: string | null): LucideIcon {
  if (!iconName) return Package
  return ICON_MAP[normalize(iconName)] || Package
}

/**
 * Get icon + color config for a category, by name.
 * Useful when you only have the category name (no icon field).
 *
 * Returns { icon, color, bgClass } for consistent styling.
 */
export function getCategoryStyle(categoryName: string | null): {
  icon: LucideIcon
  color: string
  bgClass: string
} {
  const name = normalize(categoryName || '')

  const STYLE_MAP: Record<string, { color: string; bgClass: string }> = {
    minuman:  { color: 'text-blue-600',   bgClass: 'bg-blue-50 dark:bg-blue-500/10' },
    makanan:  { color: 'text-orange-600',  bgClass: 'bg-orange-50 dark:bg-orange-500/10' },
    sembako:  { color: 'text-emerald-600', bgClass: 'bg-emerald-50 dark:bg-emerald-500/10' },
    snack:    { color: 'text-purple-600',  bgClass: 'bg-purple-50 dark:bg-purple-500/10' },
    jajanan:  { color: 'text-pink-600',    bgClass: 'bg-pink-50 dark:bg-pink-500/10' },
    rokok:    { color: 'text-slate-600',   bgClass: 'bg-slate-50 dark:bg-slate-500/10' },
    obat:     { color: 'text-red-600',     bgClass: 'bg-red-50 dark:bg-red-500/10' },
    lainnya:  { color: 'text-gray-500',    bgClass: 'bg-gray-50 dark:bg-gray-500/10' },
  }

  const style = STYLE_MAP[name] || { color: 'text-gray-500', bgClass: 'bg-gray-50 dark:bg-gray-500/10' }
  const icon = ICON_MAP[name] || Package

  return { icon, ...style }
}

/** Default fallback icon */
export const DEFAULT_ICON = Package
