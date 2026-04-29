import { Card } from '@/components/ui/Card'
import { cn, getInitials } from '@/lib/utils'
import type { MemberHeatRow, WeekColumn } from '@/hooks/useCapacity'

interface CapacityHeatmapProps {
  weeks: WeekColumn[]
  rows: MemberHeatRow[]
}

function cellClass(pct: number): string {
  if (pct >= 95) return 'bg-danger/15 border-danger/40 text-danger'
  if (pct >= 80) return 'bg-warn/15 border-warn/40 text-warn'
  if (pct >= 50) return 'bg-ok/15 border-ok/40 text-ok'
  return 'bg-panel2 border-border text-muted'
}

const LEGEND = [
  { label: '< 50%', cls: 'bg-panel2 border border-border' },
  { label: '50–79%', cls: 'bg-ok/15 border border-ok/40' },
  { label: '80–94%', cls: 'bg-warn/15 border border-warn/40' },
  { label: '≥ 95%', cls: 'bg-danger/15 border border-danger/40' },
]

export function CapacityHeatmap({ weeks, rows }: CapacityHeatmapProps) {
  const gridTemplate = `200px repeat(${weeks.length}, minmax(110px, 1fr))`

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
        <div>
          <h3 className="font-semibold text-[15px]">
            Heatmap de carga · próximas {weeks.length} semanas
          </h3>
          <p className="text-xs text-muted">
            Soma das horas estimadas (restantes) por pessoa, distribuídas pela due_date das tasks.
          </p>
        </div>
        <div className="flex items-center gap-3 text-[10px] flex-wrap">
          {LEGEND.map((l) => (
            <div key={l.label} className="flex items-center gap-1.5">
              <div className={cn('w-3 h-3 rounded', l.cls)} />
              <span className="text-muted">{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto scrollbar">
        <div
          className="grid items-center gap-2 min-w-[700px]"
          style={{ gridTemplateColumns: gridTemplate }}
        >
          <div />
          {weeks.map((w) => (
            <div
              key={w.index}
              className="text-[10px] text-center text-muted uppercase tracking-wider font-semibold"
            >
              {w.label} · {w.shortDate}
              {w.isCurrent && (
                <div className="text-[9px] normal-case font-normal text-brand">esta semana</div>
              )}
            </div>
          ))}

          {rows.length === 0 && (
            <div
              className="text-center py-12 text-muted text-sm"
              style={{ gridColumn: `1 / span ${weeks.length + 1}` }}
            >
              Nenhum membro ativo no workspace.
            </div>
          )}

          {rows.map((row) => (
            <Row key={row.memberId} row={row} weeks={weeks} />
          ))}
        </div>
      </div>
    </Card>
  )
}

function Row({ row, weeks }: { row: MemberHeatRow; weeks: WeekColumn[] }) {
  return (
    <>
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-full bg-panel2 border border-border flex items-center justify-center text-[10px] font-bold text-text shrink-0">
          {getInitials(row.fullName)}
        </div>
        <div className="min-w-0">
          <div className="text-[12px] font-semibold truncate">{row.fullName}</div>
          <div className="text-[10px] text-muted truncate">{row.jobTitle ?? '—'}</div>
        </div>
      </div>
      {weeks.map((w) => {
        const cell = row.weeks[w.index]
        const pct = cell?.pct ?? 0
        const allocated = cell?.allocatedHours ?? 0
        return (
          <div
            key={w.index}
            className={cn(
              'rounded-lg border px-2 py-2 flex flex-col items-center justify-center text-center transition',
              cellClass(pct)
            )}
            title={`${row.fullName} · Sem ${w.label}: ${allocated.toFixed(1)}h / ${row.capacityHoursWeek}h`}
          >
            <span className="text-base font-bold tabular-nums">{Math.round(pct)}%</span>
            <span className="text-[10px] opacity-90">
              {allocated.toFixed(0)}h / {row.capacityHoursWeek}h
            </span>
          </div>
        )
      })}
    </>
  )
}
