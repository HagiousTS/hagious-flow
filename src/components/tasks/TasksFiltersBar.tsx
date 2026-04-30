import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FilterOption {
  value: string
  label: string
}

interface TasksFiltersBarProps {
  search: string
  onSearchChange: (value: string) => void
  projects: FilterOption[]
  selectedProject: string
  onProjectChange: (value: string) => void
  members: FilterOption[]
  selectedMember: string
  onMemberChange: (value: string) => void
  showBlocked: boolean
  onToggleBlocked: () => void
  totalTasks: number
  filteredCount: number
}

export function TasksFiltersBar({
  search,
  onSearchChange,
  projects,
  selectedProject,
  onProjectChange,
  members,
  selectedMember,
  onMemberChange,
  showBlocked,
  onToggleBlocked,
  totalTasks,
  filteredCount,
}: TasksFiltersBarProps) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-muted" />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar task ou código..."
          className="w-full bg-panel border border-border rounded-lg pl-8 pr-3 py-1.5 text-xs placeholder:text-muted focus:outline-none focus:border-brand"
        />
      </div>

      <Select
        value={selectedProject}
        onChange={onProjectChange}
        options={[{ value: '', label: 'Todos os projetos' }, ...projects]}
      />

      <Select
        value={selectedMember}
        onChange={onMemberChange}
        options={[{ value: '', label: 'Toda equipe' }, ...members]}
      />

      <button
        type="button"
        onClick={onToggleBlocked}
        className={cn(
          'text-xs px-3 py-1.5 rounded-lg border transition',
          showBlocked
            ? 'border-danger/40 bg-danger/10 text-danger'
            : 'border-border bg-panel text-muted hover:border-brand/40'
        )}
      >
        {showBlocked ? '⚠ Só bloqueadas' : 'Inclui bloqueadas'}
      </button>

      <span className="text-[11px] text-muted ml-auto">
        {filteredCount} de {totalTasks} tasks
      </span>
    </div>
  )
}

interface SelectProps {
  value: string
  onChange: (value: string) => void
  options: FilterOption[]
}

function Select({ value, onChange, options }: SelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-panel border border-border rounded-lg px-3 py-1.5 text-xs text-text focus:outline-none focus:border-brand"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}
