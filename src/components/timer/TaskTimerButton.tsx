import { Play, Square } from 'lucide-react'
import { useStartTimer, useTimer } from '@/hooks/useTimer'
import { cn } from '@/lib/utils'

interface TaskTimerButtonProps {
  taskId: string
  taskTitle: string
  taskCode: string | null
  projectId: string
  projectCode: string
  size?: 'sm' | 'md'
}

export function TaskTimerButton({
  taskId,
  taskTitle,
  taskCode,
  projectId,
  projectCode,
  size = 'sm',
}: TaskTimerButtonProps) {
  const active = useTimer()
  const start = useStartTimer()
  const isRunning = active?.taskId === taskId
  const isOtherRunning = !!active && !isRunning

  const dim = size === 'md' ? 'w-7 h-7' : 'w-6 h-6'
  const icon = size === 'md' ? 'w-3.5 h-3.5' : 'w-3 h-3'

  function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (isRunning) return
    if (isOtherRunning) {
      const ok = confirm(
        `Trocar timer de "${active.taskTitle}" para "${taskTitle}"? A sessão atual será descartada.`
      )
      if (!ok) return
    }
    start({
      taskId,
      taskTitle,
      taskCode,
      projectId,
      projectCode,
      startedAt: Date.now(),
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      title={isRunning ? 'Timer rodando para esta task' : 'Iniciar timer'}
      className={cn(
        dim,
        'rounded-md border flex items-center justify-center transition shrink-0',
        isRunning
          ? 'bg-brand/15 border-brand/40 text-brand'
          : 'bg-panel border-border text-muted hover:text-brand hover:border-brand/40'
      )}
    >
      {isRunning ? (
        <Square className={cn(icon, 'fill-current')} />
      ) : (
        <Play className={icon} />
      )}
    </button>
  )
}
