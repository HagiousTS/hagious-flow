import { Sparkles, Zap } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { formatBRL } from '@/lib/utils'
import type { AIInsight } from '@/types/database'

interface AIBriefingHeroProps {
  insight: AIInsight | null
}

const severityChip: Record<string, string> = {
  critical: 'chip-priority-high',
  high: 'chip-priority-high',
  medium: 'chip-priority-mid',
  low: 'chip-priority-low',
  info: 'chip-info',
}

export function AIBriefingHero({ insight }: AIBriefingHeroProps) {
  if (!insight) {
    return (
      <Card className="ai-shimmer">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl grad-brand flex items-center justify-center">
            <Sparkles className="text-white w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider font-bold grad-text">
              IA COO
            </div>
            <p className="text-sm text-muted">
              Sem briefings agora. Analisando sua operação...
            </p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="ai-shimmer glow relative overflow-hidden">
      <div className="flex items-start gap-4">
        <div className="shrink-0 w-12 h-12 rounded-xl grad-brand flex items-center justify-center">
          <Sparkles className="text-white w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] uppercase tracking-wider font-bold grad-text">
              IA COO
            </span>
            <span className={`chip ${severityChip[insight.severity] ?? 'chip-info'}`}>
              {insight.kind === 'daily_briefing' ? 'Briefing Diário' : insight.kind}
            </span>
            {insight.impact_amount != null && (
              <span className="chip chip-priority-high">
                Impacto: {formatBRL(insight.impact_amount)}
              </span>
            )}
          </div>
          <h2 className="text-base md:text-lg font-semibold leading-snug mb-1">
            {insight.title}
          </h2>
          <p className="text-sm text-muted leading-relaxed">{insight.body_md}</p>
          <div className="flex flex-wrap gap-2 mt-3">
            <Button variant="soft" size="sm">
              <Zap className="w-3 h-3" />
              Aplicar plano da IA
            </Button>
            <Button variant="outline" size="sm">
              Detalhar análise →
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
