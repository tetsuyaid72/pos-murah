import { Badge } from '@/components/ui/badge'
import { STOCK_LEVELS } from '@/lib/constants'

interface StockBadgeProps {
  stock: number
  minStock: number
}

export function StockBadge({ stock, minStock }: StockBadgeProps) {
  if (stock <= 0) {
    return <Badge variant="destructive" className="text-[10px]">Habis</Badge>
  }

  if (stock <= STOCK_LEVELS.CRITICAL) {
    return <Badge variant="destructive" className="text-[10px]">Kritis ({stock})</Badge>
  }

  if (stock <= minStock || stock <= STOCK_LEVELS.LOW) {
    return <Badge variant="warning" className="text-[10px]">Rendah ({stock})</Badge>
  }

  return <Badge variant="success" className="text-[10px]">{stock}</Badge>
}
