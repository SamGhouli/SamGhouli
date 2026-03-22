import { Sidebar } from '@/components/shared/Sidebar'
import { createClient } from '@/lib/supabase/server'

export default async function CoachLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const { data: { user: authUser } } = await supabase.auth.getUser()

  let user = null
  let team = null
  let alertCount = 0
  let injuryCount = 0

  if (authUser) {
    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single()

    if (userData) {
      user = userData

      const [teamResult, alertResult, injuryResult] = await Promise.all([
        supabase.from('teams').select('*').eq('id', userData.team_id).single(),
        supabase.from('alerts').select('id', { count: 'exact' }).eq('team_id', userData.team_id).eq('is_read', false),
        supabase.from('athlete_availability').select('id', { count: 'exact' })
          .eq('team_id', userData.team_id)
          .eq('date', new Date().toISOString().split('T')[0])
          .neq('status', 'full'),
      ])

      team = teamResult.data
      alertCount = alertResult.count ?? 0
      injuryCount = injuryResult.count ?? 0
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      <Sidebar team={team ?? undefined} user={user ?? undefined} alertCount={alertCount} injuryCount={injuryCount} />
      <main className="flex flex-1 flex-col overflow-hidden">
        {children}
      </main>
    </div>
  )
}
