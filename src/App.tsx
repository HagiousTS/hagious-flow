import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AppShell } from '@/components/layout/AppShell'
import { ThemeSwitcher } from '@/components/theme/ThemeSwitcher'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { LoginPage } from '@/pages/Login'
import { DashboardPage } from '@/pages/Dashboard'
import { InboxPage } from '@/pages/Inbox'
import { FocusPage } from '@/pages/Focus'
import { CapacityPage } from '@/pages/Capacity'
import {
  ProjectsPage, ProjectDetailPage, TasksPage,
  TeamPage, ClientsPage, AICopilotPage, ReportsPage,
} from '@/pages/placeholders'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<DashboardPage />} />
            <Route path="/projetos" element={<ProjectsPage />} />
            <Route path="/projetos/:id" element={<ProjectDetailPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/inbox" element={<InboxPage />} />
            <Route path="/capacity" element={<CapacityPage />} />
            <Route path="/foco" element={<FocusPage />} />
            <Route path="/equipe" element={<TeamPage />} />
            <Route path="/clientes" element={<ClientsPage />} />
            <Route path="/ia-coo" element={<AICopilotPage />} />
            <Route path="/relatorios" element={<ReportsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <ThemeSwitcher />
      </BrowserRouter>
    </QueryClientProvider>
  )
}
