import { Target } from 'lucide-react'
import { useWorkspace } from '@/hooks/useWorkspace'
import { useFocus } from '@/hooks/useFocus'
import { FocusHero } from '@/components/focus/FocusHero'
import { FocusTimer } from '@/components/focus/FocusTimer'
import { AckQueueList } from '@/components/focus/AckQueueList'
import { FocusMetrics } from '@/components/focus/FocusMetrics'
import { FocusProtections } from '@/components/focus/FocusProtections'
import { FocusEmpty } from '@/components/focus/FocusEmpty'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'

export function FocusPage() {
  const { data: workspace, isLoading: wsLoading } = useWorkspace()
  const { data, isLoading, isError, error } = useFocus(workspace?.id)

  if (wsLoading || isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-16 rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Skeleton className="lg:col-span-8 h-[420px] rounded-xl" />
          <Skeleton className="lg:col-span-4 h-[420px] rounded-xl" />
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <Card className="border-danger/30">
        <div className="text-center py-8">
          <h3 className="font-semibold text-danger mb-2">Erro ao carregar Modo Foco</h3>
          <p className="text-sm text-muted">{(error as Error).message}</p>
        </div>
      </Card>
    )
  }

  if (!workspace) {
    return (
      <Card>
        <div className="text-center py-12">
          <h3 className="font-semibold mb-2">Sem workspace ativo</h3>
        </div>
      </Card>
    )
  }

  const session = data?.session ?? null
  const memberName = session?.member?.profile?.full_name ?? null

  return (
    <div className="space-y-6">
      <Card className="p-4 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl grad-brand flex items-center justify-center">
            <Target className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-[15px] font-bold tracking-tight flex items-center gap-2">
              Modo Foco
              {session ? (
                <span className="chip tag-focus">● Ativo</span>
              ) : (
                <span className="chip tag-status-todo">Inativo</span>
              )}
            </div>
            <div className="text-[11px] text-muted">
              {session && memberName
                ? `${memberName} em sessão · notificações silenciadas`
                : 'Nenhuma sessão ativa no workspace'}
            </div>
          </div>
        </div>

        <div className="flex-1" />

        {session && (
          <FocusTimer
            startedAt={session.started_at}
            plannedMinutes={session.planned_minutes}
          />
        )}
      </Card>

      {!session ? (
        <FocusEmpty />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <FocusHero session={session} />
            <AckQueueList items={data?.queue ?? []} />
          </div>
          <aside className="lg:col-span-4 space-y-6">
            <FocusMetrics
              metrics={
                data?.metrics ?? {
                  sessionsThisWeek: 0,
                  minutesThisWeek: 0,
                  interruptionsBlocked: 0,
                  interruptionsEscalated: 0,
                }
              }
            />
            <FocusProtections />
          </aside>
        </div>
      )}
    </div>
  )
}
