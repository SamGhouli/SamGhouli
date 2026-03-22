import { NextRequest, NextResponse } from 'next/server'
import { generateAthleteInsight } from '@/lib/ai/insights'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const isDemo = request.nextUrl.searchParams.get('demo') === 'true'
    if (!user && !isDemo) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const context = await request.json()
    const insight = await generateAthleteInsight(context)
    return NextResponse.json({ insight })
  } catch (err) {
    console.error('Athlete insight error:', err)
    return NextResponse.json(
      { insight: 'Stay consistent today and listen to your body during training.' },
      { status: 200 }
    )
  }
}
