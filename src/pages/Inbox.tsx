import { useEffect, useMemo, useState } from 'react'
import { useWorkspace } from '@/hooks/useWorkspace'
import { useInbox } from '@/hooks/useInbox'
import { OSList } from '@/components/inbox/OSList'
import { OSDetail } from '@/components/inbox/OSDetail'
import { OSKpiBar } from '@/components/inbox/OSKpiBar'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'

export function InboxPage() {
  const { data: workspace, isLoading: wsLoading } = useWorkspace()
  const { data, isLoading, isError, error } = useInbox(workspace?.id)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const orders = useMemo(() => data?.orders ?? [], [data])

  useEffect(() => {
    if (!selectedId && orders.length > 0) {
      setSelectedId(orders[0].id)
    }
  }, [orders, selectedId])

  const selected = useMemo(
    () => orders.find((o) => o.id === selectedId) ?? null,
    [orders, selectedId]
  )

  if (wsLoading || isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 rounded-xl" />
        <div className="grid grid-cols-12 gap-0">
          <Skeleton className="col-span-5 h-[60vh] rounded-xl" />
          <Skeleton className="col-span-7 h-[60vh] rounded-xl ml-4" />
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <Card className="border-danger/30">
        <div className="text-center py-8">
          <h3 className="font-semibold text-danger mb-2">
            Erro ao carregar inbox
          </h3>
          <p className="text-sm text-muted">{(error as Error).message}</p>
        </div>
      </Card>
    )
  }

  if (!workspace) {
    return (
      <Card>
        <div className="text-center py-12">
          <h3 className="font-semibold mb-2">Sem workspace ativo</h3>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-6 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Inbox de Triagem
          </h1>
          <p className="text-sm text-muted mt-1">
            Toda OS chega aqui antes de virar trabalho. Entrada controlada,
            qualidade garantida.
          </p>
        </div>
        <OSKpiBar kpis={data?.kpis ?? defaultKpis()} />
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="grid grid-cols-12 min-h-[calc(100vh-260px)]">
          <div className="col-span-12 lg:col-span-5 border-b lg:border-b-0 border-border">
            <OSList
              orders={orders}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          </div>
          <div className="col-span-12 lg:col-span-7">
            <OSDetail order={selected} />
          </div>
        </div>
      </Card>
    </div>
  )
}

function defaultKpis() {
  return {
    pending: 0,
    slaAtRisk: 0,
    returnedThisMonth: 0,
    totalThisMonth: 0,
    avgQualityScore: null,
  }
}
