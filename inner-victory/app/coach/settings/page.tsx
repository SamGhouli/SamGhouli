'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { TopBar } from '@/components/shared/TopBar'
import { DEMO_DATA, DEMO_COACH } from '@/lib/demo/data'
import { Save, Pencil, X, Plus } from 'lucide-react'
import type { Role } from '@/types/database'

interface StaffMember {
  id: string
  name: string
  role: Role
  email: string
}

const DEMO_STAFF: StaffMember[] = [
  { id: 'staff-001', name: 'Coach Sarah Mitchell', role: 'coach', email: 'sarah.mitchell@mcmaster.ca' },
  { id: 'staff-002', name: 'Dr. Alex Patel', role: 'physio', email: 'alex.patel@mcmaster.ca' },
  { id: 'staff-003', name: 'Jordan Lee', role: 'assistant_coach', email: 'jordan.lee@mcmaster.ca' },
  { id: 'staff-004', name: 'Sam Torres', role: 'strength_coach', email: 'sam.torres@mcmaster.ca' },
  { id: 'staff-005', name: 'Chris Obi', role: 'video_coordinator', email: 'chris.obi@mcmaster.ca' },
]

const ROLE_LABELS: Record<Role, string> = {
  athlete: 'Athlete',
  coach: 'Head Coach',
  assistant_coach: 'Assistant Coach',
  physio: 'Physiotherapist',
  strength_coach: 'Strength & Conditioning',
  video_coordinator: 'Video Coordinator',
  athletic_director: 'Athletic Director',
}

const ROLE_COLORS: Record<Role, string> = {
  athlete: 'bg-sky/10 border-sky/20 text-sky',
  coach: 'bg-lime/10 border-lime/20 text-lime',
  assistant_coach: 'bg-teal/10 border-teal/20 text-teal',
  physio: 'bg-green/10 border-green/20 text-green',
  strength_coach: 'bg-amber/10 border-amber/20 text-amber',
  video_coordinator: 'bg-violet/10 border-violet/20 text-violet',
  athletic_director: 'bg-rose/10 border-rose/20 text-rose',
}

export default function SettingsPage() {
  const searchParams = useSearchParams()
  const isDemo = searchParams.get('demo') === 'true'

  const initialTeam = isDemo ? DEMO_DATA.team : {
    id: '',
    name: '',
    sport: '',
    league: '',
    institution: '',
    season_label: '',
    created_at: '',
  }

  // Team form
  const [editingTeam, setEditingTeam] = useState(false)
  const [teamName, setTeamName] = useState(initialTeam.name)
  const [teamSport, setTeamSport] = useState(initialTeam.sport)
  const [teamLeague, setTeamLeague] = useState(initialTeam.league)
  const [teamInstitution, setTeamInstitution] = useState(initialTeam.institution)
  const [teamSeason, setTeamSeason] = useState(initialTeam.season_label)
  const [teamSaved, setTeamSaved] = useState(false)

  function handleSaveTeam(e: React.FormEvent) {
    e.preventDefault()
    setTeamSaved(true)
    setEditingTeam(false)
    setTimeout(() => setTeamSaved(false), 3000)
  }

  // Staff management
  const [staff, setStaff] = useState<StaffMember[]>(isDemo ? DEMO_STAFF : [])
  const [showAddStaff, setShowAddStaff] = useState(false)
  const [newName, setNewName] = useState('')
  const [newRole, setNewRole] = useState<Role>('assistant_coach')
  const [newEmail, setNewEmail] = useState('')

  function handleAddStaff(e: React.FormEvent) {
    e.preventDefault()
    setStaff((prev) => [
      ...prev,
      {
        id: `staff-${Date.now()}`,
        name: newName,
        role: newRole,
        email: newEmail,
      },
    ])
    setNewName('')
    setNewRole('assistant_coach')
    setNewEmail('')
    setShowAddStaff(false)
  }

  function handleRemoveStaff(id: string) {
    setStaff((prev) => prev.filter((s) => s.id !== id))
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <TopBar title="Settings" subtitle="Team configuration & staff management" />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Team Info */}
        <div className="rounded-xl border border-border-1 bg-surface-2 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text-primary">Team Information</h2>
            {!editingTeam ? (
              <button
                onClick={() => setEditingTeam(true)}
                className="flex items-center gap-1.5 rounded-lg border border-border-1 px-3 py-1.5 text-xs text-text-muted hover:bg-surface-3 hover:text-text-primary transition-colors"
              >
                <Pencil className="h-3 w-3" />
                Edit
              </button>
            ) : (
              <button
                onClick={() => setEditingTeam(false)}
                className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary"
              >
                <X className="h-3 w-3" />
                Cancel
              </button>
            )}
          </div>

          {teamSaved && (
            <div className="mb-3 rounded-lg border border-green/20 bg-green/10 px-4 py-2 text-xs text-green">
              Team settings saved successfully.
            </div>
          )}

          <form onSubmit={handleSaveTeam}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                { label: 'Team Name', value: teamName, setter: setTeamName },
                { label: 'Sport', value: teamSport, setter: setTeamSport },
                { label: 'League', value: teamLeague, setter: setTeamLeague },
                { label: 'Institution', value: teamInstitution, setter: setTeamInstitution },
              ].map(({ label, value, setter }) => (
                <div key={label}>
                  <label className="mb-1 block text-xs text-text-muted">{label}</label>
                  {editingTeam ? (
                    <input
                      value={value}
                      onChange={(e) => setter(e.target.value)}
                      className="w-full rounded-lg border border-border-1 bg-surface-3 px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-lime/40"
                    />
                  ) : (
                    <div className="rounded-lg border border-border-1 bg-surface-3/50 px-3 py-2 text-sm text-text-primary">
                      {value || <span className="text-text-muted italic">Not set</span>}
                    </div>
                  )}
                </div>
              ))}

              <div>
                <label className="mb-1 block text-xs text-text-muted">Season Label</label>
                {editingTeam ? (
                  <input
                    value={teamSeason}
                    onChange={(e) => setTeamSeason(e.target.value)}
                    className="w-full rounded-lg border border-border-1 bg-surface-3 px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-lime/40"
                    placeholder="e.g. 2025–26"
                  />
                ) : (
                  <div className="rounded-lg border border-border-1 bg-surface-3/50 px-3 py-2 text-sm text-text-primary">
                    {teamSeason || <span className="text-text-muted italic">Not set</span>}
                  </div>
                )}
              </div>
            </div>

            {editingTeam && (
              <div className="mt-4 flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-lg bg-lime px-4 py-2 text-xs font-semibold text-bg hover:bg-lime/90"
                >
                  <Save className="h-3 w-3" />
                  Save Changes
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Staff Management */}
        <div className="rounded-xl border border-border-1 bg-surface-2 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text-primary">Staff Management</h2>
            <button
              onClick={() => setShowAddStaff((v) => !v)}
              className="flex items-center gap-1.5 rounded-lg bg-lime/10 border border-lime/20 px-3 py-1.5 text-xs text-lime hover:bg-lime/20 transition-colors"
            >
              <Plus className="h-3 w-3" />
              Add Staff
            </button>
          </div>

          {/* Add Staff Form */}
          {showAddStaff && (
            <form onSubmit={handleAddStaff} className="mb-4 rounded-lg border border-border-1 bg-surface-3 p-4 space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs text-text-muted">Name *</label>
                  <input
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full rounded-lg border border-border-1 bg-surface-2 px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-lime/40"
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-text-muted">Role</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as Role)}
                    className="w-full rounded-lg border border-border-1 bg-surface-2 px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-lime/40"
                  >
                    {Object.entries(ROLE_LABELS)
                      .filter(([k]) => k !== 'athlete')
                      .map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-text-muted">Email</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full rounded-lg border border-border-1 bg-surface-2 px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-lime/40"
                    placeholder="email@institution.ca"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddStaff(false)}
                  className="rounded-lg border border-border-1 px-3 py-1.5 text-xs text-text-muted hover:bg-surface-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-lime px-3 py-1.5 text-xs font-semibold text-bg hover:bg-lime/90"
                >
                  Add
                </button>
              </div>
            </form>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-1">
                  <th className="pb-2 text-left text-xs font-medium text-text-muted">Name</th>
                  <th className="pb-2 text-left text-xs font-medium text-text-muted">Role</th>
                  <th className="pb-2 text-left text-xs font-medium text-text-muted">Email</th>
                  <th className="pb-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border-1">
                {staff.map((member) => {
                  const roleColor = ROLE_COLORS[member.role] ?? 'bg-surface-3 border-border-1 text-text-muted'
                  return (
                    <tr key={member.id} className="hover:bg-surface-3/40 transition-colors">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-lime/10 text-xs font-bold text-lime">
                            {member.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <span className="text-xs font-medium text-text-primary">{member.name}</span>
                        </div>
                      </td>
                      <td className="py-3">
                        <span className={`inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-semibold ${roleColor}`}>
                          {ROLE_LABELS[member.role] ?? member.role}
                        </span>
                      </td>
                      <td className="py-3 text-xs text-text-muted">{member.email || '—'}</td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => handleRemoveStaff(member.id)}
                          className="rounded p-1 text-text-muted hover:text-rose transition-colors"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
                {staff.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-xs text-text-muted">
                      No staff members added yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Season Label Quick Update */}
        <div className="rounded-xl border border-border-1 bg-surface-2 p-5">
          <h2 className="mb-3 text-sm font-semibold text-text-primary">Season Label</h2>
          <div className="flex items-center gap-3">
            <input
              value={teamSeason}
              onChange={(e) => setTeamSeason(e.target.value)}
              className="flex-1 max-w-xs rounded-lg border border-border-1 bg-surface-3 px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-lime/40"
              placeholder="e.g. 2025–26"
            />
            <button
              onClick={() => setTeamSaved(true)}
              className="flex items-center gap-1.5 rounded-lg bg-lime px-4 py-2 text-xs font-semibold text-bg hover:bg-lime/90"
            >
              <Save className="h-3 w-3" />
              Update
            </button>
          </div>
          <p className="mt-2 text-[10px] text-text-muted">
            This label appears across all coach dashboards and reports.
          </p>
        </div>
      </div>
    </div>
  )
}
