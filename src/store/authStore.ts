import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const UserRole = {
  ADMIN:       1,
  TRAVELER:    2,
  SENDER:      3,
  MODERATOR:   4,
  SUPPORT:     5,
  SUPER_ADMIN: 6,
} as const

export type UserRole = typeof UserRole[keyof typeof UserRole]

export function isSender(role: UserRole): boolean {
  return role === UserRole.SENDER
}

export function isTraveler(role: UserRole): boolean {
  return role === UserRole.TRAVELER
}

export function isAdmin(role: UserRole): boolean {
  return role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN
}

export function isPublicFrontendRole(role: UserRole): boolean {
  return isSender(role) || isTraveler(role)
}

export interface AuthUser {
  id: number
  first_name: string
  last_name: string
  email: string
  role: UserRole
}

interface AuthStore {
  user: AuthUser | null
  token: string | null
  setUser: (user: AuthUser) => void
  setToken: (token: string) => void
  logout: () => void
  isAuthenticated: () => boolean
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user:  null,
      token: null,

      setUser:  (user)  => set({ user }),
      setToken: (token) => set({ token }),
      logout:   ()      => set({ user: null, token: null }),

      isAuthenticated: () => get().user !== null,
    }),
    { name: 'gp-valise-auth' }
  )
)
