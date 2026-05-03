import { useEffect, useState } from 'react'
import {
  AlertOctagon,
  Calendar,
  Check,
  Clock,
  Loader2,
  Trash2,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import {
  useDeleteTask,
  useUpdateTask,
  type Task,
  type TaskStatus,
} from '@/hooks/useTasksBoard'
import { TaskTimerButton } from '@/components/timer/TaskTimerButton'
import { TaskComments } from '@/components/tasks/TaskComments'
import { TaskAttachments } from '@/components/tasks/TaskAttachments'
import { useCurrentMember } from '@/hooks/useCurrentMember'
import { cn } from '@/lib/utils'

interface TaskDrawerProps {
  task: Task | null
  statuses: TaskStatus[]
  members: { id: string; full_name: string }[]
  workspaceId: string | undefined
  onClose: () => void
}

const PRIORITIES: Array<{ value: 'P1' | 'P2' | 'P3'; label: string }> = [
  { value: 'P1', label: 'P1 — alta' },
  { value: 'P2', label: 'P2 — média' },
  { value: 'P3', label: 'P3 — baixa' },
]

export function TaskDrawer({
  task,
  statuses,
  members,
  workspaceId,
  onClose,
}: TaskDrawerProps) {
  const update = useUpdateTask(workspaceId)
  const del = useDeleteTask(workspaceId)
  const { data: currentMember } = useCurrentMember(workspaceId)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [statusId, setStatusId] = useState('')
  const [priority, setPriority] = useState<'P1' | 'P2' | 'P3' | ''>('')
  const [assigneeId, setAssigneeId] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [estimatedHours, setEstimatedHours] = useState('')
  const [isBlocked, setIsBlocked] = useState(false)
  const [blockedReason, setBlockedReason] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [savedTick, setSavedTick] = useState(false)

  useEffect(() => {
    if (!task) return
    setTitle(task.title)
    setDescription(task.description_md ?? '')
    setStatusId(task.status_id)
    setPriority(task.priority ?? '')
    setAssigneeId(task.assignee_member_id ?? '')
    setDueDate(task.due_date ?? '')
    setEstimatedHours(
      task.estimated_hours != null ? String(task.estimated_hours) : ''
    )
    setIsBlocked(!!task.is_blocked)
    setBlockedReason(task.blocked_reason ?? '')
    setError(null)
    setSavedTick(false)
  }, [task])

  useEffect(() => {
    if (!task) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [task, onClose])

  if (!task) return null

  async function handleSave() {
    if (!task) return
    setError(null)
    if (title.trim().length < 2) {
      setError('Título é obrigatório.')
      return
    }
    try {
      await update.mutateAsync({
        taskId: task.id,
        patch: {
          title: title.trim(),
          description_md: description.trim() || null,
          status_id: statusId,
          priority: priority || null,
          assignee_member_id: assigneeId || null,
          due_date: dueDate || null,
          estimated_hours: estimatedHours ? Number(estimatedHours) : null,
          is_blocked: isBlocked,
          blocked_reason: isBlocked ? blockedReason.trim() || null : null,
        },
      })
      setSavedTick(true)
      setTimeout(() => setSavedTick(false), 1500)
    } catch (err) {
      setError((err as Error).message)
    }
  }

  async function handleComplete() {
    if (!task) return
    try {
      await update.mutateAsync({
        taskId: task.id,
        patch: { completed_at: new Date().toISOString() },
      })
      onClose()
    } catch (err) {
      setError((err as Error).message)
    }
  }

  async function handleDelete() {
    if (!task) return
    if (!confirm('Excluir esta task? A ação faz soft delete e pode ser revertida no banco.')) return
    try {
      await del.mutateAsync(task.id)
      onClose()
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const project = task.project
  const code = project
    ? `${project.code}-${task.sequence_number}`
    : `#${task.sequence_number}`
  const completed = !!task.completed_at

  return (
    <div
      className="fixed inset-0 z-40 bg-black/50"
      onClick={onClose}
      role="presentation"
    >
      <aside
        className="absolute right-0 top-0 h-full w-full max-w-[520px] bg-panel border-l shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between px-5 py-3 border-b">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-mono text-[11px] text-muted">{code}</span>
            {project && (
              <span className="text-[11px] text-muted truncate">
                · {project.name}
              </span>
            )}
            {project && !completed && !isBlocked && workspaceId && (
              <TaskTimerButton
                taskId={task.id}
                taskTitle={title || task.title}
                taskCode={code}
                projectId={project.id}
                projectCode={project.code}
              />
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted hover:text-text"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <Field label="Título *">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input text-[15px] font-semibold"
            />
          </Field>

          <Field label="Descrição">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="input resize-y"
              placeholder="Contexto, critérios de aceite, links..."
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Status">
              <select
                value={statusId}
                onChange={(e) => setStatusId(e.target.value)}
                className="input"
              >
                {statuses.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Prioridade">
              <select
                value={priority}
                onChange={(e) =>
                  setPriority(e.target.value as 'P1' | 'P2' | 'P3' | '')
                }
                className="input"
              >
                <option value="">— sem prioridade —</option>
                {PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Responsável">
            <select
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              className="input"
            >
              <option value="">— sem dono —</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.full_name}
                </option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Prazo">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" />
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="input pl-9"
                />
              </div>
            </Field>
            <Field label="Horas estimadas">
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" />
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={estimatedHours}
                  onChange={(e) => setEstimatedHours(e.target.value)}
                  className="input pl-9"
                />
              </div>
            </Field>
          </div>

          <div className="border-t pt-4 space-y-3">
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isBlocked}
                onChange={(e) => setIsBlocked(e.target.checked)}
                className="mt-1"
              />
              <div>
                <div className="text-sm font-semibold flex items-center gap-1">
                  <AlertOctagon className="w-3.5 h-3.5 text-danger" />
                  Task bloqueada
                </div>
                <div className="text-[11px] text-muted">
                  Marca a task como bloqueada e dispara alerta no dashboard.
                </div>
              </div>
            </label>
            {isBlocked && (
              <Field label="Motivo do bloqueio">
                <textarea
                  value={blockedReason}
                  onChange={(e) => setBlockedReason(e.target.value)}
                  rows={2}
                  className="input resize-none"
                  placeholder="Aguardando integração X, sponsor Y, etc."
                />
              </Field>
            )}
          </div>

          {task.actual_hours != null && (
            <div className="text-[11px] text-muted">
              Horas registradas até agora: {Number(task.actual_hours)}h
              {task.estimated_hours != null &&
                ` / estimadas ${Number(task.estimated_hours)}h`}
            </div>
          )}

          {workspaceId && (
            <TaskAttachments
              taskId={task.id}
              workspaceId={workspaceId}
              currentMemberId={currentMember?.id ?? null}
            />
          )}

          {workspaceId && (
            <TaskComments
              taskId={task.id}
              taskTitle={task.title}
              projectHref={
                project ? `/projetos/${project.id}` : '/tasks'
              }
              workspaceId={workspaceId}
              currentMemberId={currentMember?.id ?? null}
              members={members}
            />
          )}

          {error && (
            <div className="text-xs text-danger bg-danger/10 border border-danger/30 rounded-lg px-3 py-2">
              {error}
            </div>
          )}
        </div>

        <footer className="border-t p-4 flex items-center gap-2">
          <Button
            variant="danger"
            size="sm"
            onClick={handleDelete}
            disabled={del.isPending || update.isPending}
            title="Excluir task (soft delete)"
          >
            {del.isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
          </Button>
          {!completed && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleComplete}
              disabled={update.isPending || del.isPending}
            >
              <Check className="w-3.5 h-3.5" />
              Concluir
            </Button>
          )}
          <div className="flex-1" />
          <Button variant="ghost" onClick={onClose} disabled={update.isPending}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={update.isPending || del.isPending}
            className={cn(savedTick && 'bg-brand text-white')}
          >
            {update.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {savedTick ? (
              <>
                <Check className="w-4 h-4" />
                Salvo
              </>
            ) : update.isPending ? (
              'Salvando...'
            ) : (
              'Salvar'
            )}
          </Button>
        </footer>
      </aside>
    </div>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <div className="text-[11px] text-muted uppercase tracking-wider mb-1 font-semibold">
        {label}
      </div>
      {children}
    </label>
  )
}
