import { AlertTriangle } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { formatBRL } from '@/lib/utils'
import type { Risk } from '@/types/database'

interface RisksPanelProps {
  risks: Risk[]
}

const severityClass: Record<string, string> = {
  critical: 'border-danger/30 bg-danger/5',
  high:     'border-danger/30 bg-danger/5',
  medium:   'border-warn/30 bg-warn/5',
  low:      'border-info/30 bg-info/5',
}

const severityChip: Record<string, string> = {
  critical: 'chip-priority-high',
  high:     'chip-priority-high',
  medium:   'chip-priority-mid',
  low:      'chip-priority-low',
}

export function RisksPanel({ risks }: RisksPanelProps) {
  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-[14px] flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-warn" />
          Riscos ativos
        </h3>
        <span className="chip chip-priority-high">{risks.length}</span>
      </div>

      {risks.length === 0 ? (
        <div className="text-center py-8 text-muted text-sm">
          Sem riscos ativos. Tudo certo.
        </div>
      ) : (
        <div className="space-y-2">
          {risks.map((r) => (
            <div
              key={r.id}
              className={`border rounded-xl p-3 ${severityClass[r.severity] ?? ''}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono text-muted">{r.code}</span>
                <span className={`chip ${severityChip[r.severity] ?? 'chip-info'}`}>
                  {r.severity === 'high' ? 'Alta' :
                   r.severity === 'medium' ? 'Média' :
                   r.severity === 'critical' ? 'Crítica' : 'Baixa'}
                </span>
              </div>
              <h4 className="text-[13px] font-semibold leading-snug">{r.title}</h4>
              {r.impact_amount != null && (
                <p className="text-[11px] text-muted mt-1">
                  Impacto estimado: <span className="text-text font-medium">{formatBRL(r.impact_amount)}</span>
                </p>
              )}
              {r.mitigation_plan && (
                <p className="text-[11px] text-muted mt-1.5 italic">
                  {r.mitigation_plan}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
