import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Building2,
  Folder,
  ListChecks,
  Loader2,
  Search,
  Users,
  X,
} from 'lucide-react'
import { useWorkspace } from '@/hooks/useWorkspace'
import {
  useGlobalSearch,
  type SearchResult,
  type SearchResultKind,
} from '@/hooks/useGlobalSearch'
import { cn } from '@/lib/utils'

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
}

const KIND_META: Record<
  SearchResultKind,
  { label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  project: { label: 'Projetos', icon: Folder },
  task: { label: 'Tasks', icon: ListChecks },
  client: { label: 'Clientes', icon: Building2 },
  member: { label: 'Equipe', icon: Users },
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const navigate = useNavigate()
  const { data: workspace } = useWorkspace()
  const [query, setQuery] = useState('')
  const [activeIdx, setActiveIdx] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const search = useGlobalSearch(workspace?.id, query)

  // Lista flat ordenada pra navegação por seta
  const flat: SearchResult[] = useMemo(() => {
    if (!search.data) return []
    return [
      ...search.data.projects,
      ...search.data.tasks,
      ...search.data.clients,
      ...search.data.members,
    ]
  }, [search.data])

  useEffect(() => {
    if (!open) return
    setQuery('')
    setActiveIdx(0)
    setTimeout(() => inputRef.current?.focus(), 50)
  }, [open])

  useEffect(() => {
    setActiveIdx(0)
  }, [query])

  useEffect(() => {
    if (!open) return
    function handler(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIdx((i) => Math.min(flat.length - 1, i + 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIdx((i) => Math.max(0, i - 1))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        const r = flat[activeIdx]
        if (r) {
          navigate(r.href)
          onClose()
        }
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, flat, activeIdx, onClose, navigate])

  // Scroll item ativo pra dentro da viewport
  useEffect(() => {
    if (!listRef.current) return
    const el = listRef.current.querySelector(
      `[data-result-idx="${activeIdx}"]`
    )
    el?.scrollIntoView({ block: 'nearest' })
  }, [activeIdx])

  if (!open) return null

  function go(r: SearchResult) {
    navigate(r.href)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[10vh] px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-panel border rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b">
          <Search className="w-4 h-4 text-muted shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar projetos, tasks, clientes, pessoas..."
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted"
          />
          {search.isFetching && (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-muted" />
          )}
          <kbd className="text-[10px] text-muted bg-panel2 border px-1.5 py-0.5 rounded">
            ESC
          </kbd>
          <button
            type="button"
            onClick={onClose}
            className="text-muted hover:text-text"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div ref={listRef} className="max-h-[60vh] overflow-y-auto">
          {query.length < 2 ? (
            <div className="text-center py-12 px-4">
              <Search className="w-8 h-8 mx-auto mb-2 text-muted opacity-50" />
              <div className="text-sm font-medium">
                Comece a digitar para buscar
              </div>
              <div className="text-[11px] text-muted mt-1">
                Mínimo 2 caracteres. Use ↑ ↓ pra navegar e Enter pra abrir.
              </div>
            </div>
          ) : search.isLoading ? (
            <div className="text-center py-10">
              <Loader2 className="w-5 h-5 animate-spin text-brand mx-auto" />
            </div>
          ) : !search.data || search.data.total === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="text-sm font-medium">Nada encontrado</div>
              <div className="text-[11px] text-muted mt-1">
                Tente outra palavra-chave ou cheque o workspace ativo.
              </div>
            </div>
          ) : (
            <>
              {(['project', 'task', 'client', 'member'] as const).map(
                (kind) => {
                  const rows =
                    kind === 'project'
                      ? search.data!.projects
                      : kind === 'task'
                        ? search.data!.tasks
                        : kind === 'client'
                          ? search.data!.clients
                          : search.data!.members
                  if (rows.length === 0) return null
                  return (
                    <Section key={kind} kind={kind}>
                      {rows.map((r) => {
                        const idx = flat.findIndex(
                          (x) => x.id === r.id && x.kind === r.kind
                        )
                        return (
                          <ResultRow
                            key={`${r.kind}-${r.id}`}
                            r={r}
                            idx={idx}
                            active={idx === activeIdx}
                            onClick={() => go(r)}
                            onHover={() => setActiveIdx(idx)}
                          />
                        )
                      })}
                    </Section>
                  )
                }
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function Section({
  kind,
  children,
}: {
  kind: SearchResultKind
  children: React.ReactNode
}) {
  const meta = KIND_META[kind]
  const Icon = meta.icon
  return (
    <div className="border-b last:border-b-0">
      <div className="flex items-center gap-1.5 px-4 py-2 text-[10px] uppercase tracking-wider text-muted bg-panel2/30">
        <Icon className="w-3 h-3" />
        {meta.label}
      </div>
      <div>{children}</div>
    </div>
  )
}

function ResultRow({
  r,
  idx,
  active,
  onClick,
  onHover,
}: {
  r: SearchResult
  idx: number
  active: boolean
  onClick: () => void
  onHover: () => void
}) {
  return (
    <button
      type="button"
      data-result-idx={idx}
      onClick={onClick}
      onMouseEnter={onHover}
      className={cn(
        'w-full text-left px-4 py-2.5 flex items-center gap-3 transition',
        active ? 'bg-brand/10' : 'hover:bg-panel2'
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{r.title}</div>
        {r.subtitle && (
          <div className="text-[11px] text-muted truncate">{r.subtitle}</div>
        )}
      </div>
      {r.badge && (
        <span className="text-[10px] uppercase tracking-wider text-muted bg-panel2 border border-border px-1.5 py-0.5 rounded shrink-0">
          {r.badge}
        </span>
      )}
    </button>
  )
}
