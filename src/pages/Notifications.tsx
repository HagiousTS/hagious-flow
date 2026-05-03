import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Check, CheckCheck, Loader2, Trash2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useWorkspace } from '@/hooks/useWorkspace'
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from '@/hooks/useNotifications'
import { supabase } from '@/lib/supabase'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn, relativeDays } from '@/lib/utils'
import type { Notification } from '@/types/database'

type ReadFilter = 'all' | 'unread' | 'read'

const TYPE_FILTERS: { id: string; label: string }[] = [
  { id: 'all', label: 'Todos os tipos' },
  { id: 'risk', label: 'Riscos' },
  { id: 'task', label: 'Tasks' },
  { id: 'project', label: 'Projetos' },
  { id: 'os', label: 'OS' },
  { id: 'mention', label: 'Menções' },
  { id: 'ai', label: 'IA' },
]

const TYPE_ACCENT: Record<string, string> = {
  risk: 'bg-danger/15 text-danger',
  task: 'bg-info/15 text-info',
  project: 'bg-brand/15 text-brand',
  os: 'bg-warn/15 text-warn',
  ai: 'bg-purple-500/15 text-purple-300',
  mention: 'bg-info/15 text-info',
  default: 'bg-panel2 text-muted',
}

function accentFor(type: string): string {
  return TYPE_ACCENT[type] ?? TYPE_ACCENT.default
}

export function NotificationsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: workspace, isLoading: wsLoading } = useWorkspace()
  const { data, isLoading } = useNotifications(workspace?.id, user?.id, {
    limit: 200,
  })
  const markRead = useMarkNotificationRead()
  const markAll = useMarkAllNotificationsRead()
  const bulkMark = useBulkMarkRead(workspace?.id, user?.id)
  const bulkDelete = useBulkDeleteNotifications(workspace?.id, user?.id)

  const [readFilter, setReadFilter] = useState<ReadFilter>('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const list = useMemo(() => data?.list ?? [], [data])
  const filtered = useMemo(() => {
    return list.filter((n) => {
      if (readFilter === 'unread' && n.is_read) return false
      if (readFilter === 'read' && !n.is_read) return false
      if (typeFilter !== 'all' && n.type !== typeFilter) return false
      return true
    })
  }, [list, readFilter, typeFilter])

  const allSelected =
    filtered.length > 0 && filtered.every((n) => selected.has(n.id))

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set())
    } else {
      setSelected(new Set(filtered.map((n) => n.id)))
    }
  }

  function toggleOne(id: string) {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelected(next)
  }

  async function handleClick(n: Notification) {
    if (!n.is_read && workspace && user) {
      markRead.mutate({ id: n.id, workspaceId: workspace.id, userId: user.id })
    }
    if (n.action_url) navigate(n.action_url)
  }

  if (wsLoading || isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64 rounded-lg" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    )
  }

  if (!workspace) {
    return (
      <Card>
        <div className="text-center py-12">
          <h3 className="font-semibold mb-2">Sem workspace ativo</h3>
        </div>
      </Card>
    )
  }

  const unreadCount = list.filter((n) => !n.is_read).length

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notificações</h1>
          <p className="text-sm text-muted mt-1">
            {list.length} no histórico ·{' '}
            <span
              className={
                unreadCount > 0 ? 'text-danger font-semibold' : 'text-muted'
              }
            >
              {unreadCount} não lidas
            </span>
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            onClick={() => {
              if (!workspace || !user) return
              markAll.mutate({ workspaceId: workspace.id, userId: user.id })
            }}
            disabled={markAll.isPending}
          >
            <CheckCheck className="w-4 h-4" />
            Marcar todas como lidas
          </Button>
        )}
      </div>

      <Card className="space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 border border-border rounded-lg p-0.5 text-xs">
            {(
              [
                { id: 'all', label: 'Todas' },
                { id: 'unread', label: 'Não lidas' },
                { id: 'read', label: 'Lidas' },
              ] as { id: ReadFilter; label: string }[]
            ).map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setReadFilter(f.id)}
                className={cn(
                  'px-3 py-1 rounded transition',
                  readFilter === f.id
                    ? 'bg-brand text-white font-semibold'
                    : 'text-muted hover:text-text'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="input text-xs max-w-[200px]"
          >
            {TYPE_FILTERS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>

          <div className="flex-1" />

          {selected.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted">
                {selected.size} selecionada{selected.size > 1 ? 's' : ''}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  if (!workspace || !user) return
                  await bulkMark.mutateAsync(Array.from(selected))
                  setSelected(new Set())
                }}
                disabled={bulkMark.isPending}
              >
                <Check className="w-3.5 h-3.5" />
                Marcar como lidas
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={async () => {
                  if (!workspace || !user) return
                  if (!confirm(`Excluir ${selected.size} notificação(ões)?`))
                    return
                  await bulkDelete.mutateAsync(Array.from(selected))
                  setSelected(new Set())
                }}
                disabled={bulkDelete.isPending}
              >
                {bulkDelete.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                Excluir
              </Button>
            </div>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12 px-4 border border-dashed border-border rounded-xl">
            <Bell className="w-8 h-8 mx-auto mb-2 text-muted opacity-50" />
            <div className="text-sm font-medium">
              Nada por aqui pra esses filtros
            </div>
          </div>
        ) : (
          <div className="border border-border rounded-xl overflow-hidden">
            <div className="bg-panel2/50 px-3 py-2 flex items-center gap-2 border-b border-border text-[11px] text-muted">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleAll}
                className="cursor-pointer"
              />
              <span>
                {allSelected
                  ? 'Selecionar nenhuma'
                  : `Selecionar ${filtered.length} visíveis`}
              </span>
            </div>
            <div>
              {filtered.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    'flex items-start gap-3 px-3 py-3 border-b last:border-b-0 hover:bg-panel2/40 transition',
                    !n.is_read && 'bg-brand/5'
                  )}
                >
                  <input
                    type="checkbox"
                    checked={selected.has(n.id)}
                    onChange={() => toggleOne(n.id)}
                    className="mt-1.5 cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <button
                    type="button"
                    onClick={() => handleClick(n)}
                    className="flex-1 text-left flex gap-3 min-w-0"
                  >
                    <div
                      className={cn(
                        'w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-[11px] font-bold uppercase',
                        accentFor(n.type)
                      )}
                    >
                      {n.type.slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2">
                        <div className="font-medium text-sm leading-tight flex-1 min-w-0">
                          {n.title}
                        </div>
                        {!n.is_read && (
                          <span className="w-2 h-2 rounded-full bg-brand mt-1 shrink-0" />
                        )}
                      </div>
                      {n.body && (
                        <div className="text-xs text-muted mt-1 line-clamp-2">
                          {n.body}
                        </div>
                      )}
                      <div className="text-[10px] text-muted mt-1 flex items-center gap-2">
                        <span>{relativeDays(n.created_at)}</span>
                        <span>·</span>
                        <span className="font-mono">{n.type}</span>
                        {n.is_read && (
                          <>
                            <span>·</span>
                            <span className="flex items-center gap-0.5">
                              <Check className="w-3 h-3" />
                              lida
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}

function useBulkMarkRead(
  workspaceId: string | undefined,
  userId: string | undefined
) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (ids: string[]) => {
      if (ids.length === 0) return
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .in('id', ids)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ['notifications', workspaceId, userId],
      })
    },
  })
}

function useBulkDeleteNotifications(
  workspaceId: string | undefined,
  userId: string | undefined
) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (ids: string[]) => {
      if (ids.length === 0) return
      const { error } = await supabase
        .from('notifications')
        .delete()
        .in('id', ids)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ['notifications', workspaceId, userId],
      })
    },
  })
}
