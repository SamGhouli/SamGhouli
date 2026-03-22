'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { TopBar } from '@/components/shared/TopBar'
import { EmptyState } from '@/components/shared/EmptyState'
import { DEMO_DATA } from '@/lib/demo/data'
import type { TeamEvent } from '@/types/database'
import { ChevronLeft, ChevronRight, PlusCircle, X, Clock, MapPin } from 'lucide-react'

const EVENT_TYPE_COLORS: Record<string, string> = {
  training: 'bg-lime/15 text-lime border-lime/20',
  match: 'bg-rose/15 text-rose border-rose/20',
  film: 'bg-violet/15 text-violet border-violet/20',
  recovery: 'bg-teal/15 text-teal border-teal/20',
  meeting: 'bg-sky/15 text-sky border-sky/20',
  medical: 'bg-amber/15 text-amber border-amber/20',
  other: 'bg-surface-3 text-text-muted border-border-1',
}

const EVENT_TYPE_DOT: Record<string, string> = {
  training: 'bg-lime',
  match: 'bg-rose',
  film: 'bg-violet',
  recovery: 'bg-teal',
  meeting: 'bg-sky',
  medical: 'bg-amber',
  other: 'bg-text-muted',
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

export default function CalendarPage() {
  const searchParams = useSearchParams()
  const isDemo = searchParams.get('demo') === 'true'

  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [selectedEvent, setSelectedEvent] = useState<TeamEvent | null>(null)

  // Add event form
  const [showForm, setShowForm] = useState(false)
  const [events, setEvents] = useState<TeamEvent[]>(
    isDemo ? DEMO_DATA.upcomingEvents : []
  )
  const [formTitle, setFormTitle] = useState('')
  const [formType, setFormType] = useState('training')
  const [formDate, setFormDate] = useState('')
  const [formTime, setFormTime] = useState('')
  const [formDuration, setFormDuration] = useState('90')
  const [formLocation, setFormLocation] = useState('')
  const [formNotes, setFormNotes] = useState('')

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  function handleAddEvent(e: React.FormEvent) {
    e.preventDefault()
    const newEvent: TeamEvent = {
      id: `ev-${Date.now()}`,
      team_id: 'demo-team-mcmaster-001',
      title: formTitle,
      event_type: formType,
      event_date: formDate,
      start_time: formTime,
      duration_mins: parseInt(formDuration) || 90,
      location: formLocation,
      notes: formNotes,
      created_by: 'demo-coach-001',
      created_at: new Date().toISOString(),
    }
    setEvents((prev) => [...prev, newEvent])
    setFormTitle('')
    setFormType('training')
    setFormDate('')
    setFormTime('')
    setFormDuration('90')
    setFormLocation('')
    setFormNotes('')
    setShowForm(false)
  }

  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth)

  // Map events to dates in this month
  const eventsByDate = new Map<number, TeamEvent[]>()
  events.forEach((ev) => {
    const d = new Date(ev.event_date)
    if (d.getFullYear() === viewYear && d.getMonth() === viewMonth) {
      const day = d.getDate()
      if (!eventsByDate.has(day)) eventsByDate.set(day, [])
      eventsByDate.get(day)!.push(ev)
    }
  })

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  // Pad to complete rows
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <TopBar
        title="Season Calendar"
        subtitle={`${events.length} event${events.length !== 1 ? 's' : ''} scheduled`}
        actions={
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex h-8 items-center gap-1.5 rounded-lg bg-lime/10 border border-lime/20 px-3 text-xs text-lime transition-colors hover:bg-lime/20"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            Add Event
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* Add Event Form */}
        {showForm && (
          <form
            onSubmit={handleAddEvent}
            className="rounded-xl border border-border-1 bg-surface-2 p-5 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-text-primary">Add Event</h2>
              <button type="button" onClick={() => setShowForm(false)} className="text-text-muted hover:text-text-primary">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs text-text-muted">Title *</label>
                <input
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full rounded-lg border border-border-1 bg-surface-3 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-lime/40"
                  placeholder="Event title"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-text-muted">Type</label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value)}
                  className="w-full rounded-lg border border-border-1 bg-surface-3 px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-lime/40"
                >
                  {Object.keys(EVENT_TYPE_COLORS).map((t) => (
                    <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-text-muted">Date *</label>
                <input
                  required
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full rounded-lg border border-border-1 bg-surface-3 px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-lime/40"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-text-muted">Start Time</label>
                <input
                  type="time"
                  value={formTime}
                  onChange={(e) => setFormTime(e.target.value)}
                  className="w-full rounded-lg border border-border-1 bg-surface-3 px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-lime/40"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-text-muted">Duration (mins)</label>
                <input
                  type="number"
                  value={formDuration}
                  onChange={(e) => setFormDuration(e.target.value)}
                  className="w-full rounded-lg border border-border-1 bg-surface-3 px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-lime/40"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs text-text-muted">Location</label>
                <input
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  className="w-full rounded-lg border border-border-1 bg-surface-3 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-lime/40"
                  placeholder="e.g. Ron Joyce Stadium"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-text-muted">Notes</label>
                <input
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full rounded-lg border border-border-1 bg-surface-3 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-lime/40"
                  placeholder="Optional notes..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-border-1 px-4 py-1.5 text-xs text-text-muted hover:bg-surface-3">Cancel</button>
              <button type="submit" className="rounded-lg bg-lime px-4 py-1.5 text-xs font-semibold text-bg hover:bg-lime/90">Add Event</button>
            </div>
          </form>
        )}

        {/* Month Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={prevMonth}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border-1 text-text-muted hover:bg-surface-2 hover:text-text-primary transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <h2 className="text-sm font-semibold text-text-primary">
            {MONTHS[viewMonth]} {viewYear}
          </h2>
          <button
            onClick={nextMonth}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border-1 text-text-muted hover:bg-surface-2 hover:text-text-primary transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="rounded-xl border border-border-1 bg-surface-2 overflow-hidden">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-border-1">
            {DAYS.map((day) => (
              <div key={day} className="px-2 py-2 text-center text-[10px] font-semibold text-text-muted uppercase">
                {day}
              </div>
            ))}
          </div>

          {/* Weeks */}
          <div className="grid grid-cols-7 divide-x divide-y divide-border-1">
            {cells.map((day, idx) => {
              const isToday =
                day !== null &&
                today.getDate() === day &&
                today.getMonth() === viewMonth &&
                today.getFullYear() === viewYear
              const dayEvents = day ? (eventsByDate.get(day) ?? []) : []

              return (
                <div
                  key={idx}
                  className={`min-h-[80px] p-1.5 ${day === null ? 'bg-surface-1/40' : 'hover:bg-surface-3/30'} transition-colors`}
                >
                  {day !== null && (
                    <>
                      <div
                        className={`mb-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                          isToday
                            ? 'bg-lime text-bg font-bold'
                            : 'text-text-muted'
                        }`}
                      >
                        {day}
                      </div>
                      <div className="space-y-0.5">
                        {dayEvents.slice(0, 3).map((ev) => {
                          const dotColor = EVENT_TYPE_DOT[ev.event_type] ?? 'bg-text-muted'
                          const chipColor =
                            EVENT_TYPE_COLORS[ev.event_type] ?? 'bg-surface-3 text-text-muted border-border-1'
                          return (
                            <button
                              key={ev.id}
                              onClick={() =>
                                setSelectedEvent((prev) =>
                                  prev?.id === ev.id ? null : ev
                                )
                              }
                              className={`w-full rounded border px-1.5 py-0.5 text-left text-[9px] font-medium truncate transition-opacity hover:opacity-80 ${chipColor}`}
                            >
                              {ev.title}
                            </button>
                          )
                        })}
                        {dayEvents.length > 3 && (
                          <div className="text-[9px] text-text-muted px-1">
                            +{dayEvents.length - 3} more
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Event Detail Panel */}
        {selectedEvent && (
          <div className="rounded-xl border border-border-1 bg-surface-2 p-5">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-3">
                <div
                  className={`mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full ${EVENT_TYPE_DOT[selectedEvent.event_type] ?? 'bg-text-muted'}`}
                />
                <div>
                  <h3 className="text-sm font-semibold text-text-primary">{selectedEvent.title}</h3>
                  <div className="mt-1 flex flex-wrap gap-3 text-xs text-text-muted">
                    <span>
                      {new Date(selectedEvent.event_date).toLocaleDateString('en-GB', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                    {selectedEvent.start_time && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {selectedEvent.start_time} · {selectedEvent.duration_mins} min
                      </span>
                    )}
                    {selectedEvent.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {selectedEvent.location}
                      </span>
                    )}
                  </div>
                  {selectedEvent.notes && (
                    <p className="mt-2 text-xs text-text-muted">{selectedEvent.notes}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="shrink-0 text-text-muted hover:text-text-primary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-wrap gap-3">
          {Object.entries(EVENT_TYPE_COLORS).map(([type, color]) => (
            <div key={type} className="flex items-center gap-1.5">
              <div className={`h-2 w-2 rounded-full ${EVENT_TYPE_DOT[type] ?? 'bg-text-muted'}`} />
              <span className="text-[10px] text-text-muted capitalize">{type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
