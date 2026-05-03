import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { SkillProficiency } from '@/types/database'

export interface MemberDetailSkill {
  id: string
  name: string
  category: string | null
  proficiency: SkillProficiency
  isCertified: boolean
}

export interface MemberDetailProject {
  id: string
  code: string
  name: string
  status: string
  health: string | null
  role: string | null
  allocationPercent: number | null
  hoursLogged: number
}

export interface MemberDetailTask {
  id: string
  title: string
  sequenceNumber: number
  isBlocked: boolean
  completedAt: string | null
  dueDate: string | null
  priority: string | null
  statusName: string | null
  statusCategory: string | null
  projectId: string
  projectCode: string
}

export interface MemberDetailTimeEntry {
  id: string
  entryDate: string
  hours: number
  description: string | null
  isBillable: boolean
  hourlyRate: number | null
  projectId: string
  projectCode: string
  projectName: string
}

export interface MemberDetailKpis {
  openTasks: number
  blockedTasks: number
  doneTasksLast30: number
  hoursLast30: number
  billableHoursLast30: number
  utilizationPctLast30: number
  activeProjects: number
}

export interface MemberDetailData {
  member: {
    id: string
    fullName: string
    email: string | null
    avatarUrl: string | null
    role: string
    jobTitle: string | null
    hourlyRate: number | null
    capacityHoursWeek: number
    isInFocus: boolean
    focusUntil: string | null
    isActive: boolean
  }
  skills: MemberDetailSkill[]
  projects: MemberDetailProject[]
  tasks: MemberDetailTask[]
  timeEntries: MemberDetailTimeEntry[]
  kpis: MemberDetailKpis
}

interface RawMember {
  id: string
  user_id: string
  role: string
  job_title: string | null
  hourly_rate: number | null
  capacity_hours_week: number | null
  is_in_focus_mode: boolean | null
  focus_mode_until: string | null
  is_active: boolean
  profile: {
    id: string
    full_name: string
    email: string | null
    avatar_url: string | null
  } | null
}

interface RawSkill {
  skill_id: string
  proficiency: SkillProficiency
  is_certified: boolean | null
  skill: { id: string; name: string; category: string | null } | null
}

interface RawTask {
  id: string
  title: string
  sequence_number: number
  is_blocked: boolean | null
  completed_at: string | null
  due_date: string | null
  priority: string | null
  project_id: string
  status: { name: string; category: string } | null
  project: { id: string; code: string } | null
}

interface RawProjectMember {
  project_id: string
  role: string | null
  allocation_percent: number | null
  project: {
    id: string
    code: string
    name: string
    status: string
    health: string | null
  } | null
}

interface RawTimeEntry {
  id: string
  entry_date: string
  hours: number
  description: string | null
  is_billable: boolean | null
  hourly_rate: number | null
  project_id: string
  project: { id: string; code: string; name: string } | null
}

export function useMemberDetail(
  workspaceId: string | undefined,
  memberId: string | undefined
) {
  return useQuery<MemberDetailData>({
    queryKey: ['member-detail', workspaceId, memberId],
    enabled: !!workspaceId && !!memberId,
    queryFn: async () => {
      const [
        { data: memberRaw, error: memberErr },
        { data: skillsRaw, error: skillsErr },
        { data: tasksRaw, error: tasksErr },
        { data: projectsRaw, error: projectsErr },
        { data: timeRaw, error: timeErr },
      ] = await Promise.all([
        supabase
          .from('workspace_members')
          .select(
            'id, user_id, role, job_title, hourly_rate, capacity_hours_week, is_in_focus_mode, focus_mode_until, is_active, profile:profiles(id, full_name, email, avatar_url)'
          )
          .eq('id', memberId!)
          .eq('workspace_id', workspaceId!)
          .single(),
        supabase
          .from('member_skills')
          .select(
            'skill_id, proficiency, is_certified, skill:skills!inner(id, name, category, workspace_id)'
          )
          .eq('member_id', memberId!)
          .eq('skill.workspace_id', workspaceId!),
        supabase
          .from('tasks')
          .select(
            'id, title, sequence_number, is_blocked, completed_at, due_date, priority, project_id, status:task_statuses(name, category), project:projects!inner(id, code, workspace_id)'
          )
          .eq('assignee_member_id', memberId!)
          .eq('project.workspace_id', workspaceId!)
          .is('deleted_at', null)
          .order('priority', { ascending: true })
          .limit(80),
        supabase
          .from('project_members')
          .select(
            'project_id, role, allocation_percent, project:projects!inner(id, code, name, status, health, workspace_id, deleted_at)'
          )
          .eq('member_id', memberId!)
          .eq('project.workspace_id', workspaceId!),
        supabase
          .from('time_entries')
          .select(
            'id, entry_date, hours, description, is_billable, hourly_rate, project_id, project:projects(id, code, name)'
          )
          .eq('member_id', memberId!)
          .eq('workspace_id', workspaceId!)
          .order('entry_date', { ascending: false })
          .limit(80),
      ])

      if (memberErr) throw memberErr
      if (skillsErr) throw skillsErr
      if (tasksErr) throw tasksErr
      if (projectsErr) throw projectsErr
      if (timeErr) throw timeErr

      const memberRow = memberRaw as unknown as RawMember
      const skillRows = (skillsRaw ?? []) as unknown as RawSkill[]
      const taskRows = (tasksRaw ?? []) as unknown as RawTask[]
      const projectRows = (projectsRaw ?? []) as unknown as RawProjectMember[]
      const timeRows = (timeRaw ?? []) as unknown as RawTimeEntry[]

      const skills: MemberDetailSkill[] = skillRows
        .filter((r) => r.skill)
        .map((r) => ({
          id: r.skill!.id,
          name: r.skill!.name,
          category: r.skill!.category,
          proficiency: r.proficiency,
          isCertified: !!r.is_certified,
        }))
        .sort((a, b) => {
          const order = ['especialista', 'senior', 'pleno', 'aprendiz']
          return order.indexOf(a.proficiency) - order.indexOf(b.proficiency)
        })

      const tasks: MemberDetailTask[] = taskRows
        .filter((t) => t.project)
        .map((t) => ({
          id: t.id,
          title: t.title,
          sequenceNumber: t.sequence_number,
          isBlocked: !!t.is_blocked,
          completedAt: t.completed_at,
          dueDate: t.due_date,
          priority: t.priority,
          statusName: t.status?.name ?? null,
          statusCategory: t.status?.category ?? null,
          projectId: t.project!.id,
          projectCode: t.project!.code,
        }))

      const hoursByProject = new Map<string, number>()
      for (const e of timeRows) {
        hoursByProject.set(
          e.project_id,
          (hoursByProject.get(e.project_id) ?? 0) + Number(e.hours ?? 0)
        )
      }

      const projects: MemberDetailProject[] = projectRows
        .filter((p) => p.project)
        .map((p) => ({
          id: p.project!.id,
          code: p.project!.code,
          name: p.project!.name,
          status: p.project!.status,
          health: p.project!.health,
          role: p.role,
          allocationPercent: p.allocation_percent,
          hoursLogged: hoursByProject.get(p.project_id) ?? 0,
        }))
        .filter((p) => p.status !== 'archived')
        .sort((a, b) => b.hoursLogged - a.hoursLogged)

      const timeEntries: MemberDetailTimeEntry[] = timeRows
        .filter((e) => e.project)
        .map((e) => ({
          id: e.id,
          entryDate: e.entry_date,
          hours: Number(e.hours ?? 0),
          description: e.description,
          isBillable: !!e.is_billable,
          hourlyRate: e.hourly_rate != null ? Number(e.hourly_rate) : null,
          projectId: e.project!.id,
          projectCode: e.project!.code,
          projectName: e.project!.name,
        }))

      // KPIs
      const today = new Date()
      const cutoff = new Date(today)
      cutoff.setDate(cutoff.getDate() - 30)
      const cutoffISO = cutoff.toISOString().slice(0, 10)

      const last30 = timeEntries.filter((e) => e.entryDate >= cutoffISO)
      const hoursLast30 = last30.reduce((acc, e) => acc + e.hours, 0)
      const billableHoursLast30 = last30
        .filter((e) => e.isBillable)
        .reduce((acc, e) => acc + e.hours, 0)
      const cap = Number(memberRow.capacity_hours_week ?? 40)
      const utilizationPctLast30 =
        cap > 0 ? (hoursLast30 / (cap * (30 / 7))) * 100 : 0

      const openTasks = tasks.filter((t) => !t.completedAt).length
      const blockedTasks = tasks.filter(
        (t) => t.isBlocked && !t.completedAt
      ).length
      const doneTasksLast30 = tasks.filter(
        (t) => t.completedAt && t.completedAt >= cutoff.toISOString()
      ).length

      const kpis: MemberDetailKpis = {
        openTasks,
        blockedTasks,
        doneTasksLast30,
        hoursLast30,
        billableHoursLast30,
        utilizationPctLast30,
        activeProjects: projects.length,
      }

      return {
        member: {
          id: memberRow.id,
          fullName: memberRow.profile?.full_name ?? 'Sem nome',
          email: memberRow.profile?.email ?? null,
          avatarUrl: memberRow.profile?.avatar_url ?? null,
          role: memberRow.role,
          jobTitle: memberRow.job_title,
          hourlyRate: memberRow.hourly_rate,
          capacityHoursWeek: cap,
          isInFocus: !!memberRow.is_in_focus_mode,
          focusUntil: memberRow.focus_mode_until,
          isActive: memberRow.is_active,
        },
        skills,
        projects,
        tasks,
        timeEntries,
        kpis,
      }
    },
  })
}
