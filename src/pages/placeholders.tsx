import { Card } from '@/components/ui/Card'
import { Construction } from 'lucide-react'

interface PlaceholderProps {
  title: string
  description: string
}

export function PlaceholderPage({ title, description }: PlaceholderProps) {
  return (
    <Card className="border-dashed">
      <div className="text-center py-16">
        <Construction className="w-12 h-12 mx-auto mb-4 text-muted" />
        <h2 className="text-xl font-semibold mb-2">{title}</h2>
        <p className="text-sm text-muted max-w-md mx-auto">{description}</p>
        <div className="text-[11px] text-muted mt-4">
          Próximas iterações vão portar o protótipo HTML para esta tela conectada ao Supabase.
        </div>
      </div>
    </Card>
  )
}

export const ProjectsPage = () => (
  <PlaceholderPage
    title="Projetos"
    description="Listagem completa, filtros, criação. Integrado com a tabela projects do Supabase."
  />
)
export const TasksPage = () => (
  <PlaceholderPage
    title="Tasks"
    description="Kanban full screen com drag & drop. Filtros por projeto, prioridade, assignee."
  />
)
export const TeamPage = () => (
  <PlaceholderPage
    title="Equipe"
    description="Membros do workspace, papéis, hourly rates, skills, capacidade."
  />
)
export const ClientsPage = () => (
  <PlaceholderPage
    title="Clientes"
    description="CRM lite. Gestão de contatos, contratos, projetos por cliente."
  />
)
export const AICopilotPage = () => (
  <PlaceholderPage
    title="IA COO"
    description="Chat fullscreen com a IA. Comandos slash. Tool use sob aprovação. Histórico semântico."
  />
)
export const ReportsPage = () => (
  <PlaceholderPage
    title="Relatórios"
    description="BI executivo. Receita, margem, throughput, NPS. Exportação CSV/PDF."
  />
)
