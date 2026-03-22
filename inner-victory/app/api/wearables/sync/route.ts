import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { getWHOOPRecovery, getWHOOPSleep, getWHOOPWorkout } from '@/lib/wearables/whoop'
import { getOuraReadiness, getOuraSleep } from '@/lib/wearables/oura'
import { calculatePhysicalScore, calculateSleepScore, calculateCombinedScore } from '@/lib/scoring/readiness'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: userData } = await supabase
    .from('users')
    .select('team_id, wearable_source, whoop_access_token, oura_access_token')
    .eq('id', user.id)
    .single()

  if (!userData) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const today = new Date().toISOString().split('T')[0]
  let physical_score = 0
  let sleep_score = 0
  let hrv = 0
  let resting_hr = 0
  let sleep_hours = 0
  let strain = 0
  const wearable_source = userData.wearable_source ?? 'manual'

  try {
    if (userData.wearable_source === 'whoop' && userData.whoop_access_token) {
      const [recovery, sleep, workout] = await Promise.all([
        getWHOOPRecovery(userData.whoop_access_token, today),
        getWHOOPSleep(userData.whoop_access_token, today),
        getWHOOPWorkout(userData.whoop_access_token, today),
      ])

      if (recovery) {
        hrv = recovery.score.hrv_rmssd_milli
        resting_hr = recovery.score.resting_heart_rate
      }
      if (sleep) {
        sleep_hours = (sleep.total_in_bed_time_milli - sleep.total_awake_time_milli) / 3600000
        const sleepQuality = sleep.score.sleep_performance_percentage
        sleep_score = calculateSleepScore({ sleepHours: sleep_hours, sleepQuality })
      }
      if (workout) {
        strain = workout.score.strain
      }

      // Get 30-day baselines
      const { data: baseline } = await supabase
        .from('readiness_scores')
        .select('hrv, resting_hr')
        .eq('athlete_id', user.id)
        .gte('date', new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0])

      const avgHrv = baseline?.length ? baseline.reduce((s, r) => s + (r.hrv ?? 0), 0) / baseline.length : hrv
      const avgHr = baseline?.length ? baseline.reduce((s, r) => s + (r.resting_hr ?? 0), 0) / baseline.length : resting_hr

      physical_score = calculatePhysicalScore({ hrv, hrvBaseline: avgHrv, restingHr: resting_hr, restingHrBaseline: avgHr, strain })
    } else if (userData.wearable_source === 'oura' && userData.oura_access_token) {
      const [readiness, sleep] = await Promise.all([
        getOuraReadiness(userData.oura_access_token, today),
        getOuraSleep(userData.oura_access_token, today),
      ])

      if (readiness) physical_score = readiness.score
      if (sleep) {
        sleep_hours = sleep.total_sleep_duration / 3600
        sleep_score = calculateSleepScore({ sleepHours: sleep_hours, sleepQuality: sleep.efficiency })
        hrv = sleep.average_hrv
        resting_hr = sleep.lowest_heart_rate
      }
    }

    // Get existing mental score for combined calculation
    const { data: checkin } = await supabase
      .from('wellness_checkins')
      .select('mental_score')
      .eq('athlete_id', user.id)
      .eq('date', today)
      .single()

    const mental_score = checkin?.mental_score ?? 70
    const combined_score = calculateCombinedScore(physical_score, mental_score, sleep_score)

    const { error } = await supabase.from('readiness_scores').upsert({
      athlete_id: user.id,
      team_id: userData.team_id,
      date: today,
      physical_score,
      sleep_score,
      combined_score,
      hrv,
      resting_hr,
      sleep_hours,
      strain,
      training_load: strain,
      wearable_source,
    }, { onConflict: 'athlete_id,date' })

    if (error) throw error

    return NextResponse.json({ success: true, physical_score, sleep_score, combined_score, hrv, resting_hr, sleep_hours, strain })
  } catch (err) {
    console.error('Sync error:', err)
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 })
  }
}
