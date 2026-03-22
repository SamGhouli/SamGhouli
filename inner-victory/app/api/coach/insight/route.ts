import { NextRequest, NextResponse } from 'next/server'
import { generateCoachingInsight } from '@/lib/ai/insights'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Allow demo mode without auth
    const isDemo = request.nextUrl.searchParams.get('demo') === 'true'
    if (!user && !isDemo) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const context = await request.json()
    const insight = await generateCoachingInsight(context)
    return NextResponse.json({ insight })
  } catch (err) {
    console.error('Coach insight error:', err)
    return NextResponse.json(
      { insight: 'Focus on the team readiness data and active alerts to guide today\'s session.' },
      { status: 200 }
    )
  }
}
