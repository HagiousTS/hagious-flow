import { Card } from '@/components/ui/Card'
import { cn, formatBRL } from '@/lib/utils'
import type { Risk } from '@/types/database'

interface ProjectRisksProps {
  risks: Risk[]
}

const SEVERITY_META: Record<
  string,
  { label: string; chipCls: string; borderCls: string; bgCls: string }
> = {
  critical: {
    label: 'Crítico',
    chipCls: 'tag-priority-high',
    borderCls: 'border-danger/30',
    bgCls: 'bg-danger/5',
  },
  high: {
    label: 'Alta',
    chipCls: 'tag-priority-high',
    borderCls: 'border-danger/30',
    bgCls: 'bg-danger/5',
  },
  medium: {
    label: 'Média',
    chipCls: 'tag-priority-mid',
    borderCls: 'border-warn/30',
    bgCls: 'bg-warn/5',
  },
  low: {
    label: 'Baixa',
    chipCls: 'tag-priority-low',
    borderCls: 'border-border',
    bgCls: 'bg-panel2/30',
  },
}

export function ProjectRisks({ risks }: ProjectRisksProps) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-[14px]">Riscos ativos</h3>
        <span className="chip tag-priority-high">{risks.length}</span>
      </div>
      {risks.length === 0 ? (
        <div className="text-center py-6 text-muted text-sm border border-dashed border-border rounded-xl">
          Nenhum risco ativo.
        </div>
      ) : (
        <div className="space-y-2">
          {risks.map((r) => {
            const meta = SEVERITY_META[r.severity] ?? SEVERITY_META.medium
            return (
              <div
                key={r.id}
                className={cn('rounded-xl border p-3', meta.borderCls, meta.bgCls)}
              >
                <div className="flex items-center justify-between mb-1 gap-2">
                  <span className="text-[10px] font-mono text-muted">{r.code}</span>
                  <span className={cn('chip', meta.chipCls)}>{meta.label}</span>
                </div>
                <h4 className="text-[13px] font-semibold leading-snug">{r.title}</h4>
                <div className="text-[11px] text-muted mt-1 flex flex-wrap gap-2">
                  {r.impact_amount != null && (
                    <span>Impacto: {formatBRL(Number(r.impact_amount))}</span>
                  )}
                  {r.is_ai_detected && <span>· detectado pela IA</span>}
                </div>
                {r.mitigation_plan && (
                  <p className="text-[11px] text-muted mt-1 line-clamp-2">
                    Mitigação: {r.mitigation_plan}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}
