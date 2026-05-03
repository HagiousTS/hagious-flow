import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BarChart3,
  Bot,
  Building2,
  CalendarDays,
  Check,
  Inbox,
  ListChecks,
  Sparkles,
  Target,
  Users,
} from 'lucide-react'
import { ThemeSwitcher } from '@/components/theme/ThemeSwitcher'

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 'R$ 0',
    suffix: '',
    seats: 'Até 3 usuários',
    cta: 'Começar grátis',
    href: '/signup',
    features: [
      'Dashboard executivo',
      'Projetos, tasks e clientes',
      'Inbox de OS',
      'Mock do IA COO',
    ],
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 'R$ 29',
    suffix: '/usuário/mês',
    seats: 'Até 10 usuários',
    cta: 'Começar trial',
    href: '/signup',
    features: [
      'Tudo do Free',
      'Capacity Planner',
      'Modo Foco',
      'Convites por link',
    ],
  },
  {
    id: 'business',
    name: 'Business',
    price: 'R$ 59',
    suffix: '/usuário/mês',
    seats: 'Usuários ilimitados',
    cta: 'Começar trial',
    href: '/signup',
    highlight: true,
    badge: 'Recomendado',
    features: [
      'Tudo do Starter',
      'IA COO com tool calls',
      'Auditoria completa',
      'Relatórios + export CSV',
      'Suporte prioritário',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 'R$ 119',
    suffix: '/usuário/mês',
    seats: 'Ilimitado',
    cta: 'Falar com vendas',
    href: 'mailto:gusttavo@hagiousts.com',
    features: [
      'Tudo do Business',
      'IA com mais autonomia',
      'Webhook Sankhya',
      'SSO / SAML',
    ],
  },
]

const FEATURES = [
  {
    icon: Inbox,
    title: 'Inbox de OS com triagem por IA',
    body: 'Recebe OS por email, portal ou WhatsApp. IA classifica DoR e propõe quem pega. Aprovação humana antes de virar task.',
  },
  {
    icon: CalendarDays,
    title: 'Capacity Planner real',
    body: 'Heatmap semanal por pessoa, considerando skills e alocação. Detecta over-allocation antes do bloqueio.',
  },
  {
    icon: Target,
    title: 'Modo Foco',
    body: 'Sessão protegida por tempo. Fila de acionamentos pra interromper sem quebrar fluxo.',
  },
  {
    icon: Bot,
    title: 'IA COO com 8 tool calls',
    body: 'Copiloto que lê o estado real do workspace e propõe ações: criar task, escalar OS, registrar risco — sempre com aprovação humana.',
  },
  {
    icon: BarChart3,
    title: 'Relatórios executivos',
    body: 'Receita por cliente, utilização do time, throughput de tasks, bloqueios por projeto. Export CSV em 1 clique.',
  },
  {
    icon: Users,
    title: 'Time tracking integrado',
    body: 'Timer por task com 1 clique. Edição manual a posteriori. Calcula faturamento por hora automaticamente.',
  },
]

const ICP = [
  { icon: Building2, label: 'Consultorias ERP' },
  { icon: ListChecks, label: 'Software houses' },
  { icon: Users, label: 'Times de TI interno' },
]

export function LandingPage() {
  return (
    <div className="min-h-screen bg-bg text-text">
      <header className="sticky top-0 z-30 bg-bg/85 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl grad-brand flex items-center justify-center font-bold text-white">
              H
            </div>
            <div className="font-bold tracking-tight">
              Hagious <span className="grad-text">Flow</span>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-5 ml-6 text-sm text-muted">
            <a href="#features" className="hover:text-text transition">
              Features
            </a>
            <a href="#planos" className="hover:text-text transition">
              Planos
            </a>
            <a href="#icp" className="hover:text-text transition">
              Pra quem é
            </a>
          </nav>
          <div className="flex-1" />
          <Link
            to="/login"
            className="text-sm text-muted hover:text-text transition"
          >
            Entrar
          </Link>
          <Link
            to="/signup"
            className="text-sm font-semibold grad-brand text-white px-4 py-2 rounded-lg hover:opacity-90 transition flex items-center gap-1"
          >
            Criar conta grátis
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      <section className="px-6 pt-20 pb-16 max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border bg-panel text-xs">
            <Sparkles className="w-3.5 h-3.5 text-brand" />
            <span className="text-muted">
              IA COO com aprovação humana · 8 ferramentas operacionais
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
            O <span className="grad-text">sistema operacional</span>
            <br />
            das consultorias técnicas e times B2B
          </h1>
          <p className="text-lg text-muted max-w-2xl mx-auto">
            Pare de fragmentar entre Excel, Trello, WhatsApp e ERPs. Hagious
            Flow centraliza projetos, OS, capacity, foco e relatórios — com
            uma IA que detecta riscos e propõe ações antes que o problema
            estoure.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              to="/signup"
              className="grad-brand text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition flex items-center gap-2"
            >
              Começar grátis
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#features"
              className="border bg-panel px-6 py-3 rounded-xl font-semibold hover:border-brand/40 transition"
            >
              Ver features
            </a>
          </div>
          <div className="text-[11px] text-muted">
            Sem cartão · Trial sem prazo · Free pra times até 3 pessoas
          </div>
        </div>
      </section>

      <section id="icp" className="px-6 pb-16 max-w-6xl mx-auto">
        <div className="text-center text-[11px] text-muted uppercase tracking-wider mb-4">
          Pensado pra
        </div>
        <div className="flex items-center justify-center gap-6 flex-wrap">
          {ICP.map((i) => (
            <div
              key={i.label}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border bg-panel"
            >
              <i.icon className="w-4 h-4 text-brand" />
              <span className="text-sm font-medium">{i.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section
        id="features"
        className="px-6 py-16 bg-panel/40 border-y"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight">
              O que vem dentro
            </h2>
            <p className="text-sm text-muted mt-2 max-w-2xl mx-auto">
              13 telas reais, conectadas a um banco Postgres com RLS por
              workspace. Sem mock decorativo: cada feature persiste,
              audita e respeita permissões.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="p-5 rounded-2xl border bg-panel hover:border-brand/40 transition"
              >
                <div className="w-10 h-10 rounded-xl grad-brand flex items-center justify-center mb-3">
                  <f.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-[15px] mb-1.5">{f.title}</h3>
                <p className="text-xs text-muted leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="planos" className="px-6 py-16 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight">Planos simples</h2>
          <p className="text-sm text-muted mt-2">
            Comece grátis. Pague só quando o time crescer.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {PLANS.map((p) => (
            <div
              key={p.id}
              className={
                p.highlight
                  ? 'p-5 rounded-2xl border-2 border-brand/50 bg-brand/5 relative shadow-lg'
                  : 'p-5 rounded-2xl border bg-panel'
              }
            >
              {p.highlight && p.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 grad-brand text-white text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded">
                  {p.badge}
                </div>
              )}
              <h3 className="font-bold text-lg">{p.name}</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-bold">{p.price}</span>
                {p.suffix && (
                  <span className="text-xs text-muted">{p.suffix}</span>
                )}
              </div>
              <div className="text-[11px] text-muted mt-1 mb-3">{p.seats}</div>
              <ul className="space-y-1.5 mb-4">
                {p.features.map((f) => (
                  <li
                    key={f}
                    className="text-xs flex items-start gap-1.5"
                  >
                    <Check className="w-3 h-3 text-brand mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              {p.href.startsWith('mailto:') ? (
                <a
                  href={p.href}
                  className={
                    p.highlight
                      ? 'block text-center grad-brand text-white py-2 rounded-lg font-semibold hover:opacity-90 transition'
                      : 'block text-center border bg-panel py-2 rounded-lg font-semibold hover:border-brand/40 transition text-sm'
                  }
                >
                  {p.cta}
                </a>
              ) : (
                <Link
                  to={p.href}
                  className={
                    p.highlight
                      ? 'block text-center grad-brand text-white py-2 rounded-lg font-semibold hover:opacity-90 transition'
                      : 'block text-center border bg-panel py-2 rounded-lg font-semibold hover:border-brand/40 transition text-sm'
                  }
                >
                  {p.cta}
                </Link>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 py-16 bg-panel/40 border-t">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            Pronto pra parar de operar fragmentado?
          </h2>
          <p className="text-sm text-muted">
            Crie sua conta em 30 segundos. Você desenha seu workspace
            depois.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 grad-brand text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition"
          >
            Criar conta grátis
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <footer className="px-6 py-8 border-t">
        <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-4 text-xs text-muted">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md grad-brand flex items-center justify-center font-bold text-white text-[10px]">
              H
            </div>
            <span>Hagious Flow · Hagious Tecnologia · Uberlândia/MG</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="hover:text-text transition">
              Entrar
            </Link>
            <Link to="/signup" className="hover:text-text transition">
              Criar conta
            </Link>
            <a
              href="mailto:gusttavo@hagiousts.com"
              className="hover:text-text transition"
            >
              Contato
            </a>
          </div>
        </div>
      </footer>

      <ThemeSwitcher />
    </div>
  )
}
