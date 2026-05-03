import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AppShell } from '@/components/layout/AppShell'
import { ThemeSwitcher } from '@/components/theme/ThemeSwitcher'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { LoginPage } from '@/pages/Login'
import { SignupPage } from '@/pages/Signup'
import { OnboardingPage } from '@/pages/Onboarding'
import { AcceptInvitationPage } from '@/pages/AcceptInvitation'
import { TimerBar } from '@/components/timer/TimerBar'
import { CommandPaletteHost } from '@/components/search/CommandPaletteHost'
import { Skeleton } from '@/components/ui/Skeleton'

const DashboardPage = lazy(() =>
  import('@/pages/Dashboard').then((m) => ({ default: m.DashboardPage }))
)
const InboxPage = lazy(() =>
  import('@/pages/Inbox').then((m) => ({ default: m.InboxPage }))
)
const FocusPage = lazy(() =>
  import('@/pages/Focus').then((m) => ({ default: m.FocusPage }))
)
const CapacityPage = lazy(() =>
  import('@/pages/Capacity').then((m) => ({ default: m.CapacityPage }))
)
const ProjectDetailPage = lazy(() =>
  import('@/pages/ProjectDetail').then((m) => ({
    default: m.ProjectDetailPage,
  }))
)
const TasksPage = lazy(() =>
  import('@/pages/Tasks').then((m) => ({ default: m.TasksPage }))
)
const TeamPage = lazy(() =>
  import('@/pages/Team').then((m) => ({ default: m.TeamPage }))
)
const ClientsPage = lazy(() =>
  import('@/pages/Clients').then((m) => ({ default: m.ClientsPage }))
)
const AICopilotPage = lazy(() =>
  import('@/pages/AICopilot').then((m) => ({ default: m.AICopilotPage }))
)
const ProjectsPage = lazy(() =>
  import('@/pages/Projects').then((m) => ({ default: m.ProjectsPage }))
)
const ReportsPage = lazy(() =>
  import('@/pages/Reports').then((m) => ({ default: m.ReportsPage }))
)
const SettingsPage = lazy(() =>
  import('@/pages/Settings').then((m) => ({ default: m.SettingsPage }))
)

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function PageFallback() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-64 rounded-lg" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-64 rounded-xl" />
    </div>
  )
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            path="/aceitar-convite/:token"
            element={<AcceptInvitationPage />}
          />

          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <OnboardingPage />
              </ProtectedRoute>
            }
          />

          <Route
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route
              path="/"
              element={
                <Suspense fallback={<PageFallback />}>
                  <DashboardPage />
                </Suspense>
              }
            />
            <Route
              path="/projetos"
              element={
                <Suspense fallback={<PageFallback />}>
                  <ProjectsPage />
                </Suspense>
              }
            />
            <Route
              path="/projetos/:id"
              element={
                <Suspense fallback={<PageFallback />}>
                  <ProjectDetailPage />
                </Suspense>
              }
            />
            <Route
              path="/tasks"
              element={
                <Suspense fallback={<PageFallback />}>
                  <TasksPage />
                </Suspense>
              }
            />
            <Route
              path="/inbox"
              element={
                <Suspense fallback={<PageFallback />}>
                  <InboxPage />
                </Suspense>
              }
            />
            <Route
              path="/capacity"
              element={
                <Suspense fallback={<PageFallback />}>
                  <CapacityPage />
                </Suspense>
              }
            />
            <Route
              path="/foco"
              element={
                <Suspense fallback={<PageFallback />}>
                  <FocusPage />
                </Suspense>
              }
            />
            <Route
              path="/equipe"
              element={
                <Suspense fallback={<PageFallback />}>
                  <TeamPage />
                </Suspense>
              }
            />
            <Route
              path="/clientes"
              element={
                <Suspense fallback={<PageFallback />}>
                  <ClientsPage />
                </Suspense>
              }
            />
            <Route
              path="/ia-coo"
              element={
                <Suspense fallback={<PageFallback />}>
                  <AICopilotPage />
                </Suspense>
              }
            />
            <Route
              path="/relatorios"
              element={
                <Suspense fallback={<PageFallback />}>
                  <ReportsPage />
                </Suspense>
              }
            />
            <Route
              path="/configuracoes"
              element={
                <Suspense fallback={<PageFallback />}>
                  <SettingsPage />
                </Suspense>
              }
            />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <TimerBar />
        <CommandPaletteHost />
        <ThemeSwitcher />
      </BrowserRouter>
    </QueryClientProvider>
  )
}
