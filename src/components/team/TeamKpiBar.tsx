import { Users, Clock, Target, Award } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { formatBRL } from '@/lib/utils'
import type { TeamKpis } from '@/hooks/useTeam'

interface TeamKpiBarProps {
  kpis: TeamKpis
}

export function TeamKpiBar({ kpis }: TeamKpiBarProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
      <Card className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-brand/15 text-brand flex items-center justify-center">
          <Users className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] text-muted uppercase tracking-wider">
            Time
          </div>
          <div className="text-xl font-bold leading-none">
            {kpis.activeMembers}
            <span className="text-muted text-xs font-medium">
              /{kpis.totalMembers}
            </span>
          </div>
          <div className="text-[11px] text-muted mt-0.5">
            {kpis.inFocus} em modo foco
          </div>
        </div>
      </Card>

      <Card className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-info/15 text-info flex items-center justify-center">
          <Clock className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] text-muted uppercase tracking-wider">
            Capacidade
          </div>
          <div className="text-xl font-bold leading-none">
            {kpis.totalCapacityHours}h
          </div>
          <div className="text-[11px] text-muted mt-0.5">por semana</div>
        </div>
      </Card>

      <Card className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-warn/15 text-warn flex items-center justify-center font-bold">
          R$
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] text-muted uppercase tracking-wider">
            Custo / semana
          </div>
          <div className="text-xl font-bold leading-none">
            {formatBRL(kpis.totalCostPerWeek, { compact: true })}
          </div>
          <div className="text-[11px] text-muted mt-0.5">
            média {formatBRL(kpis.averageHourlyRate)}/h
          </div>
        </div>
      </Card>

      <Card className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-purple-500/15 text-purple-300 flex items-center justify-center">
          {kpis.blockedTotal > 0 ? (
            <Target className="w-5 h-5" />
          ) : (
            <Award className="w-5 h-5" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] text-muted uppercase tracking-wider">
            {kpis.blockedTotal > 0 ? 'Bloqueios ativos' : 'Top skill'}
          </div>
          <div className="text-xl font-bold leading-none truncate">
            {kpis.blockedTotal > 0
              ? `${kpis.blockedTotal} task${kpis.blockedTotal !== 1 ? 's' : ''}`
              : (kpis.topSkill?.name ?? '—')}
          </div>
          <div className="text-[11px] text-muted mt-0.5 truncate">
            {kpis.blockedTotal > 0
              ? 'requer ação'
              : kpis.topSkill
                ? `${kpis.topSkill.count} pessoas`
                : 'sem skills cadastradas'}
          </div>
        </div>
      </Card>
    </div>
  )
}
