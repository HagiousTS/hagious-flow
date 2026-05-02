import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type {
  Client,
  Priority,
  Project,
  ProjectHealth,
  ProjectStatus,
} from '@/types/database'

export interface ProjectListItem {
  id: string
  code: string
  name: string
  description: string | null
  status: ProjectStatus
  health: ProjectHealth | null
  priority: Priority | null
  startDate: string | null
  dueDate: string | null
  estimatedHours: number | null
  actualHours: number | null
  budgetAmount: number | null
  progressPercent: number | null
  colorHex: string | null
  client: { id: string; name: string; tradeName: string | null } | null
  ownerName: string | null
  membersCount: number
  openTasks: number
  blockedTasks: number
  totalTasks: number
}

export interface ProjectsKpis {
  total: number
  active: number
  atRisk: number
  totalBudget: number
  totalActualHours: number
}

export interface ProjectsData {
  projects: ProjectListItem[]
  kpis: ProjectsKpis
}

interface ProjectRow {
  id: string
  code: string
  name: string
  description: string | null
  status: ProjectStatus
  health: ProjectHealth | null
  priority: Priority | null
  start_date: string | null
  due_date: string | null
  estimated_hours: number | null
  actual_hours: number | null
  budget_amount: number | null
  progress_percent: number | null
  color_hex: string | null
  client: {
    id: string
    name: string
    trade_name: string | null
  } | null
  owner: {
    id: string
    profile: { full_name: string } | null
  } | null
}

interface MembersCountRow {
  project_id: string
  member_id: string
}

interface TaskCountRow {
  project_id: string
  is_blocked: boolean
  completed_at: string | null
}

export function useProjects(workspaceId: string | undefined) {
  return useQuery<ProjectsData>({
    queryKey: ['projects', 'list', workspaceId],
    enabled: !!workspaceId,
    queryFn: async () => {
      const [
        { data: projectsRaw, error: projectsErr },
        { data: membersRaw, error: membersErr },
        { data: tasksRaw, error: tasksErr },
      ] = await Promise.all([
        supabase
          .from('projects')
          .select(
            `id, code, name, description, status, health, priority,
             start_date, due_date, estimated_hours, actual_hours,
             budget_amount, progress_percent, color_hex,
             client:clients(id, name, trade_name),
             owner:workspace_members!projects_owner_member_id_fkey(id, profile:profiles(full_name))`
          )
          .eq('workspace_id', workspaceId!)
          .is('deleted_at', null)
          .order('updated_at', { ascending: false }),
        supabase
          .from('project_members')
          .select('project_id, member_id, project:projects!inner(workspace_id)')
          .eq('project.workspace_id', workspaceId!),
        supabase
          .from('tasks')
          .select('project_id, is_blocked, completed_at')
          .eq('workspace_id', workspaceId!)
          .is('deleted_at', null),
      ])

      if (projectsErr) throw projectsErr
      if (membersErr) throw membersErr
      if (tasksErr) throw tasksErr

      const projects = (projectsRaw ?? []) as unknown as ProjectRow[]
      const members = (membersRaw ?? []) as unknown as MembersCountRow[]
      const tasks = (tasksRaw ?? []) as unknown as TaskCountRow[]

      const membersByProject = new Map<string, Set<string>>()
      for (const m of members) {
        if (!m.project_id) continue
        const set = membersByProject.get(m.project_id) ?? new Set<string>()
        set.add(m.member_id)
        membersByProject.set(m.project_id, set)
      }

      const taskStatsByProject = new Map<
        string,
        { open: number; blocked: number; total: number }
      >()
      for (const t of tasks) {
        if (!t.project_id) continue
        const stats = taskStatsByProject.get(t.project_id) ?? {
          open: 0,
          blocked: 0,
          total: 0,
        }
        stats.total += 1
        if (!t.completed_at) stats.open += 1
        if (t.is_blocked && !t.completed_at) stats.blocked += 1
        taskStatsByProject.set(t.project_id, stats)
      }

      const items: ProjectListItem[] = projects.map((p) => {
        const stats = taskStatsByProject.get(p.id) ?? {
          open: 0,
          blocked: 0,
          total: 0,
        }
        return {
          id: p.id,
          code: p.code,
          name: p.name,
          description: p.description,
          status: p.status,
          health: p.health,
          priority: p.priority,
          startDate: p.start_date,
          dueDate: p.due_date,
          estimatedHours:
            p.estimated_hours != null ? Number(p.estimated_hours) : null,
          actualHours: p.actual_hours != null ? Number(p.actual_hours) : null,
          budgetAmount:
            p.budget_amount != null ? Number(p.budget_amount) : null,
          progressPercent:
            p.progress_percent != null ? Number(p.progress_percent) : null,
          colorHex: p.color_hex,
          client: p.client
            ? {
                id: p.client.id,
                name: p.client.name,
                tradeName: p.client.trade_name,
              }
            : null,
          ownerName: p.owner?.profile?.full_name ?? null,
          membersCount: membersByProject.get(p.id)?.size ?? 0,
          openTasks: stats.open,
          blockedTasks: stats.blocked,
          totalTasks: stats.total,
        }
      })

      const active = items.filter((p) =>
        ['planning', 'active', 'on_hold'].includes(p.status)
      )
      const atRisk = active.filter(
        (p) => p.health === 'at_risk' || p.health === 'off_track'
      )

      const kpis: ProjectsKpis = {
        total: items.length,
        active: active.length,
        atRisk: atRisk.length,
        totalBudget: items.reduce((acc, p) => acc + (p.budgetAmount ?? 0), 0),
        totalActualHours: items.reduce(
          (acc, p) => acc + (p.actualHours ?? 0),
          0
        ),
      }

      return { projects: items, kpis }
    },
  })
}

export function useClientsLite(workspaceId: string | undefined) {
  return useQuery<Pick<Client, 'id' | 'name' | 'trade_name'>[]>({
    queryKey: ['clients', 'lite', workspaceId],
    enabled: !!workspaceId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('id, name, trade_name')
        .eq('workspace_id', workspaceId!)
        .eq('is_active', true)
        .is('deleted_at', null)
        .order('name', { ascending: true })
      if (error) throw error
      return (data ?? []) as Pick<Client, 'id' | 'name' | 'trade_name'>[]
    },
  })
}

export interface CreateProjectArgs {
  workspaceId: string
  code: string
  name: string
  description?: string | null
  clientId?: string | null
  projectType?: string
  status?: ProjectStatus
  priority?: Priority | null
  startDate?: string | null
  dueDate?: string | null
  estimatedHours?: number | null
  budgetAmount?: number | null
}

export function useCreateProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (args: CreateProjectArgs) => {
      const payload: Record<string, unknown> = {
        workspace_id: args.workspaceId,
        code: args.code.trim().toUpperCase(),
        name: args.name.trim(),
        description: args.description?.trim() || null,
        client_id: args.clientId || null,
        project_type: args.projectType ?? 'consultoria',
        status: args.status ?? 'planning',
        priority: args.priority ?? 'P2',
        start_date: args.startDate || null,
        due_date: args.dueDate || null,
        estimated_hours: args.estimatedHours ?? null,
        budget_amount: args.budgetAmount ?? null,
      }
      const { data, error } = await supabase
        .from('projects')
        .insert(payload)
        .select('*')
        .single()
      if (error) throw error
      return data as Project
    },
    onSuccess: (proj) => {
      qc.invalidateQueries({
        queryKey: ['projects', 'list', proj.workspace_id],
      })
      qc.invalidateQueries({ queryKey: ['dashboard', proj.workspace_id] })
    },
  })
}
