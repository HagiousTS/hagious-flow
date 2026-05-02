import { useState, type FormEvent } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Mail, Lock, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'

export function LoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/'

  const [email, setEmail] = useState('gusttavo@hagious.com.br')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) {
      setError(
        error.message === 'Invalid login credentials'
          ? 'Email ou senha incorretos.'
          : error.message
      )
      return
    }
    navigate(from, { replace: true })
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
            Hagious <span className="grad-text">Flow</span>
          </h1>
          <p className="text-sm text-muted mt-1">
            Sistema operacional para consultorias técnicas
          </p>
        </div>

        <div className="card p-6 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted block mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  className="w-full bg-panel2 border rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-brand"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted block mb-1">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-panel2 border rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-brand"
                />
              </div>
            </div>

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
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          <div className="text-center pt-2 border-t space-y-2">
            <p className="text-xs text-muted mt-3">
              Não tem conta?{' '}
              <Link to="/signup" className="text-brand hover:underline">
                Criar agora
              </Link>
            </p>
            <p className="text-[11px] text-muted">
              Demo:{' '}
              <code className="bg-panel2 px-1.5 py-0.5 rounded">
                gusttavo@hagious.com.br
              </code>{' '}
              ·{' '}
              <code className="bg-panel2 px-1.5 py-0.5 rounded">
                Hagious@2026
              </code>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
