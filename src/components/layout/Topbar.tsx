import { Search, Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'
import { NotificationsBell } from '@/components/layout/NotificationsBell'
import { useCommandPalette } from '@/hooks/useCommandPalette'

export function Topbar() {
  const { user } = useAuth()
  const openPalette = useCommandPalette((s) => s.setOpen)
  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
  const firstName =
    (user?.user_metadata?.full_name as string | undefined)?.split(' ')[0] ??
    user?.email?.split('@')[0] ??
    ''

  const isMac =
    typeof navigator !== 'undefined' &&
    /Mac|iPhone|iPad/i.test(navigator.platform)

  return (
    <header className="sticky top-0 z-20 bg-bg/85 backdrop-blur border-b">
      <div className="px-8 h-16 flex items-center gap-4">
        <div>
          <div className="text-[11px] text-muted capitalize">{today}</div>
          <div className="text-[15px] font-semibold">
            Bom dia, {firstName} 👋
          </div>
        </div>

        <button
          type="button"
          onClick={() => openPalette(true)}
          className="flex-1 max-w-xl mx-auto relative bg-panel border rounded-lg pl-9 pr-16 py-2 text-sm text-muted hover:border-brand/40 transition text-left"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted w-4 h-4" />
          Buscar projetos, tasks, pessoas, clientes...
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted bg-panel2 border px-1.5 py-0.5 rounded font-mono">
            {isMac ? '⌘K' : 'Ctrl K'}
          </span>
        </button>

        <NotificationsBell />
        <Button>
          <Plus className="w-3.5 h-3.5" />
          Novo
        </Button>
      </div>
    </header>
  )
}
