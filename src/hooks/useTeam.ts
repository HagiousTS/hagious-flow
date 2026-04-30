import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type {
  MemberWorkloadView,
  Skill,
  SkillProficiency,
} from '@/types/database'

export interface TeamMemberSkill {
  skillId: string
  name: string
  category: string | null
  proficiency: SkillProficiency
  isCertified: boolean
}

export interface TeamMember {
  id: string
  userId: string
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
  openTasks: number
  blockedTasks: number
  openHours: number
  utilizationPct: number
  skills: TeamMemberSkill[]
  activeProjects: { id: string; code: string; name: string }[]
}

export interface TeamKpis {
  totalMembers: number
  activeMembers: number
  inFocus: number
  totalCapacityHours: number
  totalCostPerWeek: number
  averageHourlyRate: number
  topSkill: { name: string; count: number } | null
  blockedTotal: number
}

export interface TeamData {
  members: TeamMember[]
  kpis: TeamKpis
}

interface MemberRow {
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

interface MemberSkillRow {
  member_id: string
  skill_id: string
  proficiency: SkillProficiency
  is_certified: boolean
  skill: { id: string; name: string; category: string | null } | null
}

interface ProjectMemberRow {
  member_id: string
  project: { id: string; code: string; name: string; status: string } | null
}

export function useTeam(workspaceId: string | undefined) {
  return useQuery<TeamData>({
    queryKey: ['team', workspaceId],
    enabled: !!workspaceId,
    queryFn: async () => {
      const [
        { data: membersRaw, error: membersErr },
        { data: workloadRaw, error: workloadErr },
        { data: skillsRaw, error: skillsErr },
        { data: projectMembersRaw, error: pmErr },
      ] = await Promise.all([
        supabase
          .from('workspace_members')
          .select(
            'id, user_id, role, job_title, hourly_rate, capacity_hours_week, is_in_focus_mode, focus_mode_until, is_active, profile:profiles(id, full_name, email, avatar_url)'
          )
          .eq('workspace_id', workspaceId!)
          .order('role', { ascending: true }),
        supabase
          .from('v_member_workload')
          .select('*')
          .eq('workspace_id', workspaceId!),
        supabase
          .from('member_skills')
          .select(
            '*, skill:skills!inner(id, workspace_id, name, category)'
          )
          .eq('skill.workspace_id', workspaceId!),
        supabase
          .from('project_members')
          .select(
            'member_id, project:projects!inner(id, workspace_id, code, name, status)'
          )
          .eq('project.workspace_id', workspaceId!),
      ])

      if (membersErr) throw membersErr
      if (workloadErr) throw workloadErr
      if (skillsErr) throw skillsErr
      if (pmErr) throw pmErr

      const membersList = (membersRaw ?? []) as unknown as MemberRow[]
      const workload = (workloadRaw ?? []) as MemberWorkloadView[]
      const memberSkills = (skillsRaw ?? []) as unknown as MemberSkillRow[]
      const projectMembers = (projectMembersRaw ?? []) as unknown as ProjectMemberRow[]

      const skillsByMember = new Map<string, TeamMemberSkill[]>()
      for (const ms of memberSkills) {
        if (!ms.skill) continue
        const arr = skillsByMember.get(ms.member_id) ?? []
        arr.push({
          skillId: ms.skill_id,
          name: ms.skill.name,
          category: ms.skill.category,
          proficiency: ms.proficiency,
          isCertified: ms.is_certified,
        })
        skillsByMember.set(ms.member_id, arr)
      }

      const projectsByMember = new Map<
        string,
        { id: string; code: string; name: string }[]
      >()
      for (const pm of projectMembers) {
        if (!pm.project) continue
        if (pm.project.status === 'archived' || pm.project.status === 'done')
          continue
        const arr = projectsByMember.get(pm.member_id) ?? []
        arr.push({
          id: pm.project.id,
          code: pm.project.code,
          name: pm.project.name,
        })
        projectsByMember.set(pm.member_id, arr)
      }

      const skillCounts = new Map<string, number>()
      for (const arr of skillsByMember.values()) {
        for (const s of arr) {
          skillCounts.set(s.name, (skillCounts.get(s.name) ?? 0) + 1)
        }
      }
      let topSkill: TeamKpis['topSkill'] = null
      for (const [name, count] of skillCounts) {
        if (!topSkill || count > topSkill.count) topSkill = { name, count }
      }

      const members: TeamMember[] = membersList.map((m) => {
        const wl = workload.find((w) => w.member_id === m.id)
        const cap = m.capacity_hours_week ?? 40
        const open = Number(wl?.open_estimated_hours ?? 0)
        return {
          id: m.id,
          userId: m.user_id,
          fullName: m.profile?.full_name ?? 'Sem nome',
          email: m.profile?.email ?? null,
          avatarUrl: m.profile?.avatar_url ?? null,
          role: m.role,
          jobTitle: m.job_title,
          hourlyRate: m.hourly_rate,
          capacityHoursWeek: cap,
          isInFocus: !!m.is_in_focus_mode,
          focusUntil: m.focus_mode_until,
          isActive: m.is_active,
          openTasks: Number(wl?.open_tasks_count ?? 0),
          blockedTasks: Number(wl?.blocked_tasks_count ?? 0),
          openHours: open,
          utilizationPct: cap > 0 ? (open / cap) * 100 : 0,
          skills: skillsByMember.get(m.id) ?? [],
          activeProjects: projectsByMember.get(m.id) ?? [],
        }
      })

      const active = members.filter((m) => m.isActive)
      const totalCapacityHours = active.reduce(
        (acc, m) => acc + m.capacityHoursWeek,
        0
      )
      const ratesPresent = active.filter((m) => m.hourlyRate != null)
      const totalCostPerWeek = ratesPresent.reduce(
        (acc, m) => acc + (m.hourlyRate ?? 0) * m.capacityHoursWeek,
        0
      )
      const averageHourlyRate =
        ratesPresent.length > 0
          ? ratesPresent.reduce((acc, m) => acc + (m.hourlyRate ?? 0), 0) /
            ratesPresent.length
          : 0

      const kpis: TeamKpis = {
        totalMembers: members.length,
        activeMembers: active.length,
        inFocus: active.filter((m) => m.isInFocus).length,
        totalCapacityHours,
        totalCostPerWeek,
        averageHourlyRate,
        topSkill,
        blockedTotal: active.reduce((acc, m) => acc + m.blockedTasks, 0),
      }

      return { members, kpis }
    },
  })
}
