import { NextRequest, NextResponse } from 'next/server'
import { generatePreMatchBrief } from '@/lib/ai/insights'

export async function POST(req: NextRequest) {
  try {
    const context = await req.json()
    const brief = await generatePreMatchBrief(context)
    return NextResponse.json(brief)
  } catch {
    return NextResponse.json(
      { squadAvailability: '', loadConcerns: '', rtpStatus: '', sessionContext: '', tacticalNote: '' },
      { status: 500 }
    )
  }
}
