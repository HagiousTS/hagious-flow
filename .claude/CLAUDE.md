# Hagious Flow · Contexto do Projeto

> **Documento de handoff** — leitura obrigatória antes de qualquer mudança no código.
> Última atualização: 29/abr/2026 · v0.1 (MVP)
> Fundador: Gusttavo Fróes Lopes · Hagious Tecnologia · Uberlândia/MG

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

## 6. ✅ O que está PRONTO (estado atual v0.1)

### Banco de dados (100%)
- ✅ Projeto Supabase provisionado (`lbalifwjrdssoolactbd`)
- ✅ Região: South America (São Paulo)
- ✅ 35 tabelas + 2 views aplicadas via 6 migrations
- ✅ RLS ativado em todas as tabelas com policies por workspace
- ✅ Triggers de `updated_at` automáticos
- ✅ Trigger `handle_new_user()` cria profile automaticamente no signup
- ✅ Helper `is_workspace_member(workspace_id)` para policies
- ✅ Seeds completos do cenário Sankhya ABC (1 workspace + 6 users + 3 clientes + 4 projetos + 11 tasks + 3 OS na inbox + 5 itens na fila)
- ✅ View `v_project_health` corrigida (bug de multiplicação no JOIN)

### Frontend (v0.1)
- ✅ Setup Vite + React + TS + Tailwind funcionando
- ✅ Cliente Supabase configurado
- ✅ Sistema de 3 temas com persistência em localStorage
- ✅ ThemeSwitcher (canto inferior direito, colapsável)
- ✅ Login funcional via Supabase Auth
- ✅ ProtectedRoute redireciona para /login se não autenticado
- ✅ AppShell com Sidebar + Topbar
- ✅ Sidebar com workspace switcher + nav 2 seções (Operação, Inteligência)
- ✅ **Dashboard executivo** consumindo dados reais:
  - Hero IA Briefing com insight do banco
  - 4 KPIs calculados (receita, projetos ativos, tasks, saúde)
  - Lista de projetos ordenada por risco
  - Painel da equipe com % carga e sinais
  - Riscos ativos com severidade
- ✅ TypeScript compila sem erros (`tsc -b`)
- ✅ Build de produção funciona (`vite build` → 472KB JS / 137KB gzip)

---

## 7. ⏳ O que está PENDENTE (backlog priorizado)

### 🔥 Alta prioridade (fazer agora)

| # | Item | Esforço | Por quê |
|---|---|---|---|
| 1 | Portar **Inbox de OS** para React | M (2–3 dias) | Maior diferencial de venda |
| 2 | Portar **Modo Foco** para React | M (2–3 dias) | Demo emocional pros GPs |
| 3 | Portar **Capacity Planner** para React | L (3–5 dias) | Decisor de compra para gestores |

### 🟡 Média prioridade (próxima sprint)

| # | Item | Esforço |
|---|---|---|
| 4 | Página **Projeto Detalhe** com Gantt + tasks + riscos | L |
| 5 | Página **IA COO fullscreen** com chat | L |
| 6 | Página **Tasks** kanban com drag & drop | M |
| 7 | Multi-workspace switcher real | S |
| 8 | Página **Equipe** | M |
| 9 | Página **Clientes** | M |

### 🔵 Baixa prioridade (depois do beta)

| # | Item | Esforço |
|---|---|---|
| 10 | **Onboarding self-service** (criar workspace + convidar time) | L |
| 11 | **Notificações realtime** via Supabase Realtime | M |
| 12 | **Página Relatórios/BI** | L |
| 13 | **Backend Spring Boot** (substituir queries diretas no Supabase pra rotas críticas) | XL |
| 14 | **Integração OpenAI** real para IA COO | M |
| 15 | **Landing page de vendas** + captura de beta | M |

### 🟣 Backlog técnico (dívida)

- [ ] Configurar ESLint + Prettier
- [ ] Adicionar testes (Vitest + React Testing Library)
- [ ] Configurar CI/CD (GitHub Actions)
- [ ] Substituir tipos manuais em `src/types/database.ts` por tipos auto-gerados via `supabase gen types typescript`
- [ ] Adicionar Storybook para os componentes ui/
- [ ] Implementar tracking de erros (Sentry)
- [ ] Configurar deploy automático (Vercel/Netlify)

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

### Migrations aplicadas (6)

| Versão | Nome | O que faz |
|---|---|---|
| 20260429224344 | 001_extensions_profiles | Extensions + profiles + triggers |
| 20260429224413 | 002_workspaces_members | Workspaces, members, teams, clients |
| 20260429224506 | 003_projects_tasks | Projects, tasks, comments, time, risks |
| 20260429224622 | 004_notifications_ai_governance | Notif + IA + governança operacional + views |
| 20260429224844 | 005_seeds_sankhya_abc | Cenário Sankhya ABC completo |
| 20260429224921 | fix_project_health_view | Correção de bug na view |

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
