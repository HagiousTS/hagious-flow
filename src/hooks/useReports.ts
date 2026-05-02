import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { ProjectStatus } from '@/types/database'

export interface ReportsRange {
  from: string // YYYY-MM-DD inclusivo
  to: string // YYYY-MM-DD inclusivo
}

export interface ReportsKpis {
  totalRevenue: number
  recognizedRevenue: number
  hoursLogged: number
  hoursEstimated: number
  utilizationPct: number
  activeProjectsCount: number
  doneProjectsCount: number
  totalTasks: number
  doneTasks: number
  blockedTasks: number
  throughputPct: number
  totalMembers: number
  averageTasksPerMember: number
  billableHours: number
  billableRevenue: number
}

export interface BreakdownRow {
  id: string
  label: string
  sublabel?: string | null
  value: number
  formatted: string
  pct: number
  pctOfMax: number
  highlight?: 'on_track' | 'at_risk' | 'off_track' | 'ahead' | null
}

export interface ReportsData {
  range: ReportsRange
  kpis: ReportsKpis
  revenueByClient: BreakdownRow[]
  hoursByProject: BreakdownRow[]
  hoursByMember: BreakdownRow[]
  loadByMember: BreakdownRow[]
  blockedByProject: BreakdownRow[]
  topSkills: BreakdownRow[]
}

interface ProjectRow {
  id: string
  code: string
  name: string
  status: ProjectStatus
  health: string | null
  client_id: string | null
  budget_amount: number | null
  estimated_hours: number | null
  progress_percent: number | null
}

interface ClientRow {
  id: string
  name: string
  trade_name: string | null
}

interface TaskRow {
  id: string
  project_id: string
  is_blocked: boolean
  completed_at: string | null
  assignee_member_id: string | null
}

interface MemberRow {
  id: string
  profile: { full_name: string } | null
}

interface MemberSkillRow {
  member_id: string
  skill: { id: string; name: string; workspace_id: string } | null
}

interface TimeEntryRow {
  project_id: string
  member_id: string
  hours: number
  is_billable: boolean
  hourly_rate: number | null
  entry_date: string
}

const ACTIVE_STATUSES: ProjectStatus[] = ['planning', 'active', 'on_hold']

function fmtBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}

function fmtHours(value: number): string {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k h`
  return `${Math.round(value * 10) / 10} h`
}

function withPctOfMax(rows: BreakdownRow[]): BreakdownRow[] {
  const max = rows.reduce((acc, r) => Math.max(acc, r.value), 0)
  if (max <= 0) return rows
  return rows.map((r) => ({ ...r, pctOfMax: (r.value / max) * 100 }))
}

export function useReports(
  workspaceId: string | undefined,
  range: ReportsRange
) {
  return useQuery<ReportsData>({
    queryKey: ['reports', workspaceId, range.from, range.to],
    enabled: !!workspaceId,
    queryFn: async () => {
      const [
        { data: projectsRaw, error: pErr },
        { data: clientsRaw, error: cErr },
        { data: tasksRaw, error: tErr },
        { data: membersRaw, error: mErr },
        { data: skillsRaw, error: sErr },
        { data: timeRaw, error: teErr },
      ] = await Promise.all([
        supabase
          .from('projects')
          .select(
            'id, code, name, status, health, client_id, budget_amount, estimated_hours, progress_percent'
          )
          .eq('workspace_id', workspaceId!)
          .is('deleted_at', null),
        supabase
          .from('clients')
          .select('id, name, trade_name')
          .eq('workspace_id', workspaceId!)
          .is('deleted_at', null),
        supabase
          .from('tasks')
          .select(
            'id, project_id, is_blocked, completed_at, assignee_member_id'
          )
          .eq('workspace_id', workspaceId!)
          .is('deleted_at', null),
        supabase
          .from('workspace_members')
          .select('id, profile:profiles(full_name)')
          .eq('workspace_id', workspaceId!)
          .eq('is_active', true),
        supabase
          .from('member_skills')
          .select('member_id, skill:skills!inner(id, name, workspace_id)')
          .eq('skill.workspace_id', workspaceId!),
        supabase
          .from('time_entries')
          .select(
            'project_id, member_id, hours, is_billable, hourly_rate, entry_date'
          )
          .eq('workspace_id', workspaceId!)
          .gte('entry_date', range.from)
          .lte('entry_date', range.to),
      ])

      if (pErr) throw pErr
      if (cErr) throw cErr
      if (tErr) throw tErr
      if (mErr) throw mErr
      if (sErr) throw sErr
      if (teErr) throw teErr

      const projects = (projectsRaw ?? []) as ProjectRow[]
      const clients = (clientsRaw ?? []) as ClientRow[]
      const tasks = (tasksRaw ?? []) as TaskRow[]
      const members = (membersRaw ?? []) as unknown as MemberRow[]
      const memberSkills = (skillsRaw ?? []) as unknown as MemberSkillRow[]
      const timeEntries = (timeRaw ?? []) as TimeEntryRow[]

      const totalRevenue = projects.reduce(
        (acc, p) => acc + Number(p.budget_amount ?? 0),
        0
      )
      const recognizedRevenue = projects.reduce(
        (acc, p) =>
          acc +
          Number(p.budget_amount ?? 0) *
            (Number(p.progress_percent ?? 0) / 100),
        0
      )

      const hoursLogged = timeEntries.reduce(
        (acc, t) => acc + Number(t.hours ?? 0),
        0
      )
      const hoursEstimated = projects.reduce(
        (acc, p) => acc + Number(p.estimated_hours ?? 0),
        0
      )
      const billableHours = timeEntries
        .filter((t) => t.is_billable)
        .reduce((acc, t) => acc + Number(t.hours ?? 0), 0)
      const billableRevenue = timeEntries
        .filter((t) => t.is_billable)
        .reduce(
          (acc, t) => acc + Number(t.hours ?? 0) * Number(t.hourly_rate ?? 0),
          0
        )

      const activeProjectsCount = projects.filter((p) =>
        ACTIVE_STATUSES.includes(p.status)
      ).length
      const doneProjectsCount = projects.filter((p) => p.status === 'done')
        .length

      // Tasks completadas dentro do range
      const fromTs = new Date(range.from + 'T00:00:00').getTime()
      const toTs = new Date(range.to + 'T23:59:59').getTime()
      const totalTasks = tasks.length
      const doneTasksInRange = tasks.filter((t) => {
        if (!t.completed_at) return false
        const ts = new Date(t.completed_at).getTime()
        return ts >= fromTs && ts <= toTs
      }).length
      const doneTasksAll = tasks.filter((t) => t.completed_at).length
      const blockedTasks = tasks.filter(
        (t) => t.is_blocked && !t.completed_at
      ).length

      const totalMembers = members.length

      const kpis: ReportsKpis = {
        totalRevenue,
        recognizedRevenue,
        hoursLogged,
        hoursEstimated,
        utilizationPct:
          hoursEstimated > 0 ? (hoursLogged / hoursEstimated) * 100 : 0,
        activeProjectsCount,
        doneProjectsCount,
        totalTasks,
        doneTasks: doneTasksInRange,
        blockedTasks,
        throughputPct:
          totalTasks > 0 ? (doneTasksAll / totalTasks) * 100 : 0,
        totalMembers,
        averageTasksPerMember: totalMembers > 0 ? totalTasks / totalMembers : 0,
        billableHours,
        billableRevenue,
      }

      const clientById = new Map(clients.map((c) => [c.id, c]))
      const revenueByClientMap = new Map<string, number>()
      for (const p of projects) {
        if (!p.client_id) continue
        revenueByClientMap.set(
          p.client_id,
          (revenueByClientMap.get(p.client_id) ?? 0) +
            Number(p.budget_amount ?? 0)
        )
      }
      const revenueByClient = withPctOfMax(
        Array.from(revenueByClientMap.entries())
          .filter(([, v]) => v > 0)
          .map(([id, value]) => {
            const c = clientById.get(id)
            return {
              id,
              label: c?.trade_name ?? c?.name ?? '—',
              sublabel:
                c?.trade_name && c.name !== c.trade_name ? c.name : null,
              value,
              formatted: fmtBRL(value),
              pct: totalRevenue > 0 ? (value / totalRevenue) * 100 : 0,
              pctOfMax: 0,
              highlight: null,
            }
          })
          .sort((a, b) => b.value - a.value)
      )

      // Hours by project — agora vem de time_entries no range
      const hoursByProjectMap = new Map<string, number>()
      for (const te of timeEntries) {
        hoursByProjectMap.set(
          te.project_id,
          (hoursByProjectMap.get(te.project_id) ?? 0) + Number(te.hours)
        )
      }
      const projectById = new Map(projects.map((p) => [p.id, p]))
      const hoursByProject = withPctOfMax(
        Array.from(hoursByProjectMap.entries())
          .map(([id, value]) => {
            const p = projectById.get(id)
            return {
              id,
              label: p?.name ?? '—',
              sublabel: p?.code ?? null,
              value,
              formatted: fmtHours(value),
              pct: hoursLogged > 0 ? (value / hoursLogged) * 100 : 0,
              pctOfMax: 0,
              highlight: (p?.health as BreakdownRow['highlight']) ?? null,
            }
          })
          .filter((r) => r.value > 0)
          .sort((a, b) => b.value - a.value)
      )

      // Hours by member — novo, time_entries no range
      const hoursByMemberMap = new Map<string, number>()
      for (const te of timeEntries) {
        hoursByMemberMap.set(
          te.member_id,
          (hoursByMemberMap.get(te.member_id) ?? 0) + Number(te.hours)
        )
      }
      const memberById = new Map(
        members.map((m) => [m.id, m.profile?.full_name ?? 'Sem nome'])
      )
      const hoursByMember = withPctOfMax(
        Array.from(hoursByMemberMap.entries())
          .map(([id, value]) => ({
            id,
            label: memberById.get(id) ?? 'Sem nome',
            sublabel: null,
            value,
            formatted: fmtHours(value),
            pct: hoursLogged > 0 ? (value / hoursLogged) * 100 : 0,
            pctOfMax: 0,
            highlight: null,
          }))
          .filter((r) => r.value > 0)
          .sort((a, b) => b.value - a.value)
      )

      // Carga atual (tasks abertas) — independe do range
      const tasksByMember = new Map<string, number>()
      for (const t of tasks) {
        if (!t.assignee_member_id || t.completed_at) continue
        tasksByMember.set(
          t.assignee_member_id,
          (tasksByMember.get(t.assignee_member_id) ?? 0) + 1
        )
      }
      const loadByMember = withPctOfMax(
        Array.from(tasksByMember.entries())
          .map(([id, count]) => ({
            id,
            label: memberById.get(id) ?? 'Sem nome',
            sublabel: null,
            value: count,
            formatted: `${count} task${count !== 1 ? 's' : ''}`,
            pct: totalTasks > 0 ? (count / totalTasks) * 100 : 0,
            pctOfMax: 0,
            highlight: null,
          }))
          .sort((a, b) => b.value - a.value)
      )

      const blockedByProjectMap = new Map<string, number>()
      for (const t of tasks) {
        if (!t.is_blocked || t.completed_at) continue
        blockedByProjectMap.set(
          t.project_id,
          (blockedByProjectMap.get(t.project_id) ?? 0) + 1
        )
      }
      const blockedByProject = withPctOfMax(
        Array.from(blockedByProjectMap.entries())
          .map(([id, count]) => {
            const p = projectById.get(id)
            return {
              id,
              label: p?.name ?? '—',
              sublabel: p?.code ?? null,
              value: count,
              formatted: `${count} bloqueada${count !== 1 ? 's' : ''}`,
              pct: blockedTasks > 0 ? (count / blockedTasks) * 100 : 0,
              pctOfMax: 0,
              highlight: 'off_track' as const,
            }
          })
          .sort((a, b) => b.value - a.value)
      )

      const skillCount = new Map<string, { name: string; count: number }>()
      for (const ms of memberSkills) {
        if (!ms.skill) continue
        const existing = skillCount.get(ms.skill.id)
        if (existing) existing.count += 1
        else skillCount.set(ms.skill.id, { name: ms.skill.name, count: 1 })
      }
      const topSkills = withPctOfMax(
        Array.from(skillCount.entries())
          .map(([id, info]) => ({
            id,
            label: info.name,
            sublabel: null,
            value: info.count,
            formatted: `${info.count} pessoa${info.count !== 1 ? 's' : ''}`,
            pct: totalMembers > 0 ? (info.count / totalMembers) * 100 : 0,
            pctOfMax: 0,
            highlight: null,
          }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 8)
      )

      return {
        range,
        kpis,
        revenueByClient,
        hoursByProject,
        hoursByMember,
        loadByMember,
        blockedByProject,
        topSkills,
      }
    },
  })
}
