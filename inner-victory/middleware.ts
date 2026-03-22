import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Role-based route guards
const roleRoutes: Record<string, string[]> = {
  '/coach': ['coach', 'assistant_coach', 'physio', 'strength_coach', 'video_coordinator', 'athletic_director'],
  '/athlete': ['athlete'],
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname, searchParams } = request.nextUrl

  // Allow demo mode through without auth
  if (searchParams.get('demo') === 'true') {
    return supabaseResponse
  }

  // Allow auth routes through
  if (pathname.startsWith('/auth')) {
    // If already authenticated and visiting login, redirect based on role
    if (user && pathname === '/auth/login') {
      const { data: userRecord } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      const role = userRecord?.role
      const coachRoles = ['coach', 'assistant_coach', 'physio', 'strength_coach', 'video_coordinator', 'athletic_director']

      if (role && coachRoles.includes(role)) {
        return NextResponse.redirect(new URL('/coach', request.url))
      } else if (role === 'athlete') {
        return NextResponse.redirect(new URL('/athlete', request.url))
      }
    }
    return supabaseResponse
  }

  // If not authenticated, redirect to login
  if (!user) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Enforce role-based access for protected routes
  for (const [routePrefix, allowedRoles] of Object.entries(roleRoutes)) {
    if (pathname.startsWith(routePrefix)) {
      const { data: userRecord } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      const role = userRecord?.role

      if (!role || !allowedRoles.includes(role)) {
        // Redirect to the appropriate dashboard
        const coachRoles = ['coach', 'assistant_coach', 'physio', 'strength_coach', 'video_coordinator', 'athletic_director']
        if (role && coachRoles.includes(role)) {
          return NextResponse.redirect(new URL('/coach', request.url))
        } else if (role === 'athlete') {
          return NextResponse.redirect(new URL('/athlete', request.url))
        } else {
          return NextResponse.redirect(new URL('/auth/login', request.url))
        }
      }
      break
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
