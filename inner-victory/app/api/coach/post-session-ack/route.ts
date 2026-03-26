import { NextRequest, NextResponse } from 'next/server'
import { generatePostSessionAck } from '@/lib/ai/insights'

export async function POST(req: NextRequest) {
  try {
    const context = await req.json()
    if (!context.reflection?.trim()) {
      return NextResponse.json({ ack: null })
    }
    const ack = await generatePostSessionAck(context)
    return NextResponse.json({ ack })
  } catch {
    return NextResponse.json({ ack: null }, { status: 500 })
  }
}
