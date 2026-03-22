'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, Users, Activity, Video, Dumbbell, Trophy,
  HeartPulse, GraduationCap, UserPlus, CalendarDays, ShieldCheck,
  Settings, AlertTriangle, ChevronRight
} from 'lucide-react'
import type { Team, User } from '@/types/database'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  badge?: number
}

interface NavGroup {
  label: string
  items: NavItem[]
}

interface SidebarProps {
  team?: Team
  user?: User
  alertCount?: number
  injuryCount?: number
  collapsed?: boolean
}

function getNavGroups(alertCount = 0, injuryCount = 0): NavGroup[] {
  return [
    {
      label: 'Overview',
      items: [
        { label: 'Command Centre', href: '/coach', icon: LayoutDashboard },
        { label: 'Alerts', href: '/coach/alerts', icon: AlertTriangle, badge: alertCount },
      ],
    },
    {
      label: 'Athlete Intel',
      items: [
        { label: 'Roster', href: '/coach/roster', icon: Users },
        { label: 'Readiness', href: '/coach/readiness', icon: Activity },
        { label: 'Injuries', href: '/coach/injuries', icon: HeartPulse, badge: injuryCount },
        { label: 'Academics', href: '/coach/academics', icon: GraduationCap },
      ],
    },
    {
      label: 'Performance',
      items: [
        { label: 'Film Room', href: '/coach/film', icon: Video },
        { label: 'Training Log', href: '/coach/training', icon: Dumbbell },
        { label: 'Match Reports', href: '/coach/matches', icon: Trophy },
        { label: 'Recruitment', href: '/coach/recruitment', icon: UserPlus },
      ],
    },
    {
      label: 'Admin',
      items: [
        { label: 'Calendar', href: '/coach/calendar', icon: CalendarDays },
        { label: 'Compliance', href: '/coach/compliance', icon: ShieldCheck },
        { label: 'Settings', href: '/coach/settings', icon: Settings },
      ],
    },
  ]
}

const ROLE_LABELS: Record<string, string> = {
  coach: 'Head Coach',
  assistant_coach: 'Asst. Coach',
  physio: 'Physio',
  strength_coach: 'S&C Coach',
  video_coordinator: 'Video Coord.',
  athletic_director: 'Athletic Dir.',
}

export function Sidebar({ team, user, alertCount = 0, injuryCount = 0, collapsed = false }: SidebarProps) {
  const pathname = usePathname()
  const navGroups = getNavGroups(alertCount, injuryCount)

  return (
    <aside
      className={cn(
        'flex h-full flex-col bg-surface-1 border-r border-border-1 transition-all duration-300',
        collapsed ? 'w-[60px]' : 'w-[200px]'
      )}
    >
      {/* Brand */}
      <div className="flex h-[52px] items-center gap-2.5 px-4 border-b border-border-1 shrink-0">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-lime">
          <span className="text-xs font-bold text-bg">IV</span>
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-text-primary font-display">Inner Victory</div>
            <div className="truncate text-[10px] text-text-muted">Command Centre</div>
          </div>
        )}
      </div>

      {/* Team info */}
      {!collapsed && team && (
        <div className="px-4 py-3 border-b border-border-1">
          <div className="truncate text-xs font-semibold text-text-primary">{team.name}</div>
          <div className="truncate text-[10px] text-text-muted">{team.sport} · {team.league}</div>
          {team.season_label && (
            <div className="mt-1 inline-flex items-center rounded bg-lime/10 px-1.5 py-0.5 text-[10px] font-medium text-lime">
              {team.season_label}
            </div>
          )}
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2 px-2">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-4">
            {!collapsed && (
              <div className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-text-faint">
                {group.label}
              </div>
            )}
            {group.items.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || (item.href !== '/coach' && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2.5 rounded-lg px-2 py-2 text-xs transition-colors',
                    isActive
                      ? 'bg-lime/10 text-lime'
                      : 'text-text-muted hover:bg-surface-2 hover:text-text-primary'
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.badge ? (
                        <span className="flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-rose/20 px-1 text-[10px] font-bold text-rose">
                          {item.badge}
                        </span>
                      ) : null}
                    </>
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* User */}
      {user && (
        <div className={cn('border-t border-border-1 p-3', collapsed ? 'flex justify-center' : '')}>
          <div className={cn('flex items-center gap-2.5', collapsed ? '' : '')}>
            <div
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-bg"
              style={{ backgroundColor: user.avatar_color ?? '#d4ff5c' }}
            >
              {user.initials ?? user.full_name?.slice(0, 2).toUpperCase()}
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <div className="truncate text-xs font-medium text-text-primary">{user.full_name}</div>
                <div className="truncate text-[10px] text-text-muted">{ROLE_LABELS[user.role] ?? user.role}</div>
              </div>
            )}
            {!collapsed && <ChevronRight className="ml-auto h-3 w-3 text-text-faint" />}
          </div>
        </div>
      )}
    </aside>
  )
}
