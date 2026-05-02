import { useEffect, useRef, useState } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  useWorkspace,
  useWorkspaces,
  useSetActiveWorkspace,
} from '@/hooks/useWorkspace'

export function WorkspaceSwitcher() {
  const { data: workspaces, isLoading } = useWorkspaces()
  const { data: active } = useWorkspace()
  const setActive = useSetActiveWorkspace()

  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  const list = workspaces ?? []
  const hasMultiple = list.length > 1

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => hasMultiple && setOpen((v) => !v)}
        disabled={!hasMultiple}
        className={cn(
          'w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-panel2 text-left transition',
          hasMultiple && 'hover:opacity-80 cursor-pointer',
          !hasMultiple && 'cursor-default'
        )}
      >
        <div className="w-7 h-7 rounded-md bg-gradient-to-br from-fuchsia-500 to-rose-500 flex items-center justify-center text-[11px] font-bold text-white">
          {active?.name?.slice(0, 2).toUpperCase() ?? '..'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs text-muted">Workspace</div>
          <div className="text-sm font-semibold leading-tight truncate">
            {isLoading ? 'Carregando...' : (active?.name ?? 'Sem workspace')}
          </div>
        </div>
        {hasMultiple && (
          <ChevronsUpDown className="w-3.5 h-3.5 text-muted shrink-0" />
        )}
      </button>

      {open && hasMultiple && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-panel border rounded-lg shadow-lg overflow-hidden">
          <div className="px-3 py-2 text-[10px] uppercase tracking-wider text-muted border-b">
            Trocar workspace
          </div>
          <div className="max-h-72 overflow-y-auto py-1">
            {list.map((ws) => {
              const isActive = ws.id === active?.id
              return (
                <button
                  key={ws.id}
                  type="button"
                  onClick={() => {
                    if (!isActive) setActive(ws.id)
                    setOpen(false)
                  }}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-panel2 transition',
                    isActive && 'bg-panel2'
                  )}
                >
                  <div className="w-6 h-6 rounded-md bg-gradient-to-br from-fuchsia-500 to-rose-500 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                    {ws.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{ws.name}</div>
                    <div className="text-[10px] text-muted truncate">
                      {ws.plan} · {ws.plan_seats} seats
                    </div>
                  </div>
                  {isActive && (
                    <Check className="w-3.5 h-3.5 text-brand shrink-0" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
