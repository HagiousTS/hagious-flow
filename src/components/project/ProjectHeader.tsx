import { AlertTriangle, CheckCircle2, Clock } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { cn, formatBRL, formatDateShort, relativeDays } from '@/lib/utils'
import type { Project, ProjectHealthView } from '@/types/database'

interface ProjectHeaderProps {
  project: Project
  health: ProjectHealthView | null
  totalHoursLogged: number
}

const PRIORITY_CHIP: Record<string, { label: string; cls: string }> = {
  P1: { label: 'P1 · Crítico', cls: 'tag-priority-high' },
  P2: { label: 'P2', cls: 'tag-priority-mid' },
  P3: { label: 'P3', cls: 'tag-priority-low' },
}

const HEALTH_CHIP: Record<
  string,
  {
    label: string
    cls: string
    icon: React.ComponentType<{ className?: string }>
  }
> = {
  on_track: { label: 'No prazo', cls: 'tag-status-doing', icon: Clock },
  ahead: { label: 'Adiantado', cls: 'tag-status-done', icon: CheckCircle2 },
  at_risk: { label: 'Em risco', cls: 'tag-priority-mid', icon: AlertTriangle },
  off_track: {
    label: 'Fora do prazo',
    cls: 'tag-priority-high',
    icon: AlertTriangle,
  },
}

const TYPE_LABELS: Record<string, string> = {
  implementation: 'Implantação',
  support: 'Sustentação',
  upgrade: 'Upgrade',
  custom: 'Customização',
  internal: 'Interno',
}

function calcMargin(project: Project, hoursLogged: number): number | null {
  if (!project.budget_amount || !project.estimated_hours) return null
  const projectedActualHours = Math.max(
    hoursLogged,
    Number(project.actual_hours ?? 0)
  )
  const hourlyRate =
    Number(project.cost_estimate ?? 0) / Number(project.estimated_hours)
  if (!Number.isFinite(hourlyRate) || hourlyRate === 0) return null
  const cost = projectedActualHours * hourlyRate
  const margin =
    ((Number(project.budget_amount) - cost) / Number(project.budget_amount)) *
    100
  return margin
}

export function ProjectHeader({
  project,
  health,
  totalHoursLogged,
}: ProjectHeaderProps) {
  const priority = project.priority ? PRIORITY_CHIP[project.priority] : null
  const healthMeta = project.health ? HEALTH_CHIP[project.health] : null
  const HealthIcon = healthMeta?.icon
  const typeLabel = TYPE_LABELS[project.project_type] ?? project.project_type
  const progress = Number(project.progress_percent ?? health?.percent_done ?? 0)
  const hoursLogged = Math.max(
    totalHoursLogged,
    Number(project.actual_hours ?? 0)
  )
  const estimated = Number(project.estimated_hours ?? 0)
  const hoursOverflow = estimated > 0 && hoursLogged > estimated
  const margin = calcMargin(project, hoursLogged)
  const dueRelative = relativeDays(project.due_date)
  const isLate =
    project.due_date &&
    new Date(project.due_date).getTime() < Date.now() &&
    progress < 100

  return (
    <div className="flex items-start gap-5 flex-wrap">
      <div
        className="w-14 h-14 rounded-2xl grad-brand text-white flex items-center justify-center font-bold text-xl shrink-0"
        style={
          project.color_hex ? { background: project.color_hex } : undefined
        }
      >
        {project.code}
      </div>
      <div className="flex-1 min-w-[280px]">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          {priority && (
            <span className={cn('chip', priority.cls)}>{priority.label}</span>
          )}
          {healthMeta && (
            <span className={cn('chip', healthMeta.cls)}>
              {HealthIcon && <HealthIcon className="w-3 h-3" />}
              {healthMeta.label}
            </span>
          )}
          <span className="chip tag-info">{typeLabel}</span>
          <span className="chip tag-status-todo">{project.status}</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
        <p className="text-sm text-muted mt-1">
          {project.description ?? 'Sem descrição.'}
          {project.client?.name && (
            <>
              {' · Cliente: '}
              <span className="text-text font-medium">
                {project.client.name}
              </span>
            </>
          )}
          {project.sponsor_name && (
            <>
              {' · Sponsor: '}
              <span className="text-text font-medium">
                {project.sponsor_name}
              </span>
            </>
          )}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Mini
          label="Entrega"
          value={formatDateShort(project.due_date)}
          sub={dueRelative}
          accent={
            isLate
              ? 'text-danger'
              : project.due_date
                ? 'text-warn'
                : 'text-text'
          }
        />
        <Mini
          label="Progresso"
          value={`${Math.round(progress)}%`}
          sub={
            health ? `${health.done_tasks}/${health.total_tasks} tasks` : '—'
          }
        />
        <Mini
          label="Horas"
          value={`${Math.round(hoursLogged)}h`}
          sub={
            estimated
              ? `de ${Math.round(estimated)}h estimadas`
              : 'sem estimativa'
          }
          accent={hoursOverflow ? 'text-danger' : 'text-text'}
        />
        <Mini
          label="Margem"
          value={margin != null ? `${Math.round(margin)}%` : '—'}
          sub={
            project.budget_amount
              ? formatBRL(Number(project.budget_amount))
              : 'sem budget'
          }
          accent={
            margin == null
              ? 'text-text'
              : margin < 25
                ? 'text-danger'
                : margin < 40
                  ? 'text-warn'
                  : 'text-ok'
          }
        />
      </div>
    </div>
  )
}

interface MiniProps {
  label: string
  value: string
  sub: string
  accent?: string
}

function Mini({ label, value, sub, accent = 'text-text' }: MiniProps) {
  return (
    <Card className="px-4 py-2 text-center min-w-[110px]">
      <div className="text-[10px] text-muted uppercase tracking-wider">
        {label}
      </div>
      <div className={cn('text-sm font-bold', accent)}>{value}</div>
      <div className="text-[10px] text-muted truncate" title={sub}>
        {sub}
      </div>
    </Card>
  )
}
