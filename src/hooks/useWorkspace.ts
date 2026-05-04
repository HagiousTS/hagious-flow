import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'
import type { Workspace } from '@/types/database'

interface ActiveWorkspaceState {
  activeId: string | null
  setActiveId: (id: string | null) => void
}

const useActiveWorkspace = create<ActiveWorkspaceState>()(
  persist(
    (set) => ({
      activeId: null,
      setActiveId: (id) => set({ activeId: id }),
    }),
    { name: 'hagious.activeWorkspace' }
  )
)

export function useWorkspaces() {
  return useQuery<Workspace[]>({
    queryKey: ['workspaces', 'list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workspaces')
        .select('*')
        .is('archived_at', null)
        .order('created_at', { ascending: true })
      if (error) throw error
      return data ?? []
    },
  })
}

export function useWorkspace() {
  const list = useWorkspaces()
  const activeId = useActiveWorkspace((s) => s.activeId)
  const active =
    list.data?.find((w) => w.id === activeId) ?? list.data?.[0] ?? null

  return {
    data: active,
    isLoading: list.isLoading,
    isError: list.isError,
    error: list.error,
  }
}

export function useSetActiveWorkspace() {
  const setActiveId = useActiveWorkspace((s) => s.setActiveId)
  const qc = useQueryClient()
  return (id: string) => {
    setActiveId(id)
    qc.invalidateQueries()
  }
}

export interface BootstrapWorkspaceArgs {
  name: string
  slug: string
  industry?: string | null
  plan?: string
  seats?: number
}

export interface UpdateWorkspaceArgs {
  workspaceId: string
  name: string
  slug: string
  industry: string | null
  plan: string
  seats: number
}

export function useUpdateWorkspace() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (args: UpdateWorkspaceArgs) => {
      const { data, error } = await supabase.rpc('update_workspace', {
        p_workspace_id: args.workspaceId,
        p_name: args.name,
        p_slug: args.slug,
        p_industry: args.industry,
        p_plan: args.plan,
        p_seats: args.seats,
      })
      if (error) throw error
      return data as Workspace
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workspaces', 'list'] })
    },
  })
}

export function useArchiveWorkspace() {
  const qc = useQueryClient()
  const setActiveId = useActiveWorkspace((s) => s.setActiveId)
  return useMutation({
    mutationFn: async (workspaceId: string) => {
      const { error } = await supabase.rpc('archive_workspace', {
        p_workspace_id: workspaceId,
      })
      if (error) throw error
    },
    onSuccess: () => {
      setActiveId(null)
      qc.invalidateQueries()
    },
  })
}

export function useBootstrapWorkspace() {
  const setActiveId = useActiveWorkspace((s) => s.setActiveId)
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (args: BootstrapWorkspaceArgs) => {
      const { data, error } = await supabase.rpc('bootstrap_workspace', {
        p_name: args.name,
        p_slug: args.slug,
        p_industry: args.industry ?? null,
        p_plan: args.plan ?? 'free',
        p_seats: args.seats ?? 3,
      })
      if (error) throw error
      return data as Workspace
    },
    onSuccess: (ws) => {
      setActiveId(ws.id)
      qc.invalidateQueries()
    },
  })
}
