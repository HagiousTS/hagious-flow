import { useMemo, useState } from 'react'
import { Check, Loader2, Sparkles, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import {
  useAIActions,
  useApplyAIAction,
  useRejectAIAction,
} from '@/hooks/useAIActions'
import type {
  AIActionStatus,
  AIActionType,
  AIToolCallProposal,
} from '@/types/database'
import { cn } from '@/lib/utils'

interface ActionProposalsProps {
  proposals: AIToolCallProposal[]
}

const ACTION_LABEL: Record<string, string> = {
  create_task: 'Criar task',
  mark_task_blocked: 'Marcar como bloqueada',
  update_task_priority: 'Mudar prioridade',
  escalate_os: 'Triagear OS',
  complete_task: 'Concluir task',
  reassign_task: 'Trocar responsável',
  create_risk: 'Registrar risco',
  accept_os: 'Aceitar OS',
}

const STATUS_LABEL: Record<AIActionStatus, string> = {
  proposed: 'Proposta',
  pending: 'Pendente',
  applied: 'Aplicada',
  rejected: 'Rejeitada',
  failed: 'Falhou',
}

const STATUS_CLS: Record<AIActionStatus, string> = {
  proposed: 'bg-info/15 text-info',
  pending: 'bg-info/15 text-info',
  applied: 'bg-brand/15 text-brand',
  rejected: 'bg-panel2 text-muted',
  failed: 'bg-danger/15 text-danger',
}

export function ActionProposals({ proposals }: ActionProposalsProps) {
  const ids = useMemo(() => proposals.map((p) => p.action_id), [proposals])
  const { data: actions } = useAIActions(ids)

  if (proposals.length === 0) return null

  return (
    <div className="space-y-2 mt-2">
      {proposals.map((p) => {
        const action = actions?.find((a) => a.id === p.action_id)
        return (
          <ActionCard
            key={p.action_id}
            proposal={p}
            status={action?.status ?? 'proposed'}
            errorMessage={action?.error_message ?? null}
          />
        )
      })}
    </div>
  )
}

function ActionCard({
  proposal,
  status,
  errorMessage,
}: {
  proposal: AIToolCallProposal
  status: AIActionStatus
  errorMessage: string | null
}) {
  const apply = useApplyAIAction()
  const reject = useRejectAIAction()
  const [localError, setLocalError] = useState<string | null>(null)

  const isPending = apply.isPending || reject.isPending
  const isFinal = status === 'applied' || status === 'rejected' || status === 'failed'
  const label = ACTION_LABEL[proposal.name] ?? proposal.name

  async function handleApprove() {
    setLocalError(null)
    try {
      await apply.mutateAsync(proposal.action_id)
    } catch (err) {
      setLocalError((err as Error).message)
    }
  }

  async function handleReject() {
    setLocalError(null)
    try {
      await reject.mutateAsync(proposal.action_id)
    } catch (err) {
      setLocalError((err as Error).message)
    }
  }

  return (
    <div
      className={cn(
        'border rounded-xl p-3 bg-panel/60',
        status === 'applied' && 'border-brand/40 bg-brand/5',
        status === 'rejected' && 'opacity-60',
        status === 'failed' && 'border-danger/40 bg-danger/5'
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-3.5 h-3.5 text-brand shrink-0" />
        <span className="text-[11px] font-bold uppercase tracking-wider text-muted">
          IA propôs
        </span>
        <span className="text-sm font-semibold flex-1 truncate">{label}</span>
        <span
          className={cn(
            'text-[10px] uppercase px-1.5 py-0.5 rounded font-bold tracking-wider',
            STATUS_CLS[status]
          )}
        >
          {STATUS_LABEL[status]}
        </span>
      </div>

      <PayloadView name={proposal.name as AIActionType} input={proposal.input} />

      {(localError || (status === 'failed' && errorMessage)) && (
        <div className="text-[11px] text-danger mt-2 bg-danger/10 border border-danger/30 rounded px-2 py-1">
          {localError ?? errorMessage}
        </div>
      )}

      {!isFinal && (
        <div className="flex items-center gap-2 mt-3">
          <Button
            size="sm"
            onClick={handleApprove}
            disabled={isPending}
            className="flex-1"
          >
            {apply.isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Check className="w-3.5 h-3.5" />
            )}
            Aprovar
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleReject}
            disabled={isPending}
          >
            {reject.isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <X className="w-3.5 h-3.5" />
            )}
            Rejeitar
          </Button>
        </div>
      )}
    </div>
  )
}

function PayloadView({
  name,
  input,
}: {
  name: AIActionType
  input: Record<string, unknown>
}) {
  const entries = Object.entries(input).filter(([, v]) => v != null && v !== '')
  if (entries.length === 0) {
    return (
      <div className="text-[11px] text-muted italic">
        Sem payload — execução padrão de {name}.
      </div>
    )
  }
  return (
    <dl className="grid grid-cols-[100px_1fr] gap-x-3 gap-y-1 text-[11px]">
      {entries.map(([k, v]) => (
        <DLRow key={k} label={k} value={v} />
      ))}
    </dl>
  )
}

function DLRow({ label, value }: { label: string; value: unknown }) {
  const display =
    typeof value === 'string' || typeof value === 'number'
      ? String(value)
      : JSON.stringify(value)
  const looksUuid =
    typeof value === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      value
    )
  return (
    <>
      <dt className="text-muted uppercase tracking-wider text-[10px]">
        {label}
      </dt>
      <dd
        className={cn(
          'truncate',
          looksUuid && 'font-mono text-[10px] text-muted'
        )}
        title={display}
      >
        {display}
      </dd>
    </>
  )
}
