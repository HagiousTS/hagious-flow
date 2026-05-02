import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type {
  MemberSkill,
  MemberWorkloadView,
  Skill,
  SkillProficiency,
} from '@/types/database'

export interface WeekColumn {
  index: number
  label: string
  shortDate: string
  weekStart: Date
  weekEnd: Date
  isCurrent: boolean
}

export interface MemberHeatRow {
  memberId: string
  fullName: string
  capacityHoursWeek: number
  weeks: { weekIndex: number; allocatedHours: number; pct: number }[]
  blockedTasks: number
  jobTitle: string | null
}

export interface ProjectAllocation {
  projectId: string
  code: string
  name: string
  hoursWeek: number
  capacityRemaining: number
  health: 'on_track' | 'at_risk' | 'overloaded' | 'idle'
  members: { memberId: string; fullName: string }[]
  dueDate: string | null
}

export interface CapacityKpis {
  membersCount: number
  totalCapacityHours: number
  totalAllocatedHours: number
  saturationPct: number
  overloadedCount: number
  overloadedSummary: string
  freeHours: number
  freeSummary: string
}

export interface SkillCell {
  proficiency: SkillProficiency | null
  isCertified: boolean
}

export interface SkillMatrix {
  skills: Skill[]
  members: { id: string; full_name: string }[]
  cells: Record<string, Record<string, SkillCell>>
}

export interface CapacityData {
  weeks: WeekColumn[]
  rows: MemberHeatRow[]
  kpis: CapacityKpis
  projects: ProjectAllocation[]
  skillMatrix: SkillMatrix
}

const WEEKS_AHEAD = 4

function startOfIsoWeek(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const day = d.getDay()
  const diff = day === 0 ? 6 : day - 1
  d.setDate(d.getDate() - diff)
  return d
}

function buildWeeks(): WeekColumn[] {
  const start = startOfIsoWeek(new Date())
  const cols: WeekColumn[] = []
  for (let i = 0; i < WEEKS_AHEAD; i += 1) {
    const ws = new Date(start)
    ws.setDate(ws.getDate() + i * 7)
    const we = new Date(ws)
    we.setDate(we.getDate() + 6)
    we.setHours(23, 59, 59, 999)
    cols.push({
      index: i,
      label: weekLabel(ws),
      shortDate: shortDate(ws),
      weekStart: ws,
      weekEnd: we,
      isCurrent: i === 0,
    })
  }
  return cols
}

function weekLabel(d: Date): string {
  const onejan = new Date(d.getFullYear(), 0, 1)
  const millisecsInDay = 86400000
  const week = Math.ceil(
    ((d.getTime() - onejan.getTime()) / millisecsInDay + onejan.getDay() + 1) /
      7
  )
  return `Sem ${week}`
}

function shortDate(d: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  }).format(d)
}

function projectHealth(
  hoursWeek: number,
  totalCapacityRemaining: number
): ProjectAllocation['health'] {
  if (hoursWeek === 0) return 'idle'
  if (totalCapacityRemaining < 0) return 'overloaded'
  if (totalCapacityRemaining < 8) return 'at_risk'
  return 'on_track'
}

interface OpenTaskRow {
  id: string
  project_id: string
  assignee_member_id: string | null
  estimated_hours: number | null
  actual_hours: number | null
  due_date: string | null
  is_blocked: boolean
  project: {
    id: string
    code: string
    name: string
    due_date: string | null
  } | null
}

export function useCapacity(workspaceId: string | undefined) {
  return useQuery<CapacityData>({
    queryKey: ['capacity', workspaceId],
    enabled: !!workspaceId,
    queryFn: async () => {
      const weeks = buildWeeks()
      const rangeEnd = weeks[weeks.length - 1].weekEnd

      const [
        { data: workload, error: workloadErr },
        { data: tasksRaw, error: tasksErr },
        { data: skills, error: skillsErr },
        { data: memberSkills, error: msErr },
        { data: members, error: membersErr },
      ] = await Promise.all([
        supabase
          .from('v_member_workload')
          .select('*')
          .eq('workspace_id', workspaceId!),
        supabase
          .from('tasks')
          .select(
            'id, project_id, assignee_member_id, estimated_hours, actual_hours, due_date, is_blocked, project:projects(id, code, name, due_date)'
          )
          .eq('workspace_id', workspaceId!)
          .is('deleted_at', null)
          .is('completed_at', null)
          .not('assignee_member_id', 'is', null)
          .not('estimated_hours', 'is', null),
        supabase.from('skills').select('*').eq('workspace_id', workspaceId!),
        supabase
          .from('member_skills')
          .select('*, skill:skills!inner(id, workspace_id, name, category)')
          .eq('skill.workspace_id', workspaceId!),
        supabase
          .from('workspace_members')
          .select('id, job_title, profile:profiles(id, full_name, avatar_url)')
          .eq('workspace_id', workspaceId!)
          .eq('is_active', true),
      ])

      if (workloadErr) throw workloadErr
      if (tasksErr) throw tasksErr
      if (skillsErr) throw skillsErr
      if (msErr) throw msErr
      if (membersErr) throw membersErr

      const workloadList = (workload ?? []) as MemberWorkloadView[]
      const tasks = (tasksRaw ?? []) as unknown as OpenTaskRow[]
      const skillsList = (skills ?? []) as Skill[]
      const memberSkillsList = (memberSkills ?? []) as MemberSkill[]
      const memberRows = (members ?? []) as unknown as Array<{
        id: string
        job_title: string | null
        profile: {
          id: string
          full_name: string
          avatar_url: string | null
        } | null
      }>

      const memberById = new Map<
        string,
        {
          id: string
          full_name: string
          jobTitle: string | null
          capacityWeek: number
        }
      >()
      for (const m of memberRows) {
        const wl = workloadList.find((w) => w.member_id === m.id)
        memberById.set(m.id, {
          id: m.id,
          full_name: m.profile?.full_name ?? 'Sem nome',
          jobTitle: m.job_title,
          capacityWeek: wl?.capacity_hours_week ?? 40,
        })
      }

      const allocs = new Map<string, Map<number, number>>()
      const projectAllocs = new Map<
        string,
        {
          project: OpenTaskRow['project']
          memberIds: Set<string>
          hoursThisWeek: number
        }
      >()

      for (const t of tasks) {
        if (!t.assignee_member_id) continue
        const remaining = Math.max(
          0,
          Number(t.estimated_hours ?? 0) - Number(t.actual_hours ?? 0)
        )
        if (remaining <= 0) continue

        const dueDate = t.due_date ? new Date(t.due_date) : null
        const weekIndex = dueDate
          ? weeks.findIndex(
              (w) => dueDate >= w.weekStart && dueDate <= w.weekEnd
            )
          : 0

        if (dueDate && dueDate > rangeEnd) continue

        const idx = weekIndex >= 0 ? weekIndex : 0
        const memberMap =
          allocs.get(t.assignee_member_id) ?? new Map<number, number>()
        memberMap.set(idx, (memberMap.get(idx) ?? 0) + remaining)
        allocs.set(t.assignee_member_id, memberMap)

        if (t.project) {
          const entry =
            projectAllocs.get(t.project.id) ??
            ({
              project: t.project,
              memberIds: new Set<string>(),
              hoursThisWeek: 0,
            } as {
              project: OpenTaskRow['project']
              memberIds: Set<string>
              hoursThisWeek: number
            })
          entry.memberIds.add(t.assignee_member_id)
          if (idx === 0) entry.hoursThisWeek += remaining
          projectAllocs.set(t.project.id, entry)
        }
      }

      const rows: MemberHeatRow[] = []
      for (const m of memberById.values()) {
        const memberMap = allocs.get(m.id) ?? new Map<number, number>()
        const wl = workloadList.find((w) => w.member_id === m.id)
        const weeksData = weeks.map((w) => {
          const allocatedHours = memberMap.get(w.index) ?? 0
          const cap = m.capacityWeek || 40
          return {
            weekIndex: w.index,
            allocatedHours,
            pct: cap > 0 ? (allocatedHours / cap) * 100 : 0,
          }
        })
        rows.push({
          memberId: m.id,
          fullName: m.full_name,
          capacityHoursWeek: m.capacityWeek,
          weeks: weeksData,
          blockedTasks: Number(wl?.blocked_tasks_count ?? 0),
          jobTitle: m.jobTitle,
        })
      }
      rows.sort((a, b) => (b.weeks[0]?.pct ?? 0) - (a.weeks[0]?.pct ?? 0))

      const totalCapacityHours = rows.reduce(
        (acc, r) => acc + r.capacityHoursWeek,
        0
      )
      const totalAllocatedHours = rows.reduce(
        (acc, r) => acc + (r.weeks[0]?.allocatedHours ?? 0),
        0
      )
      const overloaded = rows.filter((r) => (r.weeks[0]?.pct ?? 0) > 95)
      const free = rows.filter((r) => (r.weeks[0]?.pct ?? 0) < 60)
      const freeHours = free.reduce(
        (acc, r) =>
          acc +
          Math.max(0, r.capacityHoursWeek - (r.weeks[0]?.allocatedHours ?? 0)),
        0
      )

      const kpis: CapacityKpis = {
        membersCount: rows.length,
        totalCapacityHours,
        totalAllocatedHours,
        saturationPct:
          totalCapacityHours > 0
            ? (totalAllocatedHours / totalCapacityHours) * 100
            : 0,
        overloadedCount: overloaded.length,
        overloadedSummary:
          overloaded
            .slice(0, 2)
            .map(
              (r) =>
                `${r.fullName.split(' ')[0]} · ${Math.round(r.weeks[0]?.pct ?? 0)}%`
            )
            .join(' · ') || '—',
        freeHours,
        freeSummary:
          free
            .slice(0, 2)
            .map((r) => r.fullName.split(' ')[0])
            .join(' + ') || '—',
      }

      const projects: ProjectAllocation[] = []
      for (const entry of projectAllocs.values()) {
        if (!entry.project) continue
        const memberDetails = Array.from(entry.memberIds).map((id) => {
          const meta = memberById.get(id)
          return { memberId: id, fullName: meta?.full_name ?? 'Desconhecido' }
        })
        const totalCapacityForMembers = memberDetails.reduce((acc, m) => {
          const meta = memberById.get(m.memberId)
          return acc + (meta?.capacityWeek ?? 0)
        }, 0)
        const remaining = totalCapacityForMembers - entry.hoursThisWeek
        projects.push({
          projectId: entry.project.id,
          code: entry.project.code,
          name: entry.project.name,
          hoursWeek: entry.hoursThisWeek,
          capacityRemaining: remaining,
          health: projectHealth(entry.hoursThisWeek, remaining),
          members: memberDetails,
          dueDate: entry.project.due_date,
        })
      }
      projects.sort((a, b) => b.hoursWeek - a.hoursWeek)

      const matrixCells: Record<string, Record<string, SkillCell>> = {}
      for (const ms of memberSkillsList) {
        if (!matrixCells[ms.member_id]) matrixCells[ms.member_id] = {}
        matrixCells[ms.member_id][ms.skill_id] = {
          proficiency: ms.proficiency,
          isCertified: ms.is_certified,
        }
      }

      const matrixMembers = rows.map((r) => ({
        id: r.memberId,
        full_name: r.fullName,
      }))

      const skillMatrix: SkillMatrix = {
        skills: skillsList,
        members: matrixMembers,
        cells: matrixCells,
      }

      return {
        weeks,
        rows,
        kpis,
        projects,
        skillMatrix,
      }
    },
  })
}
