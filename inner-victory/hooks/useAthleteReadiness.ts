'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { ReadinessScore, WellnessCheckin } from '@/types/database'

export interface AthleteReadinessData {
  today: (ReadinessScore & { mental_score?: number }) | null
  yesterday: ReadinessScore | null
  checkin: WellnessCheckin | null
  trend: ReadinessScore[]
  loading: boolean
  error: string | null
}

export function useAthleteReadiness(athleteId: string | undefined) {
  const [data, setData] = useState<AthleteReadinessData>({
    today: null,
    yesterday: null,
    checkin: null,
    trend: [],
    loading: true,
    error: null,
  })

  useEffect(() => {
    if (!athleteId) return

    const supabase = createClient()
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]

    async function fetchData() {
      try {
        const [todayResult, yesterdayResult, checkinResult, trendResult] = await Promise.all([
          supabase.from('readiness_scores').select('*').eq('athlete_id', athleteId).eq('date', today).single(),
          supabase.from('readiness_scores').select('*').eq('athlete_id', athleteId).eq('date', yesterday).single(),
          supabase.from('wellness_checkins').select('*').eq('athlete_id', athleteId).eq('date', today).single(),
          supabase.from('readiness_scores').select('*').eq('athlete_id', athleteId).gte('date', sevenDaysAgo).order('date', { ascending: true }),
        ])

        // Merge mental score into today's readiness (athlete-side only)
        const todayData = todayResult.data
          ? {
              ...todayResult.data,
              mental_score: checkinResult.data?.mental_score ?? undefined,
            }
          : null

        setData({
          today: todayData,
          yesterday: yesterdayResult.data ?? null,
          checkin: checkinResult.data ?? null,
          trend: trendResult.data ?? [],
          loading: false,
          error: null,
        })
      } catch (err) {
        setData((prev) => ({ ...prev, loading: false, error: String(err) }))
      }
    }

    fetchData()

    const channel = supabase
      .channel(`athlete-readiness-${athleteId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'readiness_scores', filter: `athlete_id=eq.${athleteId}` }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'wellness_checkins', filter: `athlete_id=eq.${athleteId}` }, fetchData)
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [athleteId])

  return data
}
