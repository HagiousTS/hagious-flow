import { useMemo, useState } from 'react'
import { useWorkspace } from '@/hooks/useWorkspace'
import { useMoveTask, useTasksBoard } from '@/hooks/useTasksBoard'
import { KanbanBoard } from '@/components/tasks/KanbanBoard'
import { TasksFiltersBar } from '@/components/tasks/TasksFiltersBar'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'

export function TasksPage() {
  const { data: workspace, isLoading: wsLoading } = useWorkspace()
  const { data, isLoading, isError, error } = useTasksBoard(workspace?.id)
  const moveTask = useMoveTask(workspace?.id)

  const [search, setSearch] = useState('')
  const [selectedProject, setSelectedProject] = useState('')
  const [selectedMember, setSelectedMember] = useState('')
  const [onlyBlocked, setOnlyBlocked] = useState(false)

  const filtered = useMemo(() => {
    if (!data) return []
    const q = search.trim().toLowerCase()
    return data.tasks.filter((t) => {
      if (selectedProject && t.project_id !== selectedProject) return false
      if (selectedMember && t.assignee_member_id !== selectedMember)
        return false
      if (onlyBlocked && !t.is_blocked) return false
      if (!q) return true
      const code = t.project ? `${t.project.code}-${t.sequence_number}` : ''
      return (
        t.title.toLowerCase().includes(q) ||
        code.toLowerCase().includes(q) ||
        (t.description_md ?? '').toLowerCase().includes(q)
      )
    })
  }, [data, search, selectedProject, selectedMember, onlyBlocked])

  if (wsLoading || isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 rounded-xl" />
        <Skeleton className="h-12 rounded-xl" />
        <div className="flex gap-4 overflow-x-auto">
          {[...Array(4)].map((_, i) => (
            <Skeleton
              key={i}
              className="h-[60vh] w-[280px] rounded-xl shrink-0"
            />
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <Card className="border-danger/30">
        <div className="text-center py-8">
          <h3 className="font-semibold text-danger mb-2">
            Erro ao carregar Tasks
          </h3>
          <p className="text-sm text-muted">{(error as Error).message}</p>
        </div>
      </Card>
    )
  }

  if (!workspace || !data) {
    return (
      <Card>
        <div className="text-center py-12">
          <h3 className="font-semibold mb-2">Sem workspace ativo</h3>
        </div>
      </Card>
    )
  }

  const projectOptions = data.projects.map((p) => ({
    value: p.id,
    label: `${p.code} · ${p.name}`,
  }))
  const memberOptions = data.members.map((m) => ({
    value: m.id,
    label: m.full_name,
  }))

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-6 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tasks · Kanban</h1>
          <p className="text-sm text-muted mt-1">
            Arraste cards entre colunas para mudar o status. Mutação otimista,
            persiste no banco.
          </p>
        </div>
        {moveTask.isPending && (
          <span className="text-[11px] text-muted">Salvando…</span>
        )}
      </div>

      <TasksFiltersBar
        search={search}
        onSearchChange={setSearch}
        projects={projectOptions}
        selectedProject={selectedProject}
        onProjectChange={setSelectedProject}
        members={memberOptions}
        selectedMember={selectedMember}
        onMemberChange={setSelectedMember}
        showBlocked={onlyBlocked}
        onToggleBlocked={() => setOnlyBlocked((v) => !v)}
        totalTasks={data.tasks.length}
        filteredCount={filtered.length}
      />

      <KanbanBoard
        statuses={data.statuses}
        tasks={filtered}
        onMove={(taskId, newStatusId) =>
          moveTask.mutate({ taskId, newStatusId })
        }
      />

      {moveTask.isError && (
        <Card className="border-danger/40">
          <p className="text-sm text-danger">
            Falha ao mover task: {(moveTask.error as Error).message}
          </p>
        </Card>
      )}
    </div>
  )
}
