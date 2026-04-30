import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Folder, ListChecks, Users, Building2,
  Sparkles, BarChart3, Settings, Inbox, Calendar, Target,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { Avatar } from '@/components/ui/Avatar'
import { WorkspaceSwitcher } from '@/components/layout/WorkspaceSwitcher'

interface NavItem {
  to: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
}

const operationalNav: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/projetos', label: 'Projetos', icon: Folder },
  { to: '/tasks', label: 'Tasks', icon: ListChecks },
  { to: '/inbox', label: 'Inbox de OS', icon: Inbox, badge: 'novo' },
  { to: '/capacity', label: 'Capacity', icon: Calendar },
  { to: '/foco', label: 'Modo Foco', icon: Target },
  { to: '/equipe', label: 'Equipe', icon: Users },
  { to: '/clientes', label: 'Clientes', icon: Building2 },
]

const intelligenceNav: NavItem[] = [
  { to: '/ia-coo', label: 'IA COO', icon: Sparkles },
  { to: '/relatorios', label: 'Relatórios', icon: BarChart3 },
]

function NavSection({ title, items }: { title: string; items: NavItem[] }) {
  return (
    <div>
      <div className="px-4 text-[10px] tracking-wider text-muted font-semibold uppercase mb-2 mt-3">
        {title}
      </div>
      <nav className="space-y-0.5">
        {items.map(({ to, label, icon: Icon, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-2 text-sm border-l-2 transition-colors',
                isActive
                  ? 'bg-gradient-to-r from-brand/15 to-transparent border-brand text-text font-medium'
                  : 'border-transparent text-muted hover:text-text'
              )
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span className="flex-1">{label}</span>
            {badge && (
              <span className="text-[10px] px-1.5 py-0.5 rounded chip-status-review">
                {badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

export function Sidebar() {
  const { user, signOut } = useAuth()

  return (
    <aside className="w-[240px] shrink-0 border-r bg-panel/60 backdrop-blur sticky top-0 h-screen flex flex-col">
      {/* Logo */}
      <div className="px-5 py-5 border-b flex items-center gap-2">
        <div className="w-9 h-9 rounded-xl grad-brand flex items-center justify-center font-bold text-white">
          H
        </div>
        <div>
          <div className="font-bold tracking-tight text-[15px]">
            Hagious <span className="grad-text">Flow</span>
          </div>
          <div className="text-[10px] text-muted -mt-0.5">v0.1 · MVP</div>
        </div>
      </div>

      {/* Workspace switcher */}
      <div className="px-3 py-3 border-b">
        <WorkspaceSwitcher />
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto py-3">
        <NavSection title="Operação" items={operationalNav} />
        <NavSection title="Inteligência" items={intelligenceNav} />
      </div>

      {/* User */}
      <div className="border-t p-3">
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-panel2 cursor-pointer group">
          <Avatar name={user?.user_metadata?.full_name ?? user?.email} size="md" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold truncate">
              {user?.user_metadata?.full_name ?? user?.email?.split('@')[0]}
            </div>
            <div className="text-[11px] text-muted truncate">
              {user?.email}
            </div>
          </div>
          <button
            onClick={() => signOut()}
            className="opacity-0 group-hover:opacity-100 text-[10px] text-muted hover:text-danger"
            title="Sair"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  )
}
