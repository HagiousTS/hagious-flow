import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { useWorkspace } from '@/hooks/useWorkspace'
import { useClients } from '@/hooks/useClients'
import { ClientsKpiBar } from '@/components/clients/ClientsKpiBar'
import { ClientCard } from '@/components/clients/ClientCard'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/lib/utils'

type ClientFilter = 'all' | 'active_projects' | 'open_os' | 'inactive'

const FILTERS: { id: ClientFilter; label: string }[] = [
  { id: 'all', label: 'Todos' },
  { id: 'active_projects', label: 'Com projeto ativo' },
  { id: 'open_os', label: 'OS abertas' },
  { id: 'inactive', label: 'Inativos' },
]

export function ClientsPage() {
  const { data: workspace, isLoading: wsLoading } = useWorkspace()
  const { data, isLoading, isError, error } = useClients(workspace?.id)
  const [filter, setFilter] = useState<ClientFilter>('all')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!data) return []
    const q = search.trim().toLowerCase()
    return data.rows.filter((r) => {
      const c = r.client
      if (filter === 'inactive') {
        if (c.is_active) return false
      } else if (filter === 'active_projects') {
        if (!c.is_active || r.activeProjects === 0) return false
      } else if (filter === 'open_os') {
        if (!c.is_active || r.openServiceOrders === 0) return false
      } else {
        if (!c.is_active) return false
      }
      if (!q) return true
      return (
        c.name.toLowerCase().includes(q) ||
        c.trade_name?.toLowerCase().includes(q) ||
        c.cnpj?.toLowerCase().includes(q) ||
        c.contact_name?.toLowerCase().includes(q) ||
        c.contact_email?.toLowerCase().includes(q) ||
        r.projects.some(
          (p) =>
            p.code.toLowerCase().includes(q) ||
            p.name.toLowerCase().includes(q)
        )
      )
    })
  }, [data, filter, search])

  if (wsLoading || isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <Card className="border-danger/30">
        <div className="text-center py-8">
          <h3 className="font-semibold text-danger mb-2">
            Erro ao carregar clientes
          </h3>
          <p className="text-sm text-muted">{(error as Error).message}</p>
        </div>
      </Card>
    )
  }

  if (!workspace || !data) {
    return (
      <Card>
        <div className="text-center py-12">
          <h3 className="font-semibold mb-2">Sem dados de clientes</h3>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-6 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
          <p className="text-sm text-muted mt-1">
            CRM lite. Conta projetos, receita contratada, horas e OS por
            cliente.
          </p>
        </div>
      </div>

      <ClientsKpiBar kpis={data.kpis} />

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-panel border rounded-lg px-3 py-2 flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 text-muted shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, CNPJ, contato, projeto..."
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted"
          />
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={cn(
                'text-xs px-3 py-1.5 rounded-lg border transition',
                filter === f.id
                  ? 'bg-brand/15 border-brand/40 text-brand font-semibold'
                  : 'bg-panel border-border text-muted hover:text-text'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card className="border-dashed">
          <div className="text-center py-12 text-muted text-sm">
            Nenhum cliente encontrado para os filtros atuais.
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((r) => (
            <ClientCard key={r.client.id} row={r} />
          ))}
        </div>
      )}
    </div>
  )
}
