import { cn } from '@/lib/utils'
import type { AvailabilityStatus } from '@/types/database'

interface StatusDotProps {
  status: AvailabilityStatus
  showLabel?: boolean
  className?: string
}

const STATUS_CONFIG = {
  full: { color: 'bg-green', label: 'Full' },
  limited: { color: 'bg-amber', label: 'Limited' },
  out: { color: 'bg-rose', label: 'Out' },
}

export function StatusDot({ status, showLabel = false, className }: StatusDotProps) {
  const config = STATUS_CONFIG[status]
  return (
    <span className={cn('flex items-center gap-1.5', className)}>
      <span className={cn('h-2 w-2 rounded-full', config.color)} />
      {showLabel && <span className="text-xs text-text-muted">{config.label}</span>}
    </span>
  )
}
