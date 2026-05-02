import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'
import type { CapacityKpis } from '@/hooks/useCapacity'

interface CapacityKpiBarProps {
  kpis: CapacityKpis
}

export function CapacityKpiBar({ kpis }: CapacityKpiBarProps) {
  const saturationAccent =
    kpis.saturationPct > 95
      ? 'text-danger'
      : kpis.saturationPct > 80
        ? 'text-warn'
        : 'text-text'

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <Stat
        label="Equipe ativa"
        value={`${kpis.membersCount} ${kpis.membersCount === 1 ? 'pessoa' : 'pessoas'}`}
        sub={`${kpis.totalCapacityHours}h capacidade total`}
      />
      <Stat
        label="Saturação atual"
        value={`${Math.round(kpis.saturationPct)}%`}
        sub={`${Math.round(kpis.totalAllocatedHours)}h alocadas`}
        accent={saturationAccent}
      />
      <Stat
        label="Em sobrecarga"
        value={`${kpis.overloadedCount} ${kpis.overloadedCount === 1 ? 'pessoa' : 'pessoas'}`}
        sub={kpis.overloadedSummary}
        accent={kpis.overloadedCount > 0 ? 'text-danger' : 'text-text'}
        border={kpis.overloadedCount > 0 ? 'border-danger/30' : ''}
      />
      <Stat
        label="Capacidade livre"
        value={`${Math.round(kpis.freeHours)}h disponíveis`}
        sub={kpis.freeSummary}
        accent="text-ok"
        border="border-ok/30"
      />
    </div>
  )
}

interface StatProps {
  label: string
  value: string
  sub: string
  accent?: string
  border?: string
}

function Stat({
  label,
  value,
  sub,
  accent = 'text-text',
  border = '',
}: StatProps) {
  return (
    <Card className={cn('px-4 py-3', border)}>
      <div className="text-[10px] text-muted uppercase tracking-wider">
        {label}
      </div>
      <div className={cn('text-base font-bold mt-1', accent)}>{value}</div>
      <div className="text-[10px] text-muted truncate" title={sub}>
        {sub}
      </div>
    </Card>
  )
}
