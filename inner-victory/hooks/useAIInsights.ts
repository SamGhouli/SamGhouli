'use client'
import { useState, useCallback } from 'react'

export function useAIInsight(initialInsight?: string) {
  const [insight, setInsight] = useState(initialInsight ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async (context: Record<string, unknown>) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/coach/insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(context),
      })
      if (!res.ok) throw new Error('Failed to fetch insight')
      const data = await res.json()
      setInsight(data.insight)
    } catch (err) {
      setError(String(err))
      setInsight('Unable to generate insight at this time. Focus on the readiness trends and active alerts to guide today\'s session.')
    } finally {
      setLoading(false)
    }
  }, [])

  return { insight, loading, error, refresh }
}

export function useAthleteAIInsight(initialInsight?: string) {
  const [insight, setInsight] = useState(initialInsight ?? '')
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async (context: Record<string, unknown>) => {
    setLoading(true)
    try {
      const res = await fetch('/api/athlete/insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(context),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setInsight(data.insight)
    } catch {
      setInsight('Stay consistent with your effort today and listen to your body.')
    } finally {
      setLoading(false)
    }
  }, [])

  return { insight, loading, refresh }
}
