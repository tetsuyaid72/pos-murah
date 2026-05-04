import type { Category } from '@/types'

export const sampleCategories: Category[] = [
  {
    id: 'cat-1',
    name: 'Rokok',
    description: 'Berbagai merek rokok',
    color: '#ef4444',
    icon: 'Cigarette',
    sortOrder: 1,
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'cat-2',
    name: 'Minuman',
    description: 'Minuman dingin dan hangat',
    color: '#3b82f6',
    icon: 'Coffee',
    sortOrder: 2,
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'cat-3',
    name: 'Makanan Ringan',
    description: 'Snack dan cemilan',
    color: '#f59e0b',
    icon: 'Cookie',
    sortOrder: 3,
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'cat-4',
    name: 'Sembako',
    description: 'Kebutuhan pokok sehari-hari',
    color: '#22c55e',
    icon: 'ShoppingBasket',
    sortOrder: 4,
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'cat-5',
    name: 'Obat & Kesehatan',
    description: 'Obat-obatan dan kebutuhan kesehatan',
    color: '#8b5cf6',
    icon: 'Pill',
    sortOrder: 5,
    createdAt: '2024-01-01T00:00:00.000Z',
  },
]
