'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Team, User } from '@/types/database'

export function useTeam() {
  const [team, setTeam] = useState<Team | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    async function fetchTeam() {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) { setLoading(false); return }

      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (!userData) { setLoading(false); return }
      setUser(userData)

      const { data: teamData } = await supabase
        .from('teams')
        .select('*')
        .eq('id', userData.team_id)
        .single()

      setTeam(teamData ?? null)
      setLoading(false)
    }

    fetchTeam()
  }, [])

  return { team, user, loading }
}
