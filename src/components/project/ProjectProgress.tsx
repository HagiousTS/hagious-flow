import { Card } from '@/components/ui/Card'
import type { ProjectStatusBreakdown } from '@/hooks/useProjectDetail'

interface ProjectProgressProps {
  breakdown: ProjectStatusBreakdown
  totalDone: number
  totalTasks: number
}

const ROWS: Array<{
  key: keyof ProjectStatusBreakdown
  label: string
  color: string
  textCls: string
}> = [
  { key: 'done', label: 'Done', color: 'var(--ok)', textCls: '' },
  { key: 'doing', label: 'Em execução', color: 'var(--info)', textCls: '' },
  { key: 'review', label: 'Em revisão', color: 'var(--brand-2)', textCls: '' },
  {
    key: 'blocked',
    label: 'Bloqueadas',
    color: 'var(--danger)',
    textCls: 'text-danger',
  },
  { key: 'todo', label: 'A fazer', color: 'var(--muted)', textCls: '' },
]

export function ProjectProgress({
  breakdown,
  totalDone,
  totalTasks,
}: ProjectProgressProps) {
  const total =
    totalTasks || Object.values(breakdown).reduce((a, b) => a + b, 0)
  const pct = total > 0 ? (totalDone / total) * 100 : 0
  const radius = 42
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (pct / 100) * circumference

  return (
    <Card className="p-5">
      <h3 className="font-semibold text-[14px] mb-4">Progresso</h3>
      <div className="flex items-center gap-4">
        <svg viewBox="0 0 100 100" className="w-24 h-24 shrink-0">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="var(--border)"
            strokeWidth="10"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="url(#progGrad)"
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{
              transform: 'rotate(-90deg)',
              transformOrigin: 'center',
              transition: 'stroke-dashoffset 1s ease',
            }}
          />
          <defs>
            <linearGradient id="progGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--brand)" />
              <stop offset="100%" stopColor="var(--brand-2)" />
            </linearGradient>
          </defs>
          <text
            x="50"
            y="48"
            fill="currentColor"
            fontSize="18"
            fontWeight="bold"
            textAnchor="middle"
          >
            {Math.round(pct)}%
          </text>
          <text
            x="50"
            y="62"
            fill="var(--muted)"
            fontSize="8"
            textAnchor="middle"
          >
            {totalDone} / {total}
          </text>
        </svg>

        <div className="flex-1 space-y-2.5 min-w-0">
          {ROWS.map((row) => {
            const value = breakdown[row.key]
            const rowPct = total > 0 ? (value / total) * 100 : 0
            return (
              <div key={row.key}>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-muted">{row.label}</span>
                  <span className={`font-semibold ${row.textCls}`}>
                    {value}
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${rowPct}%`,
                      background: row.color,
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Card>
  )
}
