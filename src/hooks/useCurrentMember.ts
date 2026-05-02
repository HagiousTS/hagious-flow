import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import type { WorkspaceMember } from '@/types/database'

/**
 * Resolve o workspace_member do user autenticado dentro de um workspace.
 * Devolve null se o user não for membro daquele workspace.
 */
export function useCurrentMember(workspaceId: string | undefined) {
  const { user } = useAuth()
  return useQuery<WorkspaceMember | null>({
    queryKey: ['current-member', workspaceId, user?.id],
    enabled: !!workspaceId && !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workspace_members')
        .select('*')
        .eq('workspace_id', workspaceId!)
        .eq('user_id', user!.id)
        .maybeSingle()
      if (error) throw error
      return (data ?? null) as WorkspaceMember | null
    },
  })
}
