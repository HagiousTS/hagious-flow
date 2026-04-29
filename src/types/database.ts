/**
 * Tipos TypeScript que mapeiam o schema do Supabase.
 *
 * Em uma fase futura, esses tipos podem ser auto-gerados via:
 *   npx supabase gen types typescript --project-id lbalifwjrdssoolactbd > src/types/database.ts
 *
 * Por ora, mantemos manualmente os tipos das tabelas mais usadas.
 */

export type Priority = 'P1' | 'P2' | 'P3'
export type ProjectHealth = 'on_track' | 'at_risk' | 'off_track' | 'ahead'
export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'done' | 'archived'
export type TaskStatusCategory = 'todo' | 'doing' | 'review' | 'done' | 'blocked'
export type RiskSeverity = 'low' | 'medium' | 'high' | 'critical'
export type ServiceOrderStatus = 'received' | 'triaged' | 'accepted' | 'refined' | 'returned' | 'rejected'

export interface Workspace {
  id: string
  slug: string
  name: string
  industry: string | null
  plan: string
  plan_seats: number
  owner_user_id: string
  created_at: string
}

export interface Profile {
  id: string
  email: string
  full_name: string
  avatar_url: string | null
}

export interface WorkspaceMember {
  id: string
  workspace_id: string
  user_id: string
  role: string
  job_title: string | null
  hourly_rate: number | null
  capacity_hours_week: number | null
  is_in_focus_mode: boolean | null
  focus_mode_until: string | null
  is_active: boolean
  // joined fields (via select com profiles)
  profile?: Profile
}

export interface Client {
  id: string
  workspace_id: string
  name: string
  trade_name: string | null
  cnpj: string | null
  contact_name: string | null
  contact_email: string | null
}

export interface Project {
  id: string
  workspace_id: string
  code: string
  name: string
  description: string | null
  client_id: string | null
  project_type: string
  status: ProjectStatus
  priority: Priority | null
  health: ProjectHealth | null
  start_date: string | null
  due_date: string | null
  estimated_hours: number | null
  actual_hours: number | null
  progress_percent: number | null
  budget_amount: number | null
  owner_member_id: string | null
  // joined
  client?: Client | null
}

export interface ProjectHealthView {
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

export interface MemberWorkloadView {
  member_id: string
  workspace_id: string
  user_id: string
  full_name: string
  capacity_hours_week: number
  open_estimated_hours: number
  open_tasks_count: number
  blocked_tasks_count: number
}

export interface TaskStatus {
  id: string
  workspace_id: string
  name: string
  category: TaskStatusCategory
  sort_order: number
}

export interface Task {
  id: string
  workspace_id: string
  project_id: string
  sequence_number: number
  title: string
  description_md: string | null
  status_id: string
  priority: Priority | null
  is_blocked: boolean
  blocked_reason: string | null
  assignee_member_id: string | null
  estimated_hours: number | null
  actual_hours: number | null
  due_date: string | null
  completed_at: string | null
  // joined
  status?: TaskStatus
  project?: Project
  assignee?: WorkspaceMember
}

export interface Risk {
  id: string
  workspace_id: string
  project_id: string
  code: string
  title: string
  severity: RiskSeverity
  probability: string
  impact_amount: number | null
  status: string
  mitigation_plan: string | null
  is_ai_detected: boolean
  // joined
  project?: Project
}

export interface AIInsight {
  id: string
  workspace_id: string
  user_id: string | null
  kind: string
  severity: string
  title: string
  body_md: string
  impact_amount: number | null
  related_entity_type: string | null
  related_entity_id: string | null
  is_read: boolean
  is_dismissed: boolean
  created_at: string
}

export interface OSTemplate {
  id: string
  workspace_id: string
  name: string
  slug: string
  category: string | null
  icon: string | null
  color_hex: string | null
  sla_response_hours: number | null
  sla_first_action_hours: number | null
  default_priority: Priority | null
  requires_quote: boolean | null
  requires_sponsor_approval: boolean | null
}

export interface ServiceOrder {
  id: string
  workspace_id: string
  template_id: string | null
  client_id: string | null
  source_channel: string
  source_ref: string | null
  subject: string
  raw_body: string | null
  requester_name: string | null
  requester_email: string | null
  status: ServiceOrderStatus
  priority: Priority | null
  quality_score: number | null
  quality_issues_json: unknown | null
  triaged_by_member_id: string | null
  triaged_at: string | null
  accepted_task_id: string | null
  return_reason: string | null
  sla_due_at: string | null
  created_at: string
  updated_at: string
  // joined
  client?: Client | null
  template?: OSTemplate | null
}

export interface FocusSession {
  id: string
  workspace_id: string
  member_id: string
  task_id: string | null
  started_at: string
  planned_minutes: number
  ended_at: string | null
  actual_minutes: number | null
  interruptions_blocked: number
  interruptions_escalated: number
  notes: string | null
  created_at: string
  // joined
  task?: Task | null
  member?: WorkspaceMember | null
}

export type AckUrgency = 'urgent' | 'can_wait' | 'normal' | null

export interface AcknowledgmentQueueItem {
  id: string
  workspace_id: string
  target_member_id: string
  requester_member_id: string | null
  requester_external_name: string | null
  requester_external_email: string | null
  channel: string
  urgency_marked: AckUrgency
  message: string | null
  is_escalated: boolean
  escalated_to_member_id: string | null
  escalated_at: string | null
  resolved_at: string | null
  created_at: string
  // joined
  requester?: WorkspaceMember | null
  escalated_to?: WorkspaceMember | null
}
