import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { ActivityLogEntry } from '@/types/database'

export interface ActivityLogFilters {
  actorType?: 'all' | 'user' | 'ai' | 'system'
  action?: string
  entityType?: string
}

interface RawEntry {
  id: string
  workspace_id: string
  actor_user_id: string | null
  actor_type: string
  action: string
  entity_type: string
  entity_id: string | null
  diff_json: unknown
  metadata_json: unknown
  created_at: string
  actor: {
    id: string
    full_name: string
    avatar_url: string | null
  } | null
}

export function useActivityLog(
  workspaceId: string | undefined,
  filters: ActivityLogFilters = {}
) {
  return useQuery<ActivityLogEntry[]>({
    queryKey: [
      'activity-log',
      workspaceId,
      filters.actorType ?? 'all',
      filters.action ?? 'all',
      filters.entityType ?? 'all',
    ],
    enabled: !!workspaceId,
    queryFn: async () => {
      let q = supabase
        .from('activity_log')
        .select(
          'id, workspace_id, actor_user_id, actor_type, action, entity_type, entity_id, diff_json, metadata_json, created_at, actor:profiles(id, full_name, avatar_url)'
        )
        .eq('workspace_id', workspaceId!)
        .order('created_at', { ascending: false })
        .limit(200)

      if (filters.actorType && filters.actorType !== 'all') {
        q = q.eq('actor_type', filters.actorType)
      }
      if (filters.action && filters.action !== 'all') {
        q = q.eq('action', filters.action)
      }
      if (filters.entityType && filters.entityType !== 'all') {
        q = q.eq('entity_type', filters.entityType)
      }

      const { data, error } = await q
      if (error) throw error
      return ((data ?? []) as unknown as RawEntry[]).map((row) => ({
        id: row.id,
        workspace_id: row.workspace_id,
        actor_user_id: row.actor_user_id,
        actor_type: row.actor_type,
        action: row.action,
        entity_type: row.entity_type,
        entity_id: row.entity_id,
        diff_json: row.diff_json,
        metadata_json: row.metadata_json,
        created_at: row.created_at,
        actor: row.actor
          ? {
              id: row.actor.id,
              email: '',
              full_name: row.actor.full_name,
              avatar_url: row.actor.avatar_url,
            }
          : null,
      })) as ActivityLogEntry[]
    },
  })
}
