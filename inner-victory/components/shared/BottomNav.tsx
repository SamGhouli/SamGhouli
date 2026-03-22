'use client'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { Zap, TrendingUp, CheckSquare, MessageCircle, User, CalendarDays } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  badge?: boolean
}

interface BottomNavProps {
  hasCheckedIn?: boolean
}

export function BottomNav({ hasCheckedIn = false }: BottomNavProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isDemo = searchParams.get('demo') === 'true'

  const items: NavItem[] = [
    { label: 'Readiness', href: '/athlete', icon: Zap },
    { label: 'Schedule', href: '/athlete/schedule', icon: CalendarDays },
    { label: 'Check-in', href: '/athlete/checkin', icon: CheckSquare, badge: !hasCheckedIn },
    { label: 'Support', href: '/athlete/support', icon: MessageCircle },
    { label: 'Trends', href: '/athlete/trends', icon: TrendingUp },
    { label: 'Profile', href: '/athlete/profile', icon: User },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-[60px] items-center justify-around border-t border-border-1 bg-surface-1 px-1 safe-area-inset-bottom">
      {items.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href || (item.href !== '/athlete' && pathname.startsWith(item.href))
        return (
          <Link
            key={item.href}
            href={isDemo ? `${item.href}?demo=true` : item.href}
            className={cn(
              'relative flex min-h-[44px] flex-col items-center justify-center gap-0.5 rounded-lg px-2 transition-colors',
              isActive ? 'text-lime' : 'text-text-muted'
            )}
          >
            <div className="relative">
              <Icon className="h-4.5 w-4.5 h-[18px] w-[18px]" />
              {item.badge && (
                <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-rose" />
              )}
            </div>
            <span className="text-[9px] font-medium">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
