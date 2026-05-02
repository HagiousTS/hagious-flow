import { Link } from 'react-router-dom'
import { AlertOctagon, Calendar } from 'lucide-react'
import { TaskTimerButton } from '@/components/timer/TaskTimerButton'
import { cn, formatDateShort, getInitials } from '@/lib/utils'
import type { Task } from '@/types/database'

interface TaskCardProps {
  task: Task
  isDragging?: boolean
  onDragStart: (e: React.DragEvent<HTMLDivElement>, taskId: string) => void
  onDragEnd: () => void
}

const PRIORITY_CHIP: Record<string, { label: string; cls: string }> = {
  P1: { label: 'P1', cls: 'tag-priority-high' },
  P2: { label: 'P2', cls: 'tag-priority-mid' },
  P3: { label: 'P3', cls: 'tag-priority-low' },
}

export function TaskCard({
  task,
  isDragging,
  onDragStart,
  onDragEnd,
}: TaskCardProps) {
  const project = task.project
  const code = project
    ? `${project.code}-${task.sequence_number}`
    : `#${task.sequence_number}`
  const priority = task.priority ? PRIORITY_CHIP[task.priority] : null
  const assigneeName = task.assignee?.profile?.full_name ?? null
  const isOverdue =
    task.due_date &&
    new Date(task.due_date).getTime() < Date.now() &&
    !task.completed_at

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      onDragEnd={onDragEnd}
      className={cn(
        'card p-3 cursor-grab active:cursor-grabbing transition select-none',
        isDragging && 'opacity-40 scale-95',
        task.is_blocked && 'border-danger/40'
      )}
    >
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <span className="font-mono text-[10px] text-muted">{code}</span>
        {priority && (
          <span className={cn('chip', priority.cls)}>{priority.label}</span>
        )}
        {task.is_blocked && (
          <span className="chip tag-status-block flex items-center gap-1">
            <AlertOctagon className="w-3 h-3" /> Bloqueada
          </span>
        )}
        {project && !task.completed_at && !task.is_blocked && (
          <div className="ml-auto">
            <TaskTimerButton
              taskId={task.id}
              taskTitle={task.title}
              taskCode={code}
              projectId={project.id}
              projectCode={project.code}
            />
          </div>
        )}
      </div>

      <h4 className="text-[13px] font-semibold leading-snug mb-2 line-clamp-2">
        {task.title}
      </h4>

      {project && (
        <Link
          to={`/projetos/${project.id}`}
          className="text-[10px] text-muted hover:text-brand truncate block mb-2"
          onClick={(e) => e.stopPropagation()}
        >
          {project.name}
        </Link>
      )}

      <div className="flex items-center justify-between text-[11px] gap-2">
        {assigneeName ? (
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="w-5 h-5 rounded-full bg-panel2 border border-border text-text flex items-center justify-center text-[8px] font-bold shrink-0">
              {getInitials(assigneeName)}
            </div>
            <span className="text-muted truncate">
              {assigneeName.split(' ')[0]}
            </span>
          </div>
        ) : (
          <span className="text-muted">Sem dono</span>
        )}

        {task.due_date && (
          <div
            className={cn(
              'flex items-center gap-1 text-[10px]',
              isOverdue ? 'text-danger font-semibold' : 'text-muted'
            )}
          >
            <Calendar className="w-3 h-3" />
            {formatDateShort(task.due_date)}
          </div>
        )}
      </div>

      {task.estimated_hours != null && (
        <div className="mt-2 text-[10px] text-muted">
          {Number(task.actual_hours ?? 0).toFixed(0)}h /{' '}
          {Number(task.estimated_hours).toFixed(0)}h
        </div>
      )}
    </div>
  )
}
