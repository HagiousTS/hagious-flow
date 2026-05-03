import { useState } from 'react'
import { useWorkspace } from '@/hooks/useWorkspace'
import { useCapacity } from '@/hooks/useCapacity'
import { CapacityKpiBar } from '@/components/capacity/CapacityKpiBar'
import { CapacityHeatmap } from '@/components/capacity/CapacityHeatmap'
import { ProjectAllocations } from '@/components/capacity/ProjectAllocations'
import { SkillMatrixGrid } from '@/components/capacity/SkillMatrixGrid'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/lib/utils'

const WEEK_OPTIONS: { id: number; label: string }[] = [
  { id: 2, label: '2 semanas' },
  { id: 4, label: '4 semanas' },
  { id: 8, label: '8 semanas' },
  { id: 12, label: '12 semanas' },
]

export function CapacityPage() {
  const { data: workspace, isLoading: wsLoading } = useWorkspace()
  const [weeksAhead, setWeeksAhead] = useState(4)
  const { data, isLoading, isError, error } = useCapacity(
    workspace?.id,
    weeksAhead
  )

  if (wsLoading || isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-80 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  if (isError) {
    return (
      <Card className="border-danger/30">
        <div className="text-center py-8">
          <h3 className="font-semibold text-danger mb-2">
            Erro ao carregar Capacity Planner
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
          <h3 className="font-semibold mb-2">Sem dados de capacidade</h3>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-6 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Capacity Planner
          </h1>
          <p className="text-sm text-muted mt-1">
            Carga semanal por pessoa, agrupada por <em>due_date</em> das tasks
            abertas. Mostrando próximas {weeksAhead} semanas.
          </p>
        </div>
        <div className="flex items-center gap-1 border border-border rounded-lg p-0.5 text-xs">
          {WEEK_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setWeeksAhead(opt.id)}
              className={cn(
                'px-3 py-1.5 rounded transition',
                weeksAhead === opt.id
                  ? 'bg-brand text-white font-semibold'
                  : 'text-muted hover:text-text'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <CapacityKpiBar kpis={data.kpis} />

      <CapacityHeatmap weeks={data.weeks} rows={data.rows} />

      <ProjectAllocations projects={data.projects} />

      <SkillMatrixGrid matrix={data.skillMatrix} />
    </div>
  )
}
