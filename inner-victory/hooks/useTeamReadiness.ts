'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { ReadinessScore, User } from '@/types/database'

export interface AthleteReadinessRow extends ReadinessScore {
  user: User
  availability_status?: string
  availability_reason?: string
  academic_flag?: boolean
  mental_score?: number
}

export interface TeamReadinessData {
  athletes: AthleteReadinessRow[]
  teamReadiness: number
  physicalAvg: number
  sleepAvg: number
  mentalAggregate: number
  trainingLoadAvg: number
  loading: boolean
  error: string | null
}

export function useTeamReadiness(teamId: string | undefined) {
  const [data, setData] = useState<TeamReadinessData>({
    athletes: [],
    teamReadiness: 0,
    physicalAvg: 0,
    sleepAvg: 0,
    mentalAggregate: 0,
    trainingLoadAvg: 0,
    loading: true,
    error: null,
  })

  useEffect(() => {
    if (!teamId) return

    const supabase = createClient()
    const today = new Date().toISOString().split('T')[0]

    async function fetchData() {
      try {
        // Fetch today's readiness scores with user info
        const { data: scores, error } = await supabase
          .from('readiness_scores')
          .select(`
            *,
            user:users!readiness_scores_athlete_id_fkey(*)
          `)
          .eq('team_id', teamId)
          .eq('date', today)

        if (error) throw error

        // Fetch availability
        const { data: availability } = await supabase
          .from('athlete_availability')
          .select('*')
          .eq('team_id', teamId)
          .eq('date', today)

        // Fetch academic flags
        const { data: academics } = await supabase
          .from('academic_records')
          .select('athlete_id, eligibility_status')
          .eq('team_id', teamId)
          .neq('eligibility_status', 'ok')

        // Fetch mental aggregate (anonymised)
        const { data: mentalAgg } = await supabase
          .from('team_mental_aggregates')
          .select('avg_mental_score')
          .eq('team_id', teamId)
          .eq('date', today)
          .single()

        const availMap = new Map(availability?.map((a) => [a.athlete_id, a]) ?? [])
        const academicFlags = new Set(academics?.map((a) => a.athlete_id) ?? [])

        const enriched: AthleteReadinessRow[] = (scores ?? []).map((s) => ({
          ...s,
          availability_status: availMap.get(s.athlete_id)?.status ?? 'full',
          availability_reason: availMap.get(s.athlete_id)?.reason,
          academic_flag: academicFlags.has(s.athlete_id),
        }))

        const avg = (arr: number[]) => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0

        setData({
          athletes: enriched,
          teamReadiness: avg(enriched.map((a) => a.combined_score)),
          physicalAvg: avg(enriched.map((a) => a.physical_score)),
          sleepAvg: avg(enriched.map((a) => a.sleep_score)),
          mentalAggregate: mentalAgg?.avg_mental_score ?? 0,
          trainingLoadAvg: avg(enriched.map((a) => Math.round(a.training_load ?? 0))),
          loading: false,
          error: null,
        })
      } catch (err) {
        setData((prev) => ({ ...prev, loading: false, error: String(err) }))
      }
    }

    fetchData()

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`team-readiness-${teamId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'readiness_scores', filter: `team_id=eq.${teamId}` }, fetchData)
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [teamId])

  return data
}
