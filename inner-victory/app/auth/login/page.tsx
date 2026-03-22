'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Role } from '@/types/database'

const COACH_ROLES: Role[] = [
  'coach',
  'assistant_coach',
  'physio',
  'strength_coach',
  'video_coordinator',
  'athletic_director',
]

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        setError('Invalid email or password. Please try again.')
        return
      }

      if (!data.user) {
        setError('Something went wrong. Please try again.')
        return
      }

      // Fetch user role
      const { data: userRecord, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', data.user.id)
        .single()

      if (userError || !userRecord) {
        // No profile yet — send to onboarding
        router.push('/auth/onboarding')
        return
      }

      const role = userRecord.role as Role

      if (COACH_ROLES.includes(role)) {
        router.push('/coach')
      } else if (role === 'athlete') {
        router.push('/athlete')
      } else {
        router.push('/auth/onboarding')
      }
    } finally {
      setLoading(false)
    }
  }

  function handleDemoCoach() {
    router.push('/coach?demo=true')
  }

  function handleDemoAthlete() {
    router.push('/athlete?demo=true')
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4 py-12">
      {/* Brand mark */}
      <div className="flex flex-col items-center gap-3 mb-10">
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-lime/10 border border-lime/20">
          {/* Trophy / victory mark */}
          <svg
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M14 3L17.5 9.5L25 10.5L19.5 16L21 23.5L14 20L7 23.5L8.5 16L3 10.5L10.5 9.5L14 3Z"
              fill="#d4ff5c"
              opacity="0.9"
            />
          </svg>
        </div>

        <div className="text-center">
          <h1 className="font-display text-3xl font-semibold text-text-primary tracking-tight leading-none">
            Inner Victory
          </h1>
          <p className="mt-1.5 text-sm text-text-muted font-ui tracking-wide">
            Athlete Intelligence Platform
          </p>
        </div>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm">
        <div className="bg-surface-1 border border-border-1 rounded-2xl p-8">
          <h2 className="text-text-primary font-ui font-semibold text-lg mb-6">
            Sign in to your account
          </h2>

          <form onSubmit={handleSignIn} className="flex flex-col gap-4">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="email"
                className="text-xs font-ui font-medium text-text-muted uppercase tracking-widest"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@university.ca"
                disabled={loading}
                className="
                  w-full bg-surface-2 border border-border-1 rounded-xl
                  px-4 py-3 text-sm text-text-primary font-ui
                  placeholder:text-text-faint
                  focus:outline-none focus:ring-2 focus:ring-lime/40 focus:border-lime/30
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-colors
                "
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="password"
                className="text-xs font-ui font-medium text-text-muted uppercase tracking-widest"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
                className="
                  w-full bg-surface-2 border border-border-1 rounded-xl
                  px-4 py-3 text-sm text-text-primary font-ui
                  placeholder:text-text-faint
                  focus:outline-none focus:ring-2 focus:ring-lime/40 focus:border-lime/30
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-colors
                "
              />
            </div>

            {/* Error */}
            {error && (
              <div className="bg-rose/10 border border-rose/20 rounded-xl px-4 py-3">
                <p className="text-rose text-sm font-ui">{error}</p>
              </div>
            )}

            {/* Submit */}
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
                  <svg
                    className="animate-spin w-4 h-4 text-bg"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Signing in…
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>
        </div>

        {/* Demo mode */}
        <div className="mt-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-border-1" />
            <span className="text-xs text-text-faint font-ui uppercase tracking-widest">
              or try demo mode
            </span>
            <div className="flex-1 h-px bg-border-1" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleDemoCoach}
              className="
                bg-surface-1 border border-border-1 rounded-xl
                px-4 py-3 text-sm font-ui font-medium text-text-primary
                hover:bg-surface-2 hover:border-border-2
                active:scale-[0.98] transition-all duration-150
                flex flex-col items-start gap-1
              "
            >
              <span className="text-lime text-xs font-semibold uppercase tracking-widest">
                Coach
              </span>
              <span className="text-text-muted text-xs leading-tight">
                Demo Coach View
              </span>
            </button>

            <button
              onClick={handleDemoAthlete}
              className="
                bg-surface-1 border border-border-1 rounded-xl
                px-4 py-3 text-sm font-ui font-medium text-text-primary
                hover:bg-surface-2 hover:border-border-2
                active:scale-[0.98] transition-all duration-150
                flex flex-col items-start gap-1
              "
            >
              <span className="text-teal text-xs font-semibold uppercase tracking-widest">
                Athlete
              </span>
              <span className="text-text-muted text-xs leading-tight">
                Demo Athlete View
              </span>
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-text-faint font-ui">
          For access, contact your team administrator.
        </p>
      </div>
    </div>
  )
}
