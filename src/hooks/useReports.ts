import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { ProjectStatus } from '@/types/database'

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
  kpis: ReportsKpis
  revenueByClient: BreakdownRow[]
  hoursByProject: BreakdownRow[]
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
  actual_hours: number | null
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
  return `${Math.round(value)} h`
}

function withPctOfMax(rows: BreakdownRow[]): BreakdownRow[] {
  const max = rows.reduce((acc, r) => Math.max(acc, r.value), 0)
  if (max <= 0) return rows
  return rows.map((r) => ({ ...r, pctOfMax: (r.value / max) * 100 }))
}

export function useReports(workspaceId: string | undefined) {
  return useQuery<ReportsData>({
    queryKey: ['reports', workspaceId],
    enabled: !!workspaceId,
    queryFn: async () => {
      const [
        { data: projectsRaw, error: pErr },
        { data: clientsRaw, error: cErr },
        { data: tasksRaw, error: tErr },
        { data: membersRaw, error: mErr },
        { data: skillsRaw, error: sErr },
      ] = await Promise.all([
        supabase
          .from('projects')
          .select(
            'id, code, name, status, health, client_id, budget_amount, estimated_hours, actual_hours, progress_percent'
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
      ])

      if (pErr) throw pErr
      if (cErr) throw cErr
      if (tErr) throw tErr
      if (mErr) throw mErr
      if (sErr) throw sErr

      const projects = (projectsRaw ?? []) as ProjectRow[]
      const clients = (clientsRaw ?? []) as ClientRow[]
      const tasks = (tasksRaw ?? []) as TaskRow[]
      const members = (membersRaw ?? []) as unknown as MemberRow[]
      const memberSkills = (skillsRaw ?? []) as unknown as MemberSkillRow[]

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
      const hoursLogged = projects.reduce(
        (acc, p) => acc + Number(p.actual_hours ?? 0),
        0
      )
      const hoursEstimated = projects.reduce(
        (acc, p) => acc + Number(p.estimated_hours ?? 0),
        0
      )
      const activeProjectsCount = projects.filter((p) =>
        ACTIVE_STATUSES.includes(p.status)
      ).length
      const doneProjectsCount = projects.filter(
        (p) => p.status === 'done'
      ).length

      const totalTasks = tasks.length
      const doneTasks = tasks.filter((t) => t.completed_at).length
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
        doneTasks,
        blockedTasks,
        throughputPct: totalTasks > 0 ? (doneTasks / totalTasks) * 100 : 0,
        totalMembers,
        averageTasksPerMember: totalMembers > 0 ? totalTasks / totalMembers : 0,
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
          .filter(([_, v]) => v > 0)
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

      const hoursByProject = withPctOfMax(
        projects
          .map((p) => ({
            id: p.id,
            label: p.name,
            sublabel: p.code,
            value: Number(p.actual_hours ?? 0),
            formatted: fmtHours(Number(p.actual_hours ?? 0)),
            pct:
              hoursLogged > 0
                ? (Number(p.actual_hours ?? 0) / hoursLogged) * 100
                : 0,
            pctOfMax: 0,
            highlight: (p.health as BreakdownRow['highlight']) ?? null,
          }))
          .filter((r) => r.value > 0)
          .sort((a, b) => b.value - a.value)
      )

      const tasksByMember = new Map<string, number>()
      for (const t of tasks) {
        if (!t.assignee_member_id || t.completed_at) continue
        tasksByMember.set(
          t.assignee_member_id,
          (tasksByMember.get(t.assignee_member_id) ?? 0) + 1
        )
      }
      const memberById = new Map(
        members.map((m) => [m.id, m.profile?.full_name ?? 'Sem nome'])
      )
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
      const projectById = new Map(projects.map((p) => [p.id, p]))
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
        kpis,
        revenueByClient,
        hoursByProject,
        loadByMember,
        blockedByProject,
        topSkills,
      }
    },
  })
}
