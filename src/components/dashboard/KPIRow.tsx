import { Card } from '@/components/ui/Card'
import { formatBRL } from '@/lib/utils'
import type { ProjectHealthView, MemberWorkloadView } from '@/types/database'

interface KPIRowProps {
  projects: ProjectHealthView[]
  members: MemberWorkloadView[]
}

export function KPIRow({ projects, members }: KPIRowProps) {
  // Cálculos a partir de dados reais
  const activeProjects = projects.filter((p) => p.status === 'active').length
  const totalProjects = projects.length

  const totalTasks = projects.reduce((sum, p) => sum + (p.total_tasks ?? 0), 0)
  const doneTasks = projects.reduce((sum, p) => sum + (p.done_tasks ?? 0), 0)
  const blockedTasks = projects.reduce((sum, p) => sum + (p.blocked_tasks ?? 0), 0)
  const donePercent = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0

  // MRR mock baseado em budgets ativos (cenário fictício)
  const totalBudget = projects
    .filter((p) => p.status === 'active')
    .reduce((sum, p) => sum + (Number(p.budget_amount) || 0), 0)

  // Saúde da operação: 100 - 10 por bloqueio - 5 por capacidade > 90%
  const overloaded = members.filter(
    (m) => Number(m.open_estimated_hours) / (m.capacity_hours_week || 40) > 0.9
  ).length
  const health = Math.max(0, 100 - blockedTasks * 10 - overloaded * 5)

  const healthLabel =
    health >= 85 ? 'Saudável' : health >= 60 ? 'Atenção' : 'Crítico'

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <KPICard
        label="Receita projetada"
        value={formatBRL(totalBudget, { compact: true })}
        sub={`${totalProjects} projetos no portfólio`}
        accent="ok"
      />
      <KPICard
        label="Projetos ativos"
        value={String(activeProjects)}
        sub={`${totalProjects - activeProjects} em planejamento`}
        accent="brand"
      />
      <KPICard
        label="Tasks da semana"
        value={String(totalTasks)}
        sub={
          <>
            {doneTasks} done · {blockedTasks > 0 && (
              <span className="text-danger font-semibold">{blockedTasks} bloqueadas</span>
            )}
            {blockedTasks === 0 && <span className="text-ok">no fluxo</span>}
          </>
        }
        progress={donePercent}
      />
      <KPICard
        label="Saúde da operação"
        value={`${health}/100`}
        sub={`${healthLabel} · ${overloaded} pessoa(s) sobrecarregada(s)`}
        accent={health >= 85 ? 'ok' : health >= 60 ? 'warn' : 'danger'}
      />
    </section>
  )
}

interface KPICardProps {
  label: string
  value: string
  sub: React.ReactNode
  accent?: 'ok' | 'warn' | 'danger' | 'brand'
  progress?: number
}

function KPICard({ label, value, sub, progress }: KPICardProps) {
  return (
    <Card>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted">{label}</span>
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-[11px] text-muted mt-1">{sub}</div>
      {progress != null && (
        <div className="progress-bar mt-3">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      )}
    </Card>
  )
}
