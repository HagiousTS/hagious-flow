import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { cn, formatDateShort, getInitials } from '@/lib/utils'
import type { Task } from '@/types/database'

interface ProjectTasksListProps {
  tasks: Task[]
  projectCode: string
}

const PRIORITY_CHIP: Record<string, { label: string; cls: string }> = {
  P1: { label: 'P1', cls: 'tag-priority-high' },
  P2: { label: 'P2', cls: 'tag-priority-mid' },
  P3: { label: 'P3', cls: 'tag-priority-low' },
}

const STATUS_CHIP: Record<string, string> = {
  todo: 'tag-status-todo',
  doing: 'tag-status-doing',
  review: 'tag-status-review',
  done: 'tag-status-done',
  blocked: 'tag-status-block',
}

type TaskFilter = 'all' | 'open' | 'blocked' | 'done'

const FILTERS: Array<{
  id: TaskFilter
  label: string
  matches: (t: Task) => boolean
}> = [
  { id: 'all', label: 'Todas', matches: () => true },
  {
    id: 'open',
    label: 'Em aberto',
    matches: (t) => t.status?.category !== 'done' && !t.is_blocked,
  },
  { id: 'blocked', label: 'Bloqueadas', matches: (t) => t.is_blocked },
  {
    id: 'done',
    label: 'Concluídas',
    matches: (t) => t.status?.category === 'done',
  },
]

export function ProjectTasksList({
  tasks,
  projectCode,
}: ProjectTasksListProps) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<TaskFilter>('all')

  const counts = useMemo(() => {
    const c: Record<TaskFilter, number> = {
      all: 0,
      open: 0,
      blocked: 0,
      done: 0,
    }
    for (const t of tasks) {
      c.all += 1
      for (const f of FILTERS) {
        if (f.id === 'all') continue
        if (f.matches(t)) c[f.id] += 1
      }
    }
    return c
  }, [tasks])

  const filtered = useMemo(() => {
    const f = FILTERS.find((x) => x.id === filter) ?? FILTERS[0]
    const q = search.trim().toLowerCase()
    return tasks
      .filter((t) => {
        if (!f.matches(t)) return false
        if (!q) return true
        return (
          t.title.toLowerCase().includes(q) ||
          (t.description_md ?? '').toLowerCase().includes(q) ||
          `${projectCode}-${t.sequence_number}`.toLowerCase().includes(q)
        )
      })
      .slice(0, 30)
  }, [tasks, filter, search, projectCode])

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div>
          <h3 className="font-semibold text-[15px]">Tasks do projeto</h3>
          <p className="text-xs text-muted">
            {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'} · ordenadas
            por prioridade e prazo
          </p>
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          <div className="relative">
            <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar task..."
              className="bg-panel2 border border-border rounded-lg pl-8 pr-3 py-1.5 text-xs placeholder:text-muted focus:outline-none w-48"
            />
          </div>
          <div className="flex gap-1 text-xs border border-border rounded-lg p-0.5">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={cn(
                  'px-3 py-1 rounded transition',
                  filter === f.id
                    ? 'bg-panel2 font-semibold text-text'
                    : 'text-muted hover:text-text'
                )}
              >
                {f.label} ({counts[f.id]})
              </button>
            ))}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-10 text-muted text-sm border border-dashed border-border rounded-xl">
          Nenhuma task nesta visão.
        </div>
      ) : (
        <div className="overflow-hidden border border-border rounded-xl">
          <div className="overflow-x-auto scrollbar">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[11px] text-muted bg-panel2/50">
                  <th className="text-left font-medium py-2 px-3">Task</th>
                  <th className="text-left font-medium py-2 px-3">Status</th>
                  <th className="text-left font-medium py-2 px-3">Prio</th>
                  <th className="text-left font-medium py-2 px-3">Resp.</th>
                  <th className="text-left font-medium py-2 px-3">Prazo</th>
                  <th className="text-left font-medium py-2 px-3">Estim.</th>
                  <th className="text-left font-medium py-2 px-3">Real</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((t) => {
                  const prio = t.priority ? PRIORITY_CHIP[t.priority] : null
                  const statusKey = t.is_blocked
                    ? 'blocked'
                    : (t.status?.category ?? 'todo')
                  const statusCls = STATUS_CHIP[statusKey] ?? 'tag-status-todo'
                  const assigneeName = t.assignee?.profile?.full_name ?? null
                  const completed = t.status?.category === 'done'
                  return (
                    <tr key={t.id} className="hover:bg-panel2/40">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] text-muted font-mono">
                            {projectCode}-{t.sequence_number}
                          </span>
                          <span className="font-medium text-[13px]">
                            {t.title}
                          </span>
                          {t.is_blocked && (
                            <span className="chip tag-status-block">
                              ⚠ Bloqueada
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className={cn('chip', statusCls)}>
                          {t.status?.name ?? statusKey}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        {prio && (
                          <span className={cn('chip', prio.cls)}>
                            {prio.label}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        {assigneeName ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-panel2 border border-border text-text flex items-center justify-center text-[9px] font-bold">
                              {getInitials(assigneeName)}
                            </div>
                            <span className="text-[12px] truncate max-w-[140px]">
                              {assigneeName.split(' ')[0]}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-muted">—</span>
                        )}
                      </td>
                      <td
                        className={cn(
                          'py-3 px-3 text-[12px]',
                          completed
                            ? 'text-ok'
                            : t.due_date &&
                                new Date(t.due_date).getTime() < Date.now()
                              ? 'text-danger font-semibold'
                              : 'text-text'
                        )}
                      >
                        {formatDateShort(t.due_date)}
                      </td>
                      <td className="py-3 px-3 text-[12px] text-muted">
                        {t.estimated_hours != null
                          ? `${Number(t.estimated_hours)}h`
                          : '—'}
                      </td>
                      <td className="py-3 px-3 text-[12px]">
                        {t.actual_hours != null
                          ? `${Number(t.actual_hours)}h`
                          : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {tasks.length > filtered.length && (
            <div className="bg-panel2/30 px-3 py-2 text-center text-xs text-muted">
              Mostrando {filtered.length} de {tasks.length} tasks
            </div>
          )}
        </div>
      )}
    </Card>
  )
}
