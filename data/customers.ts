import type { Customer } from '@/types'

export const sampleCustomers: Customer[] = [
  {
    id: 'cust-1',
    name: 'Pak Budi',
    phone: '08123456001',
    address: 'Jl. Melati No. 5',
    totalDebt: 20000,
    createdAt: '2024-02-01T00:00:00.000Z',
  },
  {
    id: 'cust-2',
    name: 'Bu Siti',
    phone: '08123456002',
    address: 'Jl. Mawar No. 12',
    totalDebt: 55000,
    createdAt: '2024-02-10T00:00:00.000Z',
  },
  {
    id: 'cust-3',
    name: 'Mas Agus',
    phone: '08123456003',
    address: null,
    totalDebt: 0,
    createdAt: '2024-03-05T00:00:00.000Z',
  },
  {
    id: 'cust-4',
    name: 'Mbak Rina',
    phone: '08123456004',
    address: 'Jl. Kenanga No. 8',
    totalDebt: 35000,
    createdAt: '2024-03-15T00:00:00.000Z',
  },
  {
    id: 'cust-5',
    name: 'Pak Hendra',
    phone: null,
    address: 'Jl. Dahlia No. 3',
    totalDebt: 0,
    createdAt: '2024-04-01T00:00:00.000Z',
  },
]
