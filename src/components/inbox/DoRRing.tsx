import { cn } from '@/lib/utils'

interface DoRRingProps {
  score: number | null
  size?: number
  showLabel?: boolean
  className?: string
}

function scoreColor(score: number): { stroke: string; text: string } {
  if (score >= 80) return { stroke: 'var(--ok)', text: 'text-ok' }
  if (score >= 60) return { stroke: 'var(--warn)', text: 'text-warn' }
  return { stroke: 'var(--danger)', text: 'text-danger' }
}

export function DoRRing({
  score,
  size = 22,
  showLabel = true,
  className,
}: DoRRingProps) {
  if (score == null) {
    return (
      <span className={cn('text-[11px] text-muted', className)}>DoR —</span>
    )
  }

  const radius = 15
  const circumference = 2 * Math.PI * radius
  const offset =
    circumference - (Math.min(100, Math.max(0, score)) / 100) * circumference
  const { stroke, text } = scoreColor(score)

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <svg width={size} height={size} viewBox="0 0 36 36" className="shrink-0">
        <circle
          cx="18"
          cy="18"
          r={radius}
          fill="none"
          strokeWidth="3"
          className="ring-bg"
          stroke="var(--border)"
        />
        <circle
          cx="18"
          cy="18"
          r={radius}
          fill="none"
          strokeWidth="3"
          stroke={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transform: 'rotate(-90deg)',
            transformOrigin: 'center',
            transition: 'stroke-dashoffset 1.2s ease',
          }}
        />
      </svg>
      {showLabel && (
        <span className={cn('text-[11px] font-bold', text)}>
          DoR {Math.round(score)}
        </span>
      )}
    </div>
  )
}
