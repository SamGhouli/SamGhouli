'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Role } from '@/types/database'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const SPORTS = [
  'Soccer',
  'Basketball',
  'Hockey',
  'Volleyball',
  'Football',
  'Rugby',
  'Swimming',
  'Track & Field',
  'Cross Country',
  'Tennis',
  'Baseball',
  'Softball',
  'Lacrosse',
  'Field Hockey',
  'Wrestling',
  'Other',
]

const LEAGUES = [
  'U SPORTS',
  'OUA',
  'NCAA D2',
  'NCAA D3',
  'High Performance Youth',
  'RSEQ',
  'Canada West',
  'AUS',
  'OFC',
]

const COACH_ROLES: { value: Role; label: string; description: string }[] = [
  { value: 'coach', label: 'Head Coach', description: 'Full team management access' },
  { value: 'assistant_coach', label: 'Assistant Coach', description: 'Training and development' },
  { value: 'physio', label: 'Physiotherapist', description: 'Athlete health and injury' },
  { value: 'strength_coach', label: 'Strength & Conditioning', description: 'Load management and performance' },
  { value: 'video_coordinator', label: 'Video Coordinator', description: 'Film sessions and analysis' },
  { value: 'athletic_director', label: 'Athletic Director', description: 'Program oversight and strategy' },
]

// ---------------------------------------------------------------------------
// Step form types
// ---------------------------------------------------------------------------
interface TeamForm {
  name: string
  sport: string
  league: string
  institution: string
}

interface ProfileForm {
  fullName: string
  role: Role | ''
}

// ---------------------------------------------------------------------------
// Progress indicator
// ---------------------------------------------------------------------------
function StepIndicator({ currentStep, total }: { currentStep: number; total: number }) {
  return (
    <div className="flex items-center gap-3 mb-8">
      {Array.from({ length: total }, (_, i) => {
        const step = i + 1
        const isActive = step === currentStep
        const isComplete = step < currentStep
        return (
          <div key={step} className="flex items-center gap-3">
            <div
              className={`
                flex items-center justify-center w-7 h-7 rounded-full text-xs font-ui font-semibold
                transition-colors duration-200
                ${isComplete
                  ? 'bg-lime text-bg'
                  : isActive
                  ? 'bg-lime/20 border border-lime/40 text-lime'
                  : 'bg-surface-2 border border-border-1 text-text-faint'
                }
              `}
            >
              {isComplete ? (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                step
              )}
            </div>
            {step < total && (
              <div className={`h-px w-8 transition-colors duration-200 ${isComplete ? 'bg-lime/40' : 'bg-border-1'}`} />
            )}
          </div>
        )
      })}
      <span className="ml-1 text-xs text-text-muted font-ui">
        Step {currentStep} of {total}
      </span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------
export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [teamForm, setTeamForm] = useState<TeamForm>({
    name: '',
    sport: '',
    league: '',
    institution: '',
  })

  const [profileForm, setProfileForm] = useState<ProfileForm>({
    fullName: '',
    role: '',
  })

  // Saved after step 2 completes
  const [createdTeamId, setCreatedTeamId] = useState<string | null>(null)

  // -------------------------------------------------------------------------
  // Step 1 submit: create team
  // -------------------------------------------------------------------------
  async function handleTeamSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const supabase = createClient()

      const { data: team, error: teamError } = await supabase
        .from('teams')
        .insert({
          name: teamForm.name.trim(),
          sport: teamForm.sport,
          league: teamForm.league,
          institution: teamForm.institution.trim(),
          season_label: `${new Date().getFullYear()}–${new Date().getFullYear() + 1}`,
        })
        .select('id')
        .single()

      if (teamError) {
        setError('Failed to create team. Please try again.')
        return
      }

      setCreatedTeamId(team.id)
      setStep(2)
    } finally {
      setLoading(false)
    }
  }

  // -------------------------------------------------------------------------
  // Step 2 submit: create user profile
  // -------------------------------------------------------------------------
  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const supabase = createClient()

      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setError('Session expired. Please sign in again.')
        router.push('/auth/login')
        return
      }

      const { error: userError } = await supabase
        .from('users')
        .upsert({
          auth_id: user.id,
          team_id: createdTeamId,
          full_name: profileForm.fullName.trim(),
          email: user.email ?? '',
          role: profileForm.role,
        }, { onConflict: 'auth_id' })

      if (userError) {
        setError('Failed to save your profile. Please try again.')
        return
      }

      setStep(3)
    } finally {
      setLoading(false)
    }
  }

  // -------------------------------------------------------------------------
  // Step 3: go to dashboard
  // -------------------------------------------------------------------------
  function handleGoToDashboard() {
    router.push('/coach')
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4 py-12">
      {/* Brand mark */}
      <div className="flex items-center gap-3 mb-10">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-lime/10 border border-lime/20">
          <svg width="20" height="20" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path
              d="M14 3L17.5 9.5L25 10.5L19.5 16L21 23.5L14 20L7 23.5L8.5 16L3 10.5L10.5 9.5L14 3Z"
              fill="#d4ff5c"
              opacity="0.9"
            />
          </svg>
        </div>
        <span className="font-display text-xl font-semibold text-text-primary tracking-tight">
          Inner Victory
        </span>
      </div>

      <div className="w-full max-w-md">
        <div className="bg-surface-1 border border-border-1 rounded-2xl p-8">
          {/* Heading */}
          <div className="mb-6">
            <h1 className="text-text-primary font-ui font-semibold text-xl leading-snug">
              {step === 1 && 'Set up your team'}
              {step === 2 && 'Your profile'}
              {step === 3 && "You're all set"}
            </h1>
            <p className="mt-1 text-text-muted text-sm font-ui">
              {step === 1 && 'Tell us about the team you coach.'}
              {step === 2 && 'Let us know your name and role.'}
              {step === 3 && 'Your team and profile have been created.'}
            </p>
          </div>

          <StepIndicator currentStep={step} total={3} />

          {/* Error */}
          {error && (
            <div className="mb-5 bg-rose/10 border border-rose/20 rounded-xl px-4 py-3">
              <p className="text-rose text-sm font-ui">{error}</p>
            </div>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* Step 1 — Team */}
          {/* ---------------------------------------------------------------- */}
          {step === 1 && (
            <form onSubmit={handleTeamSubmit} className="flex flex-col gap-4">
              {/* Team name */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="team-name" className="text-xs font-ui font-medium text-text-muted uppercase tracking-widest">
                  Team name
                </label>
                <input
                  id="team-name"
                  type="text"
                  required
                  value={teamForm.name}
                  onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                  placeholder="e.g. McMaster Marauders"
                  disabled={loading}
                  className="
                    w-full bg-surface-2 border border-border-1 rounded-xl
                    px-4 py-3 text-sm text-text-primary font-ui
                    placeholder:text-text-faint
                    focus:outline-none focus:ring-2 focus:ring-lime/40 focus:border-lime/30
                    disabled:opacity-50 disabled:cursor-not-allowed transition-colors
                  "
                />
              </div>

              {/* Sport */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="sport" className="text-xs font-ui font-medium text-text-muted uppercase tracking-widest">
                  Sport
                </label>
                <select
                  id="sport"
                  required
                  value={teamForm.sport}
                  onChange={(e) => setTeamForm({ ...teamForm, sport: e.target.value })}
                  disabled={loading}
                  className="
                    w-full bg-surface-2 border border-border-1 rounded-xl
                    px-4 py-3 text-sm text-text-primary font-ui
                    focus:outline-none focus:ring-2 focus:ring-lime/40 focus:border-lime/30
                    disabled:opacity-50 disabled:cursor-not-allowed transition-colors
                    appearance-none
                  "
                >
                  <option value="" disabled>Select sport…</option>
                  {SPORTS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* League */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="league" className="text-xs font-ui font-medium text-text-muted uppercase tracking-widest">
                  League
                </label>
                <select
                  id="league"
                  required
                  value={teamForm.league}
                  onChange={(e) => setTeamForm({ ...teamForm, league: e.target.value })}
                  disabled={loading}
                  className="
                    w-full bg-surface-2 border border-border-1 rounded-xl
                    px-4 py-3 text-sm text-text-primary font-ui
                    focus:outline-none focus:ring-2 focus:ring-lime/40 focus:border-lime/30
                    disabled:opacity-50 disabled:cursor-not-allowed transition-colors
                    appearance-none
                  "
                >
                  <option value="" disabled>Select league…</option>
                  {LEAGUES.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>

              {/* Institution */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="institution" className="text-xs font-ui font-medium text-text-muted uppercase tracking-widest">
                  Institution
                </label>
                <input
                  id="institution"
                  type="text"
                  required
                  value={teamForm.institution}
                  onChange={(e) => setTeamForm({ ...teamForm, institution: e.target.value })}
                  placeholder="e.g. McMaster University"
                  disabled={loading}
                  className="
                    w-full bg-surface-2 border border-border-1 rounded-xl
                    px-4 py-3 text-sm text-text-primary font-ui
                    placeholder:text-text-faint
                    focus:outline-none focus:ring-2 focus:ring-lime/40 focus:border-lime/30
                    disabled:opacity-50 disabled:cursor-not-allowed transition-colors
                  "
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="
                  w-full mt-2 bg-lime text-bg font-ui font-semibold text-sm
                  rounded-xl px-4 py-3 flex items-center justify-center gap-2
                  hover:bg-lime/90 active:scale-[0.98]
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all duration-150
                "
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4 text-bg" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Creating team…
                  </>
                ) : (
                  'Continue'
                )}
              </button>
            </form>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* Step 2 — Profile */}
          {/* ---------------------------------------------------------------- */}
          {step === 2 && (
            <form onSubmit={handleProfileSubmit} className="flex flex-col gap-5">
              {/* Full name */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="full-name" className="text-xs font-ui font-medium text-text-muted uppercase tracking-widest">
                  Full name
                </label>
                <input
                  id="full-name"
                  type="text"
                  required
                  value={profileForm.fullName}
                  onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                  placeholder="e.g. Sarah Mitchell"
                  disabled={loading}
                  className="
                    w-full bg-surface-2 border border-border-1 rounded-xl
                    px-4 py-3 text-sm text-text-primary font-ui
                    placeholder:text-text-faint
                    focus:outline-none focus:ring-2 focus:ring-lime/40 focus:border-lime/30
                    disabled:opacity-50 disabled:cursor-not-allowed transition-colors
                  "
                />
              </div>

              {/* Role */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-ui font-medium text-text-muted uppercase tracking-widest">
                  Your role
                </span>
                <div className="flex flex-col gap-2">
                  {COACH_ROLES.map(({ value, label, description }) => {
                    const selected = profileForm.role === value
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setProfileForm({ ...profileForm, role: value })}
                        disabled={loading}
                        className={`
                          w-full flex items-center gap-3 rounded-xl px-4 py-3
                          border text-left transition-all duration-150
                          disabled:opacity-50 disabled:cursor-not-allowed
                          ${selected
                            ? 'bg-lime/10 border-lime/30'
                            : 'bg-surface-2 border-border-1 hover:border-border-2 hover:bg-surface-3'
                          }
                        `}
                      >
                        {/* Radio dot */}
                        <div className={`
                          flex-shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center
                          transition-colors duration-150
                          ${selected ? 'border-lime bg-lime/20' : 'border-text-faint'}
                        `}>
                          {selected && <div className="w-1.5 h-1.5 rounded-full bg-lime" />}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className={`text-sm font-ui font-medium leading-none mb-0.5 ${selected ? 'text-lime' : 'text-text-primary'}`}>
                            {label}
                          </div>
                          <div className="text-xs text-text-muted font-ui">{description}</div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="flex gap-3 mt-1">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  disabled={loading}
                  className="
                    flex-1 bg-surface-2 border border-border-1 rounded-xl
                    px-4 py-3 text-sm font-ui font-medium text-text-muted
                    hover:text-text-primary hover:border-border-2
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-all duration-150
                  "
                >
                  Back
                </button>

                <button
                  type="submit"
                  disabled={loading || !profileForm.fullName.trim() || !profileForm.role}
                  className="
                    flex-[2] bg-lime text-bg font-ui font-semibold text-sm
                    rounded-xl px-4 py-3 flex items-center justify-center gap-2
                    hover:bg-lime/90 active:scale-[0.98]
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-all duration-150
                  "
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin w-4 h-4 text-bg" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Saving…
                    </>
                  ) : (
                    'Continue'
                  )}
                </button>
              </div>
            </form>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* Step 3 — Confirmation */}
          {/* ---------------------------------------------------------------- */}
          {step === 3 && (
            <div className="flex flex-col items-center text-center gap-6">
              {/* Success icon */}
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-lime/10 border border-lime/20">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <circle cx="16" cy="16" r="14" fill="rgba(212,255,92,0.1)" stroke="#d4ff5c" strokeWidth="1.5" />
                  <path d="M10 16L14 20L22 11" stroke="#d4ff5c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              <div>
                <h2 className="text-text-primary font-ui font-semibold text-lg">
                  Welcome to Inner Victory
                </h2>
                <p className="mt-2 text-text-muted text-sm font-ui max-w-xs mx-auto leading-relaxed">
                  Your team <span className="text-text-primary font-medium">{teamForm.name}</span> is ready.
                  Head to your dashboard to start adding athletes and tracking performance.
                </p>
              </div>

              {/* Summary */}
              <div className="w-full bg-surface-2 border border-border-1 rounded-xl p-4 text-left">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-text-faint font-ui uppercase tracking-widest mb-0.5">Team</div>
                    <div className="text-sm text-text-primary font-ui font-medium">{teamForm.name}</div>
                  </div>
                  <div>
                    <div className="text-xs text-text-faint font-ui uppercase tracking-widest mb-0.5">Sport</div>
                    <div className="text-sm text-text-primary font-ui font-medium">{teamForm.sport}</div>
                  </div>
                  <div>
                    <div className="text-xs text-text-faint font-ui uppercase tracking-widest mb-0.5">League</div>
                    <div className="text-sm text-text-primary font-ui font-medium">{teamForm.league}</div>
                  </div>
                  <div>
                    <div className="text-xs text-text-faint font-ui uppercase tracking-widest mb-0.5">Role</div>
                    <div className="text-sm text-text-primary font-ui font-medium">
                      {COACH_ROLES.find((r) => r.value === profileForm.role)?.label ?? profileForm.role}
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleGoToDashboard}
                className="
                  w-full bg-lime text-bg font-ui font-semibold text-sm
                  rounded-xl px-4 py-3
                  hover:bg-lime/90 active:scale-[0.98]
                  transition-all duration-150
                "
              >
                Go to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
