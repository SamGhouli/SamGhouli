'use client'
import { useEffect, useState } from 'react'

interface ReadinessRingProps {
  score: number
  size?: number
}

function getScoreColor(score: number): string {
  if (score >= 75) return '#4ade80'
  if (score >= 55) return '#fbbf24'
  return '#fb7185'
}

export function ReadinessRing({ score, size = 160 }: ReadinessRingProps) {
  const [animatedScore, setAnimatedScore] = useState(0)
  const radius = 70
  const strokeWidth = 8
  const viewBoxSize = (radius + strokeWidth) * 2
  const circumference = 2 * Math.PI * radius
  const color = getScoreColor(score)

  useEffect(() => {
    const duration = 1500
    const startTime = performance.now()

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setAnimatedScore(Math.round(score * eased))
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    const raf = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf)
  }, [score])

  const dashOffset = circumference - (animatedScore / 100) * circumference

  return (
    <div className="flex flex-col items-center">
      <div style={{ width: size, height: size }} className="relative">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
          className="-rotate-90"
          style={{ filter: `drop-shadow(0 0 12px ${color}60)` }}
        >
          {/* Background ring */}
          <circle
            cx={viewBoxSize / 2}
            cy={viewBoxSize / 2}
            r={radius}
            fill="none"
            stroke="#1e2334"
            strokeWidth={strokeWidth}
          />
          {/* Score ring */}
          <circle
            cx={viewBoxSize / 2}
            cy={viewBoxSize / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 0.016s linear' }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-4xl font-bold tabular-nums"
            style={{ color, lineHeight: 1 }}
          >
            {animatedScore}
          </span>
          <span className="mt-1 text-xs text-text-muted">/ 100</span>
        </div>
      </div>
      <span className="mt-2 text-sm font-medium text-text-muted">Readiness Score</span>
    </div>
  )
}
