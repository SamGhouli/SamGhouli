import { cn } from '@/lib/utils'

interface LoadingStateProps {
  message?: string
  className?: string
}

export function LoadingState({ message = 'Loading...', className }: LoadingStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 py-12', className)}>
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-surface-3 border-t-lime" />
      <p className="text-xs text-text-muted">{message}</p>
    </div>
  )
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse rounded-xl bg-surface-2 p-4', className)}>
      <div className="mb-3 h-4 w-32 rounded bg-surface-3" />
      <div className="h-8 w-16 rounded bg-surface-3" />
    </div>
  )
}
