import { cn } from '@/lib/utils'
import type { ServiceOrder } from '@/types/database'
import { SourceIcon } from './SourceIcon'
import { DoRRing } from './DoRRing'

interface OSCardProps {
  order: ServiceOrder
  selected?: boolean
  onClick?: () => void
}

function shortCode(id: string): string {
  return `OS-${id.slice(0, 8).toUpperCase()}`
}

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  if (diffMs < 0) return 'agora'
  const min = Math.floor(diffMs / 60_000)
  if (min < 1) return 'agora'
  if (min < 60) return `há ${min}min`
  const h = Math.floor(min / 60)
  if (h < 24) return `há ${h}h`
  const d = Math.floor(h / 24)
  return d === 1 ? 'há 1 dia' : `há ${d} dias`
}

function priorityChip(priority: string | null): { label: string; cls: string } {
  switch (priority) {
    case 'P1':
      return { label: 'P1 · Crítico', cls: 'tag-priority-high' }
    case 'P2':
      return { label: 'P2', cls: 'tag-priority-mid' }
    case 'P3':
      return { label: 'P3', cls: 'tag-priority-low' }
    default:
      return { label: '—', cls: 'tag-status-todo' }
  }
}

function slaChip(order: ServiceOrder): { label: string; cls: string } | null {
  if (!order.sla_due_at) return null
  if (order.status === 'accepted' || order.status === 'returned') return null
  const diffMs = new Date(order.sla_due_at).getTime() - Date.now()
  if (diffMs < 0) {
    return { label: '⚠ SLA estourado', cls: 'tag-priority-high' }
  }
  const totalMin = Math.floor(diffMs / 60_000)
  if (totalMin < 240) {
    const h = Math.floor(totalMin / 60)
    const m = totalMin % 60
    return { label: `⚠ SLA: faltam ${h}h${m}min`, cls: 'tag-priority-high' }
  }
  return null
}

function statusChip(status: string): { label: string; cls: string } | null {
  if (status === 'accepted')
    return { label: '✓ Aceita', cls: 'tag-status-done' }
  if (status === 'returned')
    return { label: '↩ Devolvida', cls: 'tag-status-block' }
  if (status === 'triaged')
    return { label: 'Em triagem', cls: 'tag-status-doing' }
  return null
}

export function OSCard({ order, selected, onClick }: OSCardProps) {
  const prio = priorityChip(order.priority)
  const sla = slaChip(order)
  const status = statusChip(order.status)
  const dimmed = order.status === 'accepted' || order.status === 'returned'

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full text-left card p-4 transition card-hover',
        selected && 'border-brand shadow-[0_0_0_1px_var(--brand)]',
        dimmed && 'opacity-70'
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <SourceIcon channel={order.source_channel} />
          <span className="font-mono text-[10px] text-muted">
            {shortCode(order.id)}
          </span>
        </div>
        <span className={cn('chip', prio.cls)}>{prio.label}</span>
      </div>

      <h3 className="text-[14px] font-semibold leading-snug mb-2 line-clamp-2">
        {order.client?.name ? `${order.client.name} · ` : ''}
        {order.subject}
      </h3>

      <div className="flex items-center justify-between mt-3">
        <div className="text-[11px] text-muted">
          {order.requester_name ?? 'Sem solicitante'} ·{' '}
          {relativeTime(order.created_at)}
        </div>
        <DoRRing
          score={
            order.quality_score == null ? null : Number(order.quality_score)
          }
        />
      </div>

      {(sla || status) && (
        <div className="flex flex-wrap gap-1 mt-2">
          {sla && <span className={cn('chip', sla.cls)}>{sla.label}</span>}
          {status && (
            <span className={cn('chip', status.cls)}>{status.label}</span>
          )}
        </div>
      )}
    </button>
  )
}
