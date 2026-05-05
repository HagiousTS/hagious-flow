import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type {
  Project,
  Task,
  TaskStatus,
  WorkspaceMember,
} from '@/types/database'

export interface TasksBoardData {
  statuses: TaskStatus[]
  tasks: Task[]
  projects: Pick<Project, 'id' | 'code' | 'name' | 'color_hex'>[]
  members: Array<{ id: string; full_name: string; avatar_url: string | null }>
}

interface RawMember {
  id: string
  profile: {
    id: string
    full_name: string
    avatar_url: string | null
  } | null
}

export function useTasksBoard(workspaceId: string | undefined) {
  return useQuery<TasksBoardData>({
    queryKey: ['tasks-board', workspaceId],
    enabled: !!workspaceId,
    queryFn: async () => {
      const [
        { data: statuses, error: statusErr },
        { data: tasks, error: tasksErr },
        { data: projects, error: projectsErr },
        { data: members, error: membersErr },
      ] = await Promise.all([
        supabase
          .from('task_statuses')
          .select('*')
          .eq('workspace_id', workspaceId!)
          .is('project_id', null)
          .order('sort_order', { ascending: true }),
        supabase
          .from('tasks')
          .select(
            '*, status:task_statuses(id, name, category, color_hex), project:projects(id, code, name, color_hex), assignee:workspace_members!tasks_assignee_member_id_fkey(id, profile:profiles(id, full_name, avatar_url))'
          )
          .eq('workspace_id', workspaceId!)
          .is('deleted_at', null)
          .is('completed_at', null)
          .order('priority', { ascending: true })
          .order('due_date', { ascending: true })
          .limit(300),
        supabase
          .from('projects')
          .select('id, code, name, color_hex')
          .eq('workspace_id', workspaceId!)
          .is('deleted_at', null)
          .neq('status', 'archived')
          .order('code', { ascending: true }),
        supabase
          .from('workspace_members')
          .select('id, profile:profiles(id, full_name, avatar_url)')
          .eq('workspace_id', workspaceId!)
          .eq('is_active', true),
      ])

      if (statusErr) throw statusErr
      if (tasksErr) throw tasksErr
      if (projectsErr) throw projectsErr
      if (membersErr) throw membersErr

      const memberRows = ((members ?? []) as unknown as RawMember[]).map(
        (m) => ({
          id: m.id,
          full_name: m.profile?.full_name ?? 'Sem nome',
          avatar_url: m.profile?.avatar_url ?? null,
        })
      )

      return {
        statuses: (statuses ?? []) as TaskStatus[],
        tasks: (tasks ?? []) as Task[],
        projects: (projects ?? []) as Pick<
          Project,
          'id' | 'code' | 'name' | 'color_hex'
        >[],
        members: memberRows,
      }
    },
  })
}

interface MoveTaskArgs {
  taskId: string
  newStatusId: string
}

export function useMoveTask(workspaceId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ taskId, newStatusId }: MoveTaskArgs) => {
      const { error } = await supabase
        .from('tasks')
        .update({ status_id: newStatusId })
        .eq('id', taskId)
      if (error) throw error
    },
    onMutate: async ({ taskId, newStatusId }) => {
      const queryKey = ['tasks-board', workspaceId]
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<TasksBoardData>(queryKey)
      if (!previous) return { previous }

      const newStatus = previous.statuses.find((s) => s.id === newStatusId)
      const updated: TasksBoardData = {
        ...previous,
        tasks: previous.tasks.map((t) =>
          t.id === taskId
            ? {
                ...t,
                status_id: newStatusId,
                status: newStatus ?? t.status,
              }
            : t
        ),
      }
      queryClient.setQueryData(queryKey, updated)
      return { previous }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(['tasks-board', workspaceId], ctx.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks-board', workspaceId] })
      queryClient.invalidateQueries({ queryKey: ['dashboard', workspaceId] })
    },
  })
}

export type { Task, TaskStatus, WorkspaceMember }

export interface UpdateTaskArgs {
  taskId: string
  patch: {
    title?: string
    description_md?: string | null
    status_id?: string
    priority?: 'P1' | 'P2' | 'P3' | null
    assignee_member_id?: string | null
    estimated_hours?: number | null
    due_date?: string | null
    is_blocked?: boolean
    blocked_reason?: string | null
    completed_at?: string | null
  }
}

export function useUpdateTask(workspaceId: string | undefined) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ taskId, patch }: UpdateTaskArgs) => {
      const { error } = await supabase
        .from('tasks')
        .update(patch)
        .eq('id', taskId)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks-board', workspaceId] })
      qc.invalidateQueries({ queryKey: ['project-detail'] })
      qc.invalidateQueries({ queryKey: ['dashboard', workspaceId] })
      qc.invalidateQueries({ queryKey: ['capacity', workspaceId] })
      qc.invalidateQueries({ queryKey: ['reports', workspaceId] })
    },
  })
}

export function useDeleteTask(workspaceId: string | undefined) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase
        .from('tasks')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', taskId)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks-board', workspaceId] })
      qc.invalidateQueries({ queryKey: ['project-detail'] })
      qc.invalidateQueries({ queryKey: ['dashboard', workspaceId] })
      qc.invalidateQueries({ queryKey: ['capacity', workspaceId] })
    },
  })
}
