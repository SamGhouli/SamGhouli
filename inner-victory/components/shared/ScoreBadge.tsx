import { cn } from '@/lib/utils'

interface ScoreBadgeProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function ScoreBadge({ score, size = 'md', className }: ScoreBadgeProps) {
  const color =
    score >= 75 ? 'text-green bg-green/10 border-green/20'
    : score >= 55 ? 'text-amber bg-amber/10 border-amber/20'
    : 'text-rose bg-rose/10 border-rose/20'

  const sizeClass =
    size === 'sm' ? 'text-xs px-1.5 py-0.5 min-w-[2rem]'
    : size === 'lg' ? 'text-2xl px-4 py-2 min-w-[4rem] font-bold'
    : 'text-sm px-2 py-1 min-w-[2.5rem]'

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-md border font-mono font-semibold tabular-nums',
        color,
        sizeClass,
        className
      )}
    >
      {score}
    </span>
  )
}
