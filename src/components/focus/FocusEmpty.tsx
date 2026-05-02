import { Target } from 'lucide-react'
import { Card } from '@/components/ui/Card'

export function FocusEmpty() {
  return (
    <Card className="p-12 text-center">
      <div className="w-16 h-16 rounded-2xl grad-brand mx-auto flex items-center justify-center mb-4">
        <Target className="w-7 h-7 text-white" />
      </div>
      <h2 className="text-xl font-bold mb-2">Nenhuma sessão de foco ativa</h2>
      <p className="text-sm text-muted max-w-md mx-auto mb-6">
        Quando alguém do workspace estiver em modo foco, a sessão aparece aqui
        com a fila de acionamentos e métricas em tempo real.
      </p>
      <button
        type="button"
        disabled
        className="grad-brand text-white text-sm font-semibold px-5 py-2.5 rounded-lg opacity-60 cursor-not-allowed inline-flex items-center gap-2"
        title="Mutação na próxima iteração"
      >
        <Target className="w-4 h-4" />
        Iniciar nova sessão
      </button>
    </Card>
  )
}
