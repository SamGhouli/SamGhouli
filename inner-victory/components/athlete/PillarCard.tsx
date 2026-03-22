interface PillarCardProps {
  label: string
  score: number
  delta: number
  color: string
}

export function PillarCard({ label, score, delta, color }: PillarCardProps) {
  const isPositive = delta >= 0
  const deltaColor = isPositive ? '#4ade80' : '#fb7185'
  const deltaSign = isPositive ? '+' : ''

  // Mini arc: half-circle SVG
  const radius = 28
  const strokeWidth = 5
  const cx = 36
  const circumference = Math.PI * radius // half circle
  const fill = (score / 100) * circumference

  return (
    <div className="flex-1 rounded-xl border border-border-1 bg-surface-2 p-4 flex flex-col items-center gap-2">
      {/* Mini arc */}
      <div style={{ width: 72, height: 40 }} className="relative">
        <svg width={72} height={40} viewBox="0 0 72 40">
          {/* Background half-arc */}
          <path
            d={`M ${strokeWidth} ${cx} A ${radius} ${radius} 0 0 1 ${72 - strokeWidth} ${cx}`}
            fill="none"
            stroke="#1e2334"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Score half-arc */}
          <path
            d={`M ${strokeWidth} ${cx} A ${radius} ${radius} 0 0 1 ${72 - strokeWidth} ${cx}`}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - fill}
            style={{ transition: 'stroke-dashoffset 1.2s ease-out' }}
          />
        </svg>
        {/* Score in center */}
        <div className="absolute inset-x-0 bottom-0 flex justify-center">
          <span className="text-base font-bold tabular-nums" style={{ color }}>
            {score}
          </span>
        </div>
      </div>

      <span className="text-xs font-semibold text-text-primary">{label}</span>

      <span
        className="text-xs font-medium tabular-nums"
        style={{ color: deltaColor }}
      >
        {deltaSign}{delta}
      </span>
    </div>
  )
}
