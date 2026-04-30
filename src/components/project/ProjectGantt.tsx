import { useMemo } from 'react'
import { Card } from '@/components/ui/Card'
import type { ProjectPhase, Project } from '@/types/database'

interface ProjectGanttProps {
  phases: ProjectPhase[]
  project: Project
}

function dateToDay(date: string | null): number | null {
  if (!date) return null
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return null
  return Math.floor(d.getTime() / 86400000)
}

function formatWeek(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(date)
}

const PHASE_COLOR: Record<string, string> = {
  done: 'var(--ok)',
  in_progress: 'var(--brand)',
  pending: 'var(--muted)',
  delayed: 'var(--warn)',
  blocked: 'var(--danger)',
}

export function ProjectGantt({ phases, project }: ProjectGanttProps) {
  const range = useMemo(() => {
    const candidates: number[] = []
    for (const p of phases) {
      const s = dateToDay(p.start_date)
      const d = dateToDay(p.due_date)
      if (s != null) candidates.push(s)
      if (d != null) candidates.push(d)
    }
    const ps = dateToDay(project.start_date)
    const pd = dateToDay(project.due_date)
    if (ps != null) candidates.push(ps)
    if (pd != null) candidates.push(pd)
    if (candidates.length === 0) return null
    const min = Math.min(...candidates)
    const max = Math.max(...candidates) + 1
    return { min, max, span: Math.max(1, max - min) }
  }, [phases, project])

  const today = Math.floor(Date.now() / 86400000)
  const todayPct =
    range && today >= range.min && today <= range.max
      ? ((today - range.min) / range.span) * 100
      : null

  const weekTicks = useMemo(() => {
    if (!range) return []
    const ticks: { dayOffset: number; label: string }[] = []
    const startMs = range.min * 86400000
    const totalDays = range.span
    const tickCount = Math.min(8, Math.max(2, Math.ceil(totalDays / 7)))
    for (let i = 0; i <= tickCount; i += 1) {
      const dayOffset = Math.round((totalDays * i) / tickCount)
      const date = new Date(startMs + dayOffset * 86400000)
      ticks.push({ dayOffset, label: formatWeek(date) })
    }
    return ticks
  }, [range])

  if (!range || phases.length === 0) {
    return (
      <Card className="p-5">
        <h3 className="font-semibold text-[15px] mb-2">Timeline · Fases</h3>
        <div className="text-center py-10 text-muted text-sm border border-dashed border-border rounded-xl">
          Nenhuma fase cadastrada para este projeto.
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h3 className="font-semibold text-[15px]">Timeline · Fases do projeto</h3>
          <p className="text-xs text-muted">
            {phases.length} {phases.length === 1 ? 'fase' : 'fases'} · linha vermelha = hoje
          </p>
        </div>
      </div>

      <div className="overflow-x-auto scrollbar">
        <div className="min-w-[700px]">
          <div className="flex border-b border-border pb-2 text-[10px] text-muted">
            <div className="w-[200px] shrink-0">Fase</div>
            <div className="flex-1 relative h-4">
              {weekTicks.map((t, i) => (
                <div
                  key={i}
                  className="absolute top-0 -translate-x-1/2 text-center"
                  style={{ left: `${(t.dayOffset / range.span) * 100}%` }}
                >
                  {t.label}
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            {todayPct != null && (
              <div
                className="absolute top-0 bottom-0 border-l-2 border-danger z-10 pointer-events-none"
                style={{ left: `calc(200px + (100% - 200px) * ${todayPct / 100})` }}
              >
                <div className="absolute -top-1 -left-1 w-2 h-2 rounded-full bg-danger" />
                <div className="absolute -top-5 -left-4 text-[9px] text-danger font-semibold whitespace-nowrap">
                  HOJE
                </div>
              </div>
            )}

            {phases.map((phase) => {
              const start = dateToDay(phase.start_date)
              const end = dateToDay(phase.due_date)
              if (start == null || end == null) return null
              const left = ((start - range.min) / range.span) * 100
              const width = Math.max(2, ((end - start) / range.span) * 100)
              const color = PHASE_COLOR[phase.status] ?? PHASE_COLOR.pending
              const progress = Number(phase.progress_percent ?? 0)

              return (
                <div key={phase.id} className="flex py-1.5">
                  <div className="w-[200px] shrink-0 text-[12px] flex items-center gap-2 pr-3">
                    <span className="font-medium truncate">{phase.name}</span>
                  </div>
                  <div className="flex-1 relative h-7 bg-panel2/40 rounded-md">
                    <div
                      className="absolute top-1 bottom-1 rounded-md flex items-center px-2 text-[11px] text-white font-semibold overflow-hidden whitespace-nowrap"
                      style={{
                        left: `${left}%`,
                        width: `${width}%`,
                        background: color,
                        opacity: phase.status === 'pending' ? 0.7 : 1,
                      }}
                      title={`${phase.name} · ${phase.start_date ?? ''} → ${phase.due_date ?? ''} · ${Math.round(progress)}%`}
                    >
                      {progress > 0 && progress < 100 && (
                        <div
                          className="absolute inset-y-0 left-0 bg-black/25 rounded-l-md"
                          style={{ width: `${progress}%` }}
                        />
                      )}
                      <span className="relative">
                        {phase.name} · {Math.round(progress)}%
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-4 text-[10px] flex-wrap">
        <Legend color="var(--muted)" label="Pendente" />
        <Legend color="var(--brand)" label="Em execução" />
        <Legend color="var(--ok)" label="Concluída" />
        <Legend color="var(--warn)" label="Atrasada" />
        <Legend color="var(--danger)" label="Bloqueada" />
      </div>
    </Card>
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-3 h-3 rounded" style={{ background: color }} />
      <span className="text-muted">{label}</span>
    </div>
  )
}
