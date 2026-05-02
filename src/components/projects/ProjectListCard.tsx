import { Link } from 'react-router-dom'
import {
  Calendar,
  Users,
  ListChecks,
  AlertOctagon,
  Building2,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { cn, formatBRL, formatDateShort, relativeDays } from '@/lib/utils'
import type { ProjectListItem } from '@/hooks/useProjects'

interface ProjectListCardProps {
  project: ProjectListItem
}

const STATUS_LABEL: Record<string, string> = {
  planning: 'Planejamento',
  active: 'Ativo',
  on_hold: 'Pausado',
  done: 'Concluído',
  archived: 'Arquivado',
}

const STATUS_CLS: Record<string, string> = {
  planning: 'chip-status-todo',
  active: 'chip-status-doing',
  on_hold: 'chip-status-review',
  done: 'chip-status-done',
  archived: 'chip-status-todo',
}

const HEALTH_LABEL: Record<string, string> = {
  on_track: 'on track',
  ahead: 'adiantado',
  at_risk: 'em risco',
  off_track: 'fora do prazo',
}

const HEALTH_CLS: Record<string, string> = {
  on_track: 'bg-brand/20 text-brand',
  ahead: 'bg-info/20 text-info',
  at_risk: 'bg-warn/20 text-warn',
  off_track: 'bg-danger/20 text-danger',
}

const PRIORITY_CLS: Record<string, string> = {
  P1: 'chip-priority-high',
  P2: 'chip-priority-mid',
  P3: 'chip-priority-low',
}

export function ProjectListCard({ project }: ProjectListCardProps) {
  const progress = project.progressPercent ?? 0
  const accent = project.colorHex ?? undefined

  return (
    <Link to={`/projetos/${project.id}`} className="block group">
      <Card className="hover:border-brand/40 transition cursor-pointer h-full flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <div
            className="w-1 self-stretch rounded-full shrink-0"
            style={{ backgroundColor: accent ?? 'hsl(var(--brand))' }}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-[11px] text-muted">
                {project.code}
              </span>
              {project.priority && (
                <span
                  className={cn(
                    'text-[10px] px-1.5 py-0.5 rounded',
                    PRIORITY_CLS[project.priority]
                  )}
                >
                  {project.priority}
                </span>
              )}
              <span
                className={cn(
                  'text-[10px] px-1.5 py-0.5 rounded',
                  STATUS_CLS[project.status]
                )}
              >
                {STATUS_LABEL[project.status]}
              </span>
              {project.health && HEALTH_CLS[project.health] && (
                <span
                  className={cn(
                    'text-[10px] px-1.5 py-0.5 rounded',
                    HEALTH_CLS[project.health]
                  )}
                >
                  {HEALTH_LABEL[project.health]}
                </span>
              )}
            </div>
            <h3 className="font-semibold text-[15px] leading-tight mt-1 group-hover:text-brand transition truncate">
              {project.name}
            </h3>
            {project.client && (
              <div className="flex items-center gap-1 text-[11px] text-muted mt-0.5 truncate">
                <Building2 className="w-3 h-3 shrink-0" />
                <span className="truncate">
                  {project.client.tradeName ?? project.client.name}
                </span>
              </div>
            )}
          </div>
        </div>

        {project.description && (
          <p className="text-xs text-muted line-clamp-2">
            {project.description}
          </p>
        )}

        <div>
          <div className="flex items-center justify-between text-[10px] mb-1">
            <span className="text-muted uppercase tracking-wider">
              Progresso
            </span>
            <span className="font-semibold">{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-panel2 overflow-hidden">
            <div
              className="h-full grad-brand transition-all"
              style={{ width: `${Math.max(2, Math.min(100, progress))}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
          <div className="bg-panel2 rounded-lg py-1.5">
            <div className="text-[9px] text-muted uppercase">Budget</div>
            <div className="font-bold mt-0.5">
              {project.budgetAmount != null
                ? formatBRL(project.budgetAmount, { compact: true })
                : '—'}
            </div>
          </div>
          <div className="bg-panel2 rounded-lg py-1.5">
            <div className="text-[9px] text-muted uppercase">Horas</div>
            <div className="font-bold mt-0.5">
              {Math.round(project.actualHours ?? 0)}
              {project.estimatedHours != null && (
                <span className="text-muted font-medium">
                  /{Math.round(project.estimatedHours)}
                </span>
              )}
            </div>
          </div>
          <div className="bg-panel2 rounded-lg py-1.5">
            <div className="text-[9px] text-muted uppercase">Prazo</div>
            <div className="font-bold mt-0.5 truncate">
              {project.dueDate ? formatDateShort(project.dueDate) : '—'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-muted border-t pt-3 mt-auto">
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {project.membersCount}
          </div>
          <div className="flex items-center gap-1">
            <ListChecks className="w-3 h-3" />
            {project.openTasks}/{project.totalTasks}
          </div>
          {project.blockedTasks > 0 && (
            <div className="flex items-center gap-1 text-danger">
              <AlertOctagon className="w-3 h-3" />
              {project.blockedTasks}
            </div>
          )}
          {project.dueDate && (
            <div className="flex items-center gap-1 ml-auto">
              <Calendar className="w-3 h-3" />
              {relativeDays(project.dueDate)}
            </div>
          )}
        </div>
      </Card>
    </Link>
  )
}
