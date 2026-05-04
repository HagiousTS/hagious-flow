import { useEffect, useState, type FormEvent } from 'react'
import { Check, Loader2, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import {
  useClientsLite,
  useDeleteProject,
  useUpdateProject,
  type ProjectListItem,
} from '@/hooks/useProjects'
import { cn } from '@/lib/utils'
import type { Priority, ProjectHealth, ProjectStatus } from '@/types/database'

interface ProjectDrawerProps {
  project: ProjectListItem | null
  workspaceId: string
  onClose: () => void
}

const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: 'planning', label: 'Planejamento' },
  { value: 'active', label: 'Ativo' },
  { value: 'on_hold', label: 'Pausado' },
  { value: 'done', label: 'Concluído' },
  { value: 'archived', label: 'Arquivado' },
]

const HEALTH_OPTIONS: { value: ProjectHealth; label: string }[] = [
  { value: 'on_track', label: 'On track' },
  { value: 'ahead', label: 'Adiantado' },
  { value: 'at_risk', label: 'Em risco' },
  { value: 'off_track', label: 'Fora do prazo' },
]

const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: 'P1', label: 'P1 — alta' },
  { value: 'P2', label: 'P2 — média' },
  { value: 'P3', label: 'P3 — baixa' },
]

export function ProjectDrawer({
  project,
  workspaceId,
  onClose,
}: ProjectDrawerProps) {
  const update = useUpdateProject()
  const del = useDeleteProject(workspaceId)
  const clients = useClientsLite(workspaceId)

  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [clientId, setClientId] = useState('')
  const [status, setStatus] = useState<ProjectStatus>('planning')
  const [health, setHealth] = useState<ProjectHealth | ''>('')
  const [priority, setPriority] = useState<Priority | ''>('')
  const [startDate, setStartDate] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [estimatedHours, setEstimatedHours] = useState('')
  const [budget, setBudget] = useState('')
  const [progress, setProgress] = useState(0)
  const [sponsorName, setSponsorName] = useState('')
  const [sponsorEmail, setSponsorEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!project) return
    setCode(project.code)
    setName(project.name)
    setDescription(project.description ?? '')
    setClientId(project.client?.id ?? '')
    setStatus(project.status)
    setHealth(project.health ?? '')
    setPriority(project.priority ?? '')
    setStartDate(project.startDate ?? '')
    setDueDate(project.dueDate ?? '')
    setEstimatedHours(
      project.estimatedHours != null ? String(project.estimatedHours) : ''
    )
    setBudget(project.budgetAmount != null ? String(project.budgetAmount) : '')
    setProgress(project.progressPercent ?? 0)
    setSponsorName('')
    setSponsorEmail('')
    setError(null)
    setSaved(false)
  }, [project])

  useEffect(() => {
    if (!project) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [project, onClose])

  if (!project) return null

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    if (!project) return
    setError(null)
    if (code.trim().length < 1 || name.trim().length < 2) {
      setError('Código e nome são obrigatórios.')
      return
    }
    try {
      await update.mutateAsync({
        workspaceId,
        projectId: project.id,
        patch: {
          code,
          name,
          description: description.trim() || null,
          client_id: clientId || null,
          status,
          priority: priority || null,
          health: health || null,
          start_date: startDate || null,
          due_date: dueDate || null,
          estimated_hours: estimatedHours ? Number(estimatedHours) : null,
          budget_amount: budget ? Number(budget) : null,
          progress_percent: Math.max(0, Math.min(100, progress)),
          sponsor_name: sponsorName.trim() || null,
          sponsor_email: sponsorEmail.trim() || null,
        },
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 1500)
    } catch (err) {
      setError((err as Error).message)
    }
  }

  async function handleDelete() {
    if (!project) return
    if (
      !confirm(
        `Excluir o projeto ${project.code}? Soft delete — pode ser revertido no banco.`
      )
    )
      return
    try {
      await del.mutateAsync(project.id)
      onClose()
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <div
      className="fixed inset-0 z-40 bg-black/50"
      onClick={onClose}
      role="presentation"
    >
      <aside
        className="absolute right-0 top-0 h-full w-full max-w-[560px] bg-panel border-l shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between px-5 py-3 border-b">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-mono text-[12px] text-muted">
              {project.code}
            </span>
            <span className="text-sm font-semibold truncate">
              {project.name}
            </span>
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

        <form
          onSubmit={handleSave}
          className="flex-1 overflow-y-auto p-5 space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Field label="Código *" hint="Ex: DO, AP">
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                maxLength={12}
                className="input font-mono"
              />
            </Field>
            <Field label="Nome *" className="md:col-span-2">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input"
              />
            </Field>
          </div>

          <Field label="Descrição">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="input resize-y"
            />
          </Field>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="Cliente">
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="input"
              >
                <option value="">— sem cliente —</option>
                {(clients.data ?? []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.trade_name ?? c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Status">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                className="input"
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="Saúde">
              <select
                value={health}
                onChange={(e) =>
                  setHealth(e.target.value as ProjectHealth | '')
                }
                className="input"
              >
                <option value="">— sem avaliação —</option>
                {HEALTH_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Prioridade">
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority | '')}
                className="input"
              >
                <option value="">— sem prioridade —</option>
                {PRIORITY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Field label="Início">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Prazo">
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Horas estim.">
              <input
                type="number"
                min="0"
                step="1"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Budget (R$)">
              <input
                type="number"
                min="0"
                step="100"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="input"
              />
            </Field>
          </div>

          <Field label={`Progresso · ${progress}%`}>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="w-full"
            />
          </Field>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 border-t pt-4">
            <Field label="Sponsor (nome)">
              <input
                value={sponsorName}
                onChange={(e) => setSponsorName(e.target.value)}
                className="input"
                placeholder="Diretor/Cliente"
              />
            </Field>
            <Field label="Sponsor (email)">
              <input
                type="email"
                value={sponsorEmail}
                onChange={(e) => setSponsorEmail(e.target.value)}
                className="input"
              />
            </Field>
          </div>

          {error && (
            <div className="text-xs text-danger bg-danger/10 border border-danger/30 rounded-lg px-3 py-2">
              {error}
            </div>
          )}
        </form>

        <footer className="border-t p-4 flex items-center gap-2">
          <Button
            variant="danger"
            size="sm"
            onClick={handleDelete}
            disabled={del.isPending || update.isPending}
            title="Excluir projeto (soft delete)"
          >
            {del.isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
          </Button>
          <div className="flex-1" />
          <Button variant="ghost" onClick={onClose} disabled={update.isPending}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={update.isPending || del.isPending}
            className={cn(saved && 'bg-brand text-white')}
          >
            {update.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {saved ? (
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
  hint,
  className,
  children,
}: {
  label: string
  hint?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <label className={`block ${className ?? ''}`}>
      <div className="text-[11px] text-muted uppercase tracking-wider mb-1 font-semibold">
        {label}
        {hint && <span className="ml-1 normal-case font-normal">· {hint}</span>}
      </div>
      {children}
    </label>
  )
}
