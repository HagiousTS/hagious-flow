import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Notification } from '@/types/database'

export interface NotificationsData {
  list: Notification[]
  unreadCount: number
}

interface UseNotificationsOptions {
  limit?: number
}

export function useNotifications(
  workspaceId: string | undefined,
  userId: string | undefined,
  options: UseNotificationsOptions = {}
) {
  const qc = useQueryClient()
  const enabled = !!workspaceId && !!userId
  const limit = options.limit ?? 30

  const query = useQuery<NotificationsData>({
    queryKey: ['notifications', workspaceId, userId, limit],
    enabled,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('workspace_id', workspaceId!)
        .eq('user_id', userId!)
        .order('created_at', { ascending: false })
        .limit(limit)
      if (error) throw error
      const list = (data ?? []) as Notification[]
      return {
        list,
        unreadCount: list.filter((n) => !n.is_read).length,
      }
    },
  })

  useEffect(() => {
    if (!enabled) return
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          qc.invalidateQueries({
            queryKey: ['notifications', workspaceId, userId],
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [enabled, workspaceId, userId, qc])

  return query
}

interface MarkReadArgs {
  id: string
  workspaceId: string
  userId: string
}

export function useMarkNotificationRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id }: MarkReadArgs) => {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({
        queryKey: ['notifications', vars.workspaceId, vars.userId],
      })
    },
  })
}

interface MarkAllReadArgs {
  workspaceId: string
  userId: string
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ workspaceId, userId }: MarkAllReadArgs) => {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('workspace_id', workspaceId)
        .eq('user_id', userId)
        .eq('is_read', false)
      if (error) throw error
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({
        queryKey: ['notifications', vars.workspaceId, vars.userId],
      })
    },
  })
}
