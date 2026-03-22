import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: userData } = await supabase.from('users').select('team_id').eq('id', user.id).single()
  if (!userData?.team_id) return NextResponse.json({ alerts: [] })

  const { data: alerts } = await supabase
    .from('alerts')
    .select('*')
    .eq('team_id', userData.team_id)
    .eq('is_read', false)
    .order('created_at', { ascending: false })

  return NextResponse.json({ alerts: alerts ?? [] })
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await request.json()
  await supabase.from('alerts').update({ is_read: true }).eq('id', id)
  return NextResponse.json({ success: true })
}
