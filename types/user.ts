export type UserRole = 'owner' | 'cashier'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  outletIds: string[]
  isActive: boolean
  createdAt: string
}

export interface Outlet {
  id: string
  name: string
  address: string
  phone: string | null
  ownerId: string
  createdAt: string
}
