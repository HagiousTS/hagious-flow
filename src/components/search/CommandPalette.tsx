import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Building2,
  Folder,
  ListChecks,
  Loader2,
  Plus,
  Search,
  Sparkles,
  UserPlus,
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

interface QuickAction {
  id: string
  label: string
  hint: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  keywords: string[]
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'new-project',
    label: 'Criar projeto novo',
    hint: 'Abre o dialog de criação de projeto',
    href: '/projetos?new=1',
    icon: Folder,
    keywords: ['novo', 'projeto', 'criar', 'project'],
  },
  {
    id: 'new-client',
    label: 'Cadastrar cliente',
    hint: 'Abre o dialog de novo cliente',
    href: '/clientes?new=1',
    icon: Building2,
    keywords: ['novo', 'cliente', 'cadastrar', 'client'],
  },
  {
    id: 'invite-member',
    label: 'Convidar membro',
    hint: 'Gera link de convite na página Equipe',
    href: '/equipe?invite=1',
    icon: UserPlus,
    keywords: ['convidar', 'membro', 'time', 'invite', 'user'],
  },
  {
    id: 'new-task',
    label: 'Abrir kanban de tasks',
    hint: 'Vai pro board pra criar/editar tasks',
    href: '/tasks',
    icon: ListChecks,
    keywords: ['nova', 'task', 'kanban', 'board'],
  },
  {
    id: 'ia-coo',
    label: 'Falar com IA COO',
    hint: 'Abre o copiloto operacional',
    href: '/ia-coo',
    icon: Sparkles,
    keywords: ['ia', 'coo', 'copiloto', 'chat', 'ai', 'ação'],
  },
]

function actionMatches(a: QuickAction, q: string): boolean {
  if (!q) return true
  const norm = q.toLowerCase()
  if (a.label.toLowerCase().includes(norm)) return true
  if (a.hint.toLowerCase().includes(norm)) return true
  return a.keywords.some((k) => k.toLowerCase().includes(norm))
}

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

  const isCommandQuery = query.startsWith('>') || query.startsWith('/')
  const trimmedQuery = isCommandQuery ? query.slice(1).trim() : query.trim()

  const filteredActions = useMemo(() => {
    if (query.length >= 2 && !isCommandQuery) return []
    return QUICK_ACTIONS.filter((a) => actionMatches(a, trimmedQuery))
  }, [trimmedQuery, isCommandQuery, query])

  // Lista flat: ações + resultados de busca pra navegação por seta
  const flat: (SearchResult | { kind: 'action'; action: QuickAction })[] =
    useMemo(() => {
      const acts = filteredActions.map(
        (a) => ({ kind: 'action' as const, action: a })
      )
      if (!search.data || isCommandQuery) return acts
      return [
        ...acts,
        ...search.data.projects,
        ...search.data.tasks,
        ...search.data.clients,
        ...search.data.members,
      ]
    }, [search.data, filteredActions, isCommandQuery])

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
        if (!r) return
        const href =
          'kind' in r && r.kind === 'action' ? r.action.href : r.href
        navigate(href)
        onClose()
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
          {filteredActions.length > 0 && (
            <ActionSection>
              {filteredActions.map((a) => {
                const idx = flat.findIndex(
                  (x) => 'kind' in x && x.kind === 'action' && x.action.id === a.id
                )
                return (
                  <ActionRow
                    key={a.id}
                    action={a}
                    idx={idx}
                    active={idx === activeIdx}
                    onClick={() => {
                      navigate(a.href)
                      onClose()
                    }}
                    onHover={() => setActiveIdx(idx)}
                  />
                )
              })}
            </ActionSection>
          )}

          {!isCommandQuery && query.length >= 2 && (
            <>
              {search.isLoading ? (
                <div className="text-center py-10">
                  <Loader2 className="w-5 h-5 animate-spin text-brand mx-auto" />
                </div>
              ) : !search.data || search.data.total === 0 ? (
                <div className="text-center py-10 px-4">
                  <div className="text-sm font-medium">
                    Nenhum item encontrado
                  </div>
                  <div className="text-[11px] text-muted mt-1">
                    Tente outra palavra-chave.
                  </div>
                </div>
              ) : (
                (['project', 'task', 'client', 'member'] as const).map(
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
                            (x) =>
                              !('action' in x) &&
                              x.id === r.id &&
                              x.kind === r.kind
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
                )
              )}
            </>
          )}

          {query.length < 2 && filteredActions.length === 0 && (
            <div className="text-center py-12 px-4">
              <Search className="w-8 h-8 mx-auto mb-2 text-muted opacity-50" />
              <div className="text-sm font-medium">
                Comece a digitar para buscar
              </div>
              <div className="text-[11px] text-muted mt-1">
                Mínimo 2 caracteres. Use ↑ ↓ pra navegar e Enter pra abrir.
                Comece com <kbd className="bg-panel2 border px-1 rounded">&gt;</kbd>{' '}
                pra ver só ações.
              </div>
            </div>
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

function ActionSection({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-b">
      <div className="flex items-center gap-1.5 px-4 py-2 text-[10px] uppercase tracking-wider text-muted bg-panel2/30">
        <Plus className="w-3 h-3" />
        Ações rápidas
      </div>
      <div>{children}</div>
    </div>
  )
}

function ActionRow({
  action,
  idx,
  active,
  onClick,
  onHover,
}: {
  action: QuickAction
  idx: number
  active: boolean
  onClick: () => void
  onHover: () => void
}) {
  const Icon = action.icon
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
      <div className="w-7 h-7 rounded-md bg-brand/15 text-brand flex items-center justify-center shrink-0">
        <Icon className="w-3.5 h-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{action.label}</div>
        <div className="text-[11px] text-muted truncate">{action.hint}</div>
      </div>
      <kbd className="text-[10px] text-muted bg-panel2 border px-1.5 py-0.5 rounded font-mono">
        ↵
      </kbd>
    </button>
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
