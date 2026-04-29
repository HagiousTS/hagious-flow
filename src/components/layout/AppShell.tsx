import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

export function AppShell() {
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
