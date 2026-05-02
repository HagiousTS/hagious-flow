import { Card } from '@/components/ui/Card'
import { cn, formatBRL } from '@/lib/utils'
import type { ReportsKpis } from '@/hooks/useReports'

interface ReportsKpiBarProps {
  kpis: ReportsKpis
}

export function ReportsKpiBar({ kpis }: ReportsKpiBarProps) {
  const recognizedPct =
    kpis.totalRevenue > 0 ? (kpis.recognizedRevenue / kpis.totalRevenue) * 100 : 0

  const utilCls =
    kpis.utilizationPct > 100
      ? 'text-danger'
      : kpis.utilizationPct > 85
      ? 'text-warn'
      : 'text-brand'

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
      <Card className="space-y-1">
        <div className="text-[10px] text-muted uppercase tracking-wider">
          Receita contratada
        </div>
        <div className="text-2xl font-bold">
          {formatBRL(kpis.totalRevenue, { compact: true })}
        </div>
        <div className="text-[11px] text-muted">
          reconhecida {formatBRL(kpis.recognizedRevenue, { compact: true })} ·{' '}
          {recognizedPct.toFixed(0)}%
        </div>
      </Card>

      <Card className="space-y-1">
        <div className="text-[10px] text-muted uppercase tracking-wider">
          Utilização
        </div>
        <div className={cn('text-2xl font-bold', utilCls)}>
          {kpis.utilizationPct.toFixed(0)}%
        </div>
        <div className="text-[11px] text-muted">
          {Math.round(kpis.hoursLogged)}h de {Math.round(kpis.hoursEstimated)}h
          estimadas
        </div>
      </Card>

      <Card className="space-y-1">
        <div className="text-[10px] text-muted uppercase tracking-wider">
          Throughput de tasks
        </div>
        <div className="text-2xl font-bold">
          {kpis.throughputPct.toFixed(0)}%
        </div>
        <div className="text-[11px] text-muted">
          {kpis.doneTasks}/{kpis.totalTasks} concluídas ·{' '}
          {kpis.blockedTasks > 0 && (
            <span className="text-danger font-semibold">
              {kpis.blockedTasks} bloqueadas
            </span>
          )}
          {kpis.blockedTasks === 0 && 'sem bloqueios'}
        </div>
      </Card>

      <Card className="space-y-1">
        <div className="text-[10px] text-muted uppercase tracking-wider">
          Pipeline ativo
        </div>
        <div className="text-2xl font-bold">{kpis.activeProjectsCount}</div>
        <div className="text-[11px] text-muted">
          projetos ativos · {kpis.doneProjectsCount} concluídos ·{' '}
          {kpis.averageTasksPerMember.toFixed(1)} tasks/pessoa
        </div>
      </Card>
    </div>
  )
}
