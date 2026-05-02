import { Search, Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'
import { NotificationsBell } from '@/components/layout/NotificationsBell'

export function Topbar() {
  const { user } = useAuth()
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

  return (
    <header className="sticky top-0 z-20 bg-bg/85 backdrop-blur border-b">
      <div className="px-8 h-16 flex items-center gap-4">
        <div>
          <div className="text-[11px] text-muted capitalize">{today}</div>
          <div className="text-[15px] font-semibold">
            Bom dia, {firstName} 👋
          </div>
        </div>

        <div className="flex-1 max-w-xl mx-auto relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted w-4 h-4" />
          <input
            className="w-full bg-panel border rounded-lg pl-9 pr-16 py-2 text-sm placeholder:text-muted focus:outline-none focus:border-brand transition"
            placeholder="Buscar projetos, tasks, pessoas, clientes..."
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted bg-panel2 border px-1.5 py-0.5 rounded">
            ⌘K
          </span>
        </div>

        <NotificationsBell />
        <Button>
          <Plus className="w-3.5 h-3.5" />
          Novo
        </Button>
      </div>
    </header>
  )
}
