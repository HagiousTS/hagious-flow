import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type {
  ActivityLogEntry,
  Project,
  ProjectHealthView,
  ProjectMember,
  ProjectPhase,
  Risk,
  Task,
  TaskStatus,
} from '@/types/database'

export interface ProjectStatusBreakdown {
  done: number
  doing: number
  blocked: number
  review: number
  todo: number
}

export interface ProjectTeamLoad {
  memberId: string
  fullName: string
  role: string | null
  hoursLogged: number
  allocationPercent: number | null
  capacityHoursWeek: number
}

export interface ProjectDetailData {
  project: Project
  health: ProjectHealthView | null
  phases: ProjectPhase[]
  tasks: Task[]
  risks: Risk[]
  team: ProjectTeamLoad[]
  activity: ActivityLogEntry[]
  statusBreakdown: ProjectStatusBreakdown
  totalHoursLogged: number
  statuses: TaskStatus[]
  members: { id: string; full_name: string }[]
}

interface RawProjectMember {
  id: string
  project_id: string
  member_id: string
  role: string
  allocation_percent: number | null
  member: {
    id: string
    capacity_hours_week: number | null
    profile: { id: string; full_name: string; avatar_url: string | null } | null
  } | null
}

export function useProjectDetail(
  workspaceId: string | undefined,
  projectId: string | undefined
) {
  return useQuery<ProjectDetailData>({
    queryKey: ['project', workspaceId, projectId],
    enabled: !!workspaceId && !!projectId,
    queryFn: async () => {
      const [
        { data: project, error: projectErr },
        { data: phases, error: phasesErr },
        { data: tasks, error: tasksErr },
        { data: risks, error: risksErr },
        { data: members, error: membersErr },
        { data: timeEntries, error: timeErr },
        { data: health, error: healthErr },
        { data: activity, error: activityErr },
        { data: statuses, error: statusesErr },
        { data: workspaceMembers, error: wsMembersErr },
      ] = await Promise.all([
        supabase
          .from('projects')
          .select(
            '*, client:clients(id, name, trade_name, contact_name, contact_email)'
          )
          .eq('id', projectId!)
          .eq('workspace_id', workspaceId!)
          .single(),
        supabase
          .from('project_phases')
          .select('*')
          .eq('project_id', projectId!)
          .order('sort_order', { ascending: true }),
        supabase
          .from('tasks')
          .select(
            '*, status:task_statuses(id, name, category, color_hex), assignee:workspace_members(id, profile:profiles(id, full_name, avatar_url))'
          )
          .eq('project_id', projectId!)
          .is('deleted_at', null)
          .order('priority', { ascending: true })
          .order('due_date', { ascending: true })
          .limit(200),
        supabase
          .from('risks')
          .select(
            '*, owner:workspace_members(id, profile:profiles(id, full_name))'
          )
          .eq('project_id', projectId!)
          .neq('status', 'closed')
          .order('severity', { ascending: false }),
        supabase
          .from('project_members')
          .select(
            'id, project_id, member_id, role, allocation_percent, member:workspace_members(id, capacity_hours_week, profile:profiles(id, full_name, avatar_url))'
          )
          .eq('project_id', projectId!),
        supabase
          .from('time_entries')
          .select('member_id, hours')
          .eq('project_id', projectId!),
        supabase
          .from('v_project_health')
          .select('*')
          .eq('project_id', projectId!)
          .maybeSingle(),
        supabase
          .from('activity_log')
          .select('*, actor:profiles(id, full_name, avatar_url)')
          .eq('workspace_id', workspaceId!)
          .or(
            `entity_id.eq.${projectId!},metadata_json->>project_id.eq.${projectId!}`
          )
          .order('created_at', { ascending: false })
          .limit(8),
        supabase
          .from('task_statuses')
          .select('*')
          .eq('workspace_id', workspaceId!)
          .is('project_id', null)
          .order('sort_order', { ascending: true }),
        supabase
          .from('workspace_members')
          .select('id, profile:profiles(id, full_name)')
          .eq('workspace_id', workspaceId!)
          .eq('is_active', true),
      ])

      if (projectErr) throw projectErr
      if (phasesErr) throw phasesErr
      if (tasksErr) throw tasksErr
      if (risksErr) throw risksErr
      if (membersErr) throw membersErr
      if (timeErr) throw timeErr
      if (healthErr) throw healthErr
      if (activityErr) throw activityErr
      if (statusesErr) throw statusesErr
      if (wsMembersErr) throw wsMembersErr

      const taskList = (tasks ?? []) as Task[]

      const breakdown: ProjectStatusBreakdown = {
        done: 0,
        doing: 0,
        blocked: 0,
        review: 0,
        todo: 0,
      }
      for (const t of taskList) {
        if (t.is_blocked) breakdown.blocked += 1
        else if (t.status?.category) {
          const cat = t.status.category
          if (cat === 'done') breakdown.done += 1
          else if (cat === 'doing') breakdown.doing += 1
          else if (cat === 'review') breakdown.review += 1
          else breakdown.todo += 1
        } else {
          breakdown.todo += 1
        }
      }

      const hoursByMember = new Map<string, number>()
      let totalHours = 0
      for (const e of timeEntries ?? []) {
        const h = Number(e.hours ?? 0)
        totalHours += h
        if (e.member_id) {
          hoursByMember.set(
            e.member_id,
            (hoursByMember.get(e.member_id) ?? 0) + h
          )
        }
      }

      const team: ProjectTeamLoad[] = (
        (members ?? []) as unknown as RawProjectMember[]
      ).map((pm) => ({
        memberId: pm.member_id,
        fullName: pm.member?.profile?.full_name ?? 'Sem nome',
        role: pm.role,
        hoursLogged: hoursByMember.get(pm.member_id) ?? 0,
        allocationPercent: pm.allocation_percent,
        capacityHoursWeek: pm.member?.capacity_hours_week ?? 40,
      }))
      team.sort((a, b) => b.hoursLogged - a.hoursLogged)

      type WsMemberRow = {
        id: string
        profile: { id: string; full_name: string } | null
      }
      const wsMembers = (
        (workspaceMembers ?? []) as unknown as WsMemberRow[]
      ).map((m) => ({
        id: m.id,
        full_name: m.profile?.full_name ?? 'Sem nome',
      }))

      return {
        project: project as Project,
        health: (health as ProjectHealthView | null) ?? null,
        phases: (phases ?? []) as ProjectPhase[],
        tasks: taskList,
        risks: (risks ?? []) as Risk[],
        team,
        activity: (activity ?? []) as ActivityLogEntry[],
        statusBreakdown: breakdown,
        totalHoursLogged: totalHours,
        statuses: (statuses ?? []) as TaskStatus[],
        members: wsMembers,
      }
    },
  })
}

export function getProjectMembersTotalHours(team: ProjectTeamLoad[]): number {
  return team.reduce((acc, t) => acc + t.hoursLogged, 0)
}

export type { ProjectMember }
