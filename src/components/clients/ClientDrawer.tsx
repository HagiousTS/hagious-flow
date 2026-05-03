import { useEffect, useState, type FormEvent } from 'react'
import { Check, Loader2, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import {
  useDeleteClient,
  useUpdateClient,
  type ClientRow,
} from '@/hooks/useClients'
import { cn } from '@/lib/utils'

interface ClientDrawerProps {
  row: ClientRow | null
  workspaceId: string
  onClose: () => void
}

export function ClientDrawer({ row, workspaceId, onClose }: ClientDrawerProps) {
  const update = useUpdateClient()
  const del = useDeleteClient(workspaceId)

  const [name, setName] = useState('')
  const [tradeName, setTradeName] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [contactName, setContactName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!row) return
    const c = row.client
    setName(c.name)
    setTradeName(c.trade_name ?? '')
    setCnpj(c.cnpj ?? '')
    setContactName(c.contact_name ?? '')
    setContactEmail(c.contact_email ?? '')
    setContactPhone(c.contact_phone ?? '')
    setNotes(c.notes ?? '')
    setIsActive(c.is_active)
    setError(null)
    setSaved(false)
  }, [row])

  useEffect(() => {
    if (!row) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [row, onClose])

  if (!row) return null

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    if (!row) return
    setError(null)
    if (name.trim().length < 2) {
      setError('Nome é obrigatório.')
      return
    }
    try {
      await update.mutateAsync({
        workspaceId,
        clientId: row.client.id,
        patch: {
          name,
          trade_name: tradeName.trim() || null,
          cnpj: cnpj.trim() || null,
          contact_name: contactName.trim() || null,
          contact_email: contactEmail.trim() || null,
          contact_phone: contactPhone.trim() || null,
          notes: notes.trim() || null,
          is_active: isActive,
        },
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 1500)
    } catch (err) {
      setError((err as Error).message)
    }
  }

  async function handleDelete() {
    if (!row) return
    if (
      !confirm(
        `Excluir o cliente ${row.client.name}? Soft delete — projetos vinculados continuam, mas o cliente some das listagens. Pode ser revertido no banco.`
      )
    )
      return
    try {
      await del.mutateAsync(row.client.id)
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
        className="absolute right-0 top-0 h-full w-full max-w-[480px] bg-panel border-l shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between px-5 py-3 border-b">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm font-semibold truncate">
              {row.client.trade_name ?? row.client.name}
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
          <Field label="Razão social *">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
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
              rows={3}
              className="input resize-y"
              placeholder="Histórico, preferências, contratos..."
            />
          </Field>

          <label className="flex items-center gap-2 cursor-pointer border-t pt-4">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            <span className="text-sm">
              Cliente ativo
              <span className="text-[11px] text-muted ml-2">
                {isActive
                  ? 'Aparece nas listagens'
                  : 'Some das listagens (mas projetos seguem ativos)'}
              </span>
            </span>
          </label>

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
            title="Excluir cliente (soft delete)"
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
