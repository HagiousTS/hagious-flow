import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type {
  Workspace,
  WorkspaceInvitation,
  WorkspaceInvitationPreview,
  WorkspaceInvitationRole,
} from '@/types/database'

export function useInvitations(workspaceId: string | undefined) {
  return useQuery<WorkspaceInvitation[]>({
    queryKey: ['invitations', workspaceId],
    enabled: !!workspaceId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workspace_invitations')
        .select('*')
        .eq('workspace_id', workspaceId!)
        .is('accepted_at', null)
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as WorkspaceInvitation[]
    },
  })
}

interface CreateInvitationArgs {
  workspaceId: string
  email: string
  role: WorkspaceInvitationRole
}

export function useCreateInvitation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (args: CreateInvitationArgs) => {
      const { data, error } = await supabase.rpc(
        'create_workspace_invitation',
        {
          p_workspace_id: args.workspaceId,
          p_email: args.email,
          p_role: args.role,
        }
      )
      if (error) throw error
      return data as WorkspaceInvitation
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['invitations', vars.workspaceId] })
    },
  })
}

export function usePreviewInvitation(token: string | undefined) {
  return useQuery<WorkspaceInvitationPreview | null>({
    queryKey: ['invitation', 'preview', token],
    enabled: !!token,
    queryFn: async () => {
      const { data, error } = await supabase.rpc(
        'preview_workspace_invitation',
        { p_token: token! }
      )
      if (error) throw error
      const row = Array.isArray(data) ? data[0] : data
      return (row ?? null) as WorkspaceInvitationPreview | null
    },
  })
}

export function useAcceptInvitation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (token: string) => {
      const { data, error } = await supabase.rpc(
        'accept_workspace_invitation',
        { p_token: token }
      )
      if (error) throw error
      return data as Workspace
    },
    onSuccess: () => {
      qc.invalidateQueries()
    },
  })
}
