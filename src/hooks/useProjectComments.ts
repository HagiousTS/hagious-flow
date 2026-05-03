import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { ProjectComment } from '@/types/database'

interface CommentRow {
  id: string
  project_id: string
  workspace_id: string
  author_member_id: string
  body_md: string
  is_ai_generated: boolean | null
  created_at: string
  updated_at: string
  deleted_at: string | null
  author: {
    id: string
    profile: {
      id: string
      full_name: string
      avatar_url: string | null
      email: string | null
    } | null
  } | null
}

export function useProjectComments(projectId: string | undefined) {
  return useQuery<ProjectComment[]>({
    queryKey: ['project-comments', projectId],
    enabled: !!projectId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_comments')
        .select(
          'id, project_id, workspace_id, author_member_id, body_md, is_ai_generated, created_at, updated_at, deleted_at, author:workspace_members(id, profile:profiles(id, full_name, avatar_url, email))'
        )
        .eq('project_id', projectId!)
        .is('deleted_at', null)
        .order('created_at', { ascending: true })
      if (error) throw error
      return ((data ?? []) as unknown as CommentRow[]).map((row) => ({
        ...row,
        author: row.author
          ? {
              id: row.author.id,
              workspace_id: row.workspace_id,
              user_id: '',
              role: '',
              job_title: null,
              hourly_rate: null,
              capacity_hours_week: null,
              is_in_focus_mode: null,
              focus_mode_until: null,
              is_active: true,
              profile: row.author.profile
                ? {
                    id: row.author.profile.id,
                    full_name: row.author.profile.full_name,
                    avatar_url: row.author.profile.avatar_url,
                    email: row.author.profile.email ?? '',
                  }
                : undefined,
            }
          : null,
      })) as ProjectComment[]
    },
  })
}

interface CreateCommentArgs {
  projectId: string
  workspaceId: string
  authorMemberId: string
  body: string
  mentionMemberIds: string[]
  projectName: string
  projectHref: string
  authorName: string
}

export function useCreateProjectComment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (args: CreateCommentArgs) => {
      const trimmed = args.body.trim()
      if (!trimmed) throw new Error('Comentário vazio')

      const { data: comment, error } = await supabase
        .from('project_comments')
        .insert({
          project_id: args.projectId,
          workspace_id: args.workspaceId,
          author_member_id: args.authorMemberId,
          body_md: trimmed,
          is_ai_generated: false,
        })
        .select('*')
        .single()
      if (error) throw error

      if (args.mentionMemberIds.length > 0) {
        const { data: members } = await supabase
          .from('workspace_members')
          .select('user_id')
          .in('id', args.mentionMemberIds)
          .eq('is_active', true)
        const recipientUserIds = (members ?? [])
          .map((m) => m.user_id as string | null)
          .filter((u): u is string => !!u)

        if (recipientUserIds.length > 0) {
          await supabase.from('notifications').insert(
            recipientUserIds.map((uid) => ({
              workspace_id: args.workspaceId,
              user_id: uid,
              type: 'mention',
              title: `${args.authorName} mencionou você no projeto ${args.projectName}`,
              body: trimmed.slice(0, 240),
              entity_type: 'project',
              entity_id: args.projectId,
              action_url: args.projectHref,
              is_read: false,
            }))
          )
        }
      }
      return comment
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['project-comments', vars.projectId] })
      qc.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

interface UpdateProjectCommentArgs {
  commentId: string
  projectId: string
  body: string
}

export function useUpdateProjectComment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ commentId, body }: UpdateProjectCommentArgs) => {
      const trimmed = body.trim()
      if (!trimmed) throw new Error('Comentário vazio')
      const { error } = await supabase
        .from('project_comments')
        .update({ body_md: trimmed })
        .eq('id', commentId)
      if (error) throw error
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['project-comments', vars.projectId] })
    },
  })
}

export function useDeleteProjectComment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      commentId,
    }: {
      commentId: string
      projectId: string
    }) => {
      const { error } = await supabase
        .from('project_comments')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', commentId)
      if (error) throw error
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['project-comments', vars.projectId] })
    },
  })
}
