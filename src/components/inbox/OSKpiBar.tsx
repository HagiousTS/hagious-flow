import { Card } from '@/components/ui/Card'
import type { InboxKpis } from '@/hooks/useInbox'

interface OSKpiBarProps {
  kpis: InboxKpis
}

export function OSKpiBar({ kpis }: OSKpiBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Stat label="Aguardando" value={kpis.pending} accent="text-warn" />
      <Stat
        label="SLA em risco"
        value={kpis.slaAtRisk}
        accent={kpis.slaAtRisk > 0 ? 'text-danger' : 'text-text'}
      />
      <Stat
        label="Devolvidas (mês)"
        value={
          <span>
            {kpis.returnedThisMonth}{' '}
            <span className="text-[10px] text-muted font-normal">de {kpis.totalThisMonth}</span>
          </span>
        }
      />
      <Stat
        label="DoR médio"
        value={kpis.avgQualityScore ?? '—'}
        accent={
          kpis.avgQualityScore != null && kpis.avgQualityScore >= 70 ? 'text-ok' : 'text-text'
        }
      />
    </div>
  )
}

interface StatProps {
  label: string
  value: React.ReactNode
  accent?: string
}

function Stat({ label, value, accent = 'text-text' }: StatProps) {
  return (
    <Card className="px-4 py-2 text-center min-w-[120px]">
      <div className="text-[10px] text-muted uppercase tracking-wider">{label}</div>
      <div className={`text-sm font-bold ${accent}`}>{value}</div>
    </Card>
  )
}
