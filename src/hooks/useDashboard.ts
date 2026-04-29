import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type {
  ProjectHealthView,
  MemberWorkloadView,
  AIInsight,
  Risk,
  Task,
} from '@/types/database'

interface DashboardData {
  projects: ProjectHealthView[]
  members: MemberWorkloadView[]
  aiInsight: AIInsight | null
  activeRisks: Risk[]
  recentTasks: Task[]
}

export function useDashboard(workspaceId: string | undefined) {
  return useQuery<DashboardData>({
    queryKey: ['dashboard', workspaceId],
    enabled: !!workspaceId,
    queryFn: async () => {
      // Em paralelo: tudo o que o dashboard precisa
      const [
        { data: projects, error: projectsErr },
        { data: members, error: membersErr },
        { data: insights, error: insightsErr },
        { data: risks, error: risksErr },
        { data: tasks, error: tasksErr },
      ] = await Promise.all([
        supabase
          .from('v_project_health')
          .select('*')
          .eq('workspace_id', workspaceId!),
        supabase
          .from('v_member_workload')
          .select('*')
          .eq('workspace_id', workspaceId!)
          .order('open_estimated_hours', { ascending: false }),
        supabase
          .from('ai_insights')
          .select('*')
          .eq('workspace_id', workspaceId!)
          .eq('is_dismissed', false)
          .order('created_at', { ascending: false })
          .limit(1),
        supabase
          .from('risks')
          .select('*, project:projects(name, code)')
          .eq('workspace_id', workspaceId!)
          .neq('status', 'closed')
          .order('severity', { ascending: false }),
        supabase
          .from('tasks')
          .select('*, status:task_statuses(name, category)')
          .eq('workspace_id', workspaceId!)
          .is('deleted_at', null)
          .order('updated_at', { ascending: false })
          .limit(20),
      ])

      if (projectsErr) throw projectsErr
      if (membersErr) throw membersErr
      if (insightsErr) throw insightsErr
      if (risksErr) throw risksErr
      if (tasksErr) throw tasksErr

      return {
        projects: projects ?? [],
        members: members ?? [],
        aiInsight: insights?.[0] ?? null,
        activeRisks: (risks ?? []) as Risk[],
        recentTasks: (tasks ?? []) as Task[],
      }
    },
  })
}
