import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(new URL('/athlete/wearables?error=whoop_auth', request.url))
  }

  try {
    // Exchange code for tokens
    const tokenRes = await fetch('https://api.prod.whoop.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: process.env.WHOOP_CLIENT_ID!,
        client_secret: process.env.WHOOP_CLIENT_SECRET!,
        code,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/wearables/whoop/callback`,
      }),
    })

    if (!tokenRes.ok) throw new Error('Token exchange failed')
    const tokens = await tokenRes.json()

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.redirect(new URL('/auth/login', request.url))

    // Store tokens (in production, encrypt these)
    await supabase
      .from('users')
      .update({
        whoop_access_token: tokens.access_token,
        whoop_refresh_token: tokens.refresh_token,
        wearable_source: 'whoop',
      })
      .eq('id', user.id)

    return NextResponse.redirect(new URL('/athlete/wearables?connected=whoop', request.url))
  } catch (err) {
    console.error('WHOOP callback error:', err)
    return NextResponse.redirect(new URL('/athlete/wearables?error=whoop_failed', request.url))
  }
}
