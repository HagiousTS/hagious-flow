import { useState } from 'react'
import type { Task, TaskStatus } from '@/types/database'
import { KanbanColumn } from './KanbanColumn'

interface KanbanBoardProps {
  statuses: TaskStatus[]
  tasks: Task[]
  onMove: (taskId: string, newStatusId: string) => void
}

export function KanbanBoard({ statuses, tasks, onMove }: KanbanBoardProps) {
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null)

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, taskId: string) => {
    setDraggingTaskId(taskId)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', taskId)
  }

  const handleDragEnd = () => {
    setDraggingTaskId(null)
  }

  const handleDrop = (statusId: string) => {
    if (!draggingTaskId) return
    const task = tasks.find((t) => t.id === draggingTaskId)
    if (task && task.status_id !== statusId) {
      onMove(draggingTaskId, statusId)
    }
    setDraggingTaskId(null)
  }

  return (
    <div className="flex gap-4 overflow-x-auto scrollbar pb-4 min-h-[60vh]">
      {statuses.map((status) => {
        const columnTasks = tasks.filter((t) => t.status_id === status.id)
        return (
          <KanbanColumn
            key={status.id}
            status={status}
            tasks={columnTasks}
            draggingTaskId={draggingTaskId}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDrop={handleDrop}
          />
        )
      })}
    </div>
  )
}
