'use client'
import { Bell, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TopBarProps {
  title?: string
  subtitle?: string
  actions?: React.ReactNode
  alertCount?: number
  className?: string
}

export function TopBar({ title, subtitle, actions, alertCount = 0, className }: TopBarProps) {
  return (
    <header className={cn('flex h-[52px] shrink-0 items-center justify-between border-b border-border-1 bg-surface-1 px-6', className)}>
      <div>
        {title && <h1 className="text-sm font-semibold text-text-primary">{title}</h1>}
        {subtitle && <p className="text-xs text-text-muted">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        {actions}
        <button className="relative flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-2 hover:text-text-primary">
          <Bell className="h-4 w-4" />
          {alertCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-rose px-1 text-[10px] font-bold text-white">
              {alertCount > 9 ? '9+' : alertCount}
            </span>
          )}
        </button>
      </div>
    </header>
  )
}

interface RefreshButtonProps {
  onRefresh: () => void
  loading?: boolean
}
export function RefreshButton({ onRefresh, loading }: RefreshButtonProps) {
  return (
    <button
      onClick={onRefresh}
      disabled={loading}
      className="flex h-8 items-center gap-1.5 rounded-lg border border-border-1 px-3 text-xs text-text-muted transition-colors hover:bg-surface-2 hover:text-text-primary disabled:opacity-50"
    >
      <RefreshCw className={cn('h-3 w-3', loading && 'animate-spin')} />
      Refresh
    </button>
  )
}
