'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { TopBar } from '@/components/shared/TopBar'
import { EmptyState } from '@/components/shared/EmptyState'
import type { RecruitmentProspect } from '@/types/database'
import { UserPlus, GraduationCap, X } from 'lucide-react'

type PipelineStatus =
  | 'tracking'
  | 'active'
  | 'contacted'
  | 'offer_made'
  | 'committed'
  | 'declined'

const PIPELINE_COLUMNS: { id: PipelineStatus; label: string; color: string }[] = [
  { id: 'tracking', label: 'Tracking', color: 'text-text-muted border-border-1' },
  { id: 'active', label: 'Active', color: 'text-sky border-sky/30' },
  { id: 'contacted', label: 'Contacted', color: 'text-violet border-violet/30' },
  { id: 'offer_made', label: 'Offer Made', color: 'text-amber border-amber/30' },
  { id: 'committed', label: 'Committed', color: 'text-green border-green/30' },
  { id: 'declined', label: 'Declined', color: 'text-rose border-rose/30' },
]

const DEMO_PROSPECTS: RecruitmentProspect[] = [
  {
    id: 'rp-001',
    team_id: 'demo-team-mcmaster-001',
    name: 'Tyler Nguyen',
    position: 'Midfielder',
    age: 18,
    current_club: 'Toronto FC Academy',
    status: 'active',
    notes: 'Strong technical skills. Top OUA prospect for 2026 intake.',
    academic_eligible: true,
    created_by: 'demo-coach-001',
    created_at: '2026-02-01T00:00:00Z',
  },
  {
    id: 'rp-002',
    team_id: 'demo-team-mcmaster-001',
    name: 'Aisha Osei',
    position: 'Striker',
    age: 17,
    current_club: 'Sigma FC',
    status: 'contacted',
    notes: 'High scoring record in League1. Academic eligibility confirmed.',
    academic_eligible: true,
    created_by: 'demo-coach-001',
    created_at: '2026-02-10T00:00:00Z',
  },
  {
    id: 'rp-003',
    team_id: 'demo-team-mcmaster-001',
    name: 'Ben Kowalski',
    position: 'Defender',
    age: 19,
    current_club: 'Ottawa Fury Academy',
    status: 'offer_made',
    notes: 'Versatile CB/LB. Decision pending scholarship offer from Western.',
    academic_eligible: true,
    created_by: 'demo-coach-001',
    created_at: '2026-01-15T00:00:00Z',
  },
  {
    id: 'rp-004',
    team_id: 'demo-team-mcmaster-001',
    name: 'Nico Delacroix',
    position: 'Goalkeeper',
    age: 18,
    current_club: 'Montreal Impact Academy',
    status: 'tracking',
    notes: '6\'3" GK prospect. Watching League1 appearances.',
    academic_eligible: false,
    created_by: 'demo-coach-001',
    created_at: '2026-03-01T00:00:00Z',
  },
  {
    id: 'rp-005',
    team_id: 'demo-team-mcmaster-001',
    name: 'Fatima Bello',
    position: 'Midfielder',
    age: 18,
    current_club: 'Calgary Foothills FC',
    status: 'committed',
    notes: 'Committed for Fall 2026. Excellent academic record.',
    academic_eligible: true,
    created_by: 'demo-coach-001',
    created_at: '2026-01-05T00:00:00Z',
  },
  {
    id: 'rp-006',
    team_id: 'demo-team-mcmaster-001',
    name: 'James Park',
    position: 'Forward',
    age: 19,
    current_club: 'Vancouver Whitecaps Academy',
    status: 'declined',
    notes: 'Chose UBC. Keep on watch list for transfer portal.',
    academic_eligible: true,
    created_by: 'demo-coach-001',
    created_at: '2025-11-20T00:00:00Z',
  },
]

function ProspectCard({
  prospect,
  onMove,
  onRemove,
}: {
  prospect: RecruitmentProspect
  onMove: (id: string, status: PipelineStatus) => void
  onRemove: (id: string) => void
}) {
  return (
    <div className="rounded-lg border border-border-1 bg-surface-3 p-3 space-y-2">
      <div className="flex items-start justify-between gap-1">
        <div className="min-w-0">
          <div className="text-xs font-semibold text-text-primary truncate">{prospect.name}</div>
          <div className="text-[10px] text-text-muted">{prospect.position} · Age {prospect.age}</div>
        </div>
        <button
          onClick={() => onRemove(prospect.id)}
          className="shrink-0 text-text-muted hover:text-rose transition-colors"
        >
          <X className="h-3 w-3" />
        </button>
      </div>

      <div className="text-[10px] text-text-muted">{prospect.current_club}</div>

      {prospect.academic_eligible && (
        <div className="flex items-center gap-1 text-[10px] text-green">
          <GraduationCap className="h-2.5 w-2.5" />
          Acad. eligible
        </div>
      )}

      {prospect.notes && (
        <p className="text-[10px] text-text-muted line-clamp-2">{prospect.notes}</p>
      )}

      <select
        value={prospect.status}
        onChange={(e) => onMove(prospect.id, e.target.value as PipelineStatus)}
        className="w-full rounded border border-border-1 bg-surface-2 px-2 py-1 text-[10px] text-text-muted focus:outline-none focus:ring-1 focus:ring-lime/40"
      >
        {PIPELINE_COLUMNS.map((col) => (
          <option key={col.id} value={col.id}>
            {col.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export default function RecruitmentPage() {
  const searchParams = useSearchParams()
  const isDemo = searchParams.get('demo') === 'true'

  const [prospects, setProspects] = useState<RecruitmentProspect[]>(
    isDemo ? DEMO_PROSPECTS : []
  )

  // Add prospect form
  const [showForm, setShowForm] = useState(false)
  const [formName, setFormName] = useState('')
  const [formPosition, setFormPosition] = useState('')
  const [formAge, setFormAge] = useState('')
  const [formClub, setFormClub] = useState('')
  const [formEligible, setFormEligible] = useState(true)
  const [formNotes, setFormNotes] = useState('')

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    const newProspect: RecruitmentProspect = {
      id: `rp-${Date.now()}`,
      team_id: 'demo-team-mcmaster-001',
      name: formName,
      position: formPosition,
      age: parseInt(formAge) || 18,
      current_club: formClub,
      status: 'tracking',
      notes: formNotes,
      academic_eligible: formEligible,
      created_by: 'demo-coach-001',
      created_at: new Date().toISOString(),
    }
    setProspects((prev) => [newProspect, ...prev])
    setFormName('')
    setFormPosition('')
    setFormAge('')
    setFormClub('')
    setFormEligible(true)
    setFormNotes('')
    setShowForm(false)
  }

  function handleMove(id: string, status: PipelineStatus) {
    setProspects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status } : p))
    )
  }

  function handleRemove(id: string) {
    setProspects((prev) => prev.filter((p) => p.id !== id))
  }

  const byStatus = (status: PipelineStatus) =>
    prospects.filter((p) => p.status === status)

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <TopBar
        title="Recruitment Pipeline"
        subtitle={`${prospects.length} prospect${prospects.length !== 1 ? 's' : ''}`}
        actions={
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex h-8 items-center gap-1.5 rounded-lg bg-lime/10 border border-lime/20 px-3 text-xs text-lime transition-colors hover:bg-lime/20"
          >
            <UserPlus className="h-3.5 w-3.5" />
            Add Prospect
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* Add Prospect Form */}
        {showForm && (
          <form
            onSubmit={handleAdd}
            className="rounded-xl border border-border-1 bg-surface-2 p-5 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-text-primary">Add Prospect</h2>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-text-muted hover:text-text-primary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs text-text-muted">Name *</label>
                <input
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full rounded-lg border border-border-1 bg-surface-3 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-lime/40"
                  placeholder="Full name"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-text-muted">Position</label>
                <input
                  value={formPosition}
                  onChange={(e) => setFormPosition(e.target.value)}
                  className="w-full rounded-lg border border-border-1 bg-surface-3 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-lime/40"
                  placeholder="e.g. Midfielder"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-text-muted">Age</label>
                <input
                  type="number"
                  min="14"
                  max="30"
                  value={formAge}
                  onChange={(e) => setFormAge(e.target.value)}
                  className="w-full rounded-lg border border-border-1 bg-surface-3 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-lime/40"
                  placeholder="18"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-text-muted">Current Club</label>
                <input
                  value={formClub}
                  onChange={(e) => setFormClub(e.target.value)}
                  className="w-full rounded-lg border border-border-1 bg-surface-3 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-lime/40"
                  placeholder="e.g. Toronto FC Academy"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-text-muted">Notes</label>
                <input
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full rounded-lg border border-border-1 bg-surface-3 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-lime/40"
                  placeholder="Scout notes..."
                />
              </div>
              <div className="flex items-end gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formEligible}
                    onChange={(e) => setFormEligible(e.target.checked)}
                    className="accent-lime"
                  />
                  <span className="text-xs text-text-muted">Academic eligible</span>
                </label>
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
                Add Prospect
              </button>
            </div>
          </form>
        )}

        {prospects.length === 0 ? (
          <EmptyState
            icon="🎯"
            title="No prospects tracked"
            description="Add your first prospect to begin building the recruitment pipeline."
            action={
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-1.5 rounded-lg bg-lime/10 border border-lime/20 px-3 py-1.5 text-xs text-lime hover:bg-lime/20"
              >
                <UserPlus className="h-3.5 w-3.5" />
                Add Prospect
              </button>
            }
          />
        ) : (
          /* Kanban Board */
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-3 2xl:grid-cols-6">
            {PIPELINE_COLUMNS.map((col) => {
              const colProspects = byStatus(col.id)
              return (
                <div key={col.id} className="flex flex-col gap-2 min-w-0">
                  {/* Column Header */}
                  <div
                    className={`flex items-center justify-between rounded-lg border px-3 py-2 ${col.color}`}
                  >
                    <span className="text-xs font-semibold">{col.label}</span>
                    <span className="flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-surface-3 px-1 text-[10px] font-bold text-text-muted">
                      {colProspects.length}
                    </span>
                  </div>

                  {/* Cards */}
                  <div className="space-y-2 min-h-[80px]">
                    {colProspects.length === 0 ? (
                      <div className="rounded-lg border border-dashed border-border-1 p-3 text-center">
                        <span className="text-[10px] text-text-muted">Empty</span>
                      </div>
                    ) : (
                      colProspects.map((prospect) => (
                        <ProspectCard
                          key={prospect.id}
                          prospect={prospect}
                          onMove={handleMove}
                          onRemove={handleRemove}
                        />
                      ))
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
