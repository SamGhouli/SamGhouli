'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@/types/database'

export function useRoster(teamId: string | undefined) {
  const [roster, setRoster] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!teamId) return
    const supabase = createClient()

    async function fetchRoster() {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('team_id', teamId)
        .eq('role', 'athlete')
        .order('jersey_number', { ascending: true })

      if (error) setError(error.message)
      else setRoster(data ?? [])
      setLoading(false)
    }

    fetchRoster()
  }, [teamId])

  return { roster, loading, error }
}
