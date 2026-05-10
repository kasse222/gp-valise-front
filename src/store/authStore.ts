import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: number
  first_name: string
  last_name: string
  email: string
  role: number
}

interface AuthStore {
  user: User | null
  token: string | null
  setUser: (user: User) => void
  setToken: (token: string) => void
  logout: () => void
  isAuthenticated: () => boolean
  isSender: () => boolean
  isTraveler: () => boolean
  isAdmin: () => boolean
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user:  null,
      token: null,

      setUser:  (user)  => set({ user }),
      setToken: (token) => set({ token }),

      logout: () => set({ user: null, token: null }),

      isAuthenticated: () => get().user !== null,
      isSender:   () => get().user?.role === 3,
      isTraveler: () => get().user?.role === 2,
      isAdmin:    () => [1, 6].includes(get().user?.role ?? 0),
    }),
    { name: 'gp-valise-auth' }
  )
)
