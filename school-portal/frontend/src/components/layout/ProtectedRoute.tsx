import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth.store'
import { Skeleton } from '@/components/ui/Skeleton'

interface Props {
  children: React.ReactNode
  roles?: string[]
  requireTelegram?: boolean
}

export function ProtectedRoute({ children, roles, requireTelegram = true }: Props) {
  const { user, isLoading } = useAuthStore()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="space-y-3 w-48">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />

  if (requireTelegram && !user.is_telegram_verified) {
    return <Navigate to="/verify-telegram" replace />
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/portal" replace />
  }

  return <>{children}</>
}
