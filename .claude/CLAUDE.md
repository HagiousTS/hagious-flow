# Hagious Flow · Contexto do Projeto

> **Documento de handoff** — leitura obrigatória antes de qualquer mudança no código.
> Última atualização: 03/mai/2026 · v0.4 (CRUD pleno + IA com 8 tools + auditoria + notif page + member detail)
> Fundador: Gusttavo Fróes Lopes · Hagious Tecnologia · Uberlândia/MG
> Deploy: https://hagious-flow-lopes.netlify.app

---

## 1. O que é o Hagious Flow

**Posicionamento:** "O sistema operacional das consultorias de tecnologia e times técnicos B2B."

**Dor que resolve:** consultorias ERP (Sankhya, Protheus), software houses e times de TI interno operam fragmentado — Excel, Trello, WhatsApp, Sankhya OS — perdendo controle de hora, projeto, OS, sustentação. Falta um cockpit único.

**ICP (Ideal Customer Profile):**
1. Consultorias ERP de 5–50 pessoas (Sankhya, Protheus, Senior)
2. Software houses de 5–30 pessoas
3. Times de TI interno em empresas médias (50–500 funcionários)

**Modelo de monetização:** SaaS B2B com seats.

| Plano | Preço/usuário | Seats | Foco |
|---|---|---|---|
| Free | R$ 0 | até 3 | freemium / trial |
| Starter | R$ 29/u | até 10 | pequenos times |
| **Business** | **R$ 59/u** | **ilimitado** | **🎯 ICP principal** |
| Pro | R$ 119/u | ilimitado | features avançadas IA |
| Enterprise | sob consulta | ilimitado | SLA dedicado |

**Meta ano 1:** 100 clientes pagantes × ~R$ 450/mês médio = **R$ 45k MRR / R$ 540k ARR**.

**3 vetores de venda (diferencial competitivo):**
1. **IA COO** — copiloto que faz briefing matinal, detecta riscos, sugere ações
2. **Multi-projeto técnico** — capacity planning real com skills + heatmap
3. **Governança Operacional** — Inbox de OS com triagem por IA, Modo Foco, fila de acionamentos

---

## 2. Stack técnico (decidido, não revisitar sem necessidade)

| Camada | Tecnologia | Versão |
|---|---|---|
| Frontend | React + TypeScript + Vite | 18 / 5 / 5 |
| Styling | Tailwind CSS + CSS vars (3 temas) | 3.4 |
| UI Components | shadcn-style (manuais) + lucide-react | 0.453 |
| Estado servidor | TanStack Query | 5.59 |
| Roteamento | React Router | 6.27 |
| State global | Zustand (quando precisar) | 5.0 |
| Backend (futuro) | Java 21 + Spring Boot 3 | — |
| Banco | Supabase (Postgres 16 + Auth + RLS) | — |
| AI | OpenAI API (a integrar) | — |

**Decisões já tomadas (não revisitar sem motivo):**
- ✅ React + Vite ao invés de Next.js (não precisamos de SSR no MVP)
- ✅ Supabase ao invés de Postgres self-hosted (acelera 4–6 semanas de dev)
- ✅ Auth do Supabase ao invés de tabela própria (economiza 2 semanas)
- ✅ Tailwind + CSS vars ao invés de styled-components (compatibilidade com shadcn)
- ✅ TanStack Query ao invés de Redux/Zustand puro pra dados do servidor
- ✅ JWT em cookies HttpOnly (gerenciado pelo Supabase JS)

---

## 3. Estrutura do repositório

```
hagious-flow/
├── .env.example          # template de variáveis
├── .env.local            # credenciais reais (GITIGNORED)
├── .gitignore
├── README.md
├── package.json
├── vite.config.ts        # alias @ → src
├── tsconfig.json + tsconfig.{app,node}.json
├── tailwind.config.js    # tokens HSL semânticos
├── postcss.config.js
├── index.html            # aplica tema antes do React montar
├── public/
│   └── favicon.svg
├── docs/
│   └── ARCHITECTURE.md
└── src/
    ├── lib/
    │   ├── supabase.ts   # cliente singleton
    │   └── utils.ts      # cn, formatBRL, formatDateShort, relativeDays, getInitials
    ├── types/
    │   └── database.ts   # tipos das 12 entidades principais
    ├── hooks/
    │   ├── useAuth.ts
    │   ├── useWorkspace.ts
    │   └── useDashboard.ts
    ├── components/
    │   ├── ui/           # Button, Card, Avatar, Skeleton (shadcn-style)
    │   ├── layout/       # AppShell, Sidebar, Topbar
    │   ├── theme/        # ThemeSwitcher
    │   ├── dashboard/    # AIBriefingHero, KPIRow, ProjectsList, TeamPanel, RisksPanel
    │   └── ProtectedRoute.tsx
    ├── pages/
    │   ├── Login.tsx
    │   ├── Dashboard.tsx
    │   └── placeholders.tsx  # 10 páginas stub
    ├── styles/
    │   └── globals.css   # tokens dos 3 temas + utilities
    ├── App.tsx
    ├── main.tsx
    └── vite-env.d.ts
```

**Convenção de imports:** sempre usar alias `@/` ao invés de paths relativos.

```ts
// ✅ Bom
import { Button } from '@/components/ui/Button'

// ❌ Evitar
import { Button } from '../../components/ui/Button'
```

---

## 4. Sistema de design

**3 temas ativáveis em runtime:**

| ID | Nome | Default? | Quando usar |
|---|---|---|---|
| `sankhya-light` | Sankhya Light | ✅ sim | padrão claro |
| `sankhya-dark` | Sankhya Dark | — | versão escura corporativa |
| `hagious-purple` | Hagious Purple | — | tema original (roxo/azul) |

Todos os tokens são definidos em `src/styles/globals.css` em **HSL** (essencial para `<alpha-value>` do Tailwind funcionar):

```css
:root, [data-theme="sankhya-light"] {
  --brand:        148 100% 30%;   /* #009A4E */
  --brand-2:      87 53% 51%;     /* #7AC143 */
  --bg:           80 22% 96%;
  --panel:        0 0% 100%;
  --text:         148 24% 14%;
  --muted:        140 7% 45%;
  /* ... etc */
}
```

**Regra de ouro:** **nunca hardcoded color** (`text-white`, `bg-gray-100`, `#FF0000`). Sempre usar tokens semânticos: `text-text`, `bg-panel`, `text-muted`, `border-border`, `text-brand`, etc.

**Utilities disponíveis em globals.css:**
- `.grad-brand` — fundo gradient da marca
- `.grad-text` — texto gradient (clip)
- `.glow` — sombra com glow brand
- `.ai-shimmer` — shimmer animado pra elementos de IA
- `.chip` + `.chip-priority-{high,mid,low}` + `.chip-status-{doing,done,block,todo,review}`
- `.card` — superfície padrão (usa Card component preferencialmente)
- `.progress-bar` + `.progress-fill`
- `.skeleton` — loading skeleton com shimmer

---

## 5. Convenções de código

### TypeScript

- ✅ Strict mode ativo (`tsconfig.app.json`)
- ✅ Tipos explícitos em hooks e props
- ✅ Evitar `any` (usar `unknown` se preciso e fazer narrow)
- ✅ Interfaces ao invés de types pra objetos
- ✅ `as const` em constantes literais

### React

- ✅ Function components only (sem class components)
- ✅ Hooks no topo do componente, antes de qualquer return condicional
- ✅ Componentes pequenos (< 250 linhas). Se passar, quebrar.
- ✅ Loading states com Skeleton
- ✅ Error states explícitos (não silenciar)

### Estado servidor

- ✅ **Tudo via TanStack Query** (`useQuery`, `useMutation`)
- ✅ Query keys hierárquicas: `['dashboard', workspaceId]`
- ✅ Invalidar cache após mutações: `queryClient.invalidateQueries({ queryKey: [...] })`
- ✅ `staleTime: 30_000` por padrão, ajustar caso a caso

### Estilo

- ✅ Tailwind utility-first
- ✅ Classes organizadas em ordem: layout → spacing → typography → colors → states
- ✅ Variantes via `class-variance-authority` (cva) para componentes ui/
- ✅ `cn()` helper para merge condicional de classes

### Naming

- ✅ Componentes: `PascalCase.tsx`
- ✅ Hooks: `useCamelCase.ts`
- ✅ Utilities: `camelCase.ts`
- ✅ Páginas: `PascalCase.tsx` + sufixo `Page` no nome do componente exportado

### Commits (Conventional Commits)

```
feat: <descrição>          # nova feature
fix: <descrição>           # correção
refactor: <descrição>      # refactor sem mudança de comportamento
docs: <descrição>          # documentação
style: <descrição>         # formatação, sem mudança de lógica
chore: <descrição>         # tarefas auxiliares
```

---

## 6. ✅ O que está PRONTO (estado atual v0.4)

### Banco de dados (100%)
- ✅ Projeto Supabase provisionado (`lbalifwjrdssoolactbd`)
- ✅ Região: South America (São Paulo)
- ✅ 36 tabelas + 2 views via 13 migrations
- ✅ RLS ativado em todas as tabelas com policies por workspace
- ✅ Triggers de `updated_at` automáticos
- ✅ Trigger `handle_new_user()` cria profile automaticamente no signup
- ✅ Helper `is_workspace_member(workspace_id)` para policies
- ✅ RPCs (security definer) para fluxos críticos:
  - `bootstrap_workspace`: onboarding self-service, cria workspace + member(owner) atomicamente
  - `create_workspace_invitation`, `accept_workspace_invitation`, `preview_workspace_invitation`: convites por link
  - `update_workspace`, `archive_workspace`: edição/danger zone (owner-only)
  - `apply_ai_action`, `reject_ai_action`: aplicação de 8 tool calls da IA com auditoria automática (insere em activity_log)
- ✅ Seeds enriquecidos (Sankhya ABC) — 1 workspace, 6 users, 3 clientes, 4 projetos, 16+ tasks (4 done, 1 review, 1 blocked), 9 OS variados, 28+ time_entries em 3 semanas, 8 notifications, 4 ai_insights, member_skills denso, 8 entries em activity_log
- ✅ View `v_project_health` corrigida (bug de multiplicação no JOIN)

### Edge functions
- ✅ `ia-coo-chat` v3 (verify_jwt) — backend do IA COO
  - Anthropic Messages API (claude-haiku-4-5) se `ANTHROPIC_API_KEY` setada
  - OpenAI Chat Completions (gpt-4o-mini) se `OPENAI_API_KEY` setada
  - Mock determinístico se nenhuma estiver definida (fallback gracioso)
  - **8 Tool calls**: `create_task`, `mark_task_blocked`, `update_task_priority`, `escalate_os`, `complete_task`, `reassign_task`, `create_risk`, `accept_os` — todas propostas pelo modelo e gravadas em `ai_actions` com `status='proposed'`, `requires_approval=true`. Execução real só após Aprovar humano via UI.
  - Injeta contexto do workspace (projetos, membros, tasks, OS, riscos) com UUIDs reais no system prompt
  - Persiste user msg + assistant msg em ai_messages com model_used, tokens, latency, tool_calls_json (referências aos action_ids)
  - apply_ai_action grava activity_log automaticamente

### Frontend (v0.4 — CRUD pleno em 4 entidades + 13 páginas reais)

**Auth + onboarding + convites**
- ✅ Login (Supabase Auth) com link pra signup
- ✅ Signup self-service (`/signup`) com email confirmation handling
- ✅ Onboarding wizard (`/onboarding`) — cria workspace, escolhe plano, slug auto-gerado
- ✅ AppShell redireciona pra `/onboarding` se user sem workspace
- ✅ Convidar membros: dialog na página Equipe gera link `/aceitar-convite/:token` (clipboard) válido 14 dias
- ✅ Página `/aceitar-convite/:token`: 6 estados (sem auth, validando, expirado, mismatch de email, sucesso, erro). Login/Signup respeitam token pendente em localStorage.

**Páginas conectadas ao banco (13)**
- ✅ Dashboard executivo (KPIs + IA briefing + projetos + equipe + riscos)
- ✅ Projetos (lista + filtros + criação via dialog + edição inline via ProjectDrawer com 14 campos + soft delete)
- ✅ Projeto Detalhe (Gantt + tasks + riscos + atividade + equipe + TaskDrawer + ProjectTimeEntries com lista/edit/add manual de horas)
- ✅ Tasks kanban (drag & drop + TaskDrawer completo + comentários com menções @user que disparam notification realtime + TaskTimerButton)
- ✅ Inbox de OS (triagem + DoR + accept/refine/reject)
- ✅ Capacity Planner (heatmap semanal + skill matrix + saturação)
- ✅ Modo Foco (sessão ativa + métricas + fila de acionamentos)
- ✅ Equipe (cards filtráveis + busca + botão Convidar). Card linka pra `/equipe/:id`
- ✅ **Member Detalhe** `/equipe/:id` (KPIs 30d, tasks abertas linkadas, últimos 30 registros de horas, skills ordenadas por proficiência, projetos ativos com role/alocação)
- ✅ Clientes (CRM lite + edição inline via ClientDrawer + criação via NewClientDialog)
- ✅ IA COO fullscreen (chat persistido + 8 tool calls com aprovação humana via ActionProposal cards)
- ✅ Relatórios (KPIs executivos + 6 breakdowns + filtros temporais + export CSV com BOM UTF-8)
- ✅ Configurações `/configuracoes` (rename, slug, setor, plano, seats; danger zone arquiva workspace)
- ✅ Notificações `/notificacoes` (lista 200 últimas + filtros lido/tipo + bulk select/marcar/excluir)
- ✅ Auditoria `/auditoria` (activity_log com filtros actor/action/entity, expand pra ver diff_json+metadata_json)

**Infra de produto**
- ✅ Sistema de 3 temas com persistência em localStorage + ThemeSwitcher
- ✅ Workspace switcher real com Zustand persist + invalidação de queries no troco
- ✅ Notificações realtime via Supabase Realtime (canal por user_id, badge dinâmico)
- ✅ Sidebar com nav 2 seções (Operação, Inteligência) + ícones separados Settings/LogOut
- ✅ **Time tracking**: TaskTimerButton (▶/⏹) em TaskCard e ProjectTasksList; TimerBar flutuante global; stop cria time_entry. Lista/edit/add manual no ProjectDetail.
- ✅ **Command Palette** (⌘K / Ctrl K): busca debounced em 4 entidades + seção "Ações rápidas" (5 atalhos pra criar projeto/cliente/convidar/etc) + suporte a query começando com `>` ou `/` pra filtrar só ações. Pages auto-abrem dialogs via `?new=1`/`?invite=1`.
- ✅ **Comentários em tasks** com menções `@user` (parser tolerante a diacríticos), notification realtime pro mencionado, soft delete

**Build + qualidade**
- ✅ Build com lazy load por rota + manualChunks (carga inicial ~125KB gzip, chunks de página 10–25KB)
- ✅ ESLint flat config v9 + Prettier (lint clean, max-warnings 0)
- ✅ Vitest + 20 testes em src/lib/utils
- ✅ Tipos auto-gerados via Supabase MCP (`src/types/database.generated.ts`)
- ✅ Compat layer (`src/types/database.ts`) com unions estreitas, joined shapes e tipos de IA (AIAction, AIActionType, AIActionStatus, AIToolCallProposal)
- ✅ TypeScript compila sem erros, build de produção OK

### Deploy
- ✅ Hospedado no Netlify (`hagious-flow-lopes.netlify.app`)
- ✅ `netlify.toml` com build command, publish dir e SPA fallback
- ✅ Env vars `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` configuradas no painel

---

## 7. ⏳ O que está PENDENTE (backlog priorizado)

### 🔥 Próximas iniciativas de produto (faltam pra v1)

| # | Item | Esforço | Por quê |
|---|---|---|---|
| 1 | **Landing page de vendas** + captura de beta | M | Aquisição. Sem isso, leads dependem de você puxar manual |
| 2 | **Billing real** (Stripe + cobrança por seat conforme plano) | L | Hoje plano é só metadata; sem cobrar não fecha venda |
| 3 | **Webhook handler** para integrar Sankhya OS via API (recebe OS automaticamente) | L | Diferencial #1 da Inbox: hoje OS são manuais; cliente quer automação |
| 4 | **Dashboard customizável** por papel (manager × dev × QA) | L | Cada papel quer ver coisa diferente; hoje todos veem o mesmo |
| 5 | **Backend Spring Boot** para rotas críticas (auditoria, billing, integrações pesadas) | XL | Edge functions servem o MVP, mas escala/queue jobs precisa backend |

### 🟡 Operação e UX (polish)

| # | Item | Esforço |
|---|---|---|
| 6 | **Triggers de auditoria automáticos** em projects/tasks/risks (hoje só apply_ai_action loga) | M |
| 7 | **Comentários em projetos** (já temos em tasks) | S |
| 8 | **Anexos em tasks/comentários** via Supabase Storage | M |
| 9 | **Edição de comentários** (hoje só create + delete) | S |
| 10 | **Filtros temporais em outros relatórios** (Capacity, Team) | M |

### 🟣 Backlog técnico (dívida e infra)

- [ ] CI/CD via GitHub Actions (lint + typecheck + test + build em PR)
- [ ] Component tests com @testing-library/react (componentes principais)
- [ ] Storybook para os componentes ui/
- [ ] Tracking de erros (Sentry ou equivalente)
- [ ] Generic do `Database` no `createClient` + atualizar hooks pra remover casts (refactor amplo)
- [ ] E2E tests (Playwright) cobrindo fluxos críticos: signup → onboarding → criar projeto → propor tool call → aprovar
- [ ] Auto-aplicar migrations a partir de `supabase/migrations/*.sql` versionadas no repo (hoje migrations vivem só no banco via MCP)

---

## 8. Snapshot do banco

### Projeto Supabase

| Item | Valor |
|---|---|
| Project ID | `lbalifwjrdssoolactbd` |
| URL | `https://lbalifwjrdssoolactbd.supabase.co` |
| Anon key (público) | `sb_publishable_39nV2gR_kgo-GOKRgPIJFw_5TeQaKuw` |
| Plano | Free |
| Região | São Paulo |

### Migrations aplicadas (13)

| Versão | Nome | O que faz |
|---|---|---|
| 20260429224344 | 001_extensions_profiles | Extensions + profiles + triggers |
| 20260429224413 | 002_workspaces_members | Workspaces, members, teams, clients |
| 20260429224506 | 003_projects_tasks | Projects, tasks, comments, time, risks |
| 20260429224622 | 004_notifications_ai_governance | Notif + IA + governança operacional + views |
| 20260429224844 | 005_seeds_sankhya_abc | Cenário Sankhya ABC completo |
| 20260429224921 | fix_project_health_view | Correção de bug na view |
| 20260502xxx | 007_bootstrap_workspace_fn | Function `bootstrap_workspace` (security definer) para onboarding self-service |
| 20260502xxx | 008_enrich_sankhya_seeds | Seeds enriquecidos (notifications, time_entries, OS, AI insights, member_skills) — idempotente |
| 20260502xxx | 009_workspace_invitations | Tabela + RLS + 3 RPCs (create/accept/preview) para convites por link |
| 20260502xxx | 010_workspace_admin_fns | RPCs update_workspace + archive_workspace + ALTER workspaces ADD archived_at |
| 20260502xxx | 011_ai_action_rpcs | RPCs apply_ai_action + reject_ai_action (4 tools iniciais) |
| 20260503xxx | 012_more_ai_tools | apply_ai_action estende para 8 tools (complete_task, reassign_task, create_risk, accept_os) |
| 20260503xxx | 013_activity_log_seeds_and_apply_action_logger | Seeds em activity_log + apply_ai_action grava entry automaticamente |

### Cenário fictício "Sankhya ABC"

- **1 workspace** (`Sankhya ABC`, plano business, 10 seats)
- **6 usuários** em auth.users + profiles automáticos
- **6 workspace_members** (1 owner + 1 manager + 4 members)
- **3 clientes** (Distribuidora Ômega, Apolo Pharma, Vetor Tech)
- **4 projetos** (DO, AP, VT, HF)
- **11 tasks** (1 bloqueada · DO-142 · Letícia)
- **1 risco ativo** (RISK-Ω-001 · impacto R$ 28.400)
- **1 insight IA** (briefing matinal · severity high)
- **3 OS na inbox** (Ômega, Apolo, Vetor)
- **5 itens na fila de acionamentos** pra Letícia
- **5 skills** mapeadas + matriz de proficiência
- **1 sessão de foco ativa** (Letícia em DO-142)

### Credenciais demo

| Email | Senha provisória | Papel |
|---|---|---|
| `gusttavo@hagious.com.br` | `Hagious@2026` | owner ⚠️ TROCAR |
| `leticia@sankhyaabc.com` | `Demo@2026` | manager |
| `rafael@sankhyaabc.com` | `Demo@2026` | dev backend |
| `patricia@sankhyaabc.com` | `Demo@2026` | analista |
| `julia@sankhyaabc.com` | `Demo@2026` | dev pleno |
| `camila@sankhyaabc.com` | `Demo@2026` | QA |

---

## 9. Como o Claude no VS Code deve trabalhar

### Antes de começar qualquer mudança

1. **Ler este documento inteiro** + `docs/ARCHITECTURE.md`
2. **Conferir o `git status`** — nunca commitar `.env.local`
3. **Conferir os tokens de design existentes** em `globals.css` antes de criar novos

### Ao implementar uma feature nova

1. **Conferir se já tem mockup HTML** no histórico (Inbox, Capacity, Foco, IA COO, Projeto Detalhe). Se tiver, **portar a estrutura visual** mantendo fidelidade.
2. **Conferir as tabelas relevantes** no banco (`src/types/database.ts` ou direto no Supabase).
3. **Criar/reusar hooks** em `src/hooks/` (TanStack Query).
4. **Quebrar componentes** em `src/components/{domain}/` (ex: `inbox/`, `focus/`).
5. **Adicionar a rota** em `App.tsx`.
6. **Substituir o placeholder** em `pages/placeholders.tsx` pela página real.
7. **Validar com `npm run typecheck`** antes de commitar.

### Padrões anti-erro

- ❌ **Nunca** colocar credenciais hardcoded no código (sempre via `.env.local`)
- ❌ **Nunca** desabilitar RLS sem motivo claro
- ❌ **Nunca** usar `service_role key` no frontend (essa é só pro backend)
- ❌ **Nunca** confiar que o user está autenticado — sempre checar via `useAuth()` ou ProtectedRoute
- ❌ **Nunca** quebrar TypeScript com `// @ts-ignore` (corrigir o tipo)
- ❌ **Nunca** commitar arquivos `.env*` exceto `.env.example`

### Quando duvidar

- ✅ Conferir `docs/ARCHITECTURE.md`
- ✅ Conferir as tabelas reais no Supabase (não confiar só nos tipos)
- ✅ Perguntar ao Gusttavo antes de mudar decisões arquiteturais

### Ao tomar decisões técnicas

- ✅ Brutalmente honesto: se uma feature não vai converter venda, contestar
- ✅ Sempre comparar trade-offs (custo de implementação × valor pro cliente)
- ✅ Pensar como CTO + Product Owner senior, não como executor de tickets

---

## 10. Comandos úteis pro dia a dia

```bash
# Desenvolvimento
npm run dev               # vite dev server em :5173
npm run typecheck         # tsc --noEmit
npm run build             # build de produção

# Git workflow
git status                # SEMPRE antes de add
git add .
git commit -m "feat: ..."
git push origin main

# Supabase (precisa CLI instalada — opcional)
npx supabase gen types typescript --project-id lbalifwjrdssoolactbd > src/types/database.generated.ts
```

---

## 11. Arquivos importantes pra ler primeiro

Antes de qualquer mudança significativa:

1. **Este documento** (HAGIOUS-FLOW-CONTEXT.md)
2. `docs/ARCHITECTURE.md` — decisões técnicas
3. `src/styles/globals.css` — tokens de design
4. `src/types/database.ts` — modelo de dados
5. `src/App.tsx` — rotas e providers

---

## 12. Identidade visual

**Logo:** letra `H` em gradient verde (Sankhya brand).
**Tipografia:** Inter (texto) + JetBrains Mono (código).
**Cores principais:**
- Verde Sankhya: `#009A4E`
- Verde claro: `#7AC143`
- Roxo Hagious: `#7C5CFF` (tema alternativo)
- Azul info: `#5B8DEF`

**Tom de voz:**
- Direto, técnico, sem floreio
- Bilíngue PT-BR/EN onde fizer sentido (ex: "Tasks" ao invés de "Tarefas" porque é o jargão da indústria)
- Sem emojis no produto (sim no marketing)
- Linguagem profissional mas humana — "Bom dia, Gusttavo 👋" no topbar é OK

---

## 13. O que NÃO fazer

- ❌ Adicionar feature que não tem cliente pedindo
- ❌ Reescrever do zero código que está funcionando
- ❌ Trocar de stack sem ROI claro
- ❌ Adicionar dependências pesadas (lodash inteiro, moment, etc) — preferir alternativas leves
- ❌ Colocar lógica de negócio em componentes (deve ficar em hooks/lib)
- ❌ Fazer queries no banco direto de componentes (sempre via hooks)
- ❌ Criar páginas decorativas — só telas que tem propósito de venda ou operação real

---

**Fim do contexto.** Quando começar a trabalhar com Claude no VS Code, cole o conteúdo deste arquivo no chat dele como contexto inicial. Ele vai ter tudo que precisa pra continuar exatamente de onde paramos.
