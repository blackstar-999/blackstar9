import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { authApi } from '@/api/auth'
import { useAuthStore } from '@/stores/auth.store'

export function useAuth() {
  const { user, setUser, setLoading, isAuthenticated, hasRole, isAtLeast } = useAuthStore()

  const { data, isLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => authApi.me(),
    retry: false,
    staleTime: 5 * 60 * 1000,
  })

  useEffect(() => {
    setLoading(isLoading)
    if (data?.data?.user) setUser(data.data.user)
  }, [data, isLoading])

  return { user, isLoading, isAuthenticated, hasRole, isAtLeast }
}
