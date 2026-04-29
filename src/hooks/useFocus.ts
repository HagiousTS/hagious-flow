import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { AcknowledgmentQueueItem, FocusSession } from '@/types/database'

export interface FocusMetrics {
  sessionsThisWeek: number
  minutesThisWeek: number
  interruptionsBlocked: number
  interruptionsEscalated: number
}

export interface FocusData {
  session: FocusSession | null
  queue: AcknowledgmentQueueItem[]
  metrics: FocusMetrics
}

function startOfWeekIso(): string {
  const now = new Date()
  const day = now.getDay()
  const diff = day === 0 ? 6 : day - 1
  const monday = new Date(now)
  monday.setDate(now.getDate() - diff)
  monday.setHours(0, 0, 0, 0)
  return monday.toISOString()
}

export function useFocus(workspaceId: string | undefined) {
  return useQuery<FocusData>({
    queryKey: ['focus', workspaceId],
    enabled: !!workspaceId,
    refetchInterval: 30_000,
    queryFn: async () => {
      const weekStart = startOfWeekIso()

      const [{ data: sessions, error: sessionsErr }, { data: weekSessions, error: weekErr }] =
        await Promise.all([
          supabase
            .from('focus_sessions')
            .select(
              `*,
               task:tasks(id, sequence_number, title, description_md, priority, project:projects(id, code, name)),
               member:workspace_members(id, job_title, user_id, profile:profiles(id, full_name, avatar_url))`
            )
            .eq('workspace_id', workspaceId!)
            .is('ended_at', null)
            .order('started_at', { ascending: false })
            .limit(1),
          supabase
            .from('focus_sessions')
            .select('id, planned_minutes, actual_minutes, interruptions_blocked, interruptions_escalated, started_at, ended_at')
            .eq('workspace_id', workspaceId!)
            .gte('started_at', weekStart),
        ])

      if (sessionsErr) throw sessionsErr
      if (weekErr) throw weekErr

      const session = (sessions?.[0] ?? null) as FocusSession | null

      let queue: AcknowledgmentQueueItem[] = []
      if (session) {
        const { data: queueRows, error: queueErr } = await supabase
          .from('acknowledgment_queue')
          .select(
            `*,
             requester:workspace_members!acknowledgment_queue_requester_member_id_fkey(id, job_title, user_id, profile:profiles(id, full_name, avatar_url)),
             escalated_to:workspace_members!acknowledgment_queue_escalated_to_member_id_fkey(id, job_title, user_id, profile:profiles(id, full_name, avatar_url))`
          )
          .eq('workspace_id', workspaceId!)
          .eq('target_member_id', session.member_id)
          .is('resolved_at', null)
          .order('created_at', { ascending: false })

        if (queueErr) throw queueErr
        queue = (queueRows ?? []) as AcknowledgmentQueueItem[]
      }

      const sessionsThisWeek = weekSessions?.length ?? 0
      const minutesThisWeek = (weekSessions ?? []).reduce((acc, s) => {
        const elapsed = s.actual_minutes ?? minutesElapsed(s.started_at, s.ended_at)
        return acc + elapsed
      }, 0)
      const interruptionsBlocked = (weekSessions ?? []).reduce(
        (acc, s) => acc + (s.interruptions_blocked ?? 0),
        0
      )
      const interruptionsEscalated = (weekSessions ?? []).reduce(
        (acc, s) => acc + (s.interruptions_escalated ?? 0),
        0
      )

      return {
        session,
        queue,
        metrics: {
          sessionsThisWeek,
          minutesThisWeek,
          interruptionsBlocked,
          interruptionsEscalated,
        },
      }
    },
  })
}

function minutesElapsed(startedAt: string, endedAt: string | null): number {
  const start = new Date(startedAt).getTime()
  const end = endedAt ? new Date(endedAt).getTime() : Date.now()
  return Math.max(0, Math.round((end - start) / 60_000))
}
