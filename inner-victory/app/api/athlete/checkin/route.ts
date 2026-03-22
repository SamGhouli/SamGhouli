import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { calculateMentalScore, calculateCombinedScore } from '@/lib/scoring/readiness'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { mood_score, energy_level, stress_level, notes } = await request.json()

    if (!mood_score || !energy_level || !stress_level) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const mental_score = calculateMentalScore({ moodScore: mood_score, energyLevel: energy_level, stressLevel: stress_level })
    const today = new Date().toISOString().split('T')[0]

    // Resolve internal user record
    const { data: userData } = await supabase
      .from('users')
      .select('id, team_id')
      .eq('auth_id', user.id)
      .single()

    if (!userData) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    const athleteId = userData.id

    // Upsert wellness check-in
    const { data: checkin, error: checkinError } = await supabase
      .from('wellness_checkins')
      .upsert({
        athlete_id: athleteId,
        team_id: userData.team_id,
        date: today,
        mood_score,
        energy_level,
        stress_level,
        notes: notes ?? '',
        mental_score,
      }, { onConflict: 'athlete_id,date' })
      .select()
      .single()

    if (checkinError) throw checkinError

    // Update combined_score in readiness_scores
    const { data: readiness } = await supabase
      .from('readiness_scores')
      .select('physical_score, sleep_score')
      .eq('athlete_id', athleteId)
      .eq('date', today)
      .single()

    if (readiness) {
      const combined_score = calculateCombinedScore(readiness.physical_score, mental_score, readiness.sleep_score)
      await supabase
        .from('readiness_scores')
        .update({ combined_score })
        .eq('athlete_id', athleteId)
        .eq('date', today)
    }
    if (userData.team_id) {
      // Query team members' check-ins for aggregate
      const { data: teamAthletes } = await supabase
        .from('users')
        .select('id')
        .eq('team_id', userData.team_id)
        .eq('role', 'athlete')

      if (teamAthletes) {
        const athleteIds = teamAthletes.map((a: { id: string }) => a.id)
        const { data: teamCheckinsDirect } = await supabase
          .from('wellness_checkins')
          .select('mental_score')
          .eq('date', today)
          .in('athlete_id', athleteIds)

        if (teamCheckinsDirect && teamCheckinsDirect.length > 0) {
          const avgMental = Math.round(
            teamCheckinsDirect.reduce((sum: number, c: { mental_score: number }) => sum + c.mental_score, 0) / teamCheckinsDirect.length
          )
          await supabase
            .from('team_mental_aggregates')
            .upsert({
              team_id: userData.team_id,
              date: today,
              avg_mental_score: avgMental,
              check_in_count: teamCheckinsDirect.length,
              total_athletes: athleteIds.length,
            }, { onConflict: 'team_id,date' })
        }
      }
    }

    return NextResponse.json({ success: true, mental_score, checkin })
  } catch (err) {
    console.error('Check-in error:', err)
    return NextResponse.json({ error: 'Check-in failed' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: userData } = await supabase
      .from('users').select('id').eq('auth_id', user.id).single()

    const today = new Date().toISOString().split('T')[0]
    const { data } = userData ? await supabase
      .from('wellness_checkins')
      .select('*')
      .eq('athlete_id', userData.id)
      .eq('date', today)
      .single() : { data: null }

    return NextResponse.json({ checkin: data })
  } catch {
    return NextResponse.json({ checkin: null })
  }
}
