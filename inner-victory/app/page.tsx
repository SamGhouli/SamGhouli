import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export default async function RootPage({
  searchParams,
}: {
  searchParams: { demo?: string }
}) {
  if (searchParams.demo === 'coach') redirect('/coach?demo=true')
  if (searchParams.demo === 'athlete') redirect('/athlete?demo=true')
  if (searchParams.demo === 'true') redirect('/coach?demo=true')

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/auth/login')

    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userData?.role === 'athlete') redirect('/athlete')
    redirect('/coach')
  } catch {
    redirect('/auth/login')
  }
}
