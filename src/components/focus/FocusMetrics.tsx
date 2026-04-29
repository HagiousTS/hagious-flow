import { Card } from '@/components/ui/Card'
import type { FocusMetrics as FocusMetricsT } from '@/hooks/useFocus'

interface FocusMetricsProps {
  metrics: FocusMetricsT
}

function formatHM(min: number): string {
  const h = Math.floor(min / 60)
  const m = min % 60
  if (h === 0) return `${m}min`
  if (m === 0) return `${h}h`
  return `${h}h${m.toString().padStart(2, '0')}min`
}

export function FocusMetrics({ metrics }: FocusMetricsProps) {
  return (
    <Card className="p-5">
      <h3 className="font-semibold text-[14px] mb-3">Métricas de foco · semana</h3>
      <div className="space-y-3">
        <Row label="Sessões esta semana" value={metrics.sessionsThisWeek.toString()} />
        <Row label="Horas em foco" value={formatHM(metrics.minutesThisWeek)} />
        <Row
          label="Interrupções bloqueadas"
          value={metrics.interruptionsBlocked.toString()}
          sub={`${metrics.interruptionsEscalated} escaladas`}
        />
      </div>
    </Card>
  )
}

interface RowProps {
  label: string
  value: string
  sub?: string
}

function Row({ label, value, sub }: RowProps) {
  return (
    <div>
      <div className="flex justify-between items-baseline mb-0.5">
        <span className="text-[12px] text-muted">{label}</span>
        <span className="text-base font-bold tabular-nums">{value}</span>
      </div>
      {sub && <div className="text-[10px] text-muted">{sub}</div>}
    </div>
  )
}
