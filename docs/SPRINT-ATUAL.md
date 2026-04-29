# Sprint Atual · Hagious Flow

> Esta é a "to-do list" curada. Ataque de cima pra baixo.

---

## 🎯 Objetivo da sprint

**Portar 3 telas de diferenciação competitiva para React conectado ao Supabase**, partindo dos mockups HTML já validados visualmente. Quando essas 3 estiverem prontas, temos um produto demonstrável o suficiente pra mostrar pros 3 GPs (gerentes de projeto da Sankhya ABC) em call de validação.

---

## ⏱️ Tarefa 1 · Inbox de OS *(comece por aqui)*

**Por quê primeiro:** maior diferencial de venda. É a tela que materializa "OS chegando incompleta" — a dor #1 reportada pelos GPs.

**Mockup de referência:** `hagious-inbox.html` (no histórico de conversas anteriores; tem score qualidade IA, 7 demandas, devolução automatizada, decisão de aceitar/refinar/devolver).

**Tabelas usadas:**
- `public.service_orders` (3 linhas seedadas)
- `public.os_templates` (4 templates seedados)
- `public.os_template_fields` (zero ainda — adicionar)
- `public.clients` (join pra mostrar nome do cliente)

**Componentes a criar:**
```
src/components/inbox/
├── InboxList.tsx           # lista lateral de OS pendentes
├── InboxDetail.tsx         # painel direito com detalhe
├── QualityScoreBadge.tsx   # 0-100 com cor (verde > 80, amarelo > 50, vermelho)
├── QualityIssuesList.tsx   # checklist do que falta
└── TriageActions.tsx       # botões: aceitar, refinar, devolver
```

**Hook:** `src/hooks/useInbox.ts`

**Página:** `src/pages/Inbox.tsx` (substituir placeholder)

**Critério de pronto:**
- [ ] Lista as 3 OS seedadas mostrando cliente, canal, score, SLA
- [ ] Clica numa OS → abre detalhe com raw_body
- [ ] Score < 70 mostra issues simulados ("falta orçamento", "sem sponsor")
- [ ] Botão "Devolver" executa UPDATE no banco mudando status pra `returned`
- [ ] Botão "Aceitar" cria task no projeto correspondente

**Esforço estimado:** 2-3 dias

---

## ⏱️ Tarefa 2 · Modo Foco

**Por quê:** demo emocional. Quando a Letícia vê a tela com fila de acionamentos sendo gerenciada pela IA, ela compra.

**Mockup de referência:** `hagious-foco.html` (Letícia em DO-142, fila de 7 acionamentos, IA escalando urgências).

**Tabelas usadas:**
- `public.focus_sessions` (1 sessão ativa seedada)
- `public.acknowledgment_queue` (5 itens seedados pra Letícia)
- `public.workspace_members` (campos `is_in_focus_mode`, `focus_mode_until`, `focus_auto_reply`)

**Componentes a criar:**
```
src/components/focus/
├── FocusHero.tsx           # quem está em foco, timer, task atual
├── AckQueueList.tsx        # fila ordenada por urgência
├── AckQueueItem.tsx        # item individual
└── EscalationBadge.tsx     # 🚨 ESCALADA pela IA
```

**Hook:** `src/hooks/useFocus.ts`

**Página:** `src/pages/Focus.tsx`

**Critério de pronto:**
- [ ] Mostra Letícia em foco no DO-142 com tempo restante
- [ ] Lista os 5 itens da ack_queue ordenados (escalados primeiro)
- [ ] Item "Patrícia · Apolo NF-e" aparece destacado como ESCALADO
- [ ] Botão "Iniciar foco" cria nova focus_session
- [ ] Botão "Encerrar foco" preenche `ended_at`

**Esforço estimado:** 2-3 dias

---

## ⏱️ Tarefa 3 · Capacity Planner

**Por quê:** decisor de compra para gestor. Quando o Gusttavo vê o heatmap mostrando que pode realocar Camila do Apolo pro Vetor, ele compra.

**Mockup de referência:** `hagious-capacity.html` (heatmap, skill matrix, bloqueio over-allocation).

**Tabelas usadas:**
- `v_member_workload` (view com carga atual)
- `public.skills` (5 skills seedadas)
- `public.member_skills` (10 mapeamentos)
- `public.task_required_skills` (2 mapeamentos)
- `public.member_unavailability` (zero ainda — adicionar férias fictícias)

**Componentes a criar:**
```
src/components/capacity/
├── CapacityHeatmap.tsx     # grid pessoa × semana, intensidade de cor por carga
├── SkillMatrix.tsx         # tabela pessoa × skill com proficiência
├── AllocationDialog.tsx    # modal de alocar pessoa em projeto
└── OverAllocationWarn.tsx  # bloqueio quando passa de 100%
```

**Hook:** `src/hooks/useCapacity.ts`

**Página:** `src/pages/Capacity.tsx`

**Critério de pronto:**
- [ ] Heatmap das 6 pessoas × próximas 8 semanas
- [ ] Letícia aparece destacada (em foco + carga atual)
- [ ] Skill matrix mostra a especialização de cada um
- [ ] Tentativa de alocar > 100% bloqueia com toast de aviso

**Esforço estimado:** 3-5 dias

---

## ✅ Definição de "pronto" (todas as tarefas)

Pra dar uma tarefa por completa, tem que:

1. ✅ TypeScript compila zero erros (`npm run typecheck`)
2. ✅ Build de produção funciona (`npm run build`)
3. ✅ Visualmente fiel ao mockup HTML
4. ✅ Conectada ao Supabase com dados reais
5. ✅ Loading states com Skeleton
6. ✅ Error states tratados
7. ✅ Funciona nos 3 temas (light, dark, purple)
8. ✅ Testada manualmente com a conta `gusttavo@hagious.com.br`
9. ✅ Commit com conventional commits
10. ✅ Push pro GitHub

---

## 🚫 Não fazer nesta sprint

- ❌ Refatorar dashboard que já está pronto
- ❌ Migrar tipos pra `database.generated.ts` (deixa pra depois)
- ❌ Adicionar testes (esperar até estabilizar)
- ❌ Deploy automático (foco é validação com GPs primeiro)
- ❌ Backend Spring Boot (Supabase tá segurando bem)

---

## 🎯 Quando essa sprint termina

Quando você puder rodar localmente, logar com `gusttavo@hagious.com.br`, e:

1. Ir em **Dashboard** → ver KPIs reais
2. Ir em **Inbox** → triar uma OS
3. Ir em **Modo Foco** → entrar em foco
4. Ir em **Capacity** → ver heatmap

E **cada uma dessas ações modifica o banco real e persiste**.

Aí marca call com os 3 GPs, mostra o produto e captura feedback.

---

**Próxima coisa:** comece pela **Tarefa 1 (Inbox)**. Toda vez que terminar uma, faz commit + push. Não acumula trabalho.
