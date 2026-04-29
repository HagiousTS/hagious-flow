import { useEffect, useState } from 'react'
import { Clock, Square } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FocusTimerProps {
  startedAt: string
  plannedMinutes: number
}

function pad(n: number): string {
  return n.toString().padStart(2, '0')
}

function formatRemaining(ms: number): { label: string; over: boolean } {
  const over = ms < 0
  const abs = Math.abs(ms)
  const totalSec = Math.floor(abs / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  return { label: `${pad(h)}:${pad(m)}:${pad(s)}`, over }
}

export function FocusTimer({ startedAt, plannedMinutes }: FocusTimerProps) {
  const endsAt = new Date(startedAt).getTime() + plannedMinutes * 60_000
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])

  const remaining = formatRemaining(endsAt - now)

  return (
    <div className="flex items-center gap-3">
      <div className="text-right">
        <div className="text-[10px] text-muted uppercase tracking-wider">
          {remaining.over ? 'Estouro de' : 'Acaba em'}
        </div>
        <div
          className={cn(
            'text-sm font-bold tabular-nums',
            remaining.over ? 'text-danger' : 'grad-text'
          )}
        >
          {remaining.label}
        </div>
      </div>
      <button
        type="button"
        disabled
        className="text-xs bg-panel border border-border px-3 py-1.5 rounded-lg flex items-center gap-1.5 opacity-60 cursor-not-allowed"
        title="Mutação na próxima iteração"
      >
        <Clock className="w-3 h-3" />
        Estender +30min
      </button>
      <button
        type="button"
        disabled
        className="text-xs bg-danger/15 text-danger border border-danger/30 px-3 py-1.5 rounded-lg flex items-center gap-1.5 opacity-60 cursor-not-allowed"
      >
        <Square className="w-3 h-3" />
        Encerrar foco
      </button>
    </div>
  )
}
