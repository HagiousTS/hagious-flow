import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type {
  Client,
  ProjectStatus,
  ServiceOrderStatus,
} from '@/types/database'

export interface ClientProjectSummary {
  id: string
  code: string
  name: string
  status: ProjectStatus
  health: string | null
  budgetAmount: number | null
  actualHours: number | null
  estimatedHours: number | null
  dueDate: string | null
  progressPercent: number | null
}

export interface ClientRow {
  client: Client
  projects: ClientProjectSummary[]
  activeProjects: number
  doneProjects: number
  totalBudget: number
  totalActualHours: number
  openServiceOrders: number
  lastActivityAt: string | null
}

export interface ClientsKpis {
  totalClients: number
  activeClients: number
  totalActiveProjects: number
  totalBudget: number
  totalOpenOS: number
}

export interface ClientsData {
  rows: ClientRow[]
  kpis: ClientsKpis
}

interface ProjectRow {
  id: string
  client_id: string | null
  code: string
  name: string
  status: ProjectStatus
  health: string | null
  budget_amount: number | null
  estimated_hours: number | null
  actual_hours: number | null
  due_date: string | null
  progress_percent: number | null
  updated_at: string | null
}

interface ServiceOrderRow {
  id: string
  client_id: string | null
  status: ServiceOrderStatus
  updated_at: string | null
}

const OPEN_OS_STATUSES: ServiceOrderStatus[] = [
  'received',
  'triaged',
  'refined',
]

const ACTIVE_PROJECT_STATUSES: ProjectStatus[] = [
  'planning',
  'active',
  'on_hold',
]

export function useClients(workspaceId: string | undefined) {
  return useQuery<ClientsData>({
    queryKey: ['clients', workspaceId],
    enabled: !!workspaceId,
    queryFn: async () => {
      const [
        { data: clientsRaw, error: clientsErr },
        { data: projectsRaw, error: projectsErr },
        { data: osRaw, error: osErr },
      ] = await Promise.all([
        supabase
          .from('clients')
          .select('*')
          .eq('workspace_id', workspaceId!)
          .is('deleted_at', null)
          .order('name', { ascending: true }),
        supabase
          .from('projects')
          .select(
            'id, client_id, code, name, status, health, budget_amount, estimated_hours, actual_hours, due_date, progress_percent, updated_at'
          )
          .eq('workspace_id', workspaceId!)
          .is('deleted_at', null),
        supabase
          .from('service_orders')
          .select('id, client_id, status, updated_at')
          .eq('workspace_id', workspaceId!),
      ])

      if (clientsErr) throw clientsErr
      if (projectsErr) throw projectsErr
      if (osErr) throw osErr

      const clients = (clientsRaw ?? []) as Client[]
      const projects = (projectsRaw ?? []) as ProjectRow[]
      const orders = (osRaw ?? []) as ServiceOrderRow[]

      const projectsByClient = new Map<string, ProjectRow[]>()
      for (const p of projects) {
        if (!p.client_id) continue
        const arr = projectsByClient.get(p.client_id) ?? []
        arr.push(p)
        projectsByClient.set(p.client_id, arr)
      }

      const ordersByClient = new Map<string, ServiceOrderRow[]>()
      for (const o of orders) {
        if (!o.client_id) continue
        const arr = ordersByClient.get(o.client_id) ?? []
        arr.push(o)
        ordersByClient.set(o.client_id, arr)
      }

      const rows: ClientRow[] = clients.map((c) => {
        const projs = projectsByClient.get(c.id) ?? []
        const projectSummaries: ClientProjectSummary[] = projs.map((p) => ({
          id: p.id,
          code: p.code,
          name: p.name,
          status: p.status,
          health: p.health,
          budgetAmount:
            p.budget_amount != null ? Number(p.budget_amount) : null,
          actualHours: p.actual_hours != null ? Number(p.actual_hours) : null,
          estimatedHours:
            p.estimated_hours != null ? Number(p.estimated_hours) : null,
          dueDate: p.due_date,
          progressPercent:
            p.progress_percent != null ? Number(p.progress_percent) : null,
        }))

        const active = projectSummaries.filter((p) =>
          ACTIVE_PROJECT_STATUSES.includes(p.status)
        )
        const done = projectSummaries.filter((p) => p.status === 'done')

        const totalBudget = projectSummaries.reduce(
          (acc, p) => acc + (p.budgetAmount ?? 0),
          0
        )
        const totalActualHours = projectSummaries.reduce(
          (acc, p) => acc + (p.actualHours ?? 0),
          0
        )

        const clientOrders = ordersByClient.get(c.id) ?? []
        const openServiceOrders = clientOrders.filter((o) =>
          OPEN_OS_STATUSES.includes(o.status)
        ).length

        const projectTimes = projs
          .map((p) => p.updated_at)
          .filter((t): t is string => !!t)
        const orderTimes = clientOrders
          .map((o) => o.updated_at)
          .filter((t): t is string => !!t)
        const allTimes = [...projectTimes, ...orderTimes, c.updated_at].filter(
          Boolean
        )
        const lastActivityAt = allTimes.length
          ? allTimes.sort().slice(-1)[0]
          : null

        return {
          client: c,
          projects: projectSummaries,
          activeProjects: active.length,
          doneProjects: done.length,
          totalBudget,
          totalActualHours,
          openServiceOrders,
          lastActivityAt,
        }
      })

      rows.sort((a, b) => {
        if (a.activeProjects !== b.activeProjects)
          return b.activeProjects - a.activeProjects
        return a.client.name.localeCompare(b.client.name)
      })

      const kpis: ClientsKpis = {
        totalClients: rows.length,
        activeClients: rows.filter((r) => r.client.is_active).length,
        totalActiveProjects: rows.reduce((acc, r) => acc + r.activeProjects, 0),
        totalBudget: rows.reduce((acc, r) => acc + r.totalBudget, 0),
        totalOpenOS: rows.reduce((acc, r) => acc + r.openServiceOrders, 0),
      }

      return { rows, kpis }
    },
  })
}

export interface CreateClientArgs {
  workspaceId: string
  name: string
  trade_name?: string | null
  cnpj?: string | null
  contact_name?: string | null
  contact_email?: string | null
  contact_phone?: string | null
  notes?: string | null
}

export function useCreateClient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (args: CreateClientArgs) => {
      const payload: Record<string, unknown> = {
        workspace_id: args.workspaceId,
        name: args.name.trim(),
        trade_name: args.trade_name?.trim() || null,
        cnpj: args.cnpj?.trim() || null,
        contact_name: args.contact_name?.trim() || null,
        contact_email: args.contact_email?.trim() || null,
        contact_phone: args.contact_phone?.trim() || null,
        notes: args.notes?.trim() || null,
        is_active: true,
      }
      const { data, error } = await supabase
        .from('clients')
        .insert(payload)
        .select('*')
        .single()
      if (error) throw error
      return data as Client
    },
    onSuccess: (c) => {
      qc.invalidateQueries({ queryKey: ['clients', c.workspace_id] })
      qc.invalidateQueries({ queryKey: ['clients', 'lite', c.workspace_id] })
    },
  })
}

export interface UpdateClientArgs {
  workspaceId: string
  clientId: string
  patch: {
    name?: string
    trade_name?: string | null
    cnpj?: string | null
    contact_name?: string | null
    contact_email?: string | null
    contact_phone?: string | null
    notes?: string | null
    is_active?: boolean
  }
}

export function useUpdateClient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (args: UpdateClientArgs) => {
      const payload: Record<string, unknown> = { ...args.patch }
      if (typeof payload.name === 'string') {
        payload.name = (payload.name as string).trim()
      }
      const { data, error } = await supabase
        .from('clients')
        .update(payload)
        .eq('id', args.clientId)
        .select('*')
        .single()
      if (error) throw error
      return data as Client
    },
    onSuccess: (c) => {
      qc.invalidateQueries({ queryKey: ['clients', c.workspace_id] })
      qc.invalidateQueries({ queryKey: ['clients', 'lite', c.workspace_id] })
      qc.invalidateQueries({ queryKey: ['reports', c.workspace_id] })
    },
  })
}

export function useDeleteClient(workspaceId: string | undefined) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (clientId: string) => {
      const { error } = await supabase
        .from('clients')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', clientId)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['clients', workspaceId] })
      qc.invalidateQueries({ queryKey: ['clients', 'lite', workspaceId] })
    },
  })
}
