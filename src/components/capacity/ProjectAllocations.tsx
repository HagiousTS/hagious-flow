import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { cn, formatDateShort, getInitials } from '@/lib/utils'
import type { ProjectAllocation } from '@/hooks/useCapacity'

interface ProjectAllocationsProps {
  projects: ProjectAllocation[]
}

const HEALTH_LABELS: Record<
  ProjectAllocation['health'],
  { label: string; cls: string }
> = {
  on_track: { label: 'No prazo', cls: 'tag-status-doing' },
  at_risk: { label: 'Em risco', cls: 'tag-priority-mid' },
  overloaded: { label: 'Sobrecarregado', cls: 'tag-priority-high' },
  idle: { label: 'Sem alocação', cls: 'tag-status-todo' },
}

export function ProjectAllocations({ projects }: ProjectAllocationsProps) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-[15px]">
            Alocações ativas por projeto
          </h3>
          <p className="text-xs text-muted">Quem está em quê, esta semana</p>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-10 text-muted text-sm border border-dashed border-border rounded-xl">
          Nenhuma alocação esta semana.
        </div>
      ) : (
        <div className="overflow-hidden border border-border rounded-xl">
          <div className="overflow-x-auto scrollbar">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[11px] text-muted bg-panel2/50">
                  <th className="text-left font-medium py-2 px-3">Projeto</th>
                  <th className="text-left font-medium py-2 px-3">Equipe</th>
                  <th className="text-left font-medium py-2 px-3">
                    Horas semana
                  </th>
                  <th className="text-left font-medium py-2 px-3">
                    Capacity restante
                  </th>
                  <th className="text-left font-medium py-2 px-3">Saúde</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {projects.map((p) => {
                  const health = HEALTH_LABELS[p.health]
                  const remainingClass =
                    p.capacityRemaining < 0
                      ? 'text-danger'
                      : p.capacityRemaining < 8
                        ? 'text-warn'
                        : 'text-ok'
                  return (
                    <tr key={p.projectId} className="hover:bg-panel2/40">
                      <td className="py-3 px-3">
                        <Link
                          to={`/projetos/${p.projectId}`}
                          className="flex items-center gap-2"
                        >
                          <div className="w-7 h-7 rounded-md grad-brand text-white flex items-center justify-center text-[10px] font-bold">
                            {p.code}
                          </div>
                          <div>
                            <div className="font-semibold text-[13px]">
                              {p.name}
                            </div>
                            <div className="text-[10px] text-muted">
                              Entrega: {formatDateShort(p.dueDate)}
                            </div>
                          </div>
                        </Link>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex -space-x-2">
                          {p.members.slice(0, 4).map((m) => (
                            <div
                              key={m.memberId}
                              className="w-6 h-6 rounded-full border-2 border-panel bg-panel2 text-text flex items-center justify-center text-[9px] font-bold"
                              title={m.fullName}
                            >
                              {getInitials(m.fullName)}
                            </div>
                          ))}
                          {p.members.length > 4 && (
                            <div className="w-6 h-6 rounded-full border-2 border-panel bg-panel2 text-muted flex items-center justify-center text-[9px] font-bold">
                              +{p.members.length - 4}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-[12px] font-semibold">
                        {p.hoursWeek.toFixed(0)}h
                      </td>
                      <td
                        className={cn('py-3 px-3 text-[12px]', remainingClass)}
                      >
                        {p.capacityRemaining < 0
                          ? `${p.capacityRemaining.toFixed(0)}h (sobrealocado)`
                          : `+${p.capacityRemaining.toFixed(0)}h livres`}
                      </td>
                      <td className="py-3 px-3">
                        <span className={cn('chip', health.cls)}>
                          {health.label}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Card>
  )
}
