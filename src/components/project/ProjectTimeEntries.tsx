import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Check, Clock, Loader2, Pencil, Plus, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import {
  useCreateTimeEntry,
  useDeleteTimeEntry,
  useProjectTimeEntries,
  useUpdateTimeEntry,
} from '@/hooks/useTimeEntries'
import { useCurrentMember } from '@/hooks/useCurrentMember'
import type { Task, TimeEntry } from '@/types/database'
import { cn, formatBRL, formatDateShort, getInitials } from '@/lib/utils'

interface ProjectTimeEntriesProps {
  workspaceId: string
  projectId: string
  members: { id: string; full_name: string }[]
  tasks: Pick<Task, 'id' | 'title' | 'sequence_number'>[]
  defaultHourlyRate?: number | null
}

function todayLocalISO(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function ProjectTimeEntries({
  workspaceId,
  projectId,
  members,
  tasks,
  defaultHourlyRate,
}: ProjectTimeEntriesProps) {
  const entries = useProjectTimeEntries(projectId, workspaceId)
  const create = useCreateTimeEntry()
  const update = useUpdateTimeEntry()
  const del = useDeleteTimeEntry()
  const { data: currentMember } = useCurrentMember(workspaceId)

  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const totals = useMemo(() => {
    const list = entries.data ?? []
    const total = list.reduce((acc, e) => acc + Number(e.hours ?? 0), 0)
    const billable = list
      .filter((e) => e.is_billable)
      .reduce((acc, e) => acc + Number(e.hours ?? 0), 0)
    const billableRevenue = list
      .filter((e) => e.is_billable)
      .reduce(
        (acc, e) => acc + Number(e.hours ?? 0) * Number(e.hourly_rate ?? 0),
        0
      )
    return { total, billable, billableRevenue, count: list.length }
  }, [entries.data])

  const memberName = (id: string) =>
    members.find((m) => m.id === id)?.full_name ?? 'Sem nome'

  return (
    <Card className="space-y-3">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h3 className="font-semibold text-[15px]">Registros de horas</h3>
          <p className="text-xs text-muted">
            {totals.count} entradas · total{' '}
            <span className="font-semibold text-text">
              {totals.total.toFixed(1)}h
            </span>{' '}
            · faturáveis{' '}
            <span className="font-semibold text-text">
              {totals.billable.toFixed(1)}h
            </span>{' '}
            ·{' '}
            <span className="font-semibold text-text">
              {formatBRL(totals.billableRevenue, { compact: true })}
            </span>
          </p>
        </div>
        {!adding && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setAdding(true)
              setEditingId(null)
              setError(null)
            }}
          >
            <Plus className="w-3.5 h-3.5" />
            Adicionar manual
          </Button>
        )}
      </div>

      {adding && (
        <EntryForm
          mode="create"
          workspaceId={workspaceId}
          projectId={projectId}
          memberId={currentMember?.id ?? null}
          members={members}
          tasks={tasks}
          defaultHourlyRate={defaultHourlyRate}
          isPending={create.isPending}
          onCancel={() => setAdding(false)}
          onSubmit={async (form) => {
            setError(null)
            try {
              await create.mutateAsync(form)
              setAdding(false)
            } catch (e) {
              setError((e as Error).message)
            }
          }}
        />
      )}

      {error && (
        <div className="text-xs text-danger bg-danger/10 border border-danger/30 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {entries.isLoading ? (
        <div className="text-center py-6 text-muted text-xs">
          Carregando registros...
        </div>
      ) : (entries.data ?? []).length === 0 ? (
        <div className="text-center py-8 text-muted text-sm border border-dashed border-border rounded-xl">
          Nenhum registro de horas neste projeto.
        </div>
      ) : (
        <div className="overflow-hidden border border-border rounded-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[11px] text-muted bg-panel2/50">
                  <th className="text-left font-medium py-2 px-3">Data</th>
                  <th className="text-left font-medium py-2 px-3">Quem</th>
                  <th className="text-left font-medium py-2 px-3">Task</th>
                  <th className="text-left font-medium py-2 px-3">Descrição</th>
                  <th className="text-right font-medium py-2 px-3">Horas</th>
                  <th className="text-right font-medium py-2 px-3">R$</th>
                  <th className="text-center font-medium py-2 px-3 w-20"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(entries.data ?? []).map((e) => {
                  if (editingId === e.id) {
                    return (
                      <tr key={e.id} className="bg-brand/5">
                        <td colSpan={7} className="p-3">
                          <EntryForm
                            mode="edit"
                            workspaceId={workspaceId}
                            projectId={projectId}
                            memberId={e.member_id}
                            members={members}
                            tasks={tasks}
                            defaultHourlyRate={defaultHourlyRate}
                            initial={e}
                            isPending={update.isPending}
                            onCancel={() => setEditingId(null)}
                            onSubmit={async (form) => {
                              setError(null)
                              try {
                                await update.mutateAsync({
                                  entryId: e.id,
                                  workspaceId,
                                  projectId,
                                  patch: {
                                    entry_date: form.entryDate,
                                    hours: form.hours,
                                    description: form.description ?? null,
                                    is_billable: form.isBillable,
                                    hourly_rate: form.hourlyRate ?? null,
                                    task_id: form.taskId ?? null,
                                  },
                                })
                                setEditingId(null)
                              } catch (err) {
                                setError((err as Error).message)
                              }
                            }}
                          />
                        </td>
                      </tr>
                    )
                  }
                  const cost = Number(e.hours ?? 0) * Number(e.hourly_rate ?? 0)
                  const taskLabel = e.task
                    ? `#${e.task.sequence_number} ${e.task.title}`
                    : null
                  return (
                    <tr key={e.id} className="hover:bg-panel2/40 group">
                      <td className="py-2 px-3 text-[12px] text-muted whitespace-nowrap">
                        {formatDateShort(e.entry_date)}
                      </td>
                      <td className="py-2 px-3 text-[12px]">
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-panel2 border border-border flex items-center justify-center text-[8px] font-bold">
                            {getInitials(memberName(e.member_id))}
                          </div>
                          <span className="truncate max-w-[100px]">
                            {memberName(e.member_id).split(' ')[0]}
                          </span>
                        </div>
                      </td>
                      <td className="py-2 px-3 text-[11px] text-muted truncate max-w-[160px]">
                        {taskLabel ?? '—'}
                      </td>
                      <td className="py-2 px-3 text-[12px] truncate max-w-[260px]">
                        {e.description ?? <span className="text-muted">—</span>}
                      </td>
                      <td className="py-2 px-3 text-[12px] text-right font-mono">
                        {Number(e.hours ?? 0).toFixed(1)}
                      </td>
                      <td className="py-2 px-3 text-[12px] text-right">
                        {e.is_billable ? (
                          formatBRL(cost, { compact: true })
                        ) : (
                          <span className="text-muted text-[10px]">não-fat</span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition">
                          <button
                            type="button"
                            onClick={() => setEditingId(e.id)}
                            className="text-muted hover:text-brand p-1"
                            title="Editar"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              if (!confirm('Excluir este registro?')) return
                              try {
                                await del.mutateAsync({
                                  entryId: e.id,
                                  workspaceId,
                                  projectId,
                                })
                              } catch (err) {
                                setError((err as Error).message)
                              }
                            }}
                            className="text-muted hover:text-danger p-1"
                            title="Excluir"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Card>
  )
}

interface EntryFormSubmit {
  workspaceId: string
  projectId: string
  memberId: string
  taskId?: string | null
  entryDate: string
  hours: number
  description?: string | null
  isBillable?: boolean
  hourlyRate?: number | null
}

function EntryForm({
  mode,
  workspaceId,
  projectId,
  memberId,
  members,
  tasks,
  defaultHourlyRate,
  initial,
  isPending,
  onCancel,
  onSubmit,
}: {
  mode: 'create' | 'edit'
  workspaceId: string
  projectId: string
  memberId: string | null
  members: { id: string; full_name: string }[]
  tasks: Pick<Task, 'id' | 'title' | 'sequence_number'>[]
  defaultHourlyRate?: number | null
  initial?: TimeEntry
  isPending: boolean
  onCancel: () => void
  onSubmit: (form: EntryFormSubmit) => void | Promise<void>
}) {
  const [date, setDate] = useState(initial?.entry_date ?? todayLocalISO())
  const [hours, setHours] = useState<string>(
    initial ? String(initial.hours) : ''
  )
  const [description, setDescription] = useState(initial?.description ?? '')
  const [taskId, setTaskId] = useState<string>(initial?.task_id ?? '')
  const [memberOverride, setMemberOverride] = useState<string>(
    initial?.member_id ?? memberId ?? ''
  )
  const [isBillable, setIsBillable] = useState(initial?.is_billable ?? true)
  const [hourlyRate, setHourlyRate] = useState<string>(
    initial?.hourly_rate != null
      ? String(initial.hourly_rate)
      : defaultHourlyRate != null
        ? String(defaultHourlyRate)
        : ''
  )
  const [localError, setLocalError] = useState<string | null>(null)

  useEffect(() => {
    if (initial) return
    if (memberId && !memberOverride) setMemberOverride(memberId)
  }, [memberId, memberOverride, initial])

  function submit(e: FormEvent) {
    e.preventDefault()
    setLocalError(null)
    const numHours = Number(hours)
    if (!Number.isFinite(numHours) || numHours <= 0 || numHours > 24) {
      setLocalError('Horas precisa ser número entre 0 e 24.')
      return
    }
    if (!memberOverride) {
      setLocalError('Selecione um membro.')
      return
    }
    onSubmit({
      workspaceId,
      projectId,
      memberId: memberOverride,
      taskId: taskId || null,
      entryDate: date,
      hours: numHours,
      description: description || null,
      isBillable,
      hourlyRate: hourlyRate ? Number(hourlyRate) : null,
    })
  }

  return (
    <form
      onSubmit={submit}
      className={cn(
        'grid grid-cols-1 md:grid-cols-12 gap-2 items-end',
        mode === 'edit' && 'border border-brand/30 rounded-lg p-2 bg-brand/5'
      )}
    >
      <Field label="Data" className="md:col-span-2">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          max={todayLocalISO()}
          className="input text-[12px]"
        />
      </Field>
      <Field label="Quem" className="md:col-span-2">
        <select
          value={memberOverride}
          onChange={(e) => setMemberOverride(e.target.value)}
          className="input text-[12px]"
        >
          <option value="">—</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.full_name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Task" className="md:col-span-3">
        <select
          value={taskId}
          onChange={(e) => setTaskId(e.target.value)}
          className="input text-[12px]"
        >
          <option value="">— sem task —</option>
          {tasks.map((t) => (
            <option key={t.id} value={t.id}>
              #{t.sequence_number} {t.title}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Horas" className="md:col-span-1">
        <input
          type="number"
          min="0"
          max="24"
          step="0.25"
          value={hours}
          onChange={(e) => setHours(e.target.value)}
          className="input text-[12px]"
          required
        />
      </Field>
      <Field label="R$/h" className="md:col-span-2">
        <input
          type="number"
          min="0"
          step="10"
          value={hourlyRate}
          onChange={(e) => setHourlyRate(e.target.value)}
          className="input text-[12px]"
        />
      </Field>
      <div className="md:col-span-2 flex items-center gap-2">
        <label className="flex items-center gap-1 text-[11px] cursor-pointer">
          <input
            type="checkbox"
            checked={isBillable}
            onChange={(e) => setIsBillable(e.target.checked)}
          />
          Faturável
        </label>
      </div>
      <Field label="Descrição" className="md:col-span-12">
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="input text-[12px]"
          placeholder="Atividade, contexto..."
        />
      </Field>

      {localError && (
        <div className="md:col-span-12 text-[11px] text-danger bg-danger/10 border border-danger/30 rounded px-2 py-1">
          {localError}
        </div>
      )}

      <div className="md:col-span-12 flex justify-end gap-2 pt-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onCancel}
          disabled={isPending}
        >
          <X className="w-3.5 h-3.5" />
          Cancelar
        </Button>
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : mode === 'edit' ? (
            <Check className="w-3.5 h-3.5" />
          ) : (
            <Clock className="w-3.5 h-3.5" />
          )}
          {mode === 'edit' ? 'Salvar' : 'Registrar horas'}
        </Button>
      </div>
    </form>
  )
}

function Field({
  label,
  className,
  children,
}: {
  label: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <label className={cn('block', className)}>
      <div className="text-[10px] text-muted uppercase tracking-wider mb-1 font-semibold">
        {label}
      </div>
      {children}
    </label>
  )
}
