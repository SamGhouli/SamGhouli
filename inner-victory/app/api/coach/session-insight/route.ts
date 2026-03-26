import { NextRequest, NextResponse } from 'next/server'
import { generateSessionInsight } from '@/lib/ai/insights'

export async function POST(req: NextRequest) {
  try {
    const context = await req.json()
    const insight = await generateSessionInsight(context)
    return NextResponse.json({ insight })
  } catch {
    return NextResponse.json({ insight: null }, { status: 500 })
  }
}
