# Hagious Flow

> Sistema operacional para consultorias técnicas e times B2B.
> Posicionamento: o cockpit de quem implanta ERP (Sankhya, Protheus), entrega projetos técnicos sob demanda e precisa controlar hora, OS, projeto e sustentação num painel só.

[![Stack](https://img.shields.io/badge/stack-React_18_·_TypeScript_5_·_Vite_5-7C5CFF)]() [![Backend](https://img.shields.io/badge/backend-Supabase_·_PostgreSQL_16-009A4E)]()

---

## Stack

| Camada          | Tecnologia                               |
| --------------- | ---------------------------------------- |
| Build           | Vite 5                                   |
| Framework       | React 18 + TypeScript 5                  |
| Styling         | Tailwind CSS 3 + CSS variables (3 temas) |
| Componentes     | shadcn-style + lucide-react              |
| Estado servidor | TanStack Query                           |
| Roteamento      | React Router 6                           |
| Backend         | Supabase (Postgres 16 + Auth + RLS)      |

---

## Setup local · 3 minutos

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

O arquivo `.env.local` já vem preenchido com as credenciais do projeto Supabase de demo (`lbalifwjrdssoolactbd`). Se você for clonar pra outro projeto, copie `.env.example` e preencha:

```bash
cp .env.example .env.local
# editar .env.local com as suas credenciais
```

> ⚠️ **NUNCA commite o `.env.local`** — ele já está no `.gitignore`.

### 3. Rodar em modo dev

```bash
npm run dev
```

Abra [http://localhost:5173](http://localhost:5173).

### 4. Login de demo

| Email                     | Senha          |
| ------------------------- | -------------- |
| `gusttavo@hagious.com.br` | `Hagious@2026` |

> Troque a senha no Supabase Auth UI antes de qualquer uso real.

---

## Scripts

| Comando             | O que faz                       |
| ------------------- | ------------------------------- |
| `npm run dev`       | Servidor dev (Vite) em :5173    |
| `npm run build`     | Build de produção em `dist/`    |
| `npm run preview`   | Preview do build                |
| `npm run typecheck` | Verificação de tipos (sem emit) |

---

## Estrutura do projeto

```
src/
├── lib/                    # Utilities (supabase client, cn, formatters)
├── types/                  # Tipos TypeScript do banco
├── hooks/                  # Hooks de dados (useAuth, useWorkspace, useDashboard)
├── components/
│   ├── ui/                 # Primitivos (Button, Card, Avatar, Skeleton)
│   ├── layout/             # AppShell, Sidebar, Topbar
│   ├── theme/              # ThemeSwitcher (3 temas)
│   ├── dashboard/          # Componentes do dashboard
│   └── ProtectedRoute.tsx
├── pages/                  # Páginas roteadas
├── styles/
│   └── globals.css         # Tokens de tema + utilities
├── App.tsx                 # Rotas + providers
└── main.tsx                # Entry point
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
2. Trigger no banco cria `public.profiles` automaticamente no signup
3. RLS via função helper `is_workspace_member(workspace_id)` em todas as tabelas
4. Frontend usa `@supabase/supabase-js` que injeta JWT em todas as queries

---

## Roadmap

### ✅ Implementado (v0.1)

- Login com Supabase Auth
- Sistema de 3 temas com persistência
- Dashboard executivo com dados reais
- Hero IA Insight (briefing matinal)
- KPIs, Lista de projetos, Painel da equipe, Riscos
- Sidebar com workspace switcher

### 🔜 Próximas iterações

- [ ] Inbox de Triagem de OS (módulo Governança)
- [ ] Capacity Planner com heatmap
- [ ] Modo Foco com fila de acionamentos
- [ ] IA COO em fullscreen
- [ ] Projeto detalhe (Gantt, tasks, riscos)
- [ ] Onboarding self-service
- [ ] Multi-workspace switcher real

---

## Contribuindo

```bash
git clone https://github.com/HagiousTS/hagious-flow.git
cd hagious-flow
npm install
npm run dev
```

Padrão de commits: [Conventional Commits](https://www.conventionalcommits.org/pt-br/v1.0.0/).

---

## Licença

Proprietário. Hagious Tecnologia · 2026.
