import { Navigate, Outlet } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useWorkspaces } from '@/hooks/useWorkspace'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

export function AppShell() {
  const { data: workspaces, isLoading, isError, error } = useWorkspaces()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-brand" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="max-w-md text-center space-y-3">
          <h1 className="text-lg font-semibold text-text">
            Falha ao carregar workspaces
          </h1>
          <p className="text-sm text-muted">
            {(error as Error)?.message ?? 'Erro desconhecido'}
          </p>
          <p className="text-xs text-muted">
            Abra o console (F12) pra ver o erro exato e recarregue.
          </p>
        </div>
      </div>
    )
  }

  if (!workspaces || workspaces.length === 0) {
    return <Navigate to="/onboarding" replace />
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 min-w-0">
        <Topbar />
        <div className="p-8 max-w-[1500px] mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
