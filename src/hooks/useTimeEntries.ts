import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { TimeEntry } from '@/types/database'

interface RawTimeEntry {
  id: string
  workspace_id: string
  project_id: string
  task_id: string | null
  member_id: string
  entry_date: string
  hours: number
  description: string | null
  is_billable: boolean | null
  hourly_rate: number | null
  created_at: string
  updated_at: string
  member: {
    id: string
    profile: {
      id: string
      full_name: string
      avatar_url: string | null
    } | null
  } | null
  task: {
    id: string
    title: string
    sequence_number: number
  } | null
}

export function useProjectTimeEntries(
  projectId: string | undefined,
  workspaceId: string | undefined
) {
  return useQuery<TimeEntry[]>({
    queryKey: ['time-entries', 'project', projectId, workspaceId],
    enabled: !!projectId && !!workspaceId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('time_entries')
        .select(
          'id, workspace_id, project_id, task_id, member_id, entry_date, hours, description, is_billable, hourly_rate, created_at, updated_at, member:workspace_members(id, profile:profiles(id, full_name, avatar_url)), task:tasks(id, title, sequence_number)'
        )
        .eq('project_id', projectId!)
        .eq('workspace_id', workspaceId!)
        .order('entry_date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(100)
      if (error) throw error
      return (data ?? []) as unknown as TimeEntry[]
    },
  })
}

export interface CreateTimeEntryArgs {
  workspaceId: string
  projectId: string
  memberId: string
  taskId?: string | null
  entryDate: string
  hours: number
  description?: string | null
  isBillable?: boolean
  hourlyRate?: number | null
}

export function useCreateTimeEntry() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (args: CreateTimeEntryArgs) => {
      const { data, error } = await supabase
        .from('time_entries')
        .insert({
          workspace_id: args.workspaceId,
          project_id: args.projectId,
          task_id: args.taskId ?? null,
          member_id: args.memberId,
          entry_date: args.entryDate,
          hours: args.hours,
          description: args.description?.trim() || null,
          is_billable: args.isBillable ?? true,
          hourly_rate: args.hourlyRate ?? null,
        })
        .select('*')
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({
        queryKey: ['time-entries', 'project', vars.projectId],
      })
      qc.invalidateQueries({ queryKey: ['project', vars.workspaceId] })
      qc.invalidateQueries({ queryKey: ['capacity', vars.workspaceId] })
      qc.invalidateQueries({ queryKey: ['reports', vars.workspaceId] })
      qc.invalidateQueries({ queryKey: ['dashboard', vars.workspaceId] })
    },
  })
}

export interface UpdateTimeEntryArgs {
  entryId: string
  workspaceId: string
  projectId: string
  patch: {
    entry_date?: string
    hours?: number
    description?: string | null
    is_billable?: boolean
    hourly_rate?: number | null
    task_id?: string | null
  }
}

export function useUpdateTimeEntry() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (args: UpdateTimeEntryArgs) => {
      const { data, error } = await supabase
        .from('time_entries')
        .update(args.patch)
        .eq('id', args.entryId)
        .select('*')
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({
        queryKey: ['time-entries', 'project', vars.projectId],
      })
      qc.invalidateQueries({ queryKey: ['project', vars.workspaceId] })
      qc.invalidateQueries({ queryKey: ['capacity', vars.workspaceId] })
      qc.invalidateQueries({ queryKey: ['reports', vars.workspaceId] })
      qc.invalidateQueries({ queryKey: ['dashboard', vars.workspaceId] })
    },
  })
}

export function useDeleteTimeEntry() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      entryId,
    }: {
      entryId: string
      workspaceId: string
      projectId: string
    }) => {
      const { error } = await supabase
        .from('time_entries')
        .delete()
        .eq('id', entryId)
      if (error) throw error
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({
        queryKey: ['time-entries', 'project', vars.projectId],
      })
      qc.invalidateQueries({ queryKey: ['project', vars.workspaceId] })
      qc.invalidateQueries({ queryKey: ['capacity', vars.workspaceId] })
      qc.invalidateQueries({ queryKey: ['reports', vars.workspaceId] })
      qc.invalidateQueries({ queryKey: ['dashboard', vars.workspaceId] })
    },
  })
}

// Re-export for unused-imports check on ProjectDetail
export type { RawTimeEntry }
