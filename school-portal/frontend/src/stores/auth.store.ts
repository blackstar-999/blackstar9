import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'

interface AuthState {
  user: User | null
  isLoading: boolean
  setUser: (user: User | null) => void
  setLoading: (v: boolean) => void
  isAuthenticated: () => boolean
  hasRole: (...roles: string[]) => boolean
  isAtLeast: (role: string) => boolean
}

const roleHierarchy: Record<string, number> = {
  guest: 0, student: 1, teacher: 2, librarian: 3,
  admin: 4, vice_principal: 5, superadmin: 99,
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: true,
      setUser: (user) => set({ user }),
      setLoading: (v) => set({ isLoading: v }),
      isAuthenticated: () => get().user !== null,
      hasRole: (...roles) => {
        const user = get().user
        return user ? roles.includes(user.role) : false
      },
      isAtLeast: (role) => {
        const user = get().user
        if (!user) return false
        return (roleHierarchy[user.role] ?? 0) >= (roleHierarchy[role] ?? 0)
      },
    }),
    { name: 'auth-store', partialize: (s) => ({ user: s.user }) }
  )
)
