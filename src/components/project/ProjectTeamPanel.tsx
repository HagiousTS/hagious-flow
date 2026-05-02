import { Card } from '@/components/ui/Card'
import { getInitials } from '@/lib/utils'
import type { ProjectTeamLoad } from '@/hooks/useProjectDetail'

interface ProjectTeamPanelProps {
  team: ProjectTeamLoad[]
  totalHours: number
}

export function ProjectTeamPanel({ team, totalHours }: ProjectTeamPanelProps) {
  const maxHours = Math.max(1, ...team.map((t) => t.hoursLogged))

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-[14px]">Time alocado</h3>
        <span className="text-[11px] text-muted">
          {team.length} {team.length === 1 ? 'pessoa' : 'pessoas'} ·{' '}
          {Math.round(totalHours)}h logadas
        </span>
      </div>
      {team.length === 0 ? (
        <div className="text-center py-8 text-muted text-sm border border-dashed border-border rounded-xl">
          Nenhum time alocado a este projeto.
        </div>
      ) : (
        <div className="space-y-2.5">
          {team.map((m) => {
            const widthPct = (m.hoursLogged / maxHours) * 100
            return (
              <div key={m.memberId} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-panel2 border border-border text-text flex items-center justify-center text-[10px] font-bold">
                  {getInitials(m.fullName)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[12px] font-semibold truncate">
                      {m.fullName}
                    </span>
                    <span className="text-[10px] text-muted shrink-0">
                      {m.hoursLogged.toFixed(0)}h{m.role ? ` · ${m.role}` : ''}
                    </span>
                  </div>
                  <div className="progress-bar mt-1">
                    <div
                      className="progress-fill"
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}
