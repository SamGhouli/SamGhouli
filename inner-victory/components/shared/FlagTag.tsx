import { cn } from '@/lib/utils'

type FlagType = 'injury' | 'academic' | 'monitor' | 'mental' | 'declining'

interface FlagTagProps {
  type: FlagType
  label?: string
  className?: string
}

const FLAG_CONFIG = {
  injury: { bg: 'bg-rose/10 border-rose/20 text-rose', label: 'INJ' },
  academic: { bg: 'bg-violet/10 border-violet/20 text-violet', label: 'A' },
  monitor: { bg: 'bg-amber/10 border-amber/20 text-amber', label: '⚠' },
  mental: { bg: 'bg-sky/10 border-sky/20 text-sky', label: 'MH' },
  declining: { bg: 'bg-rose/10 border-rose/20 text-rose', label: '↓' },
}

export function FlagTag({ type, label, className }: FlagTagProps) {
  const config = FLAG_CONFIG[type]
  return (
    <span
      className={cn(
        'inline-flex items-center rounded border px-1.5 py-0.5 text-xs font-semibold',
        config.bg,
        className
      )}
    >
      {label ?? config.label}
    </span>
  )
}
