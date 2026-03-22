'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { TopBar } from '@/components/shared/TopBar'
import { EmptyState } from '@/components/shared/EmptyState'
import { StatusDot } from '@/components/shared/StatusDot'
import { DEMO_DATA } from '@/lib/demo/data'
import type { AvailabilityStatus } from '@/types/database'
import { PlusCircle, X } from 'lucide-react'

interface InjuryRow {
  id: string
  athleteName: string
  position: string
  avatarColor: string
  initials: string
  status: AvailabilityStatus
  reason: string
  notes: string
  cleared_by: string
  date: string
}

function buildDemoInjuries(): InjuryRow[] {
  return DEMO_DATA.availability
    .filter((a) => a.status !== 'full')
    .map((a) => {
      const athlete = DEMO_DATA.athletes.find((u) => u.id === a.athlete_id)!
      return {
        id: a.id,
        athleteName: athlete.full_name,
        position: athlete.position ?? '—',
        avatarColor: athlete.avatar_color ?? '#7a869a',
        initials: athlete.initials ?? '?',
        status: a.status,
        reason: a.reason,
        notes: a.notes,
        cleared_by: a.cleared_by,
        date: a.date,
      }
    })
}

const STATUS_LABEL: Record<AvailabilityStatus, string> = {
  full: 'Full',
  limited: 'Limited',
  out: 'Out',
}

export default function InjuriesPage() {
  const searchParams = useSearchParams()
  const isDemo = searchParams.get('demo') === 'true'

  const initialRows: InjuryRow[] = isDemo ? buildDemoInjuries() : []
  const [injuries, setInjuries] = useState<InjuryRow[]>(initialRows)

  // Form state
  const [showForm, setShowForm] = useState(false)
  const [formAthlete, setFormAthlete] = useState('')
  const [formStatus, setFormStatus] = useState<AvailabilityStatus>('limited')
  const [formReason, setFormReason] = useState('')
  const [formNotes, setFormNotes] = useState('')

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    const newRow: InjuryRow = {
      id: `inj-${Date.now()}`,
      athleteName: formAthlete,
      position: '—',
      avatarColor: '#7a869a',
      initials: formAthlete.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase(),
      status: formStatus,
      reason: formReason,
      notes: formNotes,
      cleared_by: '',
      date: new Date().toISOString().split('T')[0],
    }
    setInjuries((prev) => [newRow, ...prev])
    setFormAthlete('')
    setFormStatus('limited')
    setFormReason('')
    setFormNotes('')
    setShowForm(false)
  }

  function handleRemove(id: string) {
    setInjuries((prev) => prev.filter((r) => r.id !== id))
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <TopBar
        title="Injury Tracker"
        subtitle={`${injuries.length} flag${injuries.length !== 1 ? 's' : ''} active`}
        actions={
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex h-8 items-center gap-1.5 rounded-lg bg-lime/10 border border-lime/20 px-3 text-xs text-lime transition-colors hover:bg-lime/20"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            Add Flag
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* Add Injury Form */}
        {showForm && (
          <form
            onSubmit={handleAdd}
            className="rounded-xl border border-border-1 bg-surface-2 p-5 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-text-primary">Add Injury / Availability Flag</h2>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-text-muted hover:text-text-primary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs text-text-muted">Athlete Name</label>
                <input
                  required
                  value={formAthlete}
                  onChange={(e) => setFormAthlete(e.target.value)}
                  className="w-full rounded-lg border border-border-1 bg-surface-3 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-lime/40"
                  placeholder="e.g. Jordan Casey"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-text-muted">Status</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as AvailabilityStatus)}
                  className="w-full rounded-lg border border-border-1 bg-surface-3 px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-lime/40"
                >
                  <option value="limited">Limited</option>
                  <option value="out">Out</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-text-muted">Reason</label>
                <input
                  value={formReason}
                  onChange={(e) => setFormReason(e.target.value)}
                  className="w-full rounded-lg border border-border-1 bg-surface-3 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-lime/40"
                  placeholder="e.g. Left knee soreness"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-text-muted">Notes</label>
                <input
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full rounded-lg border border-border-1 bg-surface-3 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-lime/40"
                  placeholder="e.g. No sprinting, light training only"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg border border-border-1 px-4 py-1.5 text-xs text-text-muted hover:bg-surface-3"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-lime px-4 py-1.5 text-xs font-semibold text-bg hover:bg-lime/90"
              >
                Add Flag
              </button>
            </div>
          </form>
        )}

        {injuries.length === 0 ? (
          <EmptyState
            icon="🏥"
            title="No injury flags"
            description="All athletes are at full availability. Injury flags will appear here when reported."
            action={
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-1.5 rounded-lg bg-lime/10 border border-lime/20 px-3 py-1.5 text-xs text-lime hover:bg-lime/20"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                Add Flag
              </button>
            }
          />
        ) : (
          <div className="rounded-xl border border-border-1 bg-surface-2 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-1 bg-surface-3/50">
                    <th className="px-5 py-3 text-left text-xs font-medium text-text-muted">Athlete</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-muted">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-muted">Reason</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-muted">Notes</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-muted">Cleared By</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-muted">Date</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-1">
                  {injuries.map((row) => (
                    <tr key={row.id} className="hover:bg-surface-3/40 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-bg"
                            style={{ backgroundColor: row.avatarColor }}
                          >
                            {row.initials}
                          </div>
                          <div>
                            <div className="text-xs font-medium text-text-primary">{row.athleteName}</div>
                            <div className="text-[10px] text-text-muted">{row.position}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <StatusDot status={row.status} showLabel />
                      </td>
                      <td className="px-4 py-3 text-xs text-text-primary max-w-[160px] truncate">
                        {row.reason || '—'}
                      </td>
                      <td className="px-4 py-3 text-xs text-text-muted max-w-[200px] truncate">
                        {row.notes || '—'}
                      </td>
                      <td className="px-4 py-3 text-xs text-text-muted">
                        {row.cleared_by || <span className="italic text-text-faint">Pending</span>}
                      </td>
                      <td className="px-4 py-3 text-xs text-text-muted whitespace-nowrap">
                        {new Date(row.date).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleRemove(row.id)}
                          className="rounded p-1 text-text-muted hover:text-rose transition-colors"
                          title="Remove flag"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
