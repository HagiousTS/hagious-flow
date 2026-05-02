import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, User as UserIcon, Loader2, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'

export function SignupPage() {
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [needsConfirmation, setNeedsConfirmation] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (password.length < 8) {
      setError('Senha precisa ter no mínimo 8 caracteres.')
      setLoading(false)
      return
    }
    if (fullName.trim().length < 2) {
      setError('Informe seu nome completo.')
      setLoading(false)
      return
    }

    const { data, error } = await signUp(email, password, fullName.trim())
    setLoading(false)

    if (error) {
      setError(translateError(error.message))
      return
    }

    if (data.session) {
      let pendingInvite: string | null = null
      try {
        pendingInvite = localStorage.getItem('hagious.pendingInvitationToken')
      } catch {
        // localStorage indisponível
      }
      if (pendingInvite) {
        navigate(`/aceitar-convite/${pendingInvite}`, { replace: true })
      } else {
        navigate('/onboarding', { replace: true })
      }
    } else {
      setNeedsConfirmation(true)
    }
  }

  if (needsConfirmation) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md card p-6 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl grad-brand flex items-center justify-center">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <h2 className="font-bold text-lg">Confirme seu email</h2>
          <p className="text-sm text-muted">
            Enviamos um link de confirmação para{' '}
            <strong className="text-text">{email}</strong>. Clique no link para
            ativar sua conta e voltar aqui pra entrar.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm text-brand hover:underline mt-4"
          >
            <ArrowLeft className="w-3 h-3" />
            Voltar para login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 rounded-2xl grad-brand flex items-center justify-center font-bold text-white text-xl">
              H
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Criar conta no <span className="grad-text">Hagious Flow</span>
          </h1>
          <p className="text-sm text-muted mt-1">
            Trial grátis. Você cria seu workspace na próxima tela.
          </p>
        </div>

        <div className="card p-6 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            <Field icon={UserIcon} label="Nome completo">
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                autoFocus
                className="input pl-9"
                placeholder="Gusttavo Lopes"
              />
            </Field>
            <Field icon={Mail} label="Email">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input pl-9"
                placeholder="voce@empresa.com"
              />
            </Field>
            <Field icon={Lock} label="Senha (mínimo 8 caracteres)">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="input pl-9"
              />
            </Field>

            {error && (
              <div className="text-xs text-danger bg-danger/10 border border-danger/30 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Criando conta...' : 'Criar conta'}
            </Button>
          </form>

          <div className="text-center pt-2 border-t">
            <p className="text-xs text-muted mt-3">
              Já tem conta?{' '}
              <Link to="/login" className="text-brand hover:underline">
                Entrar
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="text-xs font-medium text-muted block mb-1">
        {label}
      </label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none z-10" />
        {children}
      </div>
    </div>
  )
}

function translateError(msg: string): string {
  if (msg.toLowerCase().includes('already registered')) {
    return 'Esse email já tem uma conta. Faça login.'
  }
  if (msg.toLowerCase().includes('password')) {
    return 'Senha inválida. Use no mínimo 8 caracteres.'
  }
  return msg
}
