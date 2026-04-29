import { Check, RotateCcw, Inbox } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'
import type { ServiceOrder } from '@/types/database'
import { SourceIcon } from './SourceIcon'
import { DoRRing } from './DoRRing'

interface OSDetailProps {
  order: ServiceOrder | null
}

const PRIORITY_LABELS: Record<string, { label: string; cls: string }> = {
  P1: { label: 'P1 · Crítico', cls: 'tag-priority-high' },
  P2: { label: 'P2 · Importante', cls: 'tag-priority-mid' },
  P3: { label: 'P3 · Normal', cls: 'tag-priority-low' },
}

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  received: { label: 'Recebida · em fila', cls: 'tag-status-todo' },
  triaged: { label: 'Em triagem', cls: 'tag-status-doing' },
  refined: { label: 'Em refinamento', cls: 'tag-status-doing' },
  accepted: { label: 'Aceita', cls: 'tag-status-done' },
  returned: { label: 'Devolvida', cls: 'tag-status-block' },
  rejected: { label: 'Rejeitada', cls: 'tag-status-block' },
}

function fullDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

function shortCode(id: string): string {
  return `OS-${id.slice(0, 8).toUpperCase()}`
}

export function OSDetail({ order }: OSDetailProps) {
  if (!order) {
    return (
      <section className="overflow-y-auto scrollbar h-full">
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
          <Inbox className="w-12 h-12 text-muted mb-3" />
          <h3 className="text-base font-semibold mb-1">Nenhuma OS selecionada</h3>
          <p className="text-sm text-muted max-w-sm">
            Escolha uma OS na lista para revisar o conteúdo, qualidade e decidir se aceita ou
            devolve.
          </p>
        </div>
      </section>
    )
  }

  const prio = order.priority ? PRIORITY_LABELS[order.priority] : null
  const status = STATUS_LABELS[order.status] ?? null
  const issues = parseIssues(order.quality_issues_json)

  return (
    <section className="overflow-y-auto scrollbar h-full">
      <div className="p-8 space-y-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand/15 text-brand flex items-center justify-center shrink-0">
            <SourceIcon channel={order.source_channel} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-mono text-[11px] text-muted">{shortCode(order.id)}</span>
              {prio && <span className={cn('chip', prio.cls)}>{prio.label}</span>}
              {order.template?.name && (
                <span className="chip tag-info">{order.template.name}</span>
              )}
              {status && <span className={cn('chip', status.cls)}>{status.label}</span>}
            </div>
            <h2 className="text-xl font-bold leading-tight">
              {order.client?.name ? `${order.client.name} · ` : ''}
              {order.subject}
            </h2>
            <div className="flex items-center gap-3 text-[12px] text-muted mt-2 flex-wrap">
              {order.source_ref && <span>Ref: {order.source_ref}</span>}
              {order.requester_name && <span>· {order.requester_name}</span>}
              {order.requester_email && <span>· {order.requester_email}</span>}
              <span>· recebida {fullDate(order.created_at)}</span>
            </div>
          </div>
        </div>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold text-[14px]">Definition of Ready</h3>
              <p className="text-[11px] text-muted">
                Score calculado pela IA com base no template e nos campos preenchidos.
              </p>
            </div>
            <DoRRing
              score={order.quality_score == null ? null : Number(order.quality_score)}
              size={44}
            />
          </div>

          {issues.length > 0 ? (
            <ul className="space-y-1.5">
              {issues.map((iss, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-[12px] text-muted bg-panel2/40 border border-border rounded-md px-3 py-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-warn mt-1.5 shrink-0" />
                  <span>{iss}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[12px] text-muted">Nenhum problema identificado pela IA.</p>
          )}
        </Card>

        <Card className="p-0 overflow-hidden">
          <div className="px-5 py-3 border-b border-border bg-panel2/40 flex items-center justify-between">
            <h3 className="font-semibold text-[14px]">Conteúdo da OS</h3>
            <span className="text-[11px] text-muted">{order.source_channel}</span>
          </div>
          <div className="px-5 py-4 space-y-3 text-[13px] leading-relaxed">
            <FieldRow label="Assunto" value={order.subject} />
            <FieldRow
              label="Solicitante"
              value={
                order.requester_name
                  ? `${order.requester_name}${
                      order.requester_email ? ` · ${order.requester_email}` : ''
                    }`
                  : '—'
              }
            />
            {order.client?.name && <FieldRow label="Cliente" value={order.client.name} />}
            <FieldRow
              label="SLA"
              value={
                order.sla_due_at
                  ? `Resposta até ${fullDate(order.sla_due_at)}`
                  : 'Sem SLA definido'
              }
            />
            <FieldRow
              label="Conteúdo"
              value={
                order.raw_body ? (
                  <span className="whitespace-pre-line">{order.raw_body}</span>
                ) : (
                  <span className="italic text-muted">Sem corpo da mensagem.</span>
                )
              }
            />
          </div>
        </Card>

        {order.return_reason && (
          <Card className="p-5 border-danger/30">
            <h3 className="font-semibold text-[14px] mb-2 text-danger">Motivo da devolução</h3>
            <p className="text-[13px] text-muted whitespace-pre-line">{order.return_reason}</p>
          </Card>
        )}

        <Card className="p-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled
            className="grad-brand text-white px-4 py-3 rounded-xl opacity-60 cursor-not-allowed font-semibold flex items-center justify-center gap-2"
            title="Mutação será implementada na próxima iteração"
          >
            <Check className="w-4 h-4" />
            Aceitar · converter em task
          </button>
          <button
            type="button"
            disabled
            className="bg-panel2 border border-border px-4 py-3 rounded-xl opacity-60 cursor-not-allowed flex items-center justify-center gap-2 text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            Devolver com motivo
          </button>
        </Card>
      </div>
    </section>
  )
}

function FieldRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <div className="text-[11px] text-muted uppercase tracking-wider min-w-[110px] pt-0.5 font-semibold">
        {label}
      </div>
      <div className="flex-1 min-w-0">{value}</div>
    </div>
  )
}

function parseIssues(raw: unknown): string[] {
  if (!raw) return []
  if (Array.isArray(raw)) {
    return raw
      .map((item) => {
        if (typeof item === 'string') return item
        if (item && typeof item === 'object') {
          const obj = item as Record<string, unknown>
          if (typeof obj.message === 'string') return obj.message
          if (typeof obj.label === 'string') return obj.label
          if (typeof obj.field === 'string') return obj.field
        }
        return null
      })
      .filter((x): x is string => !!x)
  }
  if (typeof raw === 'object') {
    const obj = raw as Record<string, unknown>
    if (Array.isArray(obj.issues)) return parseIssues(obj.issues)
    if (Array.isArray(obj.missing)) return parseIssues(obj.missing)
  }
  return []
}
