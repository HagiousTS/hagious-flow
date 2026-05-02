import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export type SearchResultKind = 'project' | 'task' | 'client' | 'member'

export interface SearchResult {
  kind: SearchResultKind
  id: string
  title: string
  subtitle: string | null
  badge: string | null
  href: string
}

export interface SearchData {
  projects: SearchResult[]
  tasks: SearchResult[]
  clients: SearchResult[]
  members: SearchResult[]
  total: number
}

function useDebounced<T>(value: T, delay = 200): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
}

export function useGlobalSearch(
  workspaceId: string | undefined,
  query: string
) {
  const debounced = useDebounced(query.trim(), 200)
  const enabled = !!workspaceId && debounced.length >= 2

  return useQuery<SearchData>({
    queryKey: ['search', workspaceId, debounced],
    enabled,
    queryFn: async () => {
      const ilike = `%${debounced}%`
      const [
        { data: projectsRaw, error: pErr },
        { data: tasksRaw, error: tErr },
        { data: clientsRaw, error: cErr },
        { data: membersRaw, error: mErr },
      ] = await Promise.all([
        supabase
          .from('projects')
          .select('id, code, name, status, health')
          .eq('workspace_id', workspaceId!)
          .is('deleted_at', null)
          .or(`name.ilike.${ilike},code.ilike.${ilike}`)
          .limit(6),
        supabase
          .from('tasks')
          .select(
            'id, sequence_number, title, project:projects(id, code, name)'
          )
          .eq('workspace_id', workspaceId!)
          .is('deleted_at', null)
          .ilike('title', ilike)
          .limit(8),
        supabase
          .from('clients')
          .select('id, name, trade_name, contact_name')
          .eq('workspace_id', workspaceId!)
          .is('deleted_at', null)
          .or(`name.ilike.${ilike},trade_name.ilike.${ilike}`)
          .limit(6),
        supabase
          .from('workspace_members')
          .select(
            'id, role, job_title, profile:profiles!inner(id, full_name, email)'
          )
          .eq('workspace_id', workspaceId!)
          .eq('is_active', true)
          .or(
            `full_name.ilike.${ilike},email.ilike.${ilike}`,
            { foreignTable: 'profile' }
          )
          .limit(6),
      ])

      if (pErr) throw pErr
      if (tErr) throw tErr
      if (cErr) throw cErr
      if (mErr) throw mErr

      const projects: SearchResult[] = (projectsRaw ?? []).map((p) => ({
        kind: 'project' as const,
        id: p.id,
        title: p.name,
        subtitle: p.code,
        badge: (p.health ?? p.status) as string | null,
        href: `/projetos/${p.id}`,
      }))

      type TaskRow = {
        id: string
        sequence_number: number
        title: string
        project: { id: string; code: string; name: string } | null
      }
      const tasks: SearchResult[] = (
        (tasksRaw ?? []) as unknown as TaskRow[]
      ).map((t) => ({
        kind: 'task' as const,
        id: t.id,
        title: t.title,
        subtitle: t.project
          ? `${t.project.code}-${t.sequence_number} · ${t.project.name}`
          : `#${t.sequence_number}`,
        badge: null,
        href: t.project ? `/projetos/${t.project.id}` : `/tasks`,
      }))

      const clients: SearchResult[] = (clientsRaw ?? []).map((c) => ({
        kind: 'client' as const,
        id: c.id,
        title: c.trade_name ?? c.name,
        subtitle: c.contact_name ?? c.name,
        badge: null,
        href: `/clientes`,
      }))

      type MemberRow = {
        id: string
        role: string
        job_title: string | null
        profile: { id: string; full_name: string; email: string } | null
      }
      const members: SearchResult[] = (
        (membersRaw ?? []) as unknown as MemberRow[]
      ).map((m) => ({
        kind: 'member' as const,
        id: m.id,
        title: m.profile?.full_name ?? 'Sem nome',
        subtitle: m.job_title ?? m.profile?.email ?? '',
        badge: m.role,
        href: `/equipe`,
      }))

      return {
        projects,
        tasks,
        clients,
        members,
        total:
          projects.length + tasks.length + clients.length + members.length,
      }
    },
  })
}
