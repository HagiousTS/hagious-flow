import { useState } from 'react'
import { Download } from 'lucide-react'
import { useWorkspace } from '@/hooks/useWorkspace'
import { useReports, type ReportsRange } from '@/hooks/useReports'
import { ReportsKpiBar } from '@/components/reports/ReportsKpiBar'
import { BarBreakdown } from '@/components/reports/BarBreakdown'
import { DateRangePicker } from '@/components/reports/DateRangePicker'
import { defaultReportRange } from '@/lib/dateRange'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { downloadCsv, toCsv } from '@/lib/csv'

export function ReportsPage() {
  const { data: workspace, isLoading: wsLoading } = useWorkspace()
  const [range, setRange] = useState<ReportsRange>(defaultReportRange)
  const { data, isLoading, isError, error } = useReports(workspace?.id, range)

  function handleExport() {
    if (!data || !workspace) return
    const d = data
    const lines: string[] = []

    lines.push(
      toCsv(
        ['Workspace', workspace.name],
        [
          ['Período de', range.from],
          ['Período até', range.to],
          [
            'Gerado em',
            new Date().toISOString().replace('T', ' ').slice(0, 19),
          ],
        ]
      )
    )
    lines.push('')

    lines.push('# KPIs')
    lines.push(
      toCsv(
        ['Métrica', 'Valor'],
        [
          ['Receita contratada', d.kpis.totalRevenue],
          ['Receita reconhecida', d.kpis.recognizedRevenue],
          ['Horas estimadas', d.kpis.hoursEstimated],
          ['Horas registradas', d.kpis.hoursLogged],
          ['Horas faturáveis', d.kpis.billableHours],
          ['Receita faturável', d.kpis.billableRevenue],
          ['Utilização %', d.kpis.utilizationPct.toFixed(1)],
          ['Throughput %', d.kpis.throughputPct.toFixed(1)],
          ['Projetos ativos', d.kpis.activeProjectsCount],
          ['Projetos concluídos', d.kpis.doneProjectsCount],
          ['Tasks total', d.kpis.totalTasks],
          ['Tasks done no período', d.kpis.doneTasks],
          ['Tasks bloqueadas', d.kpis.blockedTasks],
        ]
      )
    )
    lines.push('')

    function block(title: string, rows: typeof d.revenueByClient) {
      lines.push(`# ${title}`)
      lines.push(
        toCsv(
          ['Item', 'Sublabel', 'Valor', 'Formatado', 'Pct do total'],
          rows.map((r) => [
            r.label,
            r.sublabel ?? '',
            r.value,
            r.formatted,
            r.pct.toFixed(1) + '%',
          ])
        )
      )
      lines.push('')
    }

    block('Receita por cliente', d.revenueByClient)
    block('Horas por projeto', d.hoursByProject)
    block('Horas por pessoa', d.hoursByMember)
    block('Carga atual por pessoa', d.loadByMember)
    block('Bloqueios por projeto', d.blockedByProject)
    block('Top skills', d.topSkills)

    const filename = `hagious-flow-relatorio-${workspace.slug}-${range.from}_${range.to}.csv`
    downloadCsv(filename, lines.join('\n'))
  }

  if (wsLoading || isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-80 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <Card className="border-danger/30">
        <div className="text-center py-8">
          <h3 className="font-semibold text-danger mb-2">
            Erro ao carregar relatórios
          </h3>
          <p className="text-sm text-muted">{(error as Error).message}</p>
        </div>
      </Card>
    )
  }

  if (!workspace || !data) {
    return (
      <Card>
        <div className="text-center py-12">
          <h3 className="font-semibold mb-2">Sem dados de relatórios</h3>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Relatórios</h1>
          <p className="text-sm text-muted mt-1">
            Visão executiva: receita, utilização, throughput e distribuição.
            Métricas de horas e tasks concluídas refletem o período selecionado.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DateRangePicker value={range} onChange={setRange} />
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4" />
            Exportar CSV
          </Button>
        </div>
      </div>

      <ReportsKpiBar kpis={data.kpis} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <BarBreakdown
          title="Receita por cliente"
          description="Soma do budget contratado por cliente. Não depende do período."
          rows={data.revenueByClient}
          emptyLabel="Nenhum cliente com budget cadastrado."
        />

        <BarBreakdown
          title="Horas por projeto"
          description="Time entries no período. Cor reflete health atual."
          rows={data.hoursByProject}
          emptyLabel="Nenhuma hora registrada no período."
        />

        <BarBreakdown
          title="Horas por pessoa"
          description="Tempo trabalhado no período por membro."
          rows={data.hoursByMember}
          emptyLabel="Nenhuma hora registrada no período."
        />

        <BarBreakdown
          title="Carga atual por pessoa"
          description="Tasks abertas (não concluídas) atribuídas a cada membro."
          rows={data.loadByMember}
          emptyLabel="Nenhuma task atribuída no momento."
        />

        <BarBreakdown
          title="Bloqueios por projeto"
          description="Tasks bloqueadas e ainda abertas. Não depende do período."
          rows={data.blockedByProject}
          emptyLabel="Sem bloqueios ativos. Operação no verde."
        />

        <BarBreakdown
          title="Top skills do time"
          description="Quantas pessoas declaram cada skill (qualquer proficiência)."
          rows={data.topSkills}
          emptyLabel="Nenhuma skill cadastrada ainda."
          showPercent={false}
          maxVisible={12}
        />
      </div>
    </div>
  )
}
