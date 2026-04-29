import { useWorkspace } from '@/hooks/useWorkspace'
import { useDashboard } from '@/hooks/useDashboard'
import { AIBriefingHero } from '@/components/dashboard/AIBriefingHero'
import { KPIRow } from '@/components/dashboard/KPIRow'
import { ProjectsList } from '@/components/dashboard/ProjectsList'
import { TeamPanel } from '@/components/dashboard/TeamPanel'
import { RisksPanel } from '@/components/dashboard/RisksPanel'
import { Skeleton } from '@/components/ui/Skeleton'
import { Card } from '@/components/ui/Card'

export function DashboardPage() {
  const { data: workspace, isLoading: wsLoading } = useWorkspace()
  const { data, isLoading, isError, error } = useDashboard(workspace?.id)

  if (wsLoading || isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-2 h-96 rounded-xl" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <Card className="border-danger/30">
        <div className="text-center py-8">
          <h3 className="font-semibold text-danger mb-2">
            Erro ao carregar dashboard
          </h3>
          <p className="text-sm text-muted">{(error as Error).message}</p>
        </div>
      </Card>
    )
  }

  if (!workspace) {
    return (
      <Card>
        <div className="text-center py-12">
          <h3 className="font-semibold mb-2">Nenhum workspace acessível</h3>
          <p className="text-sm text-muted">
            Você ainda não pertence a nenhum workspace. Peça a um admin para te convidar.
          </p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <AIBriefingHero insight={data?.aiInsight ?? null} />

      <KPIRow projects={data?.projects ?? []} members={data?.members ?? []} />

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ProjectsList projects={data?.projects ?? []} />
        </div>
        <div className="space-y-6">
          <RisksPanel risks={data?.activeRisks ?? []} />
        </div>
      </section>

      <TeamPanel members={data?.members ?? []} />
    </div>
  )
}
