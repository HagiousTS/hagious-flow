import { useQuery, useQueryClient } from '@tanstack/react-query'
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
