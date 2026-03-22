'use client'

import { useSearchParams } from 'next/navigation'
import { TopBar } from '@/components/shared/TopBar'
import { DEMO_DATA } from '@/lib/demo/data'
import { CheckCircle, Circle, AlertCircle, Download, FileText, Shield } from 'lucide-react'

interface ChecklistItem {
  id: string
  category: string
  label: string
  status: 'complete' | 'partial' | 'incomplete'
  detail?: string
}

const NCAA_CHECKLIST: ChecklistItem[] = [
  // Eligibility
  { id: 'el-1', category: 'Eligibility', label: 'Academic eligibility verified for all athletes', status: 'partial', detail: '8/9 athletes confirmed. Jordan Casey under review.' },
  { id: 'el-2', category: 'Eligibility', label: 'GPA minimums met (2.3 threshold)', status: 'partial', detail: 'Jordan Casey: GPA 2.1 — below threshold.' },
  { id: 'el-3', category: 'Eligibility', label: 'Attendance records on file (min 75%)', status: 'partial', detail: 'Jordan Casey at 74% — marginal.' },
  { id: 'el-4', category: 'Eligibility', label: 'Amateur status confirmation', status: 'complete' },
  // Wellness & Health
  { id: 'wh-1', category: 'Wellness & Health', label: 'Annual physical examinations completed', status: 'complete' },
  { id: 'wh-2', category: 'Wellness & Health', label: 'Concussion baseline testing on record', status: 'complete' },
  { id: 'wh-3', category: 'Wellness & Health', label: 'Daily wellness check-in programme active', status: 'complete' },
  { id: 'wh-4', category: 'Wellness & Health', label: 'Mental health resource access provided', status: 'complete' },
  { id: 'wh-5', category: 'Wellness & Health', label: 'Injury reporting protocol documented', status: 'complete' },
  // Training Hours
  { id: 'th-1', category: 'Training Hours', label: 'Weekly hour limits tracked (20h max in-season)', status: 'complete' },
  { id: 'th-2', category: 'Training Hours', label: 'Mandatory rest days enforced', status: 'complete' },
  { id: 'th-3', category: 'Training Hours', label: 'RPE logging system active', status: 'complete' },
  // Recruiting
  { id: 'rc-1', category: 'Recruiting', label: 'Prospect contact period rules followed', status: 'complete' },
  { id: 'rc-2', category: 'Recruiting', label: 'Official visit documentation maintained', status: 'incomplete', detail: 'Documentation template not yet created.' },
  // Privacy & Data
  { id: 'pd-1', category: 'Privacy & Data', label: 'Athlete mental health data anonymised', status: 'complete' },
  { id: 'pd-2', category: 'Privacy & Data', label: 'Consent forms on file for wearable data', status: 'partial', detail: '7/9 athletes signed digital consent.' },
  { id: 'pd-3', category: 'Privacy & Data', label: 'Data retention policy communicated to athletes', status: 'complete' },
]

const STATUS_CONFIG = {
  complete: {
    icon: CheckCircle,
    color: 'text-green',
    bg: 'bg-green/10',
    label: 'Complete',
  },
  partial: {
    icon: AlertCircle,
    color: 'text-amber',
    bg: 'bg-amber/10',
    label: 'Partial',
  },
  incomplete: {
    icon: Circle,
    color: 'text-rose',
    bg: 'bg-rose/10',
    label: 'Incomplete',
  },
}

export default function CompliancePage() {
  const searchParams = useSearchParams()
  const isDemo = searchParams.get('demo') === 'true'

  const totalAthletes = isDemo ? DEMO_DATA.athletes.length : 0
  const withCheckins = isDemo
    ? DEMO_DATA.wellnessCheckins.length
    : 0
  const checkinPct = totalAthletes
    ? Math.round((withCheckins / totalAthletes) * 100)
    : 0

  const complete = NCAA_CHECKLIST.filter((i) => i.status === 'complete').length
  const partial = NCAA_CHECKLIST.filter((i) => i.status === 'partial').length
  const incomplete = NCAA_CHECKLIST.filter((i) => i.status === 'incomplete').length
  const total = NCAA_CHECKLIST.length
  const completionPct = Math.round(((complete + partial * 0.5) / total) * 100)

  const categories = Array.from(new Set(NCAA_CHECKLIST.map((i) => i.category)))

  function handleExportPDF() {
    alert('PDF generation requires Supabase Storage configuration. Please connect your Supabase project to enable exports.')
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <TopBar
        title="Compliance Report"
        subtitle={`${completionPct}% compliant · ${total} checks`}
        actions={
          <button
            onClick={handleExportPDF}
            className="flex h-8 items-center gap-1.5 rounded-lg border border-border-1 px-3 text-xs text-text-muted transition-colors hover:bg-surface-2 hover:text-text-primary"
          >
            <Download className="h-3.5 w-3.5" />
            Export PDF
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-border-1 bg-surface-2 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-lime" />
              <span className="text-xs text-text-muted">Enrolled Athletes</span>
            </div>
            <div className="text-3xl font-bold text-lime tabular-nums">{totalAthletes || 9}</div>
          </div>
          <div className="rounded-xl border border-border-1 bg-surface-2 p-4">
            <div className="text-xs text-text-muted mb-1">Check-in Rate</div>
            <div className={`text-3xl font-bold tabular-nums ${checkinPct >= 75 ? 'text-green' : checkinPct >= 55 ? 'text-amber' : 'text-rose'}`}>
              {isDemo ? `${Math.round((withCheckins / (totalAthletes || 1)) * 100)}` : '—'}
              <span className="text-sm font-normal text-text-muted">%</span>
            </div>
            <div className="text-[10px] text-text-muted">today</div>
          </div>
          <div className="rounded-xl border border-border-1 bg-surface-2 p-4">
            <div className="text-xs text-text-muted mb-1">Compliance Score</div>
            <div className={`text-3xl font-bold tabular-nums ${completionPct >= 75 ? 'text-green' : completionPct >= 55 ? 'text-amber' : 'text-rose'}`}>
              {completionPct}
              <span className="text-sm font-normal text-text-muted">%</span>
            </div>
          </div>
          <div className="rounded-xl border border-border-1 bg-surface-2 p-4">
            <div className="text-xs text-text-muted mb-2">Checklist Status</div>
            <div className="space-y-1">
              <div className="flex justify-between text-[10px]">
                <span className="text-green">Complete</span>
                <span className="font-bold text-green tabular-nums">{complete}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-amber">Partial</span>
                <span className="font-bold text-amber tabular-nums">{partial}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-rose">Incomplete</span>
                <span className="font-bold text-rose tabular-nums">{incomplete}</span>
              </div>
            </div>
          </div>
        </div>

        {/* NCAA / U SPORTS Compliance Checklist */}
        <div className="space-y-4">
          {categories.map((category) => {
            const items = NCAA_CHECKLIST.filter((i) => i.category === category)
            return (
              <div key={category} className="rounded-xl border border-border-1 bg-surface-2 overflow-hidden">
                <div className="flex items-center gap-2 border-b border-border-1 bg-surface-3/50 px-5 py-3">
                  <FileText className="h-3.5 w-3.5 text-text-muted" />
                  <h3 className="text-xs font-semibold text-text-primary">{category}</h3>
                </div>
                <div className="divide-y divide-border-1">
                  {items.map((item) => {
                    const cfg = STATUS_CONFIG[item.status]
                    const Icon = cfg.icon
                    return (
                      <div key={item.id} className="flex items-start gap-3 px-5 py-3">
                        <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${cfg.bg}`}>
                          <Icon className={`h-3 w-3 ${cfg.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-text-primary">{item.label}</div>
                          {item.detail && (
                            <div className="mt-0.5 text-[10px] text-text-muted">{item.detail}</div>
                          )}
                        </div>
                        <span
                          className={`shrink-0 rounded border px-2 py-0.5 text-[10px] font-semibold ${
                            item.status === 'complete'
                              ? 'bg-green/10 border-green/20 text-green'
                              : item.status === 'partial'
                              ? 'bg-amber/10 border-amber/20 text-amber'
                              : 'bg-rose/10 border-rose/20 text-rose'
                          }`}
                        >
                          {cfg.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* Privacy Banner */}
        <div className="rounded-xl border border-border-1 bg-surface-1 px-5 py-4">
          <p className="text-center text-[11px] text-text-muted">
            <span className="font-semibold text-text-primary">Privacy Notice:</span>{' '}
            Mental health data is aggregated and anonymised. Individual athlete wellness inputs are
            never visible to coaching staff.
          </p>
        </div>
      </div>
    </div>
  )
}
