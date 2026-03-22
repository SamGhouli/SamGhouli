import { WellnessCheckin } from '@/components/athlete/WellnessCheckin'
import { createClient } from '@/lib/supabase/server'

export default async function CheckinPage() {
  let hasCheckedIn = false
  let todayResult = null

  try {
    const supabase = await createClient()
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()

    if (authUser) {
      const today = new Date().toISOString().split('T')[0]

      // Resolve internal user id from auth_id
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', authUser.id)
        .single()

      const athleteId = userData?.id

      const { data: checkin } = athleteId ? await supabase
        .from('wellness_checkins')
        .select('mental_score')
        .eq('athlete_id', athleteId)
        .eq('date', today)
        .single() : { data: null }

      if (checkin) {
        hasCheckedIn = true

        // Also pull today's readiness score for the combined score
        const { data: readiness } = athleteId ? await supabase
          .from('readiness_scores')
          .select('combined_score')
          .eq('athlete_id', athleteId)
          .eq('date', today)
          .single() : { data: null }

        todayResult = {
          mental_score: checkin.mental_score ?? 70,
          combined_score: readiness?.combined_score ?? 72,
        }
      }
    }
  } catch {
    // Unauthenticated / demo mode — fall through
  }

  return (
    <div className="min-h-screen">
      {/* Page header */}
      <div className="px-4 pt-6 pb-2">
        <h1 className="text-xl font-bold text-text-primary">Daily Check-In</h1>
        <p className="text-sm text-text-muted mt-0.5">
          {hasCheckedIn ? "You've already checked in today." : "Takes about 60 seconds."}
        </p>
      </div>

      <WellnessCheckin alreadyCheckedIn={hasCheckedIn} todayResult={todayResult} />
    </div>
  )
}
