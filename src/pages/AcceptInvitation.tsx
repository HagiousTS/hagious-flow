import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  AlertOctagon,
  ArrowRight,
  Building2,
  Check,
  Loader2,
  Mail,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useSetActiveWorkspace } from '@/hooks/useWorkspace'
import {
  useAcceptInvitation,
  usePreviewInvitation,
} from '@/hooks/useInvitations'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { relativeDays } from '@/lib/utils'

const STORAGE_KEY = 'hagious.pendingInvitationToken'

export function AcceptInvitationPage() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const setActive = useSetActiveWorkspace()
  const preview = usePreviewInvitation(token)
  const accept = useAcceptInvitation()

  const [error, setError] = useState<string | null>(null)
  const [accepted, setAccepted] = useState(false)

  // Persiste token pra sobreviver ao redirect via login/signup
  useEffect(() => {
    if (!token) return
    try {
      localStorage.setItem(STORAGE_KEY, token)
    } catch {
      // localStorage indisponível
    }
  }, [token])

  // Auto-aceita assim que tiver auth + preview válido
  useEffect(() => {
    if (
      !token ||
      authLoading ||
      !user ||
      !preview.data ||
      accept.isPending ||
      accepted
    )
      return
    if (preview.data.accepted_at) {
      // já aceito; só redireciona
      try {
        localStorage.removeItem(STORAGE_KEY)
      } catch {
        // ignore
      }
      setAccepted(true)
      return
    }
    if (
      user.email &&
      preview.data.email.toLowerCase() !== user.email.toLowerCase()
    ) {
      setError(
        `Este convite foi enviado para ${preview.data.email}, mas você está logado como ${user.email}.`
      )
      return
    }
    accept
      .mutateAsync(token)
      .then((ws) => {
        setActive(ws.id)
        setAccepted(true)
        try {
          localStorage.removeItem(STORAGE_KEY)
        } catch {
          // ignore
        }
      })
      .catch((err) => {
        setError(translate((err as Error).message))
      })
  }, [
    token,
    authLoading,
    user,
    preview.data,
    accept,
    accepted,
    setActive,
  ])

  // Após aceitar, manda pro dashboard
  useEffect(() => {
    if (!accepted) return
    const timer = setTimeout(() => navigate('/', { replace: true }), 1200)
    return () => clearTimeout(timer)
  }, [accepted, navigate])

  if (!token) {
    return shell(
      <div className="text-center space-y-3">
        <AlertOctagon className="w-10 h-10 mx-auto text-danger" />
        <h2 className="font-bold">Token de convite ausente</h2>
        <Link to="/login" className="text-sm text-brand hover:underline">
          Voltar para login
        </Link>
      </div>
    )
  }

  if (preview.isLoading || authLoading) {
    return shell(
      <div className="text-center py-6">
        <Loader2 className="w-6 h-6 animate-spin text-brand mx-auto" />
        <div className="text-xs text-muted mt-2">Validando convite...</div>
      </div>
    )
  }

  if (preview.isError || !preview.data) {
    return shell(
      <div className="text-center space-y-3">
        <AlertOctagon className="w-10 h-10 mx-auto text-danger" />
        <h2 className="font-bold">Convite não encontrado</h2>
        <p className="text-sm text-muted">
          O link pode ter expirado ou ter sido revogado. Peça um novo ao
          administrador do workspace.
        </p>
        <Link to="/login" className="text-sm text-brand hover:underline">
          Voltar para login
        </Link>
      </div>
    )
  }

  const data = preview.data
  const expired = new Date(data.expires_at) < new Date()
  const alreadyAccepted = !!data.accepted_at

  if (!user) {
    // Sem auth: oferecer login ou signup
    return shell(
      <div className="space-y-4">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl grad-brand flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <h2 className="font-bold text-lg">
            Você foi convidado para{' '}
            <span className="grad-text">{data.workspace_name}</span>
          </h2>
          <p className="text-sm text-muted">
            Convite enviado para{' '}
            <span className="font-semibold text-text">{data.email}</span> ·
            papel <span className="font-mono text-[11px]">{data.role}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/login" className="flex-1">
            <Button variant="outline" className="w-full" size="lg">
              Já tenho conta
            </Button>
          </Link>
          <Link to="/signup" className="flex-1">
            <Button className="w-full" size="lg">
              Criar conta
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
        <p className="text-[11px] text-muted text-center">
          Use o email <strong>{data.email}</strong>. Após entrar, o convite é
          aceito automático.
        </p>
      </div>
    )
  }

  if (alreadyAccepted) {
    return shell(
      <div className="text-center space-y-3">
        <Check className="w-10 h-10 mx-auto text-brand" />
        <h2 className="font-bold">Convite já aceito</h2>
        <p className="text-sm text-muted">
          Você já faz parte de{' '}
          <span className="font-semibold text-text">
            {data.workspace_name}
          </span>
          . Te levo pro dashboard.
        </p>
      </div>
    )
  }

  if (expired) {
    return shell(
      <div className="text-center space-y-3">
        <AlertOctagon className="w-10 h-10 mx-auto text-warn" />
        <h2 className="font-bold">Convite expirado</h2>
        <p className="text-sm text-muted">
          Esse convite expirou {relativeDays(data.expires_at)}. Peça um novo ao
          administrador do workspace.
        </p>
      </div>
    )
  }

  if (error) {
    return shell(
      <div className="text-center space-y-3">
        <AlertOctagon className="w-10 h-10 mx-auto text-danger" />
        <h2 className="font-bold">Não foi possível aceitar</h2>
        <p className="text-sm text-muted">{error}</p>
        <Link to="/" className="text-sm text-brand hover:underline">
          Voltar
        </Link>
      </div>
    )
  }

  if (accept.isPending) {
    return shell(
      <div className="text-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-brand mx-auto" />
        <h2 className="font-bold">Entrando em {data.workspace_name}...</h2>
      </div>
    )
  }

  if (accepted) {
    return shell(
      <div className="text-center space-y-3">
        <Check className="w-10 h-10 mx-auto text-brand" />
        <h2 className="font-bold">Bem-vindo a {data.workspace_name}!</h2>
        <p className="text-sm text-muted">Redirecionando pro dashboard...</p>
      </div>
    )
  }

  // Estado intermediário (preview pronto, ainda não disparou aceite)
  return shell(
    <div className="text-center space-y-3">
      <Mail className="w-10 h-10 mx-auto text-muted" />
      <h2 className="font-bold">Aceitando convite...</h2>
    </div>
  )
}

function shell(content: React.ReactNode) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Card className="p-6">{content}</Card>
      </div>
    </div>
  )
}

function translate(msg: string): string {
  if (msg.includes('email_mismatch'))
    return 'Esse convite foi enviado para outro email. Faça logout e entre com o email correto.'
  if (msg.includes('expired')) return 'Convite expirado.'
  if (msg.includes('already_accepted')) return 'Convite já aceito.'
  if (msg.includes('invitation_not_found')) return 'Convite não encontrado.'
  if (msg.includes('not_authenticated')) return 'Sessão expirada. Faça login.'
  return msg
}
