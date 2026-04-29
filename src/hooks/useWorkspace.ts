import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Workspace } from '@/types/database'

/**
 * Busca o workspace do usuário autenticado.
 * Por enquanto usamos o primeiro workspace que ele é membro.
 * Quando tivermos multi-workspace UI, isso vai virar um workspace switcher.
 */
export function useWorkspace() {
  return useQuery<Workspace | null>({
    queryKey: ['workspace', 'current'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workspaces')
        .select('*')
        .limit(1)
        .single()

      if (error) {
        // Se não houver workspace acessível (RLS bloqueou), retornar null
        if (error.code === 'PGRST116') return null
        throw error
      }
      return data
    },
  })
}
