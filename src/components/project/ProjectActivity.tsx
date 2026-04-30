import { Sparkles } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { getInitials } from '@/lib/utils'
import type { ActivityLogEntry } from '@/types/database'

interface ProjectActivityProps {
  activity: ActivityLogEntry[]
}

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  if (diffMs < 0) return 'agora'
  const min = Math.floor(diffMs / 60_000)
  if (min < 1) return 'agora'
  if (min < 60) return `há ${min}min`
  const h = Math.floor(min / 60)
  if (h < 24) return `há ${h}h`
  const d = Math.floor(h / 24)
  return d === 1 ? 'há 1 dia' : `há ${d} dias`
}

const ACTION_LABEL: Record<string, string> = {
  created: 'criou',
  updated: 'atualizou',
  deleted: 'removeu',
  status_changed: 'mudou status de',
  commented: 'comentou em',
  blocked: 'bloqueou',
  unblocked: 'desbloqueou',
  approved: 'aprovou',
  detected: 'detectou',
}

export function ProjectActivity({ activity }: ProjectActivityProps) {
  return (
    <Card className="p-5">
      <h3 className="font-semibold text-[14px] mb-3">Atividade recente</h3>
      {activity.length === 0 ? (
        <div className="text-center py-6 text-muted text-sm border border-dashed border-border rounded-xl">
          Nenhuma atividade registrada.
        </div>
      ) : (
        <div className="space-y-3">
          {activity.map((a) => {
            const isAi = a.actor_type === 'ai' || a.actor_type === 'system'
            const actorName = a.actor?.full_name ?? (isAi ? 'IA COO' : 'Sistema')
            const action = ACTION_LABEL[a.action] ?? a.action
            return (
              <div key={a.id} className="flex gap-3">
                {isAi ? (
                  <div className="w-7 h-7 rounded-xl grad-brand flex items-center justify-center shrink-0">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-full bg-panel2 border border-border text-text flex items-center justify-center text-[10px] font-bold shrink-0">
                    {getInitials(actorName)}
                  </div>
                )}
                <div className="flex-1 min-w-0 text-[12px]">
                  <span className={isAi ? 'grad-text font-semibold' : 'font-semibold'}>
                    {actorName}
                  </span>{' '}
                  <span className="text-muted">{action}</span>{' '}
                  <span className="text-brand">{a.entity_type}</span>
                  <div className="text-[10px] text-muted">{relativeTime(a.created_at)}</div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}
