import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { AIAction } from '@/types/database'

export function useAIActions(actionIds: string[]) {
  const sorted = [...actionIds].sort().join(',')
  return useQuery<AIAction[]>({
    queryKey: ['ai-actions', sorted],
    enabled: actionIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_actions')
        .select('*')
        .in('id', actionIds)
      if (error) throw error
      return (data ?? []) as AIAction[]
    },
  })
}

export function useApplyAIAction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (actionId: string) => {
      const { data, error } = await supabase.rpc('apply_ai_action', {
        p_action_id: actionId,
      })
      if (error) throw error
      return data as AIAction
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ai-actions'] })
      qc.invalidateQueries({ queryKey: ['tasks-board'] })
      qc.invalidateQueries({ queryKey: ['project-detail'] })
      qc.invalidateQueries({ queryKey: ['inbox'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      qc.invalidateQueries({ queryKey: ['capacity'] })
    },
  })
}

export function useRejectAIAction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (actionId: string) => {
      const { data, error } = await supabase.rpc('reject_ai_action', {
        p_action_id: actionId,
      })
      if (error) throw error
      return data as AIAction
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ai-actions'] })
    },
  })
}
