import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { TaskComment } from '@/types/database'

interface CommentRow {
  id: string
  task_id: string
  author_member_id: string | null
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

export function useTaskComments(taskId: string | undefined) {
  return useQuery<TaskComment[]>({
    queryKey: ['task-comments', taskId],
    enabled: !!taskId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('task_comments')
        .select(
          'id, task_id, author_member_id, body_md, is_ai_generated, created_at, updated_at, deleted_at, author:workspace_members(id, profile:profiles(id, full_name, avatar_url, email))'
        )
        .eq('task_id', taskId!)
        .is('deleted_at', null)
        .order('created_at', { ascending: true })
      if (error) throw error
      return ((data ?? []) as unknown as CommentRow[]).map((row) => ({
        ...row,
        author: row.author
          ? {
              id: row.author.id,
              workspace_id: '',
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
      })) as TaskComment[]
    },
  })
}

interface CreateCommentArgs {
  taskId: string
  authorMemberId: string
  body: string
  workspaceId: string
  mentionMemberIds: string[]
  taskTitle: string
  taskHref: string
  authorName: string
}

export function useCreateTaskComment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (args: CreateCommentArgs) => {
      const trimmed = args.body.trim()
      if (!trimmed) throw new Error('Comentário vazio')

      const { data: comment, error } = await supabase
        .from('task_comments')
        .insert({
          task_id: args.taskId,
          author_member_id: args.authorMemberId,
          body_md: trimmed,
          is_ai_generated: false,
        })
        .select('*')
        .single()
      if (error) throw error

      // Notifica menções @user (via member_id ou via user_id do member)
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
              title: `${args.authorName} mencionou você em ${args.taskTitle}`,
              body: trimmed.slice(0, 240),
              entity_type: 'task',
              entity_id: args.taskId,
              action_url: args.taskHref,
              is_read: false,
            }))
          )
        }
      }

      return comment
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['task-comments', vars.taskId] })
      qc.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

export function useDeleteTaskComment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      commentId,
    }: {
      commentId: string
      taskId: string
    }) => {
      const { error } = await supabase
        .from('task_comments')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', commentId)
      if (error) throw error
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['task-comments', vars.taskId] })
    },
  })
}

/**
 * Resolve @nome para member_id usando lista de membros do workspace.
 * Match flexível: case-insensitive, ignora diacríticos, casa qualquer parte do
 * nome separada por espaço (ex.: @leticia casa "Letícia Souza").
 */
export function extractMentions(
  body: string,
  members: { id: string; full_name: string }[]
): string[] {
  const matches = body.matchAll(/@([\p{L}0-9_.-]+)/gu)
  const found = new Set<string>()
  for (const m of matches) {
    const handle = normalize(m[1])
    for (const mem of members) {
      const parts = mem.full_name.split(/\s+/).filter(Boolean).map(normalize)
      const fullJoined = parts.join('')
      if (
        parts.includes(handle) ||
        fullJoined.startsWith(handle) ||
        fullJoined === handle
      ) {
        found.add(mem.id)
        break
      }
    }
  }
  return Array.from(found)
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '')
}
