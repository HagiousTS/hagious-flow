import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ServiceOrder, ServiceOrderStatus } from '@/types/database'
import { OSCard } from './OSCard'

type FilterTab = 'all' | 'received' | 'triaged' | 'returned'

interface OSListProps {
  orders: ServiceOrder[]
  selectedId: string | null
  onSelect: (id: string) => void
}

const TABS: {
  id: FilterTab
  label: string
  matches: (s: ServiceOrderStatus) => boolean
}[] = [
  { id: 'all', label: 'Todas', matches: () => true },
  { id: 'received', label: 'Recebidas', matches: (s) => s === 'received' },
  {
    id: 'triaged',
    label: 'Em triagem',
    matches: (s) => s === 'triaged' || s === 'refined',
  },
  { id: 'returned', label: 'Devolvidas', matches: (s) => s === 'returned' },
]

export function OSList({ orders, selectedId, onSelect }: OSListProps) {
  const [tab, setTab] = useState<FilterTab>('all')
  const [search, setSearch] = useState('')

  const counts = useMemo(() => {
    const c: Record<FilterTab, number> = {
      all: 0,
      received: 0,
      triaged: 0,
      returned: 0,
    }
    for (const o of orders) {
      c.all += 1
      for (const t of TABS) {
        if (t.id === 'all') continue
        if (t.matches(o.status)) c[t.id] += 1
      }
    }
    return c
  }, [orders])

  const filtered = useMemo(() => {
    const tabDef = TABS.find((t) => t.id === tab) ?? TABS[0]
    const q = search.trim().toLowerCase()
    return orders.filter((o) => {
      if (!tabDef.matches(o.status)) return false
      if (!q) return true
      return (
        o.subject.toLowerCase().includes(q) ||
        (o.client?.name ?? '').toLowerCase().includes(q) ||
        (o.requester_name ?? '').toLowerCase().includes(q) ||
        o.id.toLowerCase().includes(q)
      )
    })
  }, [orders, tab, search])

  const { recent, triagedRecent } = useMemo(() => {
    const recent: ServiceOrder[] = []
    const triagedRecent: ServiceOrder[] = []
    for (const o of filtered) {
      if (o.status === 'accepted' || o.status === 'returned')
        triagedRecent.push(o)
      else recent.push(o)
    }
    return { recent, triagedRecent }
  }, [filtered])

  return (
    <section className="border-r border-border overflow-y-auto scrollbar h-full">
      <div className="p-4 sticky top-0 bg-bg/85 backdrop-blur z-10 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar OS..."
              className="w-full bg-panel border border-border rounded-lg pl-8 pr-3 py-1.5 text-xs placeholder:text-muted focus:outline-none focus:border-brand"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-1 text-xs">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'px-3 py-1 rounded-full transition',
                tab === t.id
                  ? 'bg-panel2 border border-brand/40 font-semibold text-text'
                  : 'text-muted hover:text-text'
              )}
            >
              {t.label} ({counts[t.id]})
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-2.5">
        {recent.length === 0 && triagedRecent.length === 0 && (
          <div className="text-center py-12 text-muted text-sm">
            Nenhuma OS nesta visão.
          </div>
        )}

        {recent.map((o) => (
          <OSCard
            key={o.id}
            order={o}
            selected={o.id === selectedId}
            onClick={() => onSelect(o.id)}
          />
        ))}

        {triagedRecent.length > 0 && (
          <div className="text-[10px] text-muted uppercase tracking-wider font-semibold pt-4 pb-1 px-2">
            Recentemente triadas
          </div>
        )}

        {triagedRecent.map((o) => (
          <OSCard
            key={o.id}
            order={o}
            selected={o.id === selectedId}
            onClick={() => onSelect(o.id)}
          />
        ))}
      </div>
    </section>
  )
}
