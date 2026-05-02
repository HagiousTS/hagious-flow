import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'
import type { BreakdownRow } from '@/hooks/useReports'

interface BarBreakdownProps {
  title: string
  description?: string
  rows: BreakdownRow[]
  emptyLabel?: string
  showPercent?: boolean
  maxVisible?: number
}

const HIGHLIGHT_CLS: Record<string, string> = {
  on_track: 'grad-brand',
  ahead: 'bg-info',
  at_risk: 'bg-warn',
  off_track: 'bg-danger',
}

export function BarBreakdown({
  title,
  description,
  rows,
  emptyLabel = 'Sem dados disponíveis.',
  showPercent = true,
  maxVisible = 8,
}: BarBreakdownProps) {
  const visible = rows.slice(0, maxVisible)
  const hidden = rows.length - visible.length

  return (
    <Card className="space-y-3">
      <div>
        <h3 className="font-semibold text-[15px]">{title}</h3>
        {description && (
          <p className="text-xs text-muted mt-0.5">{description}</p>
        )}
      </div>

      {rows.length === 0 ? (
        <div className="text-center py-8 text-muted text-sm border border-dashed border-border rounded-xl">
          {emptyLabel}
        </div>
      ) : (
        <div className="space-y-2.5">
          {visible.map((r) => {
            const barCls =
              r.highlight && HIGHLIGHT_CLS[r.highlight]
                ? HIGHLIGHT_CLS[r.highlight]
                : 'grad-brand'
            return (
              <div key={r.id} className="space-y-1">
                <div className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{r.label}</div>
                    {r.sublabel && (
                      <div className="text-[10px] text-muted truncate">
                        {r.sublabel}
                      </div>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-semibold">{r.formatted}</div>
                    {showPercent && (
                      <div className="text-[10px] text-muted">
                        {r.pct.toFixed(1)}%
                      </div>
                    )}
                  </div>
                </div>
                <div className="h-2 rounded-full bg-panel2 overflow-hidden">
                  <div
                    className={cn('h-full transition-all', barCls)}
                    style={{ width: `${Math.max(2, Math.round(r.pctOfMax))}%` }}
                  />
                </div>
              </div>
            )
          })}
          {hidden > 0 && (
            <div className="text-[11px] text-muted text-center pt-1">
              +{hidden} item{hidden !== 1 ? 's' : ''} oculto
              {hidden !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      )}
    </Card>
  )
}
