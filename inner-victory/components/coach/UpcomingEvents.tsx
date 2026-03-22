import { CalendarDays, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TeamEvent } from '@/types/database'

const EVENT_COLORS: Record<string, string> = {
  match: 'text-rose bg-rose/10',
  training: 'text-lime bg-lime/10',
  film: 'text-sky bg-sky/10',
  recovery: 'text-teal bg-teal/10',
  admin: 'text-violet bg-violet/10',
  travel: 'text-amber bg-amber/10',
}

interface UpcomingEventsProps {
  events: TeamEvent[]
}

export function UpcomingEvents({ events }: UpcomingEventsProps) {
  return (
    <div className="rounded-xl border border-border-1 bg-surface-2 p-5">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-text-primary">
        <CalendarDays className="h-4 w-4 text-text-muted" />
        Upcoming 5 Days
      </h2>
      {events.length === 0 ? (
        <p className="text-xs text-text-muted">No upcoming events scheduled.</p>
      ) : (
        <div className="space-y-2">
          {events.slice(0, 5).map((event) => {
            const colorClass = EVENT_COLORS[event.event_type] ?? 'text-text-muted bg-surface-3'
            return (
              <div key={event.id} className="flex items-center gap-3">
                <div className={cn('flex h-8 w-8 shrink-0 flex-col items-center justify-center rounded-lg text-center', colorClass)}>
                  <span className="text-[10px] font-bold leading-none">
                    {new Date(event.event_date).getDate()}
                  </span>
                  <span className="text-[8px] uppercase leading-none">
                    {new Date(event.event_date).toLocaleString('en', { month: 'short' })}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-medium text-text-primary">{event.title}</div>
                  <div className="flex items-center gap-1 text-[10px] text-text-muted">
                    {event.start_time && <span>{event.start_time.slice(0, 5)}</span>}
                    {event.location && (
                      <>
                        <span>·</span>
                        <MapPin className="h-2.5 w-2.5" />
                        <span className="truncate">{event.location}</span>
                      </>
                    )}
                  </div>
                </div>
                <span className={cn('shrink-0 rounded px-1.5 py-0.5 text-[10px] capitalize', colorClass)}>
                  {event.event_type}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
