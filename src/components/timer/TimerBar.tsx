import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, Pause, Play, Square } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useWorkspace } from '@/hooks/useWorkspace'
import { useCurrentMember } from '@/hooks/useCurrentMember'
import {
  useClearTimer,
  useElapsed,
  useStopTimer,
  useTimer,
} from '@/hooks/useTimer'
import { cn } from '@/lib/utils'

function fmtElapsed(totalSec: number): string {
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  const pad = (n: number) => n.toString().padStart(2, '0')
  if (h > 0) return `${h}:${pad(m)}:${pad(s)}`
  return `${pad(m)}:${pad(s)}`
}

export function TimerBar() {
  const navigate = useNavigate()
  const timer = useTimer()
  const elapsed = useElapsed(timer)
  const { user } = useAuth()
  const { data: workspace } = useWorkspace()
  const { data: member } = useCurrentMember(workspace?.id)
  const stop = useStopTimer()
  const clear = useClearTimer()
  const [error, setError] = useState<string | null>(null)

  if (!timer || !user) return null

  async function handleStop() {
    setError(null)
    if (!workspace || !member) {
      setError('Workspace/membro não disponível.')
      return
    }
    try {
      await stop.mutateAsync({
        workspaceId: workspace.id,
        memberId: member.id,
      })
    } catch (err) {
      const msg = (err as Error).message
      if (msg === 'too_short') {
        setError('Sessão muito curta (<1 min). Descartada.')
        setTimeout(() => setError(null), 3000)
      } else {
        setError(msg)
      }
    }
  }

  function handleDiscard() {
    if (!confirm('Descartar timer sem registrar horas?')) return
    clear()
  }

  function goToTask() {
    navigate(`/projetos/${timer!.projectId}`)
  }

  return (
    <div className="fixed bottom-6 left-6 z-40 max-w-[400px]">
      <div className="bg-panel border-2 border-brand/40 rounded-xl shadow-xl p-3 flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-lg grad-brand flex items-center justify-center shrink-0 cursor-pointer"
          onClick={goToTask}
          title="Abrir projeto"
        >
          <Play className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 text-[10px] text-muted uppercase tracking-wider">
            <Pause className="w-3 h-3 inline" />
            Timer ativo · {timer.projectCode}
          </div>
          <div className="text-sm font-semibold truncate">
            {timer.taskTitle}
          </div>
          <div className="text-xs font-mono text-brand">
            {fmtElapsed(elapsed)}
          </div>
          {error && (
            <div className="text-[10px] text-danger mt-1">{error}</div>
          )}
        </div>
        <div className="flex flex-col gap-1 shrink-0">
          <button
            type="button"
            onClick={handleStop}
            disabled={stop.isPending}
            className={cn(
              'w-8 h-8 rounded-lg bg-danger/15 text-danger border border-danger/30 hover:bg-danger/25 flex items-center justify-center transition disabled:opacity-50'
            )}
            title="Parar e registrar horas"
          >
            {stop.isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Square className="w-3.5 h-3.5 fill-current" />
            )}
          </button>
          <button
            type="button"
            onClick={handleDiscard}
            disabled={stop.isPending}
            className="text-[9px] text-muted hover:text-danger transition disabled:opacity-50"
            title="Descartar"
          >
            descartar
          </button>
        </div>
      </div>
    </div>
  )
}
