import { Link } from 'react-router-dom'
import { AlertTriangle, CheckCircle2, Clock } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { formatDateShort, relativeDays } from '@/lib/utils'
import type { ProjectHealthView } from '@/types/database'

interface ProjectsListProps {
  projects: ProjectHealthView[]
}

function healthMeta(p: ProjectHealthView): {
  badge: string
  icon: React.ComponentType<{ className?: string }>
  iconColor: string
} {
  if (p.blocked_tasks > 0) {
    return {
      badge: 'chip-status-block',
      icon: AlertTriangle,
      iconColor: 'text-danger',
    }
  }
  if (p.percent_done >= 80) {
    return {
      badge: 'chip-status-done',
      icon: CheckCircle2,
      iconColor: 'text-ok',
    }
  }
  return { badge: 'chip-status-doing', icon: Clock, iconColor: 'text-info' }
}

export function ProjectsList({ projects }: ProjectsListProps) {
  // Ordenar por risco: bloqueadas primeiro, depois por prazo
  const sorted = [...projects].sort((a, b) => {
    if ((b.blocked_tasks ?? 0) !== (a.blocked_tasks ?? 0)) {
      return (b.blocked_tasks ?? 0) - (a.blocked_tasks ?? 0)
    }
    if (!a.due_date) return 1
    if (!b.due_date) return -1
    return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
  })

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-[15px]">Projetos em andamento</h3>
          <p className="text-xs text-muted">
            Visão executiva · ordenado por risco
          </p>
        </div>
      </div>

      {sorted.length === 0 && (
        <div className="text-center py-12 text-muted text-sm">
          Nenhum projeto encontrado.
        </div>
      )}

      <div className="space-y-3">
        {sorted.map((p) => {
          const { badge, icon: Icon, iconColor } = healthMeta(p)
          return (
            <Link
              key={p.project_id}
              to={`/projetos/${p.project_id}`}
              className="block border rounded-xl p-4 hover:border-brand/40 transition"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-9 h-9 rounded-lg grad-brand text-white flex items-center justify-center text-sm font-bold shrink-0">
                    {p.code}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-sm truncate">
                        {p.name}
                      </h4>
                      <span className={`chip ${badge}`}>
                        <Icon className={`w-3 h-3 ${iconColor}`} />
                        {p.blocked_tasks > 0
                          ? `${p.blocked_tasks} bloqueada(s)`
                          : p.percent_done >= 80
                            ? 'No fluxo'
                            : 'Em execução'}
                      </span>
                    </div>
                    <p className="text-xs text-muted mt-0.5">
                      {p.total_tasks} tasks · {p.done_tasks} concluídas
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs text-muted">Entrega</div>
                  <div className="text-sm font-semibold">
                    {formatDateShort(p.due_date)}
                  </div>
                  <div className="text-[10px] text-muted">
                    {relativeDays(p.due_date)}
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between text-[11px] text-muted mb-1">
                    <span>Progresso</span>
                    <span>{Number(p.percent_done).toFixed(0)}%</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${p.percent_done}%`,
                        background:
                          p.blocked_tasks > 0
                            ? 'linear-gradient(90deg, #F59E0B, #EF4444)'
                            : undefined,
                      }}
                    />
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </Card>
  )
}
