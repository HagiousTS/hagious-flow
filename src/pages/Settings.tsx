import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertOctagon,
  Archive,
  Building2,
  Check,
  Loader2,
  Save,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useCurrentMember } from '@/hooks/useCurrentMember'
import {
  useArchiveWorkspace,
  useUpdateWorkspace,
  useWorkspace,
  useWorkspaces,
} from '@/hooks/useWorkspace'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'

const PLANS = [
  { id: 'free', label: 'Free — R$ 0', defaultSeats: 3 },
  { id: 'starter', label: 'Starter — R$ 29/u', defaultSeats: 10 },
  {
    id: 'business',
    label: 'Business — R$ 59/u (recomendado)',
    defaultSeats: 50,
  },
  { id: 'pro', label: 'Pro — R$ 119/u (IA avançada)', defaultSeats: 100 },
  { id: 'enterprise', label: 'Enterprise — sob consulta', defaultSeats: 500 },
]

const INDUSTRIES = [
  '',
  'Consultoria ERP',
  'Software house',
  'TI interno',
  'Agência',
  'Outro',
]

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
}

export function SettingsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const workspaces = useWorkspaces()
  const { data: workspace, isLoading: wsLoading } = useWorkspace()
  const { data: member, isLoading: memberLoading } = useCurrentMember(
    workspace?.id
  )
  const update = useUpdateWorkspace()
  const archive = useArchiveWorkspace()

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [industry, setIndustry] = useState('')
  const [plan, setPlan] = useState('business')
  const [seats, setSeats] = useState(50)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!workspace) return
    setName(workspace.name)
    setSlug(workspace.slug)
    setIndustry(workspace.industry ?? '')
    setPlan(workspace.plan)
    setSeats(workspace.plan_seats)
    setError(null)
    setSaved(false)
  }, [workspace])

  if (wsLoading || memberLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64 rounded-lg" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    )
  }

  if (!workspace) {
    return (
      <Card>
        <div className="text-center py-12">
          <h3 className="font-semibold mb-2">Sem workspace ativo</h3>
        </div>
      </Card>
    )
  }

  const isOwner = member?.role === 'owner'

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    if (!workspace) return
    setError(null)
    try {
      await update.mutateAsync({
        workspaceId: workspace.id,
        name,
        slug,
        industry: industry.trim() || null,
        plan,
        seats,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      setError(translate((err as Error).message))
    }
  }

  async function handleArchive() {
    if (!workspace) return
    const confirmed = confirm(
      `Arquivar o workspace "${workspace.name}"? Ele desaparece da lista mas os dados ficam preservados no banco. Você precisa criar/entrar em outro workspace pra continuar usando o app.`
    )
    if (!confirmed) return
    try {
      await archive.mutateAsync(workspace.id)
      const remaining = (workspaces.data ?? []).filter(
        (w) => w.id !== workspace.id
      )
      if (remaining.length === 0) {
        navigate('/onboarding', { replace: true })
      } else {
        navigate('/', { replace: true })
      }
    } catch (err) {
      setError(translate((err as Error).message))
    }
  }

  function applyPlan(planId: string) {
    setPlan(planId)
    const def = PLANS.find((p) => p.id === planId)?.defaultSeats
    if (def && seats < def) setSeats(def)
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
        <p className="text-sm text-muted mt-1">
          Apenas o owner pode editar o workspace.{' '}
          {!isOwner && (
            <span className="text-warn font-semibold">
              Você está como {member?.role ?? '—'} — modo somente leitura.
            </span>
          )}
        </p>
      </div>

      <Card>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="flex items-center gap-3 border-b pb-3">
            <div className="w-10 h-10 rounded-lg grad-brand flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm truncate">
                {workspace.name}
              </div>
              <div className="text-[11px] text-muted font-mono">
                {workspace.id}
              </div>
            </div>
            <span className="text-[10px] text-muted bg-panel2 border px-2 py-0.5 rounded uppercase tracking-wider">
              owner: {user?.email}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="Nome do workspace">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!isOwner}
                className="input"
              />
            </Field>
            <Field label="Slug" hint="lowercase, sem espaço">
              <input
                value={slug}
                onChange={(e) => setSlug(slugify(e.target.value))}
                disabled={!isOwner}
                className="input font-mono text-[12px]"
              />
            </Field>
          </div>

          <Field label="Setor">
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              disabled={!isOwner}
              className="input"
            >
              {INDUSTRIES.map((i) => (
                <option key={i} value={i}>
                  {i || '— sem setor —'}
                </option>
              ))}
            </select>
          </Field>

          <div>
            <div className="text-[11px] text-muted uppercase tracking-wider mb-2 font-semibold">
              Plano
            </div>
            <div className="space-y-1">
              {PLANS.map((p) => (
                <label
                  key={p.id}
                  className={`flex items-center gap-3 p-2 rounded-lg border cursor-pointer transition ${
                    plan === p.id
                      ? 'bg-brand/10 border-brand/40'
                      : 'border-border hover:border-brand/30'
                  } ${!isOwner ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  <input
                    type="radio"
                    name="plan"
                    value={p.id}
                    checked={plan === p.id}
                    onChange={() => isOwner && applyPlan(p.id)}
                    disabled={!isOwner}
                  />
                  <span className="text-sm">{p.label}</span>
                </label>
              ))}
            </div>
          </div>

          <Field label="Seats (vagas)">
            <input
              type="number"
              min={1}
              value={seats}
              onChange={(e) => setSeats(Math.max(1, Number(e.target.value)))}
              disabled={!isOwner}
              className="input max-w-[120px]"
            />
          </Field>

          {error && (
            <div className="text-xs text-danger bg-danger/10 border border-danger/30 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          {isOwner && (
            <div className="flex items-center justify-end gap-2 border-t pt-4">
              <Button type="submit" disabled={update.isPending}>
                {update.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : saved ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {update.isPending
                  ? 'Salvando...'
                  : saved
                    ? 'Salvo'
                    : 'Salvar alterações'}
              </Button>
            </div>
          )}
        </form>
      </Card>

      {isOwner && (
        <Card className="border-danger/30">
          <div className="flex items-start gap-3">
            <AlertOctagon className="w-5 h-5 text-danger shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-danger">Danger zone</h3>
              <p className="text-xs text-muted mt-1 mb-3">
                Arquivar o workspace o esconde da lista. Os dados (projetos,
                tasks, OS, time entries) continuam preservados no banco. Se
                precisar reverter, peça pro suporte.
              </p>
              <Button
                variant="danger"
                size="sm"
                onClick={handleArchive}
                disabled={archive.isPending}
              >
                {archive.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Archive className="w-3.5 h-3.5" />
                )}
                Arquivar workspace
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <div className="text-[11px] text-muted uppercase tracking-wider mb-1 font-semibold">
        {label}
        {hint && <span className="ml-1 normal-case font-normal">· {hint}</span>}
      </div>
      {children}
    </label>
  )
}

function translate(msg: string): string {
  if (msg.includes('forbidden')) return 'Apenas o owner pode editar.'
  if (msg.includes('invalid_name')) return 'Nome inválido.'
  if (msg.includes('invalid_slug')) return 'Slug inválido (mín 3 caracteres).'
  if (msg.includes('invalid_plan')) return 'Plano inválido.'
  if (msg.includes('invalid_seats')) return 'Seats inválido.'
  if (msg.includes('not_authenticated')) return 'Sessão expirada. Faça login.'
  if (
    msg.toLowerCase().includes('duplicate') &&
    msg.toLowerCase().includes('slug')
  ) {
    return 'Esse slug já está em uso por outro workspace.'
  }
  return msg
}
