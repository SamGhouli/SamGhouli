'use client'

import { cn } from '@/lib/utils'

interface BlockTimerProps {
  secondsRemaining: number
  blockDurationSecs: number
  isRunning: boolean
  onToggle: () => void
}

function formatTime(secs: number): string {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function BlockTimer({ secondsRemaining, blockDurationSecs, isRunning, onToggle }: BlockTimerProps) {
  const ratio = blockDurationSecs > 0 ? secondsRemaining / blockDurationSecs : 1

  const colorClass =
    ratio <= 0.1
      ? 'text-rose'
      : ratio <= 0.2
      ? 'text-amber'
      : 'text-lime'

  const ringColor =
    ratio <= 0.1
      ? '#f43f5e'
      : ratio <= 0.2
      ? '#fbbf24'
      : '#d4ff5c'

  const circumference = 2 * Math.PI * 52
  const dashOffset = circumference * (1 - (1 - ratio))

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Circular progress */}
      <div className="relative flex items-center justify-center">
        <svg width="128" height="128" className="-rotate-90">
          <circle cx="64" cy="64" r="52" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="8" />
          <circle
            cx="64"
            cy="64"
            r="52"
            fill="none"
            stroke={ringColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 0.9s linear, stroke 0.5s ease' }}
          />
        </svg>
        <span
          className={cn(
            'absolute font-display text-4xl font-black tabular-nums tracking-tight',
            colorClass
          )}
        >
          {formatTime(secondsRemaining)}
        </span>
      </div>

      {/* Play/Pause */}
      <button
        onClick={onToggle}
        className={cn(
          'flex h-14 w-14 items-center justify-center rounded-full border-2 text-lg font-bold transition-all',
          isRunning
            ? 'border-amber/50 bg-amber/10 text-amber hover:bg-amber/20'
            : 'border-lime/50 bg-lime/10 text-lime hover:bg-lime/20'
        )}
      >
        {isRunning ? '⏸' : '▶'}
      </button>
    </div>
  )
}
