import { Link } from 'react-router-dom'
import { Mail, Phone, Inbox, AlertTriangle } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Card } from '@/components/ui/Card'
import { cn, formatBRL, relativeDays } from '@/lib/utils'
import type { ClientRow } from '@/hooks/useClients'

interface ClientCardProps {
  row: ClientRow
}

const STATUS_CLS: Record<string, string> = {
  on_track: 'bg-brand/20 text-brand',
  ahead: 'bg-info/20 text-info',
  at_risk: 'bg-warn/20 text-warn',
  off_track: 'bg-danger/20 text-danger',
}

const STATUS_LABEL: Record<string, string> = {
  on_track: 'on track',
  ahead: 'adiantado',
  at_risk: 'em risco',
  off_track: 'fora',
}

export function ClientCard({ row }: ClientCardProps) {
  const { client } = row
  const inactive = !client.is_active
  const offTrack = row.projects.some((p) => p.health === 'off_track')

  return (
    <Card
      className={cn(
        'flex flex-col gap-4',
        inactive && 'opacity-60'
      )}
    >
      <div className="flex items-start gap-3">
        <Avatar name={client.name} size="lg" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-[15px] leading-tight truncate">
              {client.trade_name ?? client.name}
            </h3>
            {offTrack && (
              <span
                className="text-[10px] px-1.5 py-0.5 rounded chip-status-block flex items-center gap-1"
                title="Tem projeto fora do prazo"
              >
                <AlertTriangle className="w-3 h-3" />
                fora
              </span>
            )}
            {inactive && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-panel2 text-muted border border-border">
                inativo
              </span>
            )}
          </div>
          {client.trade_name && (
            <div className="text-xs text-muted mt-0.5 truncate">
              {client.name}
            </div>
          )}
          {client.cnpj && (
            <div className="text-[11px] text-muted mt-0.5 font-mono">
              {client.cnpj}
            </div>
          )}
        </div>
      </div>

      {(client.contact_name || client.contact_email || client.contact_phone) && (
        <div className="space-y-1 text-[12px]">
          {client.contact_name && (
            <div className="font-medium text-text">{client.contact_name}</div>
          )}
          {client.contact_email && (
            <div className="flex items-center gap-1 text-muted truncate">
              <Mail className="w-3 h-3 shrink-0" />
              <a
                href={`mailto:${client.contact_email}`}
                className="hover:text-brand truncate"
              >
                {client.contact_email}
              </a>
            </div>
          )}
          {client.contact_phone && (
            <div className="flex items-center gap-1 text-muted">
              <Phone className="w-3 h-3 shrink-0" />
              <span>{client.contact_phone}</span>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-panel2 rounded-lg py-2">
          <div className="text-[10px] text-muted uppercase tracking-wider">
            Projetos
          </div>
          <div className="text-sm font-bold mt-0.5">
            {row.activeProjects}
            <span className="text-muted text-[10px] font-medium">
              {' '}
              ativos
            </span>
          </div>
        </div>
        <div className="bg-panel2 rounded-lg py-2">
          <div className="text-[10px] text-muted uppercase tracking-wider">
            Receita
          </div>
          <div className="text-sm font-bold mt-0.5">
            {formatBRL(row.totalBudget, { compact: true })}
          </div>
        </div>
        <div className="bg-panel2 rounded-lg py-2">
          <div className="text-[10px] text-muted uppercase tracking-wider">
            Horas
          </div>
          <div className="text-sm font-bold mt-0.5">
            {Math.round(row.totalActualHours)}h
          </div>
        </div>
      </div>

      {row.projects.length > 0 ? (
        <div className="space-y-1.5">
          <div className="text-[10px] text-muted uppercase tracking-wider mb-1">
            Projetos
          </div>
          {row.projects.slice(0, 3).map((p) => (
            <Link
              key={p.id}
              to={`/projetos/${p.id}`}
              className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-panel2 transition group"
            >
              <span className="font-mono text-[11px] text-muted shrink-0 w-12 truncate">
                {p.code}
              </span>
              <span className="flex-1 text-xs truncate group-hover:text-brand">
                {p.name}
              </span>
              {p.health && STATUS_CLS[p.health] && (
                <span
                  className={cn(
                    'text-[9px] px-1.5 py-0.5 rounded shrink-0',
                    STATUS_CLS[p.health]
                  )}
                >
                  {STATUS_LABEL[p.health] ?? p.health}
                </span>
              )}
            </Link>
          ))}
          {row.projects.length > 3 && (
            <div className="text-[10px] text-muted text-center pt-1">
              +{row.projects.length - 3} projeto
              {row.projects.length - 3 !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      ) : (
        <div className="text-[11px] text-muted italic text-center py-2 border border-dashed border-border rounded-lg">
          Sem projetos
        </div>
      )}

      <div className="flex items-center justify-between border-t pt-3 text-[11px] text-muted">
        <div className="flex items-center gap-1">
          <Inbox className="w-3 h-3" />
          {row.openServiceOrders} OS abertas
        </div>
        <div>
          última atividade {relativeDays(row.lastActivityAt ?? null)}
        </div>
      </div>
    </Card>
  )
}
