# Arquitetura · Hagious Flow

## Visão de alto nível

```
┌─────────────────────────────────────────────────┐
│ Frontend (React + Vite + TypeScript)            │
│  - Tailwind + 3 temas via CSS vars              │
│  - TanStack Query (cache de servidor)           │
│  - React Router (SPA)                           │
└──────────────────────┬──────────────────────────┘
                       │ supabase-js (REST + Auth + Realtime)
                       ▼
┌─────────────────────────────────────────────────┐
│ Supabase (Postgres 16 + Auth + Storage)         │
│  - 35 tabelas + 2 views                         │
│  - RLS em todas as tabelas                      │
│  - Trigger: handle_new_user()                   │
│  - Helper: is_workspace_member(workspace_id)    │
└─────────────────────────────────────────────────┘
```

## Decisões importantes

### 1. Multi-tenancy por `workspace_id`

Toda tabela de domínio tem coluna `workspace_id`. Isolamento via RLS:

```sql
CREATE POLICY "tasks_member_all" ON tasks FOR ALL
USING (is_workspace_member(workspace_id));
```

A função `is_workspace_member` é `SECURITY DEFINER STABLE`, ou seja, cacheável dentro de uma query.

### 2. Auth gerenciada pelo Supabase

Não criamos tabela `users` própria. Em vez disso:
- `auth.users` → autenticação (gerenciado pelo Supabase)
- `public.profiles` → dados de perfil (FK pra `auth.users(id)`)
- Trigger `on_auth_user_created` cria profile automaticamente no signup

### 3. UUID v4 (gen_random_uuid) como PK

UUIDs evitam revelar cardinalidade (não dá pra estimar quantos clientes temos pelo ID). Trade-off: chaves maiores que bigint, mas Postgres lida bem.

### 4. Identificadores public-friendly

Tasks têm `sequence_number` único por projeto. Combinado com `project.code`, viram códigos legíveis tipo `DO-142`. UUID continua sendo a PK real.

### 5. Soft delete seletivo

Apenas em entidades onde auditoria importa (User, Workspace, Project, Task, Risk). Notificações e logs usam hard delete + retention policy.

### 6. IA COO como cidadã de primeira classe

Tabelas dedicadas:
- `ai_conversations` — sessões de chat
- `ai_messages` — mensagens (user, assistant, tool)
- `ai_insights` — alertas proativos (briefing matinal)
- `ai_actions` — ações executadas com aprovação humana

Toda ação automatizada é registrada com `requires_approval` + `approved_by_user_id`.

## Estrutura de diretórios — convenções

- `src/lib/` → puro JS/TS, sem React. Singletons (supabase) e utilities.
- `src/hooks/` → Hooks customizados. Cada hook = uma "fonte de dado".
- `src/components/ui/` → Primitivos sem regras de negócio (Button, Card).
- `src/components/{domain}/` → Componentes específicos de domínio (dashboard, project, etc).
- `src/pages/` → Componentes top-level mapeados a rotas.

## Estado

Duas dimensões:
- **Estado servidor**: TanStack Query (cache, refetch, invalidação)
- **Estado cliente**: useState local; Zustand quando precisar de estado global (theme já é localStorage)

## Performance

- TanStack Query com `staleTime: 30s` reduz refetches.
- `Promise.all` em queries de dashboard.
- Skeletons durante loading evitam layout shift.
- Vite faz tree-shaking automático; bundle final < 200KB gzip.

## Segurança

- RLS sempre ON em todas as tabelas
- `.env.local` no `.gitignore`
- Anon key (público) ≠ service_role key (NUNCA no frontend)
- Auth tokens em cookies HttpOnly via Supabase
