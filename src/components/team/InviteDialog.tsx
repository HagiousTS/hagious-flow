import { useEffect, useState, type FormEvent } from 'react'
import { Check, Copy, Loader2, Mail, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import {
  useCreateInvitation,
  useInvitations,
} from '@/hooks/useInvitations'
import type {
  WorkspaceInvitation,
  WorkspaceInvitationRole,
} from '@/types/database'
import { relativeDays, cn } from '@/lib/utils'

interface InviteDialogProps {
  workspaceId: string
  open: boolean
  onClose: () => void
}

const ROLES: { value: WorkspaceInvitationRole; label: string }[] = [
  { value: 'member', label: 'Membro — operação' },
  { value: 'manager', label: 'Manager — gerencia time + projetos' },
  { value: 'viewer', label: 'Viewer — só leitura' },
]

function inviteUrl(token: string): string {
  if (typeof window === 'undefined') return ''
  return `${window.location.origin}/aceitar-convite/${token}`
}

export function InviteDialog({
  workspaceId,
  open,
  onClose,
}: InviteDialogProps) {
  const create = useCreateInvitation()
  const invites = useInvitations(workspaceId)

  const [email, setEmail] = useState('')
  const [role, setRole] = useState<WorkspaceInvitationRole>('member')
  const [error, setError] = useState<string | null>(null)
  const [lastCreated, setLastCreated] = useState<WorkspaceInvitation | null>(
    null
  )
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setEmail('')
    setRole('member')
    setError(null)
    setLastCreated(null)
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
    if (!email.includes('@')) {
      setError('Email inválido.')
      return
    }
    try {
      const inv = await create.mutateAsync({
        workspaceId,
        email: email.trim().toLowerCase(),
        role,
      })
      setLastCreated(inv)
      setEmail('')
    } catch (err) {
      setError(translate((err as Error).message))
    }
  }

  async function copy(token: string) {
    try {
      await navigator.clipboard.writeText(inviteUrl(token))
      setCopied(token)
      setTimeout(() => setCopied(null), 2000)
    } catch {
      // clipboard pode estar bloqueado em alguns contextos
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-start justify-center overflow-y-auto p-4"
      onClick={onClose}
    >
      <div
        className="bg-panel border rounded-2xl shadow-xl w-full max-w-xl my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="font-bold text-lg">Convidar membros</h2>
            <p className="text-xs text-muted mt-0.5">
              Gera um link de convite. Copie e envie por WhatsApp/email pra
              pessoa.
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
          <div className="grid grid-cols-1 md:grid-cols-[1fr_220px] gap-3">
            <div>
              <label className="text-[11px] text-muted uppercase tracking-wider mb-1 block font-semibold">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input pl-9"
                  placeholder="pessoa@empresa.com"
                />
              </div>
            </div>
            <div>
              <label className="text-[11px] text-muted uppercase tracking-wider mb-1 block font-semibold">
                Papel
              </label>
              <select
                value={role}
                onChange={(e) =>
                  setRole(e.target.value as WorkspaceInvitationRole)
                }
                className="input"
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div className="text-xs text-danger bg-danger/10 border border-danger/30 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          {lastCreated && (
            <div className="bg-brand/5 border border-brand/30 rounded-lg p-3 space-y-2">
              <div className="text-xs font-semibold text-brand flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                Convite criado para {lastCreated.email}
              </div>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-[11px] bg-panel2 rounded px-2 py-1.5 truncate font-mono">
                  {inviteUrl(lastCreated.token)}
                </code>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => copy(lastCreated.token)}
                >
                  {copied === lastCreated.token ? (
                    <>
                      <Check className="w-3 h-3" />
                      Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      Copiar
                    </>
                  )}
                </Button>
              </div>
              <div className="text-[10px] text-muted">
                Válido por 14 dias. Quem abrir precisa entrar com este email
                exato.
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 border-t pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={create.isPending}
            >
              Fechar
            </Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              {create.isPending ? 'Gerando...' : 'Gerar convite'}
            </Button>
          </div>
        </form>

        <div className="border-t px-6 py-4 space-y-2 max-h-72 overflow-y-auto">
          <div className="text-[11px] text-muted uppercase tracking-wider font-semibold">
            Convites pendentes
          </div>
          {invites.isLoading ? (
            <div className="text-xs text-muted">Carregando...</div>
          ) : (invites.data ?? []).length === 0 ? (
            <div className="text-xs text-muted italic">
              Nenhum convite pendente.
            </div>
          ) : (
            (invites.data ?? []).map((inv) => (
              <div
                key={inv.id}
                className="flex items-center gap-2 bg-panel2 rounded-lg px-3 py-2"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate">
                    {inv.email}
                  </div>
                  <div className="text-[10px] text-muted">
                    {inv.role} · expira {relativeDays(inv.expires_at)}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => copy(inv.token)}
                  className={cn(copied === inv.token && 'border-brand/50')}
                >
                  {copied === inv.token ? (
                    <>
                      <Check className="w-3 h-3" />
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                    </>
                  )}
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function translate(msg: string): string {
  if (msg.includes('forbidden')) return 'Você não tem permissão para convidar.'
  if (msg.includes('invalid_email')) return 'Email inválido.'
  if (msg.includes('invalid_role')) return 'Papel inválido.'
  if (msg.includes('not_authenticated')) return 'Sessão expirada. Faça login.'
  if (msg.toLowerCase().includes('duplicate'))
    return 'Já existe um convite para esse email.'
  return msg
}
