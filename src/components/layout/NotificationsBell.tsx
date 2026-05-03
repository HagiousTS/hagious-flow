import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Bell, Check, CheckCheck } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useWorkspace } from '@/hooks/useWorkspace'
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from '@/hooks/useNotifications'
import { cn, relativeDays } from '@/lib/utils'
import type { Notification } from '@/types/database'

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

export function NotificationsBell() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: workspace } = useWorkspace()
  const { data, isLoading } = useNotifications(workspace?.id, user?.id)
  const markRead = useMarkNotificationRead()
  const markAll = useMarkAllNotificationsRead()

  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  const list = data?.list ?? []
  const unread = data?.unreadCount ?? 0

  function handleNotificationClick(n: Notification) {
    if (!n.is_read && workspace && user) {
      markRead.mutate({ id: n.id, workspaceId: workspace.id, userId: user.id })
    }
    if (n.action_url) {
      setOpen(false)
      navigate(n.action_url)
    }
  }

  function handleMarkAll() {
    if (!workspace || !user || unread === 0) return
    markAll.mutate({ workspaceId: workspace.id, userId: user.id })
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'relative w-9 h-9 rounded-lg bg-panel border hover:border-brand/40 flex items-center justify-center transition',
          open && 'border-brand/50'
        )}
        aria-label="Notificações"
      >
        <Bell className="w-4 h-4" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-danger text-white text-[10px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center font-bold">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 w-[360px] bg-panel border rounded-xl shadow-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <div>
              <div className="font-semibold text-sm">Notificações</div>
              <div className="text-[11px] text-muted">
                {unread > 0
                  ? `${unread} não lida${unread !== 1 ? 's' : ''}`
                  : 'tudo em dia'}
              </div>
            </div>
            {unread > 0 && (
              <button
                type="button"
                onClick={handleMarkAll}
                disabled={markAll.isPending}
                className="text-[11px] flex items-center gap-1 text-muted hover:text-brand transition disabled:opacity-50"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Marcar todas
              </button>
            )}
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            {isLoading ? (
              <div className="text-center py-10 text-muted text-xs">
                Carregando...
              </div>
            ) : list.length === 0 ? (
              <div className="text-center py-10 px-4">
                <Bell className="w-8 h-8 mx-auto mb-2 text-muted opacity-50" />
                <div className="text-sm font-medium">Sem notificações</div>
                <div className="text-[11px] text-muted mt-1">
                  Avisos de risco, OS e menções vão aparecer aqui em tempo
                  real.
                </div>
              </div>
            ) : (
              list.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => handleNotificationClick(n)}
                  className={cn(
                    'w-full text-left px-4 py-3 border-b last:border-b-0 hover:bg-panel2 transition flex gap-3',
                    !n.is_read && 'bg-brand/5'
                  )}
                >
                  <div
                    className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-[11px] font-bold uppercase',
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
                      {n.is_read && (
                        <span className="flex items-center gap-0.5">
                          <Check className="w-3 h-3" />
                          lida
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          <div className="border-t bg-panel2/30">
            <Link
              to="/notificacoes"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-1 px-4 py-2 text-xs text-muted hover:text-brand transition"
            >
              Ver todas as notificações
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
