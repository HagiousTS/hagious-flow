import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, UserPlus } from 'lucide-react'
import { useWorkspace } from '@/hooks/useWorkspace'
import { useTeam, type TeamRange } from '@/hooks/useTeam'
import { defaultReportRange } from '@/lib/dateRange'
import { DateRangePicker } from '@/components/reports/DateRangePicker'
import { TeamKpiBar } from '@/components/team/TeamKpiBar'
import { MemberCard } from '@/components/team/MemberCard'
import { InviteDialog } from '@/components/team/InviteDialog'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/lib/utils'

type RoleFilter = 'all' | 'owner' | 'manager' | 'member' | 'viewer' | 'inactive'

const FILTERS: { id: RoleFilter; label: string }[] = [
  { id: 'all', label: 'Todos' },
  { id: 'owner', label: 'Owner' },
  { id: 'manager', label: 'Manager' },
  { id: 'member', label: 'Membros' },
  { id: 'viewer', label: 'Viewers' },
  { id: 'inactive', label: 'Inativos' },
]

export function TeamPage() {
  const { data: workspace, isLoading: wsLoading } = useWorkspace()
  const [range, setRange] = useState<TeamRange>(() => defaultReportRange())
  const { data, isLoading, isError, error } = useTeam(workspace?.id, range)
  const [filter, setFilter] = useState<RoleFilter>('all')
  const [search, setSearch] = useState('')
  const [inviteOpen, setInviteOpen] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    if (searchParams.get('invite') === '1') {
      setInviteOpen(true)
      const next = new URLSearchParams(searchParams)
      next.delete('invite')
      setSearchParams(next, { replace: true })
    }
  }, [searchParams, setSearchParams])

  const filtered = useMemo(() => {
    if (!data) return []
    const q = search.trim().toLowerCase()
    return data.members.filter((m) => {
      if (filter === 'inactive') {
        if (m.isActive) return false
      } else {
        if (!m.isActive) return false
        if (filter !== 'all' && m.role !== filter) return false
      }
      if (!q) return true
      return (
        m.fullName.toLowerCase().includes(q) ||
        m.email?.toLowerCase().includes(q) ||
        m.jobTitle?.toLowerCase().includes(q) ||
        m.skills.some((s) => s.name.toLowerCase().includes(q))
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
            Erro ao carregar equipe
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
          <h3 className="font-semibold mb-2">Sem dados de equipe</h3>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-6 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Equipe</h1>
          <p className="text-sm text-muted mt-1">
            Membros do workspace, papéis, capacidade, skills e projetos ativos.
            Horas e KPIs de período refletem a janela selecionada.
          </p>
          <p className="text-[11px] text-muted mt-2">
            <strong className="text-text">
              {data.kpis.totalHoursInRange.toFixed(0)}h
            </strong>{' '}
            registradas no período ·{' '}
            <strong className="text-text">
              {data.kpis.totalBillableInRange.toFixed(0)}h
            </strong>{' '}
            faturáveis · receita estimada{' '}
            <strong className="text-text">
              R$ {data.kpis.totalBillableRevenueInRange.toLocaleString('pt-BR')}
            </strong>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DateRangePicker value={range} onChange={setRange} />
          <Button onClick={() => setInviteOpen(true)}>
            <UserPlus className="w-4 h-4" />
            Convidar membros
          </Button>
        </div>
      </div>

      <InviteDialog
        workspaceId={workspace.id}
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
      />

      <TeamKpiBar kpis={data.kpis} />

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-panel border rounded-lg px-3 py-2 flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 text-muted shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, email, cargo, skill..."
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
            Nenhum membro encontrado para os filtros atuais.
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((m) => (
            <MemberCard key={m.id} member={m} />
          ))}
        </div>
      )}
    </div>
  )
}
