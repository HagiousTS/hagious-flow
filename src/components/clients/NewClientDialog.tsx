import { useEffect, useState, type FormEvent } from 'react'
import { Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useCreateClient } from '@/hooks/useClients'

interface NewClientDialogProps {
  workspaceId: string
  open: boolean
  onClose: () => void
  onCreated?: (clientId: string) => void
}

export function NewClientDialog({
  workspaceId,
  open,
  onClose,
  onCreated,
}: NewClientDialogProps) {
  const create = useCreateClient()

  const [name, setName] = useState('')
  const [tradeName, setTradeName] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [contactName, setContactName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setName('')
    setTradeName('')
    setCnpj('')
    setContactName('')
    setContactEmail('')
    setContactPhone('')
    setNotes('')
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
    if (name.trim().length < 2) {
      setError('Nome (razão social) é obrigatório.')
      return
    }
    try {
      const c = await create.mutateAsync({
        workspaceId,
        name,
        trade_name: tradeName || null,
        cnpj: cnpj || null,
        contact_name: contactName || null,
        contact_email: contactEmail || null,
        contact_phone: contactPhone || null,
        notes: notes || null,
      })
      onCreated?.(c.id)
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
        className="bg-panel border rounded-2xl shadow-xl w-full max-w-xl my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="font-bold text-lg">Novo cliente</h2>
            <p className="text-xs text-muted mt-0.5">
              Cadastre um cliente. Você liga projetos a ele depois.
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
          <Field label="Razão social *">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
              className="input"
            />
          </Field>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="Nome fantasia">
              <input
                value={tradeName}
                onChange={(e) => setTradeName(e.target.value)}
                className="input"
              />
            </Field>
            <Field label="CNPJ">
              <input
                value={cnpj}
                onChange={(e) => setCnpj(e.target.value)}
                className="input font-mono"
                placeholder="00.000.000/0000-00"
              />
            </Field>
          </div>

          <div className="border-t pt-4 space-y-3">
            <div className="text-[11px] text-muted uppercase tracking-wider font-semibold">
              Contato principal
            </div>
            <Field label="Nome">
              <input
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="input"
              />
            </Field>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="Email">
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="input"
                />
              </Field>
              <Field label="Telefone">
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="input"
                />
              </Field>
            </div>
          </div>

          <Field label="Notas internas">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="input resize-y"
            />
          </Field>

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
              disabled={create.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {create.isPending ? 'Criando...' : 'Criar cliente'}
            </Button>
          </div>
        </form>
      </div>
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
