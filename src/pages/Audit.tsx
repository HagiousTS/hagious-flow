import { useMemo, useState } from 'react'
import {
  ChevronDown,
  ChevronRight,
  Filter,
  ScrollText,
  Sparkles,
} from 'lucide-react'
import { useWorkspace } from '@/hooks/useWorkspace'
import { useActivityLog } from '@/hooks/useActivityLog'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn, getInitials, relativeDays } from '@/lib/utils'
import type { ActivityLogEntry } from '@/types/database'

type ActorFilter = 'all' | 'user' | 'ai' | 'system'

const ENTITY_TYPES = [
  'all',
  'workspace',
  'project',
  'task',
  'risk',
  'service_order',
  'workspace_member',
  'time_entry',
]

const ACTION_TYPES = [
  'all',
  'create',
  'update',
  'delete',
  'apply',
  'detect',
  'invite',
  'archive',
]

const ACTION_LABEL: Record<string, string> = {
  create: 'criou',
  update: 'atualizou',
  delete: 'excluiu',
  apply: 'aplicou (IA)',
  detect: 'detectou (IA)',
  invite: 'convidou',
  archive: 'arquivou',
}

const ENTITY_LABEL: Record<string, string> = {
  workspace: 'workspace',
  project: 'projeto',
  task: 'task',
  risk: 'risco',
  service_order: 'OS',
  workspace_member: 'membro',
  time_entry: 'registro de horas',
  ai_action: 'ação de IA',
  unknown: 'entidade',
}

export function AuditPage() {
  const { data: workspace, isLoading: wsLoading } = useWorkspace()
  const [actorFilter, setActorFilter] = useState<ActorFilter>('all')
  const [actionFilter, setActionFilter] = useState('all')
  const [entityFilter, setEntityFilter] = useState('all')
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const { data, isLoading, isError, error } = useActivityLog(workspace?.id, {
    actorType: actorFilter,
    action: actionFilter,
    entityType: entityFilter,
  })

  const list = useMemo(() => data ?? [], [data])

  function toggleExpand(id: string) {
    const next = new Set(expanded)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setExpanded(next)
  }

  if (wsLoading || isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64 rounded-lg" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    )
  }

  if (isError) {
    return (
      <Card className="border-danger/30">
        <div className="text-center py-8">
          <h3 className="font-semibold text-danger mb-2">
            Erro ao carregar auditoria
          </h3>
          <p className="text-sm text-muted">{(error as Error).message}</p>
        </div>
      </Card>
    )
  }

  if (!workspace) {
    return (
      <Card>
        <div className="text-center py-12">
          <h3 className="font-semibold mb-2">Sem workspace ativo</h3>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <ScrollText className="w-6 h-6" />
          Auditoria
        </h1>
        <p className="text-sm text-muted mt-1">
          Histórico de ações no workspace. {list.length} registros (até 200
          últimos). Inclui ações da IA aplicadas.
        </p>
      </div>

      <Card className="space-y-3">
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <div className="flex items-center gap-1 text-muted">
            <Filter className="w-3.5 h-3.5" />
            Filtros
          </div>

          <div className="flex items-center gap-1 border border-border rounded-lg p-0.5">
            {(
              [
                { id: 'all', label: 'Todos' },
                { id: 'user', label: 'Pessoa' },
                { id: 'ai', label: 'IA' },
                { id: 'system', label: 'Sistema' },
              ] as { id: ActorFilter; label: string }[]
            ).map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setActorFilter(f.id)}
                className={cn(
                  'px-3 py-1 rounded transition',
                  actorFilter === f.id
                    ? 'bg-brand text-white font-semibold'
                    : 'text-muted hover:text-text'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="input text-xs max-w-[160px]"
          >
            {ACTION_TYPES.map((a) => (
              <option key={a} value={a}>
                {a === 'all' ? 'Todas as ações' : (ACTION_LABEL[a] ?? a)}
              </option>
            ))}
          </select>

          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="input text-xs max-w-[180px]"
          >
            {ENTITY_TYPES.map((e) => (
              <option key={e} value={e}>
                {e === 'all' ? 'Todas entidades' : (ENTITY_LABEL[e] ?? e)}
              </option>
            ))}
          </select>
        </div>

        {list.length === 0 ? (
          <div className="text-center py-12 px-4 border border-dashed border-border rounded-xl">
            <ScrollText className="w-8 h-8 mx-auto mb-2 text-muted opacity-50" />
            <div className="text-sm font-medium">
              Nenhuma atividade pra esses filtros
            </div>
          </div>
        ) : (
          <div className="border border-border rounded-xl overflow-hidden">
            <div>
              {list.map((entry) => (
                <Row
                  key={entry.id}
                  entry={entry}
                  expanded={expanded.has(entry.id)}
                  onToggle={() => toggleExpand(entry.id)}
                />
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}

function Row({
  entry,
  expanded,
  onToggle,
}: {
  entry: ActivityLogEntry
  expanded: boolean
  onToggle: () => void
}) {
  const isAi = entry.actor_type === 'ai'
  const actorName = entry.actor?.full_name ?? (isAi ? 'IA COO' : 'Sistema')
  const actionLabel = ACTION_LABEL[entry.action] ?? entry.action
  const entityLabel = ENTITY_LABEL[entry.entity_type] ?? entry.entity_type
  const hasDiff =
    entry.diff_json &&
    typeof entry.diff_json === 'object' &&
    Object.keys(entry.diff_json as Record<string, unknown>).length > 0
  const hasMeta =
    entry.metadata_json &&
    typeof entry.metadata_json === 'object' &&
    Object.keys(entry.metadata_json as Record<string, unknown>).length > 0
  const canExpand = hasDiff || hasMeta

  return (
    <div className="border-b last:border-b-0">
      <button
        type="button"
        onClick={canExpand ? onToggle : undefined}
        className={cn(
          'w-full text-left px-3 py-2.5 flex items-center gap-3 transition',
          canExpand && 'hover:bg-panel2/40 cursor-pointer'
        )}
      >
        <div className="text-muted">
          {canExpand ? (
            expanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )
          ) : (
            <span className="w-4 inline-block" />
          )}
        </div>

        <div
          className={cn(
            'w-7 h-7 rounded-full border flex items-center justify-center shrink-0 text-[10px] font-bold',
            isAi
              ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
              : 'bg-panel2 border-border'
          )}
        >
          {isAi ? <Sparkles className="w-3 h-3" /> : getInitials(actorName)}
        </div>

        <div className="flex-1 min-w-0 text-sm">
          <span className="font-semibold">{actorName}</span>
          <span className="text-muted"> {actionLabel} </span>
          <span className="font-mono text-[12px] bg-panel2 px-1.5 py-0.5 rounded text-text">
            {entityLabel}
          </span>
          {entry.entity_id && (
            <span
              className="text-[10px] text-muted ml-2 font-mono"
              title={entry.entity_id}
            >
              #{entry.entity_id.slice(0, 8)}
            </span>
          )}
        </div>

        {isAi && (
          <span className="text-[10px] uppercase tracking-wider bg-purple-500/15 text-purple-300 px-1.5 py-0.5 rounded font-bold">
            IA
          </span>
        )}
        <span className="text-[11px] text-muted shrink-0">
          {relativeDays(entry.created_at)}
        </span>
      </button>

      {expanded && canExpand && (
        <div className="px-3 pb-3 pl-12 space-y-2">
          {hasDiff && (
            <JsonBlock title="Diff" data={entry.diff_json} />
          )}
          {hasMeta && (
            <JsonBlock title="Metadata" data={entry.metadata_json} />
          )}
        </div>
      )}
    </div>
  )
}

function JsonBlock({ title, data }: { title: string; data: unknown }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted font-semibold mb-1">
        {title}
      </div>
      <pre className="bg-panel2 rounded-lg p-2 text-[11px] overflow-x-auto font-mono">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  )
}

