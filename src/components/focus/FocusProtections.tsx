import { Check } from 'lucide-react'
import { Card } from '@/components/ui/Card'

const PROTECTIONS = [
  {
    title: 'Notificações silenciadas',
    sub: 'Slack, email, push, in-app',
  },
  {
    title: 'IA filtra urgências reais',
    sub: 'Só urgência real escala pro gestor',
  },
  {
    title: 'Atribuição de tasks bloqueada',
    sub: 'Ninguém pode te alocar até o fim',
  },
  {
    title: 'Reuniões automaticamente recusadas',
    sub: 'Calendário sincronizado',
  },
  {
    title: 'Apontamento automático de horas',
    sub: 'Conta tempo real na task atual',
  },
]

export function FocusProtections() {
  return (
    <Card className="p-5">
      <h3 className="font-semibold text-[14px] mb-3">Proteções ativas</h3>
      <div className="space-y-2.5">
        {PROTECTIONS.map((p) => (
          <div key={p.title} className="flex items-center gap-3 text-[13px]">
            <div className="w-7 h-7 rounded-lg bg-ok/15 text-ok flex items-center justify-center shrink-0">
              <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
            </div>
            <div className="flex-1">
              <div className="font-medium">{p.title}</div>
              <div className="text-[10px] text-muted">{p.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
