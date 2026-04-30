import { Building2, Briefcase, Inbox } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { formatBRL } from '@/lib/utils'
import type { ClientsKpis } from '@/hooks/useClients'

interface ClientsKpiBarProps {
  kpis: ClientsKpis
}

export function ClientsKpiBar({ kpis }: ClientsKpiBarProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
      <Card className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-brand/15 text-brand flex items-center justify-center">
          <Building2 className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] text-muted uppercase tracking-wider">
            Clientes
          </div>
          <div className="text-xl font-bold leading-none">
            {kpis.activeClients}
            <span className="text-muted text-xs font-medium">
              /{kpis.totalClients}
            </span>
          </div>
          <div className="text-[11px] text-muted mt-0.5">ativos</div>
        </div>
      </Card>

      <Card className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-info/15 text-info flex items-center justify-center">
          <Briefcase className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] text-muted uppercase tracking-wider">
            Projetos ativos
          </div>
          <div className="text-xl font-bold leading-none">
            {kpis.totalActiveProjects}
          </div>
          <div className="text-[11px] text-muted mt-0.5">em execução</div>
        </div>
      </Card>

      <Card className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-warn/15 text-warn flex items-center justify-center font-bold">
          R$
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] text-muted uppercase tracking-wider">
            Receita contratada
          </div>
          <div className="text-xl font-bold leading-none">
            {formatBRL(kpis.totalBudget, { compact: true })}
          </div>
          <div className="text-[11px] text-muted mt-0.5">soma de budgets</div>
        </div>
      </Card>

      <Card className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-purple-500/15 text-purple-300 flex items-center justify-center">
          <Inbox className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] text-muted uppercase tracking-wider">
            OS abertas
          </div>
          <div className="text-xl font-bold leading-none">
            {kpis.totalOpenOS}
          </div>
          <div className="text-[11px] text-muted mt-0.5">
            {kpis.totalOpenOS > 0 ? 'aguardando triagem/refino' : 'inbox limpo'}
          </div>
        </div>
      </Card>
    </div>
  )
}
