import { useMemo, useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useWorkspace } from '@/hooks/useWorkspace'
import { useProjects } from '@/hooks/useProjects'
import { ProjectListCard } from '@/components/projects/ProjectListCard'
import { NewProjectDialog } from '@/components/projects/NewProjectDialog'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn, formatBRL } from '@/lib/utils'
import type { ProjectHealth, ProjectStatus } from '@/types/database'

type StatusFilter = 'all' | ProjectStatus
type HealthFilter = 'all' | ProjectHealth

const STATUS_FILTERS: { id: StatusFilter; label: string }[] = [
  { id: 'all', label: 'Todos' },
  { id: 'active', label: 'Ativos' },
  { id: 'planning', label: 'Planejamento' },
  { id: 'on_hold', label: 'Pausados' },
  { id: 'done', label: 'Concluídos' },
]

const HEALTH_FILTERS: { id: HealthFilter; label: string }[] = [
  { id: 'all', label: 'Toda saúde' },
  { id: 'on_track', label: 'On track' },
  { id: 'ahead', label: 'Adiantados' },
  { id: 'at_risk', label: 'Em risco' },
  { id: 'off_track', label: 'Fora' },
]

export function ProjectsPage() {
  const navigate = useNavigate()
  const { data: workspace, isLoading: wsLoading } = useWorkspace()
  const { data, isLoading, isError, error } = useProjects(workspace?.id)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [healthFilter, setHealthFilter] = useState<HealthFilter>('all')
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)

  const filtered = useMemo(() => {
    if (!data) return []
    const q = search.trim().toLowerCase()
    return data.projects.filter((p) => {
      if (statusFilter !== 'all' && p.status !== statusFilter) return false
      if (healthFilter !== 'all' && p.health !== healthFilter) return false
      if (!q) return true
      return (
        p.code.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.client?.name.toLowerCase().includes(q) ||
        p.client?.tradeName?.toLowerCase().includes(q) ||
        p.ownerName?.toLowerCase().includes(q)
      )
    })
  }, [data, statusFilter, healthFilter, search])

  if (wsLoading || isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
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
            Erro ao carregar projetos
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
          <h3 className="font-semibold mb-2">Sem dados de projetos</h3>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-6 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projetos</h1>
          <p className="text-sm text-muted mt-1">
            Listagem completa, filtros por status e saúde, criação de novo
            projeto.
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4" />
          Novo projeto
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiTile label="Total" value={data.kpis.total.toString()} />
        <KpiTile
          label="Ativos"
          value={data.kpis.active.toString()}
          accent="brand"
        />
        <KpiTile
          label="Em risco"
          value={data.kpis.atRisk.toString()}
          accent={data.kpis.atRisk > 0 ? 'danger' : 'muted'}
        />
        <KpiTile
          label="Receita contratada"
          value={formatBRL(data.kpis.totalBudget, { compact: true })}
          accent="warn"
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-panel border rounded-lg px-3 py-2 flex-1 min-w-[240px] max-w-md">
            <Search className="w-4 h-4 text-muted shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por código, nome, cliente, owner..."
              className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted"
            />
          </div>
          <div className="flex items-center gap-1 flex-wrap">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setStatusFilter(f.id)}
                className={cn(
                  'text-xs px-3 py-1.5 rounded-lg border transition',
                  statusFilter === f.id
                    ? 'bg-brand/15 border-brand/40 text-brand font-semibold'
                    : 'bg-panel border-border text-muted hover:text-text'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          {HEALTH_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setHealthFilter(f.id)}
              className={cn(
                'text-[11px] px-2.5 py-1 rounded-md border transition',
                healthFilter === f.id
                  ? 'bg-info/15 border-info/40 text-info font-semibold'
                  : 'bg-panel border-border text-muted hover:text-text'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card className="border-dashed">
          <div className="text-center py-12 text-muted text-sm">
            Nenhum projeto para os filtros atuais.
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <ProjectListCard key={p.id} project={p} />
          ))}
        </div>
      )}

      <NewProjectDialog
        workspaceId={workspace.id}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onCreated={(id) => navigate(`/projetos/${id}`)}
      />
    </div>
  )
}

function KpiTile({
  label,
  value,
  accent,
}: {
  label: string
  value: string
  accent?: 'brand' | 'danger' | 'warn' | 'muted'
}) {
  const accentCls = {
    brand: 'text-brand',
    danger: 'text-danger',
    warn: 'text-warn',
    muted: 'text-text',
  }[accent ?? 'muted']

  return (
    <Card className="py-4">
      <div className="text-[10px] text-muted uppercase tracking-wider">
        {label}
      </div>
      <div className={cn('text-2xl font-bold mt-1', accentCls)}>{value}</div>
    </Card>
  )
}
