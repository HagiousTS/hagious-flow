import { useMemo, useState } from 'react'
import { Mail, MessageCircle, AppWindow, Slack, Phone } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { cn, getInitials } from '@/lib/utils'
import type { AcknowledgmentQueueItem } from '@/types/database'

type Tab = 'all' | 'urgent' | 'escalated'

interface AckQueueListProps {
  items: AcknowledgmentQueueItem[]
}

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  if (diffMs < 0) return 'agora'
  const min = Math.floor(diffMs / 60_000)
  if (min < 1) return 'agora'
  if (min < 60) return `há ${min}min`
  const h = Math.floor(min / 60)
  if (h < 24) return min % 60 === 0 ? `há ${h}h` : `há ${h}h${min % 60}min`
  const d = Math.floor(h / 24)
  return d === 1 ? 'há 1 dia' : `há ${d} dias`
}

const CHANNEL_META: Record<
  string,
  { label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  email: { label: 'Email', icon: Mail },
  slack: { label: 'Slack', icon: Slack },
  whatsapp: { label: 'WhatsApp', icon: MessageCircle },
  in_app: { label: 'Hagious Flow', icon: AppWindow },
  phone: { label: 'Telefone', icon: Phone },
}

export function AckQueueList({ items }: AckQueueListProps) {
  const [tab, setTab] = useState<Tab>('all')

  const counts = useMemo(() => {
    return {
      all: items.length,
      urgent: items.filter((i) => i.urgency_marked === 'urgent').length,
      escalated: items.filter((i) => i.is_escalated).length,
    }
  }, [items])

  const filtered = useMemo(() => {
    if (tab === 'urgent')
      return items.filter((i) => i.urgency_marked === 'urgent')
    if (tab === 'escalated') return items.filter((i) => i.is_escalated)
    return items
  }, [items, tab])

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-[15px]">Fila de acionamentos</h3>
            <span className="chip tag-info">{counts.all} aguardando</span>
          </div>
          <p className="text-xs text-muted mt-0.5">
            Tudo que tentou interromper o foco. Olha quando terminar — exceto o
            que já escalou.
          </p>
        </div>
        <div className="flex gap-1 text-xs border border-border rounded-lg p-0.5">
          <TabBtn active={tab === 'all'} onClick={() => setTab('all')}>
            Todos ({counts.all})
          </TabBtn>
          <TabBtn active={tab === 'urgent'} onClick={() => setTab('urgent')}>
            Urgentes ({counts.urgent})
          </TabBtn>
          <TabBtn
            active={tab === 'escalated'}
            onClick={() => setTab('escalated')}
          >
            Escalados ({counts.escalated})
          </TabBtn>
        </div>
      </div>

      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="text-center py-10 text-muted text-sm border border-dashed border-border rounded-xl">
            Nenhum acionamento nesta visão.
          </div>
        )}

        {filtered.map((item) => (
          <AckItem key={item.id} item={item} />
        ))}
      </div>
    </Card>
  )
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'px-3 py-1 rounded transition',
        active
          ? 'bg-panel2 font-semibold text-text'
          : 'text-muted hover:text-text'
      )}
    >
      {children}
    </button>
  )
}

function AckItem({ item }: { item: AcknowledgmentQueueItem }) {
  const isExternal = !!item.requester_external_name
  const requesterName =
    item.requester?.profile?.full_name ??
    item.requester_external_name ??
    'Desconhecido'
  const channel = CHANNEL_META[item.channel] ?? {
    label: item.channel,
    icon: AppWindow,
  }
  const ChannelIcon = channel.icon

  const urgencyChip =
    item.urgency_marked === 'urgent'
      ? { label: 'Marcou: Urgente', cls: 'tag-priority-mid' }
      : item.urgency_marked === 'can_wait'
        ? { label: 'Pode esperar', cls: 'tag-priority-low' }
        : null

  const escalatedName = item.escalated_to?.profile?.full_name ?? null

  return (
    <div
      className={cn(
        'border rounded-xl p-3 transition',
        item.is_escalated
          ? 'border-warn/30 bg-warn/5'
          : 'border-border hover:border-brand/40'
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0',
            isExternal
              ? 'bg-rose-500/20 text-rose-300'
              : 'bg-blue-500/20 text-blue-300'
          )}
          title={requesterName}
        >
          {getInitials(requesterName)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-[12px] font-semibold">{requesterName}</span>
            {isExternal && (
              <span className="chip tag-info">Cliente externo</span>
            )}
            {urgencyChip && (
              <span className={cn('chip', urgencyChip.cls)}>
                {urgencyChip.label}
              </span>
            )}
            {item.is_escalated && (
              <span className="chip tag-info">
                Escalado{escalatedName ? ` para ${escalatedName}` : ''}
              </span>
            )}
            <span className="text-[10px] text-muted flex items-center gap-1">
              <ChannelIcon className="w-3 h-3" /> {channel.label} ·{' '}
              {relativeTime(item.created_at)}
            </span>
          </div>
          {item.message && (
            <p className="text-[13px] leading-relaxed">{item.message}</p>
          )}
        </div>
      </div>
    </div>
  )
}
