# Hagious Flow · Snapshot do Banco

> Estado em 29/abr/2026 · projeto Supabase `lbalifwjrdssoolactbd`
> Use este documento como referência rápida do schema.

---

## Conexão

| Item | Valor |
|---|---|
| Project ID | `lbalifwjrdssoolactbd` |
| URL | `https://lbalifwjrdssoolactbd.supabase.co` |
| Anon key | `sb_publishable_39nV2gR_kgo-GOKRgPIJFw_5TeQaKuw` |
| Plano | Free (500MB DB, 50k MAUs) |
| Região | South America (São Paulo) |

⚠️ **Service_role key NUNCA aparece neste documento ou no código frontend.** Acessível só via Supabase Dashboard → Project Settings → API.

---

## Schema · 35 tabelas + 2 views

### 🏢 Tenancy & Pessoas (5)
- `auth.users` — gerenciado pelo Supabase
- `public.profiles` — dados de perfil (FK pra auth.users)
- `public.workspaces` — multi-tenant root
- `public.workspace_members` — usuários dentro de workspace
- `public.teams` + `public.team_members` — sub-grupos
- `public.clients` — clientes do workspace

### 📁 Projetos & Tasks (12)
- `public.projects`
- `public.project_members`
- `public.project_phases` (pra Gantt)
- `public.task_statuses` (Kanban columns)
- `public.tasks` (a estrela)
- `public.task_tags` + `public.task_tag_assignments`
- `public.task_comments`
- `public.task_attachments`
- `public.task_dependencies`
- `public.time_entries` (apontamentos)
- `public.risks`

### 🔔 Comunicação & Auditoria (2)
- `public.notifications`
- `public.activity_log`

### 🤖 IA COO (4)
- `public.ai_conversations`
- `public.ai_messages`
- `public.ai_insights` (briefings, alertas)
- `public.ai_actions` (ações com aprovação humana)

### ⚙️ Governança Operacional (12)
- `public.os_templates` (templates de OS)
- `public.os_template_fields` (campos dinâmicos)
- `public.service_orders` (Inbox de Triagem)
- `public.focus_sessions` (Modo Foco)
- `public.acknowledgment_queue` (fila de acionamentos)
- `public.skills`
- `public.member_skills`
- `public.task_required_skills`
- `public.member_unavailability` (férias, ausências)
- `public.priority_changes` (auditoria de mudanças)
- `public.task_blocks` (bloqueios externos)

### 📊 Views (2)
- `public.v_project_health` — KPIs por projeto (% done, blocked, hours)
- `public.v_member_workload` — carga por membro

---

## Migrations aplicadas (6)

| Versão | Nome | Resumo |
|---|---|---|
| 20260429224344 | 001_extensions_profiles | pgcrypto, pg_trgm, profiles, triggers |
| 20260429224413 | 002_workspaces_members | Multi-tenancy + helper RLS |
| 20260429224506 | 003_projects_tasks | Núcleo de projetos e tasks |
| 20260429224622 | 004_notifications_ai_governance | IA + governança + views |
| 20260429224844 | 005_seeds_sankhya_abc | Seeds do cenário fictício |
| 20260429224921 | fix_project_health_view | Correção de bug em JOIN |

---

## RLS (Row-Level Security)

**Princípio:** todas as tabelas têm RLS ativado. Acesso via função helper:

```sql
CREATE OR REPLACE FUNCTION public.is_workspace_member(_workspace_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.workspace_members
        WHERE workspace_id = _workspace_id
          AND user_id = auth.uid()
          AND is_active = TRUE
    );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;
```

**Padrão de policy:**

```sql
CREATE POLICY "tasks_member_all" ON public.tasks FOR ALL
USING (public.is_workspace_member(workspace_id));
```

Tabelas relacionadas usam join via parent:

```sql
CREATE POLICY "comments_via_task" ON public.task_comments FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.tasks t
  WHERE t.id = task_comments.task_id
    AND public.is_workspace_member(t.workspace_id)
));
```

---

## Triggers

### `handle_new_user()`
Cria `public.profiles` automaticamente quando alguém se cadastra em `auth.users`.

### `set_updated_at()`
Helper genérico aplicado em quase todas as tabelas:

```sql
CREATE TRIGGER trg_<table>_updated
  BEFORE UPDATE ON public.<table>
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
```

---

## Cenário fictício "Sankhya ABC" (seeds)

### Workspace
- ID dinâmico (gerado via `gen_random_uuid()`)
- Slug: `sankhya-abc`
- Plano: business · 10 seats

### Pessoas (6)

| Nome | Role | Job | Hourly | Status |
|---|---|---|---|---|
| Gusttavo Fróes Lopes | owner | Coord. Desenvolvimento | R$ 220 | ativo |
| Letícia Tavares | manager | Consultora Sênior | R$ 180 | **🔒 Em foco no DO-142** |
| Rafael Mendonça | member | Dev Backend | R$ 150 | ativo |
| Patrícia Silva | member | Analista Suporte | R$ 110 | ativo |
| Júlia Carvalho | member | Dev Pleno | R$ 130 | ativo |
| Camila Borges | member | QA | R$ 100 | ativo |

### Clientes (3)
- Distribuidora Ômega Ltda (Marcelo Andrade)
- Farmacêutica Apolo S.A. (Ana Beatriz)
- Vetor Tecnologia Ltda (Roberto Lima)

### Projetos (4)

| Code | Nome | Status | Health | % Done | Tasks | Blocked | Owner |
|---|---|---|---|---|---|---|---|
| **DO** | Implantação Distribuidora Ômega | active | **at_risk** | 25% | 4 | **1** | Letícia |
| AP | Sustentação Farmacêutica Apolo | active | on_track | 50% | 2 | 0 | Patrícia |
| VT | Migração Vetor Tech 4.16 → 4.18 | active | ahead | 33% | 3 | 0 | Rafael |
| HF | Produto Interno · Hagious Flow MVP | active | on_track | 50% | 2 | 0 | Gusttavo |

### Risk ativo
- **RISK-Ω-001** — Pendência cliente · credenciais Itaú homologação
- Severidade: high · Probabilidade: high
- Impacto: **R$ 28.400**
- Detectado pela IA · status mitigating

### IA Insight do dia
- "**3 frentes críticas hoje · começar pela Ômega**"
- Severity: high · Impacto: R$ 28.400
- Body: "Cliente reabriu chamado P1 ontem 23h. Letícia bloqueada há 2 dias por dependência externa..."

### Inbox de OS (3 demandas)

| Cliente | Canal | Subject | Quality Score | Priority | SLA |
|---|---|---|---|---|---|
| Ômega | email | "Solicitação: integrar com novo banco" | 47/100 | P2 | 20h |
| Apolo | whatsapp | "Boleto não emite mais" | 62/100 | P1 | 4h |
| Vetor | sankhya | "Erro inventário cíclico" | 89/100 | P2 | 48h |

### Fila de acionamentos da Letícia (5 itens)

1. **🚨 ESCALADA** — Patrícia: "Apolo pedindo NF-e até 16h" (urgente)
2. Rafael: "Review do PR #142" (slack)
3. Camila: "Bloquei no CFOP 6101" (in_app)
4. Júlia: "Doc JBoss → Wildfly enviada" (email)
5. **🚨 ESCALADA** — Marcelo (cliente externo): "Credenciais Itaú repassadas pro TI"

### Skills mapeadas (5)
- Sankhya · Funcional (erp)
- Integração Bancária (integration)
- Java + Spring Boot (dev)
- QA · Testes funcionais (quality)
- Fiscal · NF-e e SPED (fiscal)

---

## Queries úteis pro dia a dia

### Ver tudo

```sql
SELECT
    (SELECT COUNT(*) FROM workspaces) AS workspaces,
    (SELECT COUNT(*) FROM workspace_members) AS members,
    (SELECT COUNT(*) FROM clients) AS clients,
    (SELECT COUNT(*) FROM projects) AS projects,
    (SELECT COUNT(*) FROM tasks) AS tasks,
    (SELECT COUNT(*) FROM risks) AS risks,
    (SELECT COUNT(*) FROM service_orders) AS service_orders,
    (SELECT COUNT(*) FROM focus_sessions) AS focus_sessions,
    (SELECT COUNT(*) FROM acknowledgment_queue) AS ack_queue;

-- Esperado: workspaces=1, members=6, clients=3, projects=4, tasks=11, risks=1,
--           service_orders=3, focus_sessions=1, ack_queue=5
```

### Saúde dos projetos
```sql
SELECT name, code, percent_done, total_tasks, done_tasks, blocked_tasks, hours_logged
FROM v_project_health
ORDER BY due_date;
```

### Carga da equipe
```sql
SELECT full_name, capacity_hours_week, open_estimated_hours,
       open_tasks_count, blocked_tasks_count
FROM v_member_workload
ORDER BY open_estimated_hours DESC;
```

### Inbox de OS pendente
```sql
SELECT subject, source_channel, status, quality_score, priority,
       sla_due_at - NOW() AS tempo_restante
FROM service_orders
WHERE status IN ('received', 'triaged')
ORDER BY priority, sla_due_at;
```

### Quem está em modo foco agora
```sql
SELECT p.full_name, wm.job_title, wm.focus_mode_until,
       fs.task_id, fs.interruptions_blocked, fs.interruptions_escalated
FROM workspace_members wm
JOIN profiles p ON p.id = wm.user_id
LEFT JOIN focus_sessions fs ON fs.member_id = wm.id AND fs.ended_at IS NULL
WHERE wm.is_in_focus_mode = TRUE;
```

---

## Comando útil: regenerar tipos TS

Quando você adicionar/mudar tabelas, regere os tipos:

```bash
npx supabase gen types typescript --project-id lbalifwjrdssoolactbd > src/types/database.generated.ts
```

(Requer Supabase CLI instalada. Por enquanto, tipos manuais em `src/types/database.ts`.)
