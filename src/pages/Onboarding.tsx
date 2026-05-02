import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, Loader2, Sparkles, ArrowRight } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import {
  useBootstrapWorkspace,
  useWorkspaces,
} from '@/hooks/useWorkspace'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 'R$ 0',
    seats: 3,
    description: 'Até 3 usuários · pra testar',
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 'R$ 29/u',
    seats: 10,
    description: 'Até 10 usuários · times pequenos',
  },
  {
    id: 'business',
    name: 'Business',
    price: 'R$ 59/u',
    seats: 50,
    description: 'Ilimitado · ICP principal',
    highlight: true,
  },
] as const

const INDUSTRIES = [
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

export function OnboardingPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const workspaces = useWorkspaces()
  const bootstrap = useBootstrapWorkspace()

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [industry, setIndustry] = useState(INDUSTRIES[0])
  const [plan, setPlan] = useState<(typeof PLANS)[number]['id']>('business')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (
      !workspaces.isLoading &&
      workspaces.data &&
      workspaces.data.length > 0
    ) {
      navigate('/', { replace: true })
    }
  }, [workspaces.isLoading, workspaces.data, navigate])

  const autoSlug = useMemo(() => slugify(name), [name])
  const effectiveSlug = slugTouched ? slug : autoSlug

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (name.trim().length < 2) {
      setError('Informe um nome para o workspace.')
      return
    }
    if (effectiveSlug.length < 3) {
      setError('Slug precisa ter no mínimo 3 caracteres.')
      return
    }

    const planMeta = PLANS.find((p) => p.id === plan)!
    try {
      await bootstrap.mutateAsync({
        name: name.trim(),
        slug: effectiveSlug,
        industry: industry === 'Outro' ? null : industry,
        plan: plan,
        seats: planMeta.seats,
      })
      navigate('/', { replace: true })
    } catch (err) {
      setError(translate((err as Error).message))
    }
  }

  if (workspaces.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-brand" />
      </div>
    )
  }

  const firstName =
    (user?.user_metadata?.full_name as string | undefined)?.split(' ')[0] ??
    'pessoal'

  return (
    <div className="min-h-screen px-4 py-10 flex items-start justify-center">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl grad-brand flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Bem-vindo, {firstName}!
          </h1>
          <p className="text-sm text-muted mt-1">
            Vamos criar o workspace da sua consultoria. Você pode convidar o
            time e cadastrar projetos depois.
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field
                label="Nome do workspace *"
                hint="Geralmente o nome da empresa"
              >
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoFocus
                    className="input pl-9"
                    placeholder="Sankhya ABC Consultoria"
                  />
                </div>
              </Field>
              <Field label="Slug" hint="Identificador na URL">
                <input
                  value={effectiveSlug}
                  onChange={(e) => {
                    setSlugTouched(true)
                    setSlug(slugify(e.target.value))
                  }}
                  className="input font-mono text-[12px]"
                  placeholder="sankhya-abc"
                />
              </Field>
            </div>

            <Field label="Setor">
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="input"
              >
                {INDUSTRIES.map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
            </Field>

            <div>
              <div className="text-[11px] text-muted uppercase tracking-wider mb-2 font-semibold">
                Plano (você pode mudar depois)
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {PLANS.map((p) => {
                  const active = p.id === plan
                  return (
                    <button
                      type="button"
                      key={p.id}
                      onClick={() => setPlan(p.id)}
                      className={[
                        'text-left p-3 rounded-lg border transition relative',
                        active
                          ? 'bg-brand/10 border-brand/50'
                          : 'bg-panel border-border hover:border-brand/30',
                      ].join(' ')}
                    >
                      {'highlight' in p && p.highlight && (
                        <span className="absolute -top-2 right-2 text-[9px] uppercase tracking-wider bg-brand text-white font-bold px-1.5 py-0.5 rounded">
                          recomendado
                        </span>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm">{p.name}</span>
                        <span className="text-[11px] text-muted">
                          {p.price}
                        </span>
                      </div>
                      <div className="text-[11px] text-muted mt-1">
                        {p.description}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {error && (
              <div className="text-xs text-danger bg-danger/10 border border-danger/30 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 border-t pt-4">
              <Button
                type="submit"
                size="lg"
                disabled={bootstrap.isPending}
              >
                {bootstrap.isPending && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                {bootstrap.isPending ? 'Criando...' : 'Criar workspace'}
                {!bootstrap.isPending && <ArrowRight className="w-4 h-4" />}
              </Button>
            </div>
          </form>
        </Card>

        <div className="text-center text-[11px] text-muted">
          Convites do time, projetos e clientes você cadastra depois pelas
          próprias telas do app.
        </div>
      </div>
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
  if (msg.includes('duplicate key') && msg.includes('slug')) {
    return 'Esse slug já está em uso. Escolha outro.'
  }
  if (msg === 'invalid_name') return 'Nome inválido.'
  if (msg === 'invalid_slug') return 'Slug precisa ter no mínimo 3 caracteres.'
  if (msg === 'not_authenticated') return 'Sessão expirada. Faça login.'
  return msg
}
