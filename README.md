# Hagious Flow

> Sistema operacional para consultorias técnicas e times B2B.
> Posicionamento: o cockpit de quem implanta ERP (Sankhya, Protheus), entrega projetos técnicos sob demanda e precisa controlar hora, OS, projeto e sustentação num painel só.

[![Stack](https://img.shields.io/badge/stack-React_18_·_TypeScript_5_·_Vite_5-7C5CFF)]() [![Backend](https://img.shields.io/badge/backend-Supabase_·_PostgreSQL_16-009A4E)]() [![Deploy](https://img.shields.io/badge/deploy-Netlify-00C7B7)](https://hagious-flow-lopes.netlify.app)

Deploy: <https://hagious-flow-lopes.netlify.app>

---

## Stack

| Camada            | Tecnologia                                             |
| ----------------- | ------------------------------------------------------ |
| Build             | Vite 5 + lazy-load por rota + manualChunks             |
| Framework         | React 18 + TypeScript 5                                |
| Styling           | Tailwind CSS 3 + CSS variables (3 temas)               |
| Componentes       | shadcn-style + lucide-react                            |
| Estado servidor   | TanStack Query 5                                       |
| Estado local      | Zustand 5 com `persist`                                |
| Roteamento        | React Router 6                                         |
| Backend           | Supabase (Postgres 16 + Auth + RLS + Storage)          |
| Edge functions    | Deno + Anthropic / OpenAI SDK                          |
| Tracking de erros | Sentry (opcional)                                      |
| Lint/Format       | ESLint 9 (flat config) + Prettier 3                    |
| Tests             | Vitest 2 (unit) + Playwright 1 (smoke E2E)             |
| CI                | GitHub Actions (lint + typecheck + test + build + e2e) |

---

## Setup local · 3 minutos

### 1. Instalar dependências

```bash
npm install
```

> Requer Node 20+. Playwright local exige Node ≥ 18.19.

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env.local
# editar .env.local com as suas credenciais
```

Variáveis usadas:

| Var                      | Quando                                          |
| ------------------------ | ----------------------------------------------- |
| `VITE_SUPABASE_URL`      | Sempre (URL do projeto Supabase)                |
| `VITE_SUPABASE_ANON_KEY` | Sempre (anon key pública)                       |
| `VITE_SENTRY_DSN`        | Opcional, ativa tracking de erros em prod       |
| `VITE_RELEASE`           | Opcional, atrela errors a uma release no Sentry |

> ⚠️ **NUNCA commite o `.env.local`** — ele já está no `.gitignore`.

### 3. Rodar em modo dev

```bash
npm run dev
```

Abra <http://localhost:5173>.

### 4. Login de demo (workspace seedado Sankhya ABC)

| Email                     | Senha          | Papel   |
| ------------------------- | -------------- | ------- |
| `gusttavo@hagious.com.br` | `Hagious@2026` | owner   |
| `leticia@sankhyaabc.com`  | `Demo@2026`    | manager |

> Troque as senhas via Supabase Auth UI antes de qualquer uso real.

---

## Scripts

| Comando                 | O que faz                                        |
| ----------------------- | ------------------------------------------------ |
| `npm run dev`           | Servidor dev (Vite) em :5173                     |
| `npm run build`         | Build de produção em `dist/` (com lazy chunks)   |
| `npm run preview`       | Preview do `dist/`                               |
| `npm run lint`          | ESLint, max-warnings 0                           |
| `npm run lint:fix`      | ESLint com `--fix`                               |
| `npm run format`        | Prettier write em todo o repo                    |
| `npm run format:check`  | Prettier check (CI usa esse)                     |
| `npm run typecheck`     | `tsc --noEmit`                                   |
| `npm run test`          | Vitest unit (src/lib/utils, etc.)                |
| `npm run test:watch`    | Vitest em modo watch                             |
| `npm run test:coverage` | Vitest com cobertura V8                          |
| `npm run test:e2e`      | Playwright smoke (precisa `npm run build` antes) |
| `npm run test:e2e:ui`   | Playwright em modo interativo (UI mode)          |

---

## Estrutura do projeto

```
src/
├── lib/                    # supabase, csv, dateRange, sentry, utils
├── types/                  # database.ts (compat) + database.generated.ts (Supabase MCP)
├── hooks/                  # useAuth, useWorkspace, useTeam, useTimer, useGlobalSearch, etc.
├── components/
│   ├── ui/                 # Button, Card, Avatar, Skeleton (shadcn-style)
│   ├── layout/             # AppShell, Sidebar, Topbar, NotificationsBell
│   ├── theme/              # ThemeSwitcher
│   ├── search/             # CommandPalette (⌘K)
│   ├── timer/              # TimerBar global, TaskTimerButton
│   ├── tasks/              # KanbanBoard, TaskDrawer, TaskComments, TaskAttachments
│   ├── project/            # Gantt, TasksList, TimeEntries, Comments, Risks…
│   ├── dashboard/          # AIBriefingHero, KPIRow, etc.
│   └── …
├── pages/                  # 14 páginas (Landing pública + 13 internas)
├── styles/globals.css      # Tokens de tema + utilities
├── App.tsx                 # Rotas + providers (lazy-loaded por rota)
└── main.tsx                # Entry point + Sentry boundary
e2e/                        # Smoke tests Playwright
.github/workflows/ci.yml    # Pipeline CI
supabase/ (server-side)     # 14 migrations + 1 edge function (ia-coo-chat)
```

---

## Sistema de temas

3 temas ativáveis em runtime via switcher (canto inferior direito):

| Tema                           | Uso                                                  |
| ------------------------------ | ---------------------------------------------------- |
| 🟢 **Sankhya Light** (default) | Padrão claro, alinhado com o site oficial da Sankhya |
| 🌑 **Sankhya Dark**            | Escuro corporativo com mesmas cores de marca         |
| 🟣 **Hagious Purple**          | Tema original (roxo/azul)                            |

Tokens em HSL definidos em `src/styles/globals.css`. Tailwind os consome via `tailwind.config.js`.

---

## Como funciona a autenticação

1. Supabase Auth gerencia `auth.users` (não tabela própria)
2. Trigger `handle_new_user()` cria `public.profiles` automaticamente no signup
3. Onboarding self-service via RPC `bootstrap_workspace` (security definer) cria workspace + member(owner) atomicamente
4. Convites por link via `/aceitar-convite/:token`, validade 14 dias
5. RLS via helper `is_workspace_member(workspace_id)` em todas as tabelas com escopo de workspace
6. Frontend usa `@supabase/supabase-js` que injeta JWT em todas as queries

---

## Recursos do produto

13 páginas internas + 1 pública (Landing), todas conectadas ao banco com RLS por workspace:

- **Dashboard executivo** — KPIs + IA briefing + projetos + equipe + riscos
- **Projetos** — lista filtrável + criação + edição inline (drawer com 14 campos) + soft delete
- **Projeto detalhe** — Gantt + tasks + riscos + atividade + equipe + lista de horas + comentários
- **Tasks (kanban)** — drag & drop + drawer completo (status, prioridade, responsável, prazo, bloqueio, comentários, anexos via Storage, timer)
- **Inbox de OS** — triagem com DoR + accept/refine/reject
- **Capacity Planner** — heatmap semanal + skill matrix + filtro 2/4/8/12 semanas
- **Modo Foco** — sessão ativa + fila de acionamentos
- **Equipe** — cards filtráveis + busca + filtros temporais + convites por link
- **Member detalhe** — perfil completo (skills, projetos, tasks, horas)
- **Clientes** — CRM lite + edição inline + criação
- **IA COO** — chat com 8 tool calls (create_task, mark_task_blocked, update_task_priority, escalate_os, complete_task, reassign_task, create_risk, accept_os) com aprovação humana antes de executar
- **Relatórios** — KPIs + 6 breakdowns + filtros temporais + export CSV (BOM UTF-8)
- **Notificações** — bell em realtime + página dedicada com filtros e bulk
- **Auditoria** — `activity_log` filtrável (actor/action/entity), expand pra diff_json
- **Configurações** — rename, plano, seats, danger zone arquiva workspace
- **Command Palette** — ⌘K / Ctrl K busca em projects/tasks/clients/members + 5 ações rápidas

Infra transversal: Workspace switcher real (Zustand persist), notificações realtime via Supabase, time tracking flutuante (TimerBar), comentários com menções `@user` em tasks e projetos.

---

## Banco de dados

- 36 tabelas + 2 views públicas via 14 migrations (script-first, aplicadas via Supabase MCP)
- RLS habilitado em todas as tabelas com escopo de workspace
- 9 RPCs (security definer) cobrindo onboarding, convites, admin, ações de IA
- Trigger `log_activity_change` registra UPDATE em projects/tasks/risks/clients/workspaces/workspace_members em `activity_log`
- Bucket privado `task-attachments` (10 MB max) com policies path-based em `storage.objects`
- Realtime habilitado em `notifications` (canal por user)
- Cenário fictício seedado: workspace Sankhya ABC, 6 users, 3 clientes, 4 projetos, 16+ tasks, 9 OS, 28+ time_entries, 8 notifications, 4 ai_insights

Detalhes em [`.claude/CLAUDE.md`](.claude/CLAUDE.md).

---

## Edge function: IA COO

`ia-coo-chat` (verify_jwt) é o backend do copiloto:

1. Recebe `{ conversationId, content }` e valida JWT
2. Busca contexto do workspace (projetos, membros, tasks, OS, riscos com UUIDs reais) e injeta no system prompt
3. Chama Anthropic Messages API (claude-haiku-4-5) ou OpenAI (gpt-4o-mini), passando 8 ferramentas no formato nativo
4. Tool calls vão pra tabela `ai_actions` com `status='proposed'` e `requires_approval=true` — não executam até user aprovar via UI
5. Persiste user msg + assistant msg em `ai_messages` com `tool_calls_json`
6. Sem `ANTHROPIC_API_KEY` nem `OPENAI_API_KEY` setadas, responde com mock determinístico (sem propor tools)

Pra ligar IA real: definir `ANTHROPIC_API_KEY` em **Supabase → Edge Functions → ia-coo-chat → Secrets**.

---

## Deploy

Hospedado em [Netlify](https://hagious-flow-lopes.netlify.app):

- `netlify.toml` define `npm run build` + `publish = dist/` + SPA fallback
- Auto-deploy a cada push em `main`
- Env vars `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` configuradas no painel (escopo Builds)

CI roda em GitHub Actions (`.github/workflows/ci.yml`) em cada PR + push: lint → typecheck → format:check → unit tests → build → e2e smoke. Falha bloqueia merge.

---

## Roadmap atual

Estado atualizado em [`.claude/CLAUDE.md`](.claude/CLAUDE.md). Resumo:

✅ Entregue: 14 páginas, 8 tool calls IA, auditoria com triggers, comentários, anexos, time tracking, command palette, signup, convites, billing UI placeholder, Sentry.

🔜 Próxima fase: Stripe billing real, Webhook handler Sankhya OS, Backend Spring Boot pra rotas críticas, dashboards customizáveis por papel.

---

## Contribuindo

```bash
git clone https://github.com/HagiousTS/hagious-flow.git
cd hagious-flow
npm install
npm run dev
```

Padrão de commits: [Conventional Commits](https://www.conventionalcommits.org/pt-br/v1.0.0/). PRs disparam CI completo.

---

## Licença

Proprietário. Hagious Tecnologia · 2026.
