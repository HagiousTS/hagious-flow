import { useEffect, useState, type FormEvent } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useClientsLite, useCreateProject } from '@/hooks/useProjects'
import type { Priority, ProjectStatus } from '@/types/database'

interface NewProjectDialogProps {
  workspaceId: string
  open: boolean
  onClose: () => void
  onCreated?: (projectId: string) => void
}

const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: 'planning', label: 'Planejamento' },
  { value: 'active', label: 'Ativo' },
  { value: 'on_hold', label: 'Pausado' },
]

const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: 'P1', label: 'P1 — alta' },
  { value: 'P2', label: 'P2 — média' },
  { value: 'P3', label: 'P3 — baixa' },
]

const PROJECT_TYPES = [
  'consultoria',
  'sustentacao',
  'implantacao',
  'desenvolvimento',
  'interno',
]

export function NewProjectDialog({
  workspaceId,
  open,
  onClose,
  onCreated,
}: NewProjectDialogProps) {
  const clients = useClientsLite(workspaceId)
  const createMut = useCreateProject()

  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [clientId, setClientId] = useState('')
  const [projectType, setProjectType] = useState('consultoria')
  const [status, setStatus] = useState<ProjectStatus>('planning')
  const [priority, setPriority] = useState<Priority>('P2')
  const [startDate, setStartDate] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [estimatedHours, setEstimatedHours] = useState('')
  const [budget, setBudget] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setCode('')
    setName('')
    setDescription('')
    setClientId('')
    setProjectType('consultoria')
    setStatus('planning')
    setPriority('P2')
    setStartDate('')
    setDueDate('')
    setEstimatedHours('')
    setBudget('')
    setError(null)
  }, [open])

  useEffect(() => {
    if (!open) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  if (!open) return null

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!code.trim() || !name.trim()) {
      setError('Código e nome são obrigatórios.')
      return
    }
    try {
      const proj = await createMut.mutateAsync({
        workspaceId,
        code,
        name,
        description: description || null,
        clientId: clientId || null,
        projectType,
        status,
        priority,
        startDate: startDate || null,
        dueDate: dueDate || null,
        estimatedHours: estimatedHours ? Number(estimatedHours) : null,
        budgetAmount: budget ? Number(budget) : null,
      })
      onCreated?.(proj.id)
      onClose()
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-start justify-center overflow-y-auto p-4"
      onClick={onClose}
    >
      <div
        className="bg-panel border rounded-2xl shadow-xl w-full max-w-2xl my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="font-bold text-lg">Novo projeto</h2>
            <p className="text-xs text-muted mt-0.5">
              Cadastre um projeto. Tasks, fases e membros podem ser adicionados
              depois.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted hover:text-text p-1"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Field label="Código *" hint="Ex: DO, AP, VT">
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                maxLength={12}
                className="input"
                placeholder="DO"
              />
            </Field>
            <Field label="Nome *" className="md:col-span-2">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input"
                placeholder="Implantação ERP Sankhya"
              />
            </Field>
          </div>

          <Field label="Descrição">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="input resize-none"
              placeholder="Escopo resumido do projeto..."
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
            <Field label="Tipo">
              <select
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)}
                className="input"
              >
                {PROJECT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
            <Field label="Prioridade">
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="input"
              >
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
                placeholder="0"
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
                placeholder="0"
              />
            </Field>
          </div>

          {error && (
            <div className="text-xs text-danger bg-danger/10 border border-danger/30 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 border-t pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={createMut.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={createMut.isPending}>
              {createMut.isPending ? 'Criando...' : 'Criar projeto'}
            </Button>
          </div>
        </form>
      </div>
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
