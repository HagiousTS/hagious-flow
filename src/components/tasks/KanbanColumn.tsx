import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { Task, TaskStatus } from '@/types/database'
import { TaskCard } from './TaskCard'

interface KanbanColumnProps {
  status: TaskStatus
  tasks: Task[]
  draggingTaskId: string | null
  onDragStart: (e: React.DragEvent<HTMLDivElement>, taskId: string) => void
  onDragEnd: () => void
  onDrop: (statusId: string) => void
}

const CATEGORY_ACCENT: Record<string, string> = {
  todo: 'border-l-muted',
  doing: 'border-l-info',
  review: 'border-l-brand-2',
  done: 'border-l-ok',
  blocked: 'border-l-danger',
}

export function KanbanColumn({
  status,
  tasks,
  draggingTaskId,
  onDragStart,
  onDragEnd,
  onDrop,
}: KanbanColumnProps) {
  const [isOver, setIsOver] = useState(false)

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (!draggingTaskId) return
    e.preventDefault()
    setIsOver(true)
  }

  const handleDragLeave = () => setIsOver(false)

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsOver(false)
    onDrop(status.id)
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        'flex flex-col bg-panel2/40 border border-border rounded-xl border-l-4 min-w-[280px] w-[280px] shrink-0 max-h-full transition',
        CATEGORY_ACCENT[status.category] ?? 'border-l-muted',
        isOver && 'ring-2 ring-brand/40 bg-brand/5'
      )}
    >
      <div className="px-4 py-3 border-b border-border flex items-center justify-between sticky top-0 bg-panel2/80 backdrop-blur z-[1] rounded-t-xl">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-[13px]">{status.name}</h3>
          <span className="text-[10px] text-muted bg-panel border border-border rounded-full px-2 py-0.5">
            {tasks.length}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar p-3 space-y-2">
        {tasks.length === 0 ? (
          <div className="text-center text-[11px] text-muted border border-dashed border-border rounded-lg py-6">
            Sem tasks aqui.
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              isDragging={draggingTaskId === task.id}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
            />
          ))
        )}
      </div>
    </div>
  )
}
