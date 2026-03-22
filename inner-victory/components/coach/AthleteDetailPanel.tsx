'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ScoreBadge } from '@/components/shared/ScoreBadge'
import { StatusDot } from '@/components/shared/StatusDot'
import { FlagTag } from '@/components/shared/FlagTag'
import { X, MessageSquare, Video, Dumbbell, HeartPulse, Activity } from 'lucide-react'
import type { AthleteReadinessRow } from '@/hooks/useTeamReadiness'
import type { AvailabilityStatus, StaffNote, AcademicRecord } from '@/types/database'
import { cn } from '@/lib/utils'

type NoteTab = 'coach' | 'film' | 'training' | 'physio'

const NOTE_TABS = [
  { id: 'coach' as NoteTab, label: 'Coach', icon: MessageSquare },
  { id: 'film' as NoteTab, label: 'Film', icon: Video },
  { id: 'training' as NoteTab, label: 'Training', icon: Dumbbell },
  { id: 'physio' as NoteTab, label: 'Physio', icon: HeartPulse },
]

const SOURCE_MAP: Record<NoteTab, string> = {
  coach: 'general',
  film: 'film',
  training: 'training',
  physio: 'physio',
}

interface AthleteDetailPanelProps {
  athlete: AthleteReadinessRow
  onClose: () => void
  teamMentalAvg?: number
}

export function AthleteDetailPanel({ athlete, onClose, teamMentalAvg = 0 }: AthleteDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<NoteTab>('coach')
  const [notes, setNotes] = useState<StaffNote[]>([])
  const [academic, setAcademic] = useState<AcademicRecord | null>(null)
  const [newNote, setNewNote] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    async function fetchData() {
      const [notesResult, academicResult] = await Promise.all([
        supabase.from('staff_notes').select('*').eq('athlete_id', athlete.athlete_id).order('created_at', { ascending: false }),
        supabase.from('academic_records').select('*').eq('athlete_id', athlete.athlete_id).single(),
      ])
      setNotes(notesResult.data ?? [])
      setAcademic(academicResult.data ?? null)
    }

    fetchData()
  }, [athlete.athlete_id])

  const filteredNotes = notes.filter((n) => n.source === SOURCE_MAP[activeTab] || (activeTab === 'coach' && n.source === 'general'))

  async function addNote() {
    if (!newNote.trim()) return
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }

    const { data: userData } = await supabase.from('users').select('role, full_name').eq('id', user.id).single()

    const { data } = await supabase.from('staff_notes').insert({
      athlete_id: athlete.athlete_id,
      team_id: athlete.team_id,
      author_id: user.id,
      author_role: userData?.role ?? 'coach',
      note_text: newNote.trim(),
      source: SOURCE_MAP[activeTab],
      tags: [],
      is_private: false,
    }).select().single()

    if (data) setNotes([data, ...notes])
    setNewNote('')
    setSaving(false)
  }

  const mentalDisplay = teamMentalAvg ? `${teamMentalAvg} (team avg)` : '—'

  return (
    <div className="rounded-xl border border-border-1 bg-surface-2 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-1 p-5">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-bg"
            style={{ backgroundColor: athlete.user?.avatar_color ?? '#7a869a' }}
          >
            {athlete.user?.initials ?? '?'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-text-primary">{athlete.user?.full_name}</span>
              <span className="text-xs text-text-muted">#{athlete.user?.jersey_number} · {athlete.user?.position}</span>
            </div>
            <div className="flex items-center gap-2">
              <StatusDot status={(athlete.availability_status ?? 'full') as AvailabilityStatus} showLabel />
              {athlete.availability_reason && (
                <span className="text-[10px] text-text-muted">— {athlete.availability_reason}</span>
              )}
            </div>
          </div>
        </div>
        <button onClick={onClose} className="text-text-muted hover:text-text-primary">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* 4-column stat grid */}
      <div className="grid grid-cols-2 gap-4 p-5 lg:grid-cols-4">
        {/* Readiness */}
        <div className="rounded-lg bg-surface-3 p-3">
          <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-text-faint">
            <Activity className="h-3 w-3" /> Readiness
          </div>
          <ScoreBadge score={athlete.combined_score} size="lg" className="mb-2" />
          <div className="space-y-1">
            <MiniBar label="Physical" value={athlete.physical_score} color="#4ade80" />
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-text-muted">Mental</span>
              <span className="text-[10px] text-text-muted">{mentalDisplay}</span>
            </div>
            <MiniBar label="Sleep" value={athlete.sleep_score} color="#a78bfa" />
          </div>
        </div>

        {/* Wearables */}
        <div className="rounded-lg bg-surface-3 p-3">
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-text-faint">Wearables</div>
          <div className="space-y-2">
            <StatRow label="HRV" value={`${athlete.hrv ?? '—'} ms`} />
            <StatRow label="Resting HR" value={`${athlete.resting_hr ?? '—'} bpm`} />
            <StatRow label="Sleep" value={`${athlete.sleep_hours ?? '—'}h`} />
            <StatRow label="Strain" value={`${athlete.strain ?? '—'}`} />
          </div>
          {athlete.wearable_source && (
            <div className="mt-2 text-[10px] text-text-faint capitalize">via {athlete.wearable_source}</div>
          )}
        </div>

        {/* Season Performance */}
        <div className="rounded-lg bg-surface-3 p-3">
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-text-faint">Season</div>
          <div className="space-y-2">
            <StatRow label="Rating" value="7.4" />
            <StatRow label="Goals" value="3" />
            <StatRow label="Assists" value="5" />
            <StatRow label="Minutes" value="612" />
          </div>
        </div>

        {/* Academics */}
        <div className="rounded-lg bg-surface-3 p-3">
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-text-faint">Academics</div>
          {academic ? (
            <div className="space-y-2">
              <StatRow label="GPA" value={academic.gpa?.toFixed(2) ?? '—'} />
              <StatRow label="Attendance" value={`${academic.attendance_pct ?? '—'}%`} />
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-text-muted">Eligibility</span>
                <span className={cn('text-[10px] font-semibold capitalize',
                  academic.eligibility_status === 'ok' ? 'text-green'
                  : academic.eligibility_status === 'review' ? 'text-amber'
                  : 'text-rose'
                )}>
                  {academic.eligibility_status}
                </span>
              </div>
              {academic.flag_reason && (
                <div className="flex items-center gap-1">
                  <FlagTag type="academic" />
                  <span className="text-[10px] text-text-muted">{academic.flag_reason}</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-[10px] text-text-muted">No academic data</p>
          )}
        </div>
      </div>

      {/* Notes tabs */}
      <div className="border-t border-border-1 px-5 pb-5">
        <div className="flex gap-1 py-3">
          {NOTE_TABS.map((tab) => {
            const Icon = tab.icon
            const tabNotes = notes.filter((n) => n.source === SOURCE_MAP[tab.id] || (tab.id === 'coach' && n.source === 'general'))
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                  activeTab === tab.id ? 'bg-surface-3 text-text-primary' : 'text-text-muted hover:text-text-primary'
                )}
              >
                <Icon className="h-3 w-3" />
                {tab.label}
                {tabNotes.length > 0 && (
                  <span className="rounded-full bg-surface-3 px-1.5 text-[10px] text-text-faint">{tabNotes.length}</span>
                )}
              </button>
            )
          })}
        </div>

        <div className="space-y-2">
          {filteredNotes.map((note) => (
            <div key={note.id} className="rounded-lg bg-surface-3 p-3">
              <div className="mb-1 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[10px] text-text-muted">
                  <span className="font-medium text-text-primary">{note.author_role}</span>
                  <span>·</span>
                  <span>{new Date(note.created_at).toLocaleDateString('en-GB')}</span>
                </div>
                {note.tags?.map((tag) => (
                  <span key={tag} className="rounded bg-surface-2 px-1 py-0.5 text-[9px] text-text-faint">{tag}</span>
                ))}
              </div>
              <p className="text-xs text-text-primary">{note.note_text}</p>
            </div>
          ))}

          {/* Add note input */}
          <div className="flex gap-2">
            <input
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && addNote()}
              placeholder="Add a note..."
              className="flex-1 rounded-lg border border-border-1 bg-surface-3 px-3 py-2 text-xs text-text-primary placeholder:text-text-faint focus:border-lime/40 focus:outline-none"
            />
            <button
              onClick={addNote}
              disabled={saving || !newNote.trim()}
              className="rounded-lg bg-lime/10 px-3 py-2 text-xs font-medium text-lime transition-colors hover:bg-lime/20 disabled:opacity-50"
            >
              {saving ? '...' : 'Add'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function MiniBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="mb-0.5 flex items-center justify-between">
        <span className="text-[10px] text-text-faint">{label}</span>
        <span className="text-[10px] font-mono text-text-muted">{value}</span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-surface-2">
        <div className="h-full rounded-full" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[10px] text-text-muted">{label}</span>
      <span className="text-[10px] font-semibold tabular-nums text-text-primary">{value}</span>
    </div>
  )
}
