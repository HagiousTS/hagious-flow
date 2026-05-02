import { useParams, Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { useWorkspace } from '@/hooks/useWorkspace'
import { useProjectDetail } from '@/hooks/useProjectDetail'
import { ProjectHeader } from '@/components/project/ProjectHeader'
import { ProjectGantt } from '@/components/project/ProjectGantt'
import { ProjectTasksList } from '@/components/project/ProjectTasksList'
import { ProjectProgress } from '@/components/project/ProjectProgress'
import { ProjectTeamPanel } from '@/components/project/ProjectTeamPanel'
import { ProjectRisks } from '@/components/project/ProjectRisks'
import { ProjectActivity } from '@/components/project/ProjectActivity'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: workspace, isLoading: wsLoading } = useWorkspace()
  const { data, isLoading, isError, error } = useProjectDetail(
    workspace?.id,
    id
  )

  if (wsLoading || isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Skeleton className="lg:col-span-8 h-[500px] rounded-xl" />
          <Skeleton className="lg:col-span-4 h-[500px] rounded-xl" />
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <Card className="border-danger/30">
        <div className="text-center py-8">
          <h3 className="font-semibold text-danger mb-2">
            Erro ao carregar projeto
          </h3>
          <p className="text-sm text-muted">{(error as Error).message}</p>
          <Link
            to="/projetos"
            className="mt-4 inline-flex items-center gap-1 text-brand text-sm hover:underline"
          >
            <ChevronLeft className="w-4 h-4" /> Voltar para projetos
          </Link>
        </div>
      </Card>
    )
  }

  if (!data || !workspace) {
    return (
      <Card>
        <div className="text-center py-12">
          <h3 className="font-semibold mb-2">Projeto não encontrado</h3>
          <Link
            to="/projetos"
            className="mt-2 inline-flex items-center gap-1 text-brand text-sm hover:underline"
          >
            <ChevronLeft className="w-4 h-4" /> Voltar para projetos
          </Link>
        </div>
      </Card>
    )
  }

  const {
    project,
    health,
    phases,
    tasks,
    risks,
    team,
    activity,
    statusBreakdown,
    totalHoursLogged,
  } = data

  const totalDone = statusBreakdown.done
  const totalTasks =
    health?.total_tasks ??
    Object.values(statusBreakdown).reduce((a, b) => a + b, 0)

  return (
    <div className="space-y-6">
      <Link
        to="/projetos"
        className="inline-flex items-center gap-1 text-[12px] text-muted hover:text-brand"
      >
        <ChevronLeft className="w-3.5 h-3.5" /> Projetos
      </Link>

      <ProjectHeader
        project={project}
        health={health}
        totalHoursLogged={totalHoursLogged}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <ProjectGantt phases={phases} project={project} />
          <ProjectTasksList
            tasks={tasks}
            projectCode={project.code}
            projectId={project.id}
          />
        </div>
        <aside className="lg:col-span-4 space-y-6">
          <ProjectProgress
            breakdown={statusBreakdown}
            totalDone={totalDone}
            totalTasks={totalTasks}
          />
          <ProjectTeamPanel team={team} totalHours={totalHoursLogged} />
          <ProjectRisks risks={risks} />
          <ProjectActivity activity={activity} />
        </aside>
      </div>
    </div>
  )
}
