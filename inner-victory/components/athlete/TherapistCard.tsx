import { cn } from '@/lib/utils'
import { ExternalLink, CheckCircle2 } from 'lucide-react'

interface TherapistCardProps {
  name: string
  bio: string
  specialisations: string[]
  bookingUrl?: string
  isMatched?: boolean
  avatarColor?: string
  className?: string
}

function TherapistAvatar({
  name,
  color,
}: {
  name: string
  color: string
}) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div
      className="h-14 w-14 rounded-2xl flex items-center justify-center text-lg font-bold shrink-0"
      style={{
        background: `linear-gradient(135deg, ${color}30 0%, ${color}15 100%)`,
        border: `1.5px solid ${color}30`,
        color,
      }}
    >
      {initials}
    </div>
  )
}

export function TherapistCard({
  name,
  bio,
  specialisations,
  bookingUrl,
  isMatched = false,
  avatarColor = '#a78bfa',
  className,
}: TherapistCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border bg-surface-2 p-4 space-y-4 transition-all duration-200',
        isMatched ? 'border-violet/30' : 'border-border-1',
        className
      )}
    >
      {/* Header row */}
      <div className="flex items-start gap-3">
        <TherapistAvatar name={name} color={avatarColor} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="text-sm font-bold text-text-primary">{name}</h3>
            {isMatched && (
              <span className="inline-flex items-center gap-1 rounded-full bg-violet/10 px-2 py-0.5 text-[10px] font-semibold text-violet border border-violet/20">
                <CheckCircle2 className="h-3 w-3" />
                Your Match
              </span>
            )}
          </div>
          <p className="text-xs text-text-muted leading-relaxed line-clamp-3">{bio}</p>
        </div>
      </div>

      {/* Specialisations chips */}
      <div className="flex flex-wrap gap-1.5">
        {specialisations.map((s) => (
          <span
            key={s}
            className="rounded-full border border-border-1 bg-surface-3 px-2.5 py-1 text-[11px] text-text-muted"
          >
            {s}
          </span>
        ))}
      </div>

      {/* Book Session button */}
      <a
        href={bookingUrl ?? `mailto:book@innervictory.app?subject=Session with ${encodeURIComponent(name)}`}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          'flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold min-h-[48px] transition-opacity active:opacity-80',
          isMatched
            ? 'bg-violet text-white'
            : 'border border-border-1 bg-surface-3 text-text-primary'
        )}
      >
        Book Session
        <ExternalLink className="h-3.5 w-3.5 opacity-70" />
      </a>
    </div>
  )
}
