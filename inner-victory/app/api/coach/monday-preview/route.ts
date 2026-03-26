import { NextRequest, NextResponse } from 'next/server'
import { generateMondayPreview } from '@/lib/ai/insights'

export async function POST(req: NextRequest) {
  try {
    const context = await req.json()
    const preview = await generateMondayPreview(context)
    return NextResponse.json(preview)
  } catch {
    return NextResponse.json({ context: '', recommendation: '', watchList: [] }, { status: 500 })
  }
}
