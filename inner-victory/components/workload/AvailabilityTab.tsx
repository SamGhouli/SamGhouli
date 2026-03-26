'use client'

import { useState } from 'react'
import { X, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DEMO_DATA } from '@/lib/demo/data'
import { DEMO_AVAILABILITY_HISTORY } from '@/lib/demo/data'
import type { AvailabilityStatus } from '@/types/database'

type FilterKey = 'all' | 'full' | 'limited' | 'out'

const STATUS_STYLE: Record<AvailabilityStatus, { badge: string; dot: string }> = {
  full: { badge: 'text-green bg-green/10 border-green/20', dot: '#3DB87F' },
  limited: { badge: 'text-amber bg-amber/10 border-amber/20', dot: '#fbbf24' },
  out: { badge: 'text-rose bg-rose/10 border-rose/20', dot: '#f43f5e' },
}

interface StatusSheetProps {
  athleteId: string
  currentStatus: AvailabilityStatus
  onSave: (status: AvailabilityStatus, data: Record<string, string>) => void
  onClose: () => void
}

function StatusSheet({ athleteId, currentStatus, onSave, onClose }: StatusSheetProps) {
  const [status, setStatus] = useState<AvailabilityStatus>(currentStatus)
  const [restriction, setRestriction] = useState('')
  const [reason, setReason] = useState('')
  const [decisionMaker, setDecisionMaker] = useState('coaching staff')
  const [expectedReturn, setExpectedReturn] = useState('')

  const athlete = DEMO_DATA.athletes.find((a) => a.id === athleteId)

  function handleSave() {
    onSave(status, { restriction, reason, decisionMaker, expectedReturn })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-t-2xl sm:rounded-2xl border border-border-1 bg-surface-1 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-text-primary">
            Update — {athlete?.full_name}
          </h3>
          <button onClick={onClose} className="text-text-faint hover:text-text-primary transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Status selector */}
        <div className="grid grid-cols-3 gap-2">
          {(['full', 'limited', 'out'] as AvailabilityStatus[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={cn(
                'rounded-xl border py-3 text-xs font-semibold capitalize transition-all',
                status === s
                  ? STATUS_STYLE[s].badge + ' border-current'
                  : 'border-border-1 bg-surface-2 text-text-muted hover:bg-surface-3'
              )}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Conditional fields */}
        {(status === 'limited' || status === 'out') && (
          <>
            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                {status === 'limited' ? 'Restrictions' : 'Reason'}
              </label>
              <input
                type="text"
                value={status === 'limited' ? restriction : reason}
                onChange={(e) => status === 'limited' ? setRestriction(e.target.value) : setReason(e.target.value)}
                placeholder={status === 'limited' ? 'e.g. No sprinting, no contact' : 'e.g. Left hamstring strain'}
                className="w-full rounded-lg border border-border-1 bg-surface-2 px-3 py-2 text-sm text-text-primary placeholder:text-text-faint focus:border-lime/40 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                Decision Made By
              </label>
              <select
                value={decisionMaker}
                onChange={(e) => setDecisionMaker(e.target.value)}
                className="w-full rounded-lg border border-border-1 bg-surface-2 px-3 py-2 text-sm text-text-primary focus:border-lime/40 focus:outline-none"
              >
                <option>physio</option>
                <option>coaching staff</option>
                <option>athlete reported</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                Expected Return Date
              </label>
              <input
                type="date"
                value={expectedReturn}
                onChange={(e) => setExpectedReturn(e.target.value)}
                className="w-full rounded-lg border border-border-1 bg-surface-2 px-3 py-2 text-sm text-text-primary focus:border-lime/40 focus:outline-none"
              />
            </div>
          </>
        )}

        <button
          onClick={handleSave}
          className="w-full rounded-xl bg-lime py-3 text-sm font-bold text-bg"
        >
          Save Update
        </button>
      </div>
    </div>
  )
}

export function AvailabilityTab() {
  const [filter, setFilter] = useState<FilterKey>('all')
  const [pendingAthleteId, setPendingAthleteId] = useState<string | null>(null)
  const [overrides, setOverrides] = useState<Record<string, AvailabilityStatus>>({})
  const [showHistory, setShowHistory] = useState<string | null>(null)

  const athletes = DEMO_DATA.athletes.map((athlete) => {
    const base = DEMO_DATA.availability.find((a) => a.athlete_id === athlete.id)
    const status: AvailabilityStatus = overrides[athlete.id] ?? base?.status ?? 'full'
    const reason = base?.reason ?? ''
    const notes = base?.notes ?? ''
    return { athlete, status, reason, notes }
  })

  const filtered = filter === 'all' ? athletes : athletes.filter((a) => a.status === filter)

  const counts = {
    all: athletes.length,
    full: athletes.filter((a) => a.status === 'full').length,
    limited: athletes.filter((a) => a.status === 'limited').length,
    out: athletes.filter((a) => a.status === 'out').length,
  }

  return (
    <div className="space-y-5">
      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'full', 'limited', 'out'] as FilterKey[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'rounded-xl border px-3 py-1.5 text-xs font-semibold capitalize transition-colors',
              filter === f
                ? f === 'full' ? 'border-green/30 bg-green/10 text-green'
                  : f === 'limited' ? 'border-amber/30 bg-amber/10 text-amber'
                  : f === 'out' ? 'border-rose/30 bg-rose/10 text-rose'
                  : 'border-lime/30 bg-lime/10 text-lime'
                : 'border-border-1 bg-surface-2 text-text-muted hover:bg-surface-3'
            )}
          >
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}{' '}
            <span className="ml-1 opacity-70">{counts[f]}</span>
          </button>
        ))}
      </div>

      {/* Athlete cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map(({ athlete, status, reason }) => {
          const style = STATUS_STYLE[status]
          const history = DEMO_AVAILABILITY_HISTORY.filter((h) => h.athleteId === athlete.id)
            .sort((a, b) => b.date.localeCompare(a.date))

          return (
            <div
              key={athlete.id}
              className="rounded-xl border border-border-1 bg-surface-2 p-4 space-y-3"
            >
              {/* Athlete header */}
              <div className="flex items-center gap-3">
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                  style={{ backgroundColor: athlete.avatar_color ?? '#8B8FA8', color: '#0F1117' }}
                >
                  {athlete.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-semibold text-text-primary truncate">{athlete.full_name}</span>
                    <span className="text-[10px] text-text-muted shrink-0">#{athlete.jersey_number}</span>
                  </div>
                  <p className="text-[10px] text-text-muted">{athlete.position}</p>
                </div>
              </div>

              {/* Status badge */}
              <div className="flex items-center justify-between">
                <span className={cn('inline-flex items-center rounded border px-2 py-0.5 text-xs font-semibold capitalize', style.badge)}>
                  <span
                    className="mr-1.5 h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: style.dot }}
                  />
                  {status}
                </span>
                <button
                  onClick={() => setPendingAthleteId(athlete.id)}
                  className="text-[10px] font-medium text-text-muted hover:text-lime transition-colors"
                >
                  Update
                </button>
              </div>

              {/* Reason */}
              {reason && (
                <p className="text-[11px] text-text-muted">{reason}</p>
              )}

              {/* History toggle */}
              {history.length > 0 && (
                <div>
                  <button
                    onClick={() => setShowHistory(showHistory === athlete.id ? null : athlete.id)}
                    className="flex items-center gap-1 text-[10px] text-text-faint hover:text-text-muted transition-colors"
                  >
                    <ChevronDown className={cn('h-3 w-3 transition-transform', showHistory === athlete.id && 'rotate-180')} />
                    Status history ({history.length})
                  </button>
                  {showHistory === athlete.id && (
                    <div className="mt-2 space-y-1.5 border-t border-border-1 pt-2">
                      {history.slice(0, 4).map((h) => (
                        <div key={h.id} className="text-[10px] text-text-faint">
                          <span className="font-medium text-text-muted capitalize">{h.status}</span>
                          {' · '}{h.date}
                          {h.reason && <span> — {h.reason}</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Status update sheet */}
      {pendingAthleteId && (
        <StatusSheet
          athleteId={pendingAthleteId}
          currentStatus={
            overrides[pendingAthleteId] ??
            DEMO_DATA.availability.find((a) => a.athlete_id === pendingAthleteId)?.status ??
            'full'
          }
          onSave={(status) => {
            setOverrides((prev) => ({ ...prev, [pendingAthleteId]: status }))
          }}
          onClose={() => setPendingAthleteId(null)}
        />
      )}
    </div>
  )
}
