import { cn } from '@/utils/cn'

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-lg bg-surface-200 dark:bg-surface-700', className)} />
}

export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-surface-200 dark:border-surface-800 p-4 space-y-3">
      <Skeleton className="h-48 w-full rounded-xl" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  )
}
