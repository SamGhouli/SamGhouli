import { BottomNav } from '@/components/shared/BottomNav'
import { createClient } from '@/lib/supabase/server'

export default async function AthleteLayout({ children }: { children: React.ReactNode }) {
  let hasCheckedIn = false

  try {
    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()

    if (authUser) {
      const today = new Date().toISOString().split('T')[0]
      const { data: checkin } = await supabase
        .from('wellness_checkins')
        .select('id')
        .eq('user_id', authUser.id)
        .eq('date', today)
        .single()

      hasCheckedIn = !!checkin
    }
  } catch {
    // Silently fall through — demo mode or unauthenticated
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto max-w-[430px] relative">
        <main className="pb-[60px]">
          {children}
        </main>
        <BottomNav hasCheckedIn={hasCheckedIn} />
      </div>
    </div>
  )
}
