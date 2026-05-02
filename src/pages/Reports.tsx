import { useWorkspace } from '@/hooks/useWorkspace'
import { useReports } from '@/hooks/useReports'
import { ReportsKpiBar } from '@/components/reports/ReportsKpiBar'
import { BarBreakdown } from '@/components/reports/BarBreakdown'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'

export function ReportsPage() {
  const { data: workspace, isLoading: wsLoading } = useWorkspace()
  const { data, isLoading, isError, error } = useReports(workspace?.id)

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
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Relatórios</h1>
        <p className="text-sm text-muted mt-1">
          Visão executiva: receita, utilização, throughput e distribuição por
          cliente, projeto e pessoa.{' '}
          <span className="text-brand font-semibold">
            Próxima iteração: filtros temporais + exportação CSV.
          </span>
        </p>
      </div>

      <ReportsKpiBar kpis={data.kpis} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <BarBreakdown
          title="Receita por cliente"
          description="Soma do budget contratado por cliente, projetos não-arquivados."
          rows={data.revenueByClient}
          emptyLabel="Nenhum cliente com budget cadastrado."
        />

        <BarBreakdown
          title="Horas registradas por projeto"
          description="actual_hours por projeto. Cor reflete health atual."
          rows={data.hoursByProject}
          emptyLabel="Nenhuma hora registrada ainda."
        />

        <BarBreakdown
          title="Carga atual por pessoa"
          description="Tasks abertas (não concluídas) atribuídas a cada membro."
          rows={data.loadByMember}
          emptyLabel="Nenhuma task atribuída no momento."
        />

        <BarBreakdown
          title="Bloqueios por projeto"
          description="Tasks marcadas como bloqueadas e ainda abertas."
          rows={data.blockedByProject}
          emptyLabel="Sem bloqueios ativos. Operação no verde."
        />
      </div>

      <BarBreakdown
        title="Top skills do time"
        description="Quantas pessoas declaram cada skill (qualquer proficiência)."
        rows={data.topSkills}
        emptyLabel="Nenhuma skill cadastrada ainda."
        showPercent={false}
        maxVisible={12}
      />
    </div>
  )
}
