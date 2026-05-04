import { Link, useParams } from 'react-router-dom'
import {
  AlertOctagon,
  ChevronLeft,
  Clock,
  Mail,
  Target,
  Briefcase,
  ListChecks,
} from 'lucide-react'
import { useWorkspace } from '@/hooks/useWorkspace'
import { useMemberDetail } from '@/hooks/useMemberDetail'
import { Avatar } from '@/components/ui/Avatar'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn, formatBRL, formatDateShort, relativeDays } from '@/lib/utils'
import type { SkillProficiency } from '@/types/database'

const ROLE_LABEL: Record<string, string> = {
  owner: 'Owner',
  manager: 'Manager',
  member: 'Membro',
  viewer: 'Viewer',
}

const PROFICIENCY_CLS: Record<SkillProficiency, string> = {
  aprendiz: 'bg-panel2 border border-border text-muted',
  pleno: 'bg-warn/20 text-warn border border-warn/30',
  senior: 'bg-brand/20 text-brand border border-brand/30',
  especialista: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
}

const PROFICIENCY_LABEL: Record<SkillProficiency, string> = {
  aprendiz: 'Aprendiz',
  pleno: 'Pleno',
  senior: 'Sênior',
  especialista: 'Especialista',
}

function utilizationCls(pct: number): string {
  if (pct >= 100) return 'text-danger'
  if (pct >= 85) return 'text-warn'
  if (pct >= 50) return 'text-brand'
  return 'text-muted'
}

export function MemberDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: workspace, isLoading: wsLoading } = useWorkspace()
  const { data, isLoading, isError, error } = useMemberDetail(workspace?.id, id)

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
            Erro ao carregar membro
          </h3>
          <p className="text-sm text-muted">{(error as Error).message}</p>
          <Link
            to="/equipe"
            className="mt-4 inline-flex items-center gap-1 text-brand text-sm hover:underline"
          >
            <ChevronLeft className="w-4 h-4" /> Voltar para Equipe
          </Link>
        </div>
      </Card>
    )
  }

  if (!data || !workspace) {
    return (
      <Card>
        <div className="text-center py-12">
          <h3 className="font-semibold mb-2">Membro não encontrado</h3>
          <Link
            to="/equipe"
            className="mt-2 inline-flex items-center gap-1 text-brand text-sm hover:underline"
          >
            <ChevronLeft className="w-4 h-4" /> Voltar para Equipe
          </Link>
        </div>
      </Card>
    )
  }

  const { member, skills, projects, tasks, timeEntries, kpis } = data

  return (
    <div className="space-y-6">
      <Link
        to="/equipe"
        className="inline-flex items-center gap-1 text-[12px] text-muted hover:text-brand"
      >
        <ChevronLeft className="w-3.5 h-3.5" /> Equipe
      </Link>

      <Card className="flex items-start gap-4 flex-wrap">
        <Avatar name={member.fullName} src={member.avatarUrl} size="lg" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight">
              {member.fullName}
            </h1>
            <span className="text-[10px] uppercase tracking-wider bg-panel2 border border-border px-1.5 py-0.5 rounded font-bold">
              {ROLE_LABEL[member.role] ?? member.role}
            </span>
            {member.isInFocus && (
              <span className="text-[10px] px-1.5 py-0.5 rounded chip-status-doing flex items-center gap-1">
                <Target className="w-3 h-3" />
                Em modo foco
              </span>
            )}
            {!member.isActive && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-panel2 text-muted border border-border">
                inativo
              </span>
            )}
          </div>
          {member.jobTitle && (
            <div className="text-sm text-muted mt-1">{member.jobTitle}</div>
          )}
          {member.email && (
            <a
              href={`mailto:${member.email}`}
              className="flex items-center gap-1 text-xs text-muted hover:text-brand mt-1 truncate"
            >
              <Mail className="w-3 h-3" />
              {member.email}
            </a>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2 text-center min-w-[260px]">
          <div className="bg-panel2 rounded-lg p-3">
            <div className="text-[10px] text-muted uppercase tracking-wider">
              Capacidade
            </div>
            <div className="text-xl font-bold mt-0.5">
              {member.capacityHoursWeek}h
            </div>
            <div className="text-[10px] text-muted">por semana</div>
          </div>
          <div className="bg-panel2 rounded-lg p-3">
            <div className="text-[10px] text-muted uppercase tracking-wider">
              Hora
            </div>
            <div className="text-xl font-bold mt-0.5">
              {member.hourlyRate != null ? formatBRL(member.hourlyRate) : '—'}
            </div>
            <div className="text-[10px] text-muted">faturável</div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi
          icon={ListChecks}
          label="Tasks abertas"
          value={kpis.openTasks.toString()}
          hint={
            kpis.blockedTasks > 0
              ? `${kpis.blockedTasks} bloqueada${kpis.blockedTasks > 1 ? 's' : ''}`
              : 'sem bloqueios'
          }
          accent={kpis.blockedTasks > 0 ? 'text-danger' : undefined}
        />
        <Kpi
          icon={ListChecks}
          label="Concluídas (30d)"
          value={kpis.doneTasksLast30.toString()}
          hint="throughput recente"
        />
        <Kpi
          icon={Clock}
          label="Horas (30d)"
          value={`${kpis.hoursLast30.toFixed(0)}h`}
          hint={`${kpis.billableHoursLast30.toFixed(0)}h faturáveis`}
        />
        <Kpi
          icon={Target}
          label="Utilização (30d)"
          value={`${kpis.utilizationPctLast30.toFixed(0)}%`}
          accent={utilizationCls(kpis.utilizationPctLast30)}
          hint={
            kpis.utilizationPctLast30 >= 100
              ? 'over-allocation'
              : kpis.utilizationPctLast30 >= 85
                ? 'apertado'
                : 'saudável'
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-[15px]">
                Tasks abertas{' '}
                <span className="text-muted font-normal text-xs">
                  ({tasks.filter((t) => !t.completedAt).length})
                </span>
              </h3>
            </div>
            {tasks.filter((t) => !t.completedAt).length === 0 ? (
              <div className="text-center py-6 text-muted text-sm border border-dashed border-border rounded-xl">
                Sem tasks abertas atribuídas.
              </div>
            ) : (
              <div className="space-y-1.5">
                {tasks
                  .filter((t) => !t.completedAt)
                  .slice(0, 20)
                  .map((t) => (
                    <Link
                      key={t.id}
                      to={`/projetos/${t.projectId}`}
                      className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-panel2 transition group"
                    >
                      <span className="font-mono text-[10px] text-muted shrink-0 w-12 truncate">
                        {t.projectCode}-{t.sequenceNumber}
                      </span>
                      <span className="flex-1 text-xs truncate group-hover:text-brand">
                        {t.title}
                      </span>
                      {t.priority && (
                        <span
                          className={cn(
                            'text-[9px] px-1.5 py-0.5 rounded',
                            t.priority === 'P1'
                              ? 'chip-priority-high'
                              : t.priority === 'P2'
                                ? 'chip-priority-mid'
                                : 'chip-priority-low'
                          )}
                        >
                          {t.priority}
                        </span>
                      )}
                      {t.isBlocked && (
                        <span className="chip chip-status-block flex items-center gap-1 text-[9px]">
                          <AlertOctagon className="w-3 h-3" /> bloq
                        </span>
                      )}
                      {t.dueDate && (
                        <span className="text-[10px] text-muted">
                          {formatDateShort(t.dueDate)}
                        </span>
                      )}
                    </Link>
                  ))}
              </div>
            )}
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-[15px]">
                Últimos registros de horas{' '}
                <span className="text-muted font-normal text-xs">
                  ({timeEntries.length})
                </span>
              </h3>
            </div>
            {timeEntries.length === 0 ? (
              <div className="text-center py-6 text-muted text-sm border border-dashed border-border rounded-xl">
                Sem registros de horas ainda.
              </div>
            ) : (
              <div className="overflow-hidden border border-border rounded-xl">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[11px] text-muted bg-panel2/50">
                      <th className="text-left font-medium py-2 px-3">Data</th>
                      <th className="text-left font-medium py-2 px-3">
                        Projeto
                      </th>
                      <th className="text-left font-medium py-2 px-3">
                        Descrição
                      </th>
                      <th className="text-right font-medium py-2 px-3">
                        Horas
                      </th>
                      <th className="text-right font-medium py-2 px-3">R$</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {timeEntries.slice(0, 30).map((e) => (
                      <tr key={e.id} className="hover:bg-panel2/30">
                        <td className="py-2 px-3 text-[12px] text-muted whitespace-nowrap">
                          {formatDateShort(e.entryDate)}
                        </td>
                        <td className="py-2 px-3 text-[12px] truncate max-w-[140px]">
                          <Link
                            to={`/projetos/${e.projectId}`}
                            className="hover:text-brand"
                          >
                            <span className="font-mono text-[10px] text-muted">
                              {e.projectCode}
                            </span>{' '}
                            {e.projectName}
                          </Link>
                        </td>
                        <td className="py-2 px-3 text-[12px] truncate max-w-[260px] text-muted">
                          {e.description ?? '—'}
                        </td>
                        <td className="py-2 px-3 text-[12px] text-right font-mono">
                          {e.hours.toFixed(1)}
                        </td>
                        <td className="py-2 px-3 text-[12px] text-right">
                          {e.isBillable && e.hourlyRate
                            ? formatBRL(e.hours * e.hourlyRate, {
                                compact: true,
                              })
                            : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        <aside className="lg:col-span-4 space-y-6">
          <Card>
            <h3 className="font-semibold text-[15px] mb-3">
              Skills{' '}
              <span className="text-muted font-normal text-xs">
                ({skills.length})
              </span>
            </h3>
            {skills.length === 0 ? (
              <div className="text-[11px] text-muted italic">
                Sem skills cadastradas.
              </div>
            ) : (
              <div className="space-y-1.5">
                {skills.map((s) => (
                  <div key={s.id} className="flex items-center gap-2 text-xs">
                    <span
                      className={cn(
                        'px-1.5 py-0.5 rounded text-[10px]',
                        PROFICIENCY_CLS[s.proficiency]
                      )}
                      title={s.isCertified ? 'Certificado' : 'Auto-declarado'}
                    >
                      {PROFICIENCY_LABEL[s.proficiency]}
                    </span>
                    <span className="flex-1 truncate">{s.name}</span>
                    {s.category && (
                      <span className="text-[10px] text-muted truncate">
                        {s.category}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <h3 className="font-semibold text-[15px] mb-3 flex items-center gap-1.5">
              <Briefcase className="w-4 h-4" />
              Projetos ativos{' '}
              <span className="text-muted font-normal text-xs">
                ({projects.length})
              </span>
            </h3>
            {projects.length === 0 ? (
              <div className="text-[11px] text-muted italic">
                Sem projetos ativos.
              </div>
            ) : (
              <div className="space-y-2">
                {projects.map((p) => (
                  <Link
                    key={p.id}
                    to={`/projetos/${p.id}`}
                    className="block px-2 py-1.5 rounded hover:bg-panel2 transition group"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-muted shrink-0">
                        {p.code}
                      </span>
                      <span className="flex-1 text-xs font-medium truncate group-hover:text-brand">
                        {p.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-muted mt-0.5">
                      <span>{p.role ?? 'sem papel'}</span>
                      {p.allocationPercent != null && (
                        <>
                          <span>·</span>
                          <span>{p.allocationPercent}% alocado</span>
                        </>
                      )}
                      <span>·</span>
                      <span>{Math.round(p.hoursLogged)}h logadas</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Card>

          {member.isInFocus && member.focusUntil && (
            <Card className="bg-info/5 border-info/30">
              <div className="text-[11px] text-info uppercase tracking-wider font-semibold mb-1">
                Em modo foco
              </div>
              <div className="text-sm">
                Até {relativeDays(member.focusUntil)}.
              </div>
            </Card>
          )}
        </aside>
      </div>
    </div>
  )
}

function Kpi({
  icon: Icon,
  label,
  value,
  hint,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  hint?: string
  accent?: string
}) {
  return (
    <Card className="space-y-1">
      <div className="flex items-center gap-2 text-[10px] text-muted uppercase tracking-wider">
        <Icon className="w-3 h-3" />
        {label}
      </div>
      <div className={cn('text-2xl font-bold', accent)}>{value}</div>
      {hint && <div className="text-[11px] text-muted">{hint}</div>}
    </Card>
  )
}
