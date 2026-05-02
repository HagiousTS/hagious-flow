/**
 * Tipos do domínio derivados do schema do Supabase.
 *
 * Geração:
 *   `database.generated.ts` é regenerado via Supabase MCP / CLI:
 *     supabase gen types typescript --project-id lbalifwjrdssoolactbd
 *
 * Este arquivo é a camada de compatibilidade: exporta nomes amigáveis
 * (Project, Client, etc.) com unions estreitas pros campos varchar
 * (status, priority, health, ...) que no banco são apenas string.
 *
 * Joined shapes vivem aqui (Project com client?, Task com assignee?, etc.)
 * pra refletir o que o Supabase select retorna quando usamos relations.
 */

import type { Database } from './database.generated'

// ============================================================
// Helpers
// ============================================================
type PublicSchema = Database['public']
type Row<T extends keyof PublicSchema['Tables']> =
  PublicSchema['Tables'][T]['Row']
export type Insert<T extends keyof PublicSchema['Tables']> =
  PublicSchema['Tables'][T]['Insert']
export type Update<T extends keyof PublicSchema['Tables']> =
  PublicSchema['Tables'][T]['Update']
type ViewRow<T extends keyof PublicSchema['Views']> =
  PublicSchema['Views'][T]['Row']

export type { Database, Json } from './database.generated'

// ============================================================
// Enums estreitos (DB usa varchar, mas só esses valores são válidos)
// ============================================================
export type Priority = 'P1' | 'P2' | 'P3'
export type ProjectHealth = 'on_track' | 'at_risk' | 'off_track' | 'ahead'
export type ProjectStatus =
  | 'planning'
  | 'active'
  | 'on_hold'
  | 'done'
  | 'archived'
export type TaskStatusCategory =
  | 'todo'
  | 'doing'
  | 'review'
  | 'done'
  | 'blocked'
export type RiskSeverity = 'low' | 'medium' | 'high' | 'critical'
export type ServiceOrderStatus =
  | 'received'
  | 'triaged'
  | 'accepted'
  | 'refined'
  | 'returned'
  | 'rejected'
export type AIMessageRole = 'user' | 'assistant' | 'system' | 'tool'
export type AckUrgency = 'urgent' | 'can_wait' | 'normal' | null
export type SkillProficiency = 'aprendiz' | 'pleno' | 'senior' | 'especialista'

// ============================================================
// Tabelas (Row + estreitamento de enums + joined shapes)
// ============================================================
export type Workspace = Row<'workspaces'>
export type Profile = Row<'profiles'>

export type WorkspaceMember = Row<'workspace_members'> & {
  profile?: Profile
}

export type Client = Row<'clients'>

export type Project = Omit<
  Row<'projects'>,
  'status' | 'priority' | 'health'
> & {
  status: ProjectStatus
  priority: Priority | null
  health: ProjectHealth | null
  client?: Client | null
}

export type ProjectPhase = Omit<Row<'project_phases'>, 'status'> & {
  status: string
}

export type ProjectMember = Row<'project_members'> & {
  member?: WorkspaceMember | null
}

export type ActivityLogEntry = Row<'activity_log'> & {
  actor?: Profile | null
}

export type TaskStatus = Omit<Row<'task_statuses'>, 'category'> & {
  category: TaskStatusCategory
}

export type Task = Omit<Row<'tasks'>, 'priority' | 'is_blocked'> & {
  priority: Priority | null
  is_blocked: boolean
  status?: TaskStatus
  project?: Project
  assignee?: WorkspaceMember
}

export type Risk = Omit<Row<'risks'>, 'severity' | 'is_ai_detected'> & {
  severity: RiskSeverity
  is_ai_detected: boolean
  project?: Project
}

export type AIInsight = Omit<
  Row<'ai_insights'>,
  'severity' | 'is_read' | 'is_dismissed'
> & {
  severity: string
  is_read: boolean
  is_dismissed: boolean
}
export type AIConversation = Row<'ai_conversations'>
export type AIMessage = Omit<Row<'ai_messages'>, 'role'> & {
  role: AIMessageRole
}

export type OSTemplate = Omit<Row<'os_templates'>, 'default_priority'> & {
  default_priority: Priority | null
}

export type ServiceOrder = Omit<
  Row<'service_orders'>,
  'status' | 'priority'
> & {
  status: ServiceOrderStatus
  priority: Priority | null
  client?: Client | null
  template?: OSTemplate | null
}

export type FocusSession = Row<'focus_sessions'> & {
  task?: Task | null
  member?: WorkspaceMember | null
}

export type Skill = Row<'skills'>

export type MemberSkill = Omit<
  Row<'member_skills'>,
  'proficiency' | 'is_certified'
> & {
  proficiency: SkillProficiency
  is_certified: boolean
  skill?: Skill
}

export type AcknowledgmentQueueItem = Omit<
  Row<'acknowledgment_queue'>,
  'urgency_marked'
> & {
  urgency_marked: AckUrgency
  requester?: WorkspaceMember | null
  escalated_to?: WorkspaceMember | null
}

export type Notification = Row<'notifications'>

export type WorkspaceInvitationRole = 'manager' | 'member' | 'viewer'

export type WorkspaceInvitation = Omit<Row<'workspace_invitations'>, 'role'> & {
  role: WorkspaceInvitationRole
}

export interface WorkspaceInvitationPreview {
  workspace_id: string
  workspace_name: string
  email: string
  role: WorkspaceInvitationRole
  expires_at: string
  accepted_at: string | null
}

// ============================================================
// Views (campos vêm nullable da view, normalizamos onde sabemos seguro)
// ============================================================
export type ProjectHealthView = {
  project_id: string
  workspace_id: string
  name: string
  code: string
  status: ProjectStatus
  due_date: string | null
  total_tasks: number
  done_tasks: number
  blocked_tasks: number
  percent_done: number
  hours_logged: number
  estimated_hours: number | null
  budget_amount: number | null
}

export type MemberWorkloadView = {
  member_id: string
  workspace_id: string
  user_id: string
  full_name: string
  capacity_hours_week: number
  open_estimated_hours: number
  open_tasks_count: number
  blocked_tasks_count: number
}

// Mantém o nome ViewRow exposto se algum hook precisar do shape cru
export type ProjectHealthViewRaw = ViewRow<'v_project_health'>
export type MemberWorkloadViewRaw = ViewRow<'v_member_workload'>
