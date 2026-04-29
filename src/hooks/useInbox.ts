import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { ServiceOrder } from '@/types/database'

export interface InboxKpis {
  pending: number
  slaAtRisk: number
  returnedThisMonth: number
  totalThisMonth: number
  avgQualityScore: number | null
}

export interface InboxData {
  orders: ServiceOrder[]
  kpis: InboxKpis
}

const SLA_RISK_HOURS = 4

function startOfMonthIso(): string {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
}

export function useInbox(workspaceId: string | undefined) {
  return useQuery<InboxData>({
    queryKey: ['inbox', workspaceId],
    enabled: !!workspaceId,
    queryFn: async () => {
      const monthStart = startOfMonthIso()

      const [{ data: orders, error: ordersErr }, { data: monthOrders, error: monthErr }] =
        await Promise.all([
          supabase
            .from('service_orders')
            .select('*, client:clients(id, name, trade_name), template:os_templates(id, name, slug, category, color_hex, default_priority, sla_response_hours)')
            .eq('workspace_id', workspaceId!)
            .order('created_at', { ascending: false })
            .limit(50),
          supabase
            .from('service_orders')
            .select('id, status, quality_score, created_at')
            .eq('workspace_id', workspaceId!)
            .gte('created_at', monthStart),
        ])

      if (ordersErr) throw ordersErr
      if (monthErr) throw monthErr

      const list = (orders ?? []) as ServiceOrder[]
      const monthList = monthOrders ?? []

      const now = Date.now()
      const slaRiskMs = SLA_RISK_HOURS * 60 * 60 * 1000

      const pending = list.filter((o) => o.status === 'received').length

      const slaAtRisk = list.filter((o) => {
        if (!o.sla_due_at) return false
        if (o.status === 'accepted' || o.status === 'returned') return false
        const due = new Date(o.sla_due_at).getTime()
        return due - now <= slaRiskMs
      }).length

      const returnedThisMonth = monthList.filter((o) => o.status === 'returned').length
      const totalThisMonth = monthList.length

      const scored = monthList.filter((o) => o.quality_score != null)
      const avgQualityScore = scored.length
        ? Math.round(
            scored.reduce((acc, o) => acc + Number(o.quality_score ?? 0), 0) / scored.length
          )
        : null

      return {
        orders: list,
        kpis: {
          pending,
          slaAtRisk,
          returnedThisMonth,
          totalThisMonth,
          avgQualityScore,
        },
      }
    },
  })
}
