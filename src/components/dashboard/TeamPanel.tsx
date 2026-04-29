import { Card } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { cn } from '@/lib/utils'
import type { MemberWorkloadView } from '@/types/database'

interface TeamPanelProps {
  members: MemberWorkloadView[]
}

function loadColor(percent: number): string {
  if (percent >= 90) return 'bg-danger'
  if (percent >= 75) return 'bg-warn'
  if (percent >= 40) return 'bg-brand'
  return 'bg-ok'
}

function loadLabel(percent: number, blocked: number): { text: string; chip: string } {
  if (blocked > 0) return { text: '⚠ Bloqueado', chip: 'chip-status-block' }
  if (percent >= 90) return { text: 'Sobrecarga', chip: 'chip-priority-high' }
  if (percent >= 75) return { text: 'Atenção', chip: 'chip-priority-mid' }
  if (percent < 30) return { text: 'Capacidade livre', chip: 'chip-status-todo' }
  return { text: '⚡ No flow', chip: 'chip-status-done' }
}

export function TeamPanel({ members }: TeamPanelProps) {
  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-[15px]">Painel da equipe</h3>
          <p className="text-xs text-muted">Carga atual · ordenado por ocupação</p>
        </div>
      </div>

      <div className="overflow-x-auto -mx-1">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[11px] text-muted border-b">
              <th className="text-left font-medium pb-2 pl-1">Pessoa</th>
              <th className="text-left font-medium pb-2">Carga</th>
              <th className="text-left font-medium pb-2">Tasks</th>
              <th className="text-left font-medium pb-2 pr-1">Sinais</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => {
              const cap = m.capacity_hours_week || 40
              const used = Math.max(0, Number(m.open_estimated_hours) || 0)
              const percent = Math.min(100, Math.round((used / cap) * 100))
              const { text, chip } = loadLabel(percent, m.blocked_tasks_count)
              return (
                <tr key={m.member_id} className="hover:bg-panel2/40 border-b last:border-0">
                  <td className="py-3 pl-1">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={m.full_name} size="md" />
                      <div className="font-semibold text-[13px]">{m.full_name}</div>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 bg-panel2 rounded-full overflow-hidden">
                        <div
                          className={cn('h-full rounded-full transition-all', loadColor(percent))}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-semibold tabular-nums">
                        {percent}%
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className="text-[12px]">
                      {m.open_tasks_count} ativa{m.open_tasks_count !== 1 ? 's' : ''}
                    </span>
                  </td>
                  <td className="pr-1">
                    <span className={`chip ${chip}`}>{text}</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
