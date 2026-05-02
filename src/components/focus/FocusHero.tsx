import { Check, Pause, MessageSquare } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'
import type { FocusSession } from '@/types/database'

interface FocusHeroProps {
  session: FocusSession
}

const PRIORITY_CHIP: Record<string, { label: string; cls: string }> = {
  P1: { label: 'P1 · Crítica', cls: 'tag-priority-high' },
  P2: { label: 'P2', cls: 'tag-priority-mid' },
  P3: { label: 'P3', cls: 'tag-priority-low' },
}

export function FocusHero({ session }: FocusHeroProps) {
  const task = session.task
  const project = task?.project as
    | { id: string; code: string; name: string }
    | undefined
  const elapsedMin = Math.max(
    0,
    Math.round((Date.now() - new Date(session.started_at).getTime()) / 60_000)
  )
  const planned = session.planned_minutes
  const progress = Math.min(100, (elapsedMin / planned) * 100)
  const priority = task?.priority ? PRIORITY_CHIP[task.priority] : null

  return (
    <Card
      className="p-7 relative overflow-hidden"
      style={{
        boxShadow:
          '0 0 0 1px rgba(124,92,255,.25), 0 0 60px rgba(124,92,255,.12), 0 8px 32px rgba(0,0,0,.25)',
      }}
    >
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className="text-[10px] uppercase tracking-wider font-bold grad-text">
          Task em foco
        </span>
        {priority && (
          <span className={cn('chip', priority.cls)}>{priority.label}</span>
        )}
        {project && (
          <>
            <span className="text-[11px] text-muted">·</span>
            <Link
              to={`/projetos/${project.id}`}
              className="text-[11px] text-brand hover:underline"
            >
              {project.name}
            </Link>
          </>
        )}
      </div>

      <div className="flex items-start gap-4">
        <div className="shrink-0 w-12 h-12 rounded-xl grad-brand flex items-center justify-center text-base font-bold text-white">
          {project?.code ?? '··'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[11px] text-muted font-mono mb-1">
            {project?.code && task?.sequence_number
              ? `${project.code}-${task.sequence_number}`
              : '—'}
          </div>
          <h1 className="text-2xl font-bold leading-tight">
            {task?.title ?? 'Sem task associada à sessão'}
          </h1>
          {task?.description_md && (
            <p className="text-sm text-muted mt-2 line-clamp-3">
              {task.description_md}
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
        <Stat
          label="Sessão atual"
          value={
            <>
              {elapsedMin}
              <span className="text-base font-normal">min</span>
            </>
          }
          sub={`de ${planned}min planejados`}
          progress={progress}
        />
        <Stat
          label="Apontado hoje"
          value={
            task?.actual_hours != null ? (
              <>
                {Math.floor(Number(task.actual_hours))}
                <span className="text-base font-normal">h</span>
                {Math.round((Number(task.actual_hours) % 1) * 60)}
                <span className="text-base font-normal">min</span>
              </>
            ) : (
              '—'
            )
          }
          sub={
            task?.estimated_hours != null
              ? `Estimado: ${task.estimated_hours}h`
              : 'Sem estimativa'
          }
        />
        <Stat
          label="Interrupções bloqueadas"
          value={
            <span className="text-ok">{session.interruptions_blocked}</span>
          }
          sub={`${session.interruptions_escalated} escaladas`}
        />
      </div>

      <div className="flex flex-wrap gap-2 mt-5">
        <button
          type="button"
          disabled
          className="grad-brand text-white text-sm font-semibold px-4 py-2 rounded-lg opacity-60 cursor-not-allowed flex items-center gap-2"
        >
          <Check className="w-3.5 h-3.5" />
          Apontar {elapsedMin}min e marcar progresso
        </button>
        <button
          type="button"
          disabled
          className="text-sm bg-panel2 border border-border px-4 py-2 rounded-lg opacity-60 cursor-not-allowed flex items-center gap-2"
        >
          <Pause className="w-3.5 h-3.5" />
          Pausar sessão
        </button>
        <button
          type="button"
          disabled
          className="text-sm bg-panel2 border border-border px-4 py-2 rounded-lg opacity-60 cursor-not-allowed flex items-center gap-2 text-muted"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Adicionar nota
        </button>
      </div>
    </Card>
  )
}

interface StatProps {
  label: string
  value: React.ReactNode
  sub: string
  progress?: number
}

function Stat({ label, value, sub, progress }: StatProps) {
  return (
    <div className="bg-panel2/60 border border-border rounded-xl p-3 text-center">
      <div className="text-[10px] text-muted uppercase tracking-wider">
        {label}
      </div>
      <div className="text-2xl font-bold mt-1 grad-text">{value}</div>
      <div className="text-[10px] text-muted">{sub}</div>
      {progress != null && (
        <div className="progress-bar mt-2">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  )
}
