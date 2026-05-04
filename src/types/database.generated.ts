export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.5'
  }
  public: {
    Tables: {
      acknowledgment_queue: {
        Row: {
          channel: string
          created_at: string
          escalated_at: string | null
          escalated_to_member_id: string | null
          id: string
          is_escalated: boolean | null
          message: string | null
          requester_external_email: string | null
          requester_external_name: string | null
          requester_member_id: string | null
          resolved_at: string | null
          target_member_id: string
          urgency_marked: string | null
          workspace_id: string
        }
        Insert: {
          channel: string
          created_at?: string
          escalated_at?: string | null
          escalated_to_member_id?: string | null
          id?: string
          is_escalated?: boolean | null
          message?: string | null
          requester_external_email?: string | null
          requester_external_name?: string | null
          requester_member_id?: string | null
          resolved_at?: string | null
          target_member_id: string
          urgency_marked?: string | null
          workspace_id: string
        }
        Update: {
          channel?: string
          created_at?: string
          escalated_at?: string | null
          escalated_to_member_id?: string | null
          id?: string
          is_escalated?: boolean | null
          message?: string | null
          requester_external_email?: string | null
          requester_external_name?: string | null
          requester_member_id?: string | null
          resolved_at?: string | null
          target_member_id?: string
          urgency_marked?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'acknowledgment_queue_escalated_to_member_id_fkey'
            columns: ['escalated_to_member_id']
            isOneToOne: false
            referencedRelation: 'v_member_workload'
            referencedColumns: ['member_id']
          },
          {
            foreignKeyName: 'acknowledgment_queue_escalated_to_member_id_fkey'
            columns: ['escalated_to_member_id']
            isOneToOne: false
            referencedRelation: 'workspace_members'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'acknowledgment_queue_requester_member_id_fkey'
            columns: ['requester_member_id']
            isOneToOne: false
            referencedRelation: 'v_member_workload'
            referencedColumns: ['member_id']
          },
          {
            foreignKeyName: 'acknowledgment_queue_requester_member_id_fkey'
            columns: ['requester_member_id']
            isOneToOne: false
            referencedRelation: 'workspace_members'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'acknowledgment_queue_target_member_id_fkey'
            columns: ['target_member_id']
            isOneToOne: false
            referencedRelation: 'v_member_workload'
            referencedColumns: ['member_id']
          },
          {
            foreignKeyName: 'acknowledgment_queue_target_member_id_fkey'
            columns: ['target_member_id']
            isOneToOne: false
            referencedRelation: 'workspace_members'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'acknowledgment_queue_workspace_id_fkey'
            columns: ['workspace_id']
            isOneToOne: false
            referencedRelation: 'workspaces'
            referencedColumns: ['id']
          },
        ]
      }
      activity_log: {
        Row: {
          action: string
          actor_type: string | null
          actor_user_id: string | null
          created_at: string
          diff_json: Json | null
          entity_id: string
          entity_type: string
          id: string
          metadata_json: Json | null
          workspace_id: string
        }
        Insert: {
          action: string
          actor_type?: string | null
          actor_user_id?: string | null
          created_at?: string
          diff_json?: Json | null
          entity_id: string
          entity_type: string
          id?: string
          metadata_json?: Json | null
          workspace_id: string
        }
        Update: {
          action?: string
          actor_type?: string | null
          actor_user_id?: string | null
          created_at?: string
          diff_json?: Json | null
          entity_id?: string
          entity_type?: string
          id?: string
          metadata_json?: Json | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'activity_log_workspace_id_fkey'
            columns: ['workspace_id']
            isOneToOne: false
            referencedRelation: 'workspaces'
            referencedColumns: ['id']
          },
        ]
      }
      ai_actions: {
        Row: {
          action_type: string
          approved_at: string | null
          approved_by_user_id: string | null
          conversation_id: string | null
          created_at: string
          error_message: string | null
          executed_at: string | null
          id: string
          insight_id: string | null
          payload_json: Json
          requires_approval: boolean | null
          result_json: Json | null
          status: string | null
          user_id: string
          workspace_id: string
        }
        Insert: {
          action_type: string
          approved_at?: string | null
          approved_by_user_id?: string | null
          conversation_id?: string | null
          created_at?: string
          error_message?: string | null
          executed_at?: string | null
          id?: string
          insight_id?: string | null
          payload_json: Json
          requires_approval?: boolean | null
          result_json?: Json | null
          status?: string | null
          user_id: string
          workspace_id: string
        }
        Update: {
          action_type?: string
          approved_at?: string | null
          approved_by_user_id?: string | null
          conversation_id?: string | null
          created_at?: string
          error_message?: string | null
          executed_at?: string | null
          id?: string
          insight_id?: string | null
          payload_json?: Json
          requires_approval?: boolean | null
          result_json?: Json | null
          status?: string | null
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'ai_actions_conversation_id_fkey'
            columns: ['conversation_id']
            isOneToOne: false
            referencedRelation: 'ai_conversations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'ai_actions_insight_id_fkey'
            columns: ['insight_id']
            isOneToOne: false
            referencedRelation: 'ai_insights'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'ai_actions_workspace_id_fkey'
            columns: ['workspace_id']
            isOneToOne: false
            referencedRelation: 'workspaces'
            referencedColumns: ['id']
          },
        ]
      }
      ai_conversations: {
        Row: {
          archived_at: string | null
          context_json: Json | null
          created_at: string
          id: string
          mode: string | null
          title: string | null
          updated_at: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          archived_at?: string | null
          context_json?: Json | null
          created_at?: string
          id?: string
          mode?: string | null
          title?: string | null
          updated_at?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          archived_at?: string | null
          context_json?: Json | null
          created_at?: string
          id?: string
          mode?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'ai_conversations_workspace_id_fkey'
            columns: ['workspace_id']
            isOneToOne: false
            referencedRelation: 'workspaces'
            referencedColumns: ['id']
          },
        ]
      }
      ai_insights: {
        Row: {
          body_md: string
          created_at: string
          expires_at: string | null
          id: string
          impact_amount: number | null
          is_applied: boolean | null
          is_dismissed: boolean | null
          is_read: boolean | null
          kind: string
          related_entity_id: string | null
          related_entity_type: string | null
          severity: string | null
          suggested_actions_json: Json | null
          title: string
          user_id: string | null
          workspace_id: string
        }
        Insert: {
          body_md: string
          created_at?: string
          expires_at?: string | null
          id?: string
          impact_amount?: number | null
          is_applied?: boolean | null
          is_dismissed?: boolean | null
          is_read?: boolean | null
          kind: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          severity?: string | null
          suggested_actions_json?: Json | null
          title: string
          user_id?: string | null
          workspace_id: string
        }
        Update: {
          body_md?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          impact_amount?: number | null
          is_applied?: boolean | null
          is_dismissed?: boolean | null
          is_read?: boolean | null
          kind?: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          severity?: string | null
          suggested_actions_json?: Json | null
          title?: string
          user_id?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'ai_insights_workspace_id_fkey'
            columns: ['workspace_id']
            isOneToOne: false
            referencedRelation: 'workspaces'
            referencedColumns: ['id']
          },
        ]
      }
      ai_messages: {
        Row: {
          citations_json: Json | null
          content_md: string | null
          conversation_id: string
          created_at: string
          id: string
          latency_ms: number | null
          model_used: string | null
          role: string
          tokens_in: number | null
          tokens_out: number | null
          tool_calls_json: Json | null
        }
        Insert: {
          citations_json?: Json | null
          content_md?: string | null
          conversation_id: string
          created_at?: string
          id?: string
          latency_ms?: number | null
          model_used?: string | null
          role: string
          tokens_in?: number | null
          tokens_out?: number | null
          tool_calls_json?: Json | null
        }
        Update: {
          citations_json?: Json | null
          content_md?: string | null
          conversation_id?: string
          created_at?: string
          id?: string
          latency_ms?: number | null
          model_used?: string | null
          role?: string
          tokens_in?: number | null
          tokens_out?: number | null
          tool_calls_json?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: 'ai_messages_conversation_id_fkey'
            columns: ['conversation_id']
            isOneToOne: false
            referencedRelation: 'ai_conversations'
            referencedColumns: ['id']
          },
        ]
      }
      clients: {
        Row: {
          address_json: Json | null
          cnpj: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          deleted_at: string | null
          id: string
          is_active: boolean
          name: string
          notes: string | null
          trade_name: string | null
          updated_at: string
          workspace_id: string
        }
        Insert: {
          address_json?: Json | null
          cnpj?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_active?: boolean
          name: string
          notes?: string | null
          trade_name?: string | null
          updated_at?: string
          workspace_id: string
        }
        Update: {
          address_json?: Json | null
          cnpj?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_active?: boolean
          name?: string
          notes?: string | null
          trade_name?: string | null
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'clients_workspace_id_fkey'
            columns: ['workspace_id']
            isOneToOne: false
            referencedRelation: 'workspaces'
            referencedColumns: ['id']
          },
        ]
      }
      focus_sessions: {
        Row: {
          actual_minutes: number | null
          created_at: string
          ended_at: string | null
          id: string
          interruptions_blocked: number | null
          interruptions_escalated: number | null
          member_id: string
          notes: string | null
          planned_minutes: number
          started_at: string
          task_id: string | null
          workspace_id: string
        }
        Insert: {
          actual_minutes?: number | null
          created_at?: string
          ended_at?: string | null
          id?: string
          interruptions_blocked?: number | null
          interruptions_escalated?: number | null
          member_id: string
          notes?: string | null
          planned_minutes?: number
          started_at?: string
          task_id?: string | null
          workspace_id: string
        }
        Update: {
          actual_minutes?: number | null
          created_at?: string
          ended_at?: string | null
          id?: string
          interruptions_blocked?: number | null
          interruptions_escalated?: number | null
          member_id?: string
          notes?: string | null
          planned_minutes?: number
          started_at?: string
          task_id?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'focus_sessions_member_id_fkey'
            columns: ['member_id']
            isOneToOne: false
            referencedRelation: 'v_member_workload'
            referencedColumns: ['member_id']
          },
          {
            foreignKeyName: 'focus_sessions_member_id_fkey'
            columns: ['member_id']
            isOneToOne: false
            referencedRelation: 'workspace_members'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'focus_sessions_task_id_fkey'
            columns: ['task_id']
            isOneToOne: false
            referencedRelation: 'tasks'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'focus_sessions_workspace_id_fkey'
            columns: ['workspace_id']
            isOneToOne: false
            referencedRelation: 'workspaces'
            referencedColumns: ['id']
          },
        ]
      }
      member_skills: {
        Row: {
          is_certified: boolean | null
          member_id: string
          proficiency: string
          skill_id: string
        }
        Insert: {
          is_certified?: boolean | null
          member_id: string
          proficiency: string
          skill_id: string
        }
        Update: {
          is_certified?: boolean | null
          member_id?: string
          proficiency?: string
          skill_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'member_skills_member_id_fkey'
            columns: ['member_id']
            isOneToOne: false
            referencedRelation: 'v_member_workload'
            referencedColumns: ['member_id']
          },
          {
            foreignKeyName: 'member_skills_member_id_fkey'
            columns: ['member_id']
            isOneToOne: false
            referencedRelation: 'workspace_members'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'member_skills_skill_id_fkey'
            columns: ['skill_id']
            isOneToOne: false
            referencedRelation: 'skills'
            referencedColumns: ['id']
          },
        ]
      }
      member_unavailability: {
        Row: {
          created_at: string
          ends_at: string
          id: string
          member_id: string
          notes: string | null
          reason: string | null
          starts_at: string
        }
        Insert: {
          created_at?: string
          ends_at: string
          id?: string
          member_id: string
          notes?: string | null
          reason?: string | null
          starts_at: string
        }
        Update: {
          created_at?: string
          ends_at?: string
          id?: string
          member_id?: string
          notes?: string | null
          reason?: string | null
          starts_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'member_unavailability_member_id_fkey'
            columns: ['member_id']
            isOneToOne: false
            referencedRelation: 'v_member_workload'
            referencedColumns: ['member_id']
          },
          {
            foreignKeyName: 'member_unavailability_member_id_fkey'
            columns: ['member_id']
            isOneToOne: false
            referencedRelation: 'workspace_members'
            referencedColumns: ['id']
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          body: string | null
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          is_read: boolean | null
          read_at: string | null
          title: string
          type: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          action_url?: string | null
          body?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          is_read?: boolean | null
          read_at?: string | null
          title: string
          type: string
          user_id: string
          workspace_id: string
        }
        Update: {
          action_url?: string | null
          body?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          is_read?: boolean | null
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'notifications_workspace_id_fkey'
            columns: ['workspace_id']
            isOneToOne: false
            referencedRelation: 'workspaces'
            referencedColumns: ['id']
          },
        ]
      }
      os_template_fields: {
        Row: {
          field_key: string
          field_label: string
          field_type: string
          help_text: string | null
          id: string
          is_required: boolean | null
          options_json: Json | null
          placeholder: string | null
          sort_order: number | null
          template_id: string
        }
        Insert: {
          field_key: string
          field_label: string
          field_type: string
          help_text?: string | null
          id?: string
          is_required?: boolean | null
          options_json?: Json | null
          placeholder?: string | null
          sort_order?: number | null
          template_id: string
        }
        Update: {
          field_key?: string
          field_label?: string
          field_type?: string
          help_text?: string | null
          id?: string
          is_required?: boolean | null
          options_json?: Json | null
          placeholder?: string | null
          sort_order?: number | null
          template_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'os_template_fields_template_id_fkey'
            columns: ['template_id']
            isOneToOne: false
            referencedRelation: 'os_templates'
            referencedColumns: ['id']
          },
        ]
      }
      os_templates: {
        Row: {
          category: string
          color_hex: string | null
          created_at: string
          default_priority: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean
          name: string
          requires_quote: boolean | null
          requires_sponsor_approval: boolean | null
          sla_first_action_hours: number | null
          sla_response_hours: number | null
          slug: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          category: string
          color_hex?: string | null
          created_at?: string
          default_priority?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name: string
          requires_quote?: boolean | null
          requires_sponsor_approval?: boolean | null
          sla_first_action_hours?: number | null
          sla_response_hours?: number | null
          slug: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          category?: string
          color_hex?: string | null
          created_at?: string
          default_priority?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name?: string
          requires_quote?: boolean | null
          requires_sponsor_approval?: boolean | null
          sla_first_action_hours?: number | null
          sla_response_hours?: number | null
          slug?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'os_templates_workspace_id_fkey'
            columns: ['workspace_id']
            isOneToOne: false
            referencedRelation: 'workspaces'
            referencedColumns: ['id']
          },
        ]
      }
      priority_changes: {
        Row: {
          affected_tasks_json: Json | null
          changed_by_member_id: string | null
          created_at: string
          id: string
          impact_summary: string | null
          justification: string
          new_priority: string
          old_priority: string | null
          requested_at: string | null
          requested_by: string | null
          task_id: string
          workspace_id: string
        }
        Insert: {
          affected_tasks_json?: Json | null
          changed_by_member_id?: string | null
          created_at?: string
          id?: string
          impact_summary?: string | null
          justification: string
          new_priority: string
          old_priority?: string | null
          requested_at?: string | null
          requested_by?: string | null
          task_id: string
          workspace_id: string
        }
        Update: {
          affected_tasks_json?: Json | null
          changed_by_member_id?: string | null
          created_at?: string
          id?: string
          impact_summary?: string | null
          justification?: string
          new_priority?: string
          old_priority?: string | null
          requested_at?: string | null
          requested_by?: string | null
          task_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'priority_changes_changed_by_member_id_fkey'
            columns: ['changed_by_member_id']
            isOneToOne: false
            referencedRelation: 'v_member_workload'
            referencedColumns: ['member_id']
          },
          {
            foreignKeyName: 'priority_changes_changed_by_member_id_fkey'
            columns: ['changed_by_member_id']
            isOneToOne: false
            referencedRelation: 'workspace_members'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'priority_changes_task_id_fkey'
            columns: ['task_id']
            isOneToOne: false
            referencedRelation: 'tasks'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'priority_changes_workspace_id_fkey'
            columns: ['workspace_id']
            isOneToOne: false
            referencedRelation: 'workspaces'
            referencedColumns: ['id']
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          last_active_at: string | null
          locale: string | null
          phone: string | null
          timezone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name: string
          id: string
          last_active_at?: string | null
          locale?: string | null
          phone?: string | null
          timezone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          last_active_at?: string | null
          locale?: string | null
          phone?: string | null
          timezone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      project_comments: {
        Row: {
          author_member_id: string
          body_md: string
          created_at: string
          deleted_at: string | null
          id: string
          is_ai_generated: boolean | null
          project_id: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          author_member_id: string
          body_md: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_ai_generated?: boolean | null
          project_id: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          author_member_id?: string
          body_md?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_ai_generated?: boolean | null
          project_id?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'project_comments_author_member_id_fkey'
            columns: ['author_member_id']
            isOneToOne: false
            referencedRelation: 'v_member_workload'
            referencedColumns: ['member_id']
          },
          {
            foreignKeyName: 'project_comments_author_member_id_fkey'
            columns: ['author_member_id']
            isOneToOne: false
            referencedRelation: 'workspace_members'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'project_comments_project_id_fkey'
            columns: ['project_id']
            isOneToOne: false
            referencedRelation: 'projects'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'project_comments_project_id_fkey'
            columns: ['project_id']
            isOneToOne: false
            referencedRelation: 'v_project_health'
            referencedColumns: ['project_id']
          },
          {
            foreignKeyName: 'project_comments_workspace_id_fkey'
            columns: ['workspace_id']
            isOneToOne: false
            referencedRelation: 'workspaces'
            referencedColumns: ['id']
          },
        ]
      }
      project_members: {
        Row: {
          allocation_percent: number | null
          id: string
          member_id: string
          project_id: string
          role: string | null
        }
        Insert: {
          allocation_percent?: number | null
          id?: string
          member_id: string
          project_id: string
          role?: string | null
        }
        Update: {
          allocation_percent?: number | null
          id?: string
          member_id?: string
          project_id?: string
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'project_members_member_id_fkey'
            columns: ['member_id']
            isOneToOne: false
            referencedRelation: 'v_member_workload'
            referencedColumns: ['member_id']
          },
          {
            foreignKeyName: 'project_members_member_id_fkey'
            columns: ['member_id']
            isOneToOne: false
            referencedRelation: 'workspace_members'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'project_members_project_id_fkey'
            columns: ['project_id']
            isOneToOne: false
            referencedRelation: 'projects'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'project_members_project_id_fkey'
            columns: ['project_id']
            isOneToOne: false
            referencedRelation: 'v_project_health'
            referencedColumns: ['project_id']
          },
        ]
      }
      project_phases: {
        Row: {
          created_at: string
          due_date: string | null
          id: string
          name: string
          progress_percent: number | null
          project_id: string
          sort_order: number
          start_date: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          due_date?: string | null
          id?: string
          name: string
          progress_percent?: number | null
          project_id: string
          sort_order?: number
          start_date?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          due_date?: string | null
          id?: string
          name?: string
          progress_percent?: number | null
          project_id?: string
          sort_order?: number
          start_date?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'project_phases_project_id_fkey'
            columns: ['project_id']
            isOneToOne: false
            referencedRelation: 'projects'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'project_phases_project_id_fkey'
            columns: ['project_id']
            isOneToOne: false
            referencedRelation: 'v_project_health'
            referencedColumns: ['project_id']
          },
        ]
      }
      projects: {
        Row: {
          actual_hours: number | null
          archived_at: string | null
          budget_amount: number | null
          client_id: string | null
          code: string
          color_hex: string | null
          cost_estimate: number | null
          created_at: string
          deleted_at: string | null
          description: string | null
          due_date: string | null
          estimated_hours: number | null
          health: string | null
          id: string
          name: string
          owner_member_id: string | null
          priority: string | null
          progress_percent: number | null
          project_type: string
          settings_json: Json | null
          sponsor_email: string | null
          sponsor_name: string | null
          start_date: string | null
          status: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          actual_hours?: number | null
          archived_at?: string | null
          budget_amount?: number | null
          client_id?: string | null
          code: string
          color_hex?: string | null
          cost_estimate?: number | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          health?: string | null
          id?: string
          name: string
          owner_member_id?: string | null
          priority?: string | null
          progress_percent?: number | null
          project_type?: string
          settings_json?: Json | null
          sponsor_email?: string | null
          sponsor_name?: string | null
          start_date?: string | null
          status?: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          actual_hours?: number | null
          archived_at?: string | null
          budget_amount?: number | null
          client_id?: string | null
          code?: string
          color_hex?: string | null
          cost_estimate?: number | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          health?: string | null
          id?: string
          name?: string
          owner_member_id?: string | null
          priority?: string | null
          progress_percent?: number | null
          project_type?: string
          settings_json?: Json | null
          sponsor_email?: string | null
          sponsor_name?: string | null
          start_date?: string | null
          status?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'projects_client_id_fkey'
            columns: ['client_id']
            isOneToOne: false
            referencedRelation: 'clients'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'projects_owner_member_id_fkey'
            columns: ['owner_member_id']
            isOneToOne: false
            referencedRelation: 'v_member_workload'
            referencedColumns: ['member_id']
          },
          {
            foreignKeyName: 'projects_owner_member_id_fkey'
            columns: ['owner_member_id']
            isOneToOne: false
            referencedRelation: 'workspace_members'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'projects_workspace_id_fkey'
            columns: ['workspace_id']
            isOneToOne: false
            referencedRelation: 'workspaces'
            referencedColumns: ['id']
          },
        ]
      }
      risks: {
        Row: {
          closed_at: string | null
          code: string
          created_at: string
          description_md: string | null
          detected_at: string
          id: string
          impact_amount: number | null
          is_ai_detected: boolean | null
          mitigation_plan: string | null
          owner_member_id: string | null
          probability: string
          project_id: string
          severity: string
          status: string | null
          title: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          closed_at?: string | null
          code: string
          created_at?: string
          description_md?: string | null
          detected_at?: string
          id?: string
          impact_amount?: number | null
          is_ai_detected?: boolean | null
          mitigation_plan?: string | null
          owner_member_id?: string | null
          probability: string
          project_id: string
          severity: string
          status?: string | null
          title: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          closed_at?: string | null
          code?: string
          created_at?: string
          description_md?: string | null
          detected_at?: string
          id?: string
          impact_amount?: number | null
          is_ai_detected?: boolean | null
          mitigation_plan?: string | null
          owner_member_id?: string | null
          probability?: string
          project_id?: string
          severity?: string
          status?: string | null
          title?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'risks_owner_member_id_fkey'
            columns: ['owner_member_id']
            isOneToOne: false
            referencedRelation: 'v_member_workload'
            referencedColumns: ['member_id']
          },
          {
            foreignKeyName: 'risks_owner_member_id_fkey'
            columns: ['owner_member_id']
            isOneToOne: false
            referencedRelation: 'workspace_members'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'risks_project_id_fkey'
            columns: ['project_id']
            isOneToOne: false
            referencedRelation: 'projects'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'risks_project_id_fkey'
            columns: ['project_id']
            isOneToOne: false
            referencedRelation: 'v_project_health'
            referencedColumns: ['project_id']
          },
          {
            foreignKeyName: 'risks_workspace_id_fkey'
            columns: ['workspace_id']
            isOneToOne: false
            referencedRelation: 'workspaces'
            referencedColumns: ['id']
          },
        ]
      }
      service_orders: {
        Row: {
          accepted_task_id: string | null
          client_id: string | null
          created_at: string
          id: string
          priority: string | null
          quality_issues_json: Json | null
          quality_score: number | null
          raw_body: string | null
          requester_email: string | null
          requester_name: string | null
          return_reason: string | null
          sla_due_at: string | null
          source_channel: string
          source_ref: string | null
          status: string | null
          subject: string
          template_id: string | null
          triaged_at: string | null
          triaged_by_member_id: string | null
          updated_at: string
          workspace_id: string
        }
        Insert: {
          accepted_task_id?: string | null
          client_id?: string | null
          created_at?: string
          id?: string
          priority?: string | null
          quality_issues_json?: Json | null
          quality_score?: number | null
          raw_body?: string | null
          requester_email?: string | null
          requester_name?: string | null
          return_reason?: string | null
          sla_due_at?: string | null
          source_channel: string
          source_ref?: string | null
          status?: string | null
          subject: string
          template_id?: string | null
          triaged_at?: string | null
          triaged_by_member_id?: string | null
          updated_at?: string
          workspace_id: string
        }
        Update: {
          accepted_task_id?: string | null
          client_id?: string | null
          created_at?: string
          id?: string
          priority?: string | null
          quality_issues_json?: Json | null
          quality_score?: number | null
          raw_body?: string | null
          requester_email?: string | null
          requester_name?: string | null
          return_reason?: string | null
          sla_due_at?: string | null
          source_channel?: string
          source_ref?: string | null
          status?: string | null
          subject?: string
          template_id?: string | null
          triaged_at?: string | null
          triaged_by_member_id?: string | null
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'service_orders_accepted_task_id_fkey'
            columns: ['accepted_task_id']
            isOneToOne: false
            referencedRelation: 'tasks'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'service_orders_client_id_fkey'
            columns: ['client_id']
            isOneToOne: false
            referencedRelation: 'clients'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'service_orders_template_id_fkey'
            columns: ['template_id']
            isOneToOne: false
            referencedRelation: 'os_templates'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'service_orders_triaged_by_member_id_fkey'
            columns: ['triaged_by_member_id']
            isOneToOne: false
            referencedRelation: 'v_member_workload'
            referencedColumns: ['member_id']
          },
          {
            foreignKeyName: 'service_orders_triaged_by_member_id_fkey'
            columns: ['triaged_by_member_id']
            isOneToOne: false
            referencedRelation: 'workspace_members'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'service_orders_workspace_id_fkey'
            columns: ['workspace_id']
            isOneToOne: false
            referencedRelation: 'workspaces'
            referencedColumns: ['id']
          },
        ]
      }
      skills: {
        Row: {
          category: string | null
          id: string
          name: string
          workspace_id: string
        }
        Insert: {
          category?: string | null
          id?: string
          name: string
          workspace_id: string
        }
        Update: {
          category?: string | null
          id?: string
          name?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'skills_workspace_id_fkey'
            columns: ['workspace_id']
            isOneToOne: false
            referencedRelation: 'workspaces'
            referencedColumns: ['id']
          },
        ]
      }
      task_attachments: {
        Row: {
          created_at: string
          file_name: string
          file_size: number
          id: string
          mime_type: string | null
          storage_url: string
          task_id: string
          uploaded_by_member_id: string | null
          workspace_id: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_size: number
          id?: string
          mime_type?: string | null
          storage_url: string
          task_id: string
          uploaded_by_member_id?: string | null
          workspace_id: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_size?: number
          id?: string
          mime_type?: string | null
          storage_url?: string
          task_id?: string
          uploaded_by_member_id?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'task_attachments_task_id_fkey'
            columns: ['task_id']
            isOneToOne: false
            referencedRelation: 'tasks'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'task_attachments_uploaded_by_member_id_fkey'
            columns: ['uploaded_by_member_id']
            isOneToOne: false
            referencedRelation: 'v_member_workload'
            referencedColumns: ['member_id']
          },
          {
            foreignKeyName: 'task_attachments_uploaded_by_member_id_fkey'
            columns: ['uploaded_by_member_id']
            isOneToOne: false
            referencedRelation: 'workspace_members'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'task_attachments_workspace_id_fkey'
            columns: ['workspace_id']
            isOneToOne: false
            referencedRelation: 'workspaces'
            referencedColumns: ['id']
          },
        ]
      }
      task_blocks: {
        Row: {
          blocked_at: string
          blocked_by_member_id: string | null
          expected_unblock_at: string | null
          id: string
          impact_hours: number | null
          reason: string
          task_id: string
          unblock_notes: string | null
          unblock_owner_external: string | null
          unblock_owner_member_id: string | null
          unblocked_at: string | null
        }
        Insert: {
          blocked_at?: string
          blocked_by_member_id?: string | null
          expected_unblock_at?: string | null
          id?: string
          impact_hours?: number | null
          reason: string
          task_id: string
          unblock_notes?: string | null
          unblock_owner_external?: string | null
          unblock_owner_member_id?: string | null
          unblocked_at?: string | null
        }
        Update: {
          blocked_at?: string
          blocked_by_member_id?: string | null
          expected_unblock_at?: string | null
          id?: string
          impact_hours?: number | null
          reason?: string
          task_id?: string
          unblock_notes?: string | null
          unblock_owner_external?: string | null
          unblock_owner_member_id?: string | null
          unblocked_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'task_blocks_blocked_by_member_id_fkey'
            columns: ['blocked_by_member_id']
            isOneToOne: false
            referencedRelation: 'v_member_workload'
            referencedColumns: ['member_id']
          },
          {
            foreignKeyName: 'task_blocks_blocked_by_member_id_fkey'
            columns: ['blocked_by_member_id']
            isOneToOne: false
            referencedRelation: 'workspace_members'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'task_blocks_task_id_fkey'
            columns: ['task_id']
            isOneToOne: false
            referencedRelation: 'tasks'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'task_blocks_unblock_owner_member_id_fkey'
            columns: ['unblock_owner_member_id']
            isOneToOne: false
            referencedRelation: 'v_member_workload'
            referencedColumns: ['member_id']
          },
          {
            foreignKeyName: 'task_blocks_unblock_owner_member_id_fkey'
            columns: ['unblock_owner_member_id']
            isOneToOne: false
            referencedRelation: 'workspace_members'
            referencedColumns: ['id']
          },
        ]
      }
      task_comments: {
        Row: {
          author_member_id: string
          body_md: string
          created_at: string
          deleted_at: string | null
          id: string
          is_ai_generated: boolean | null
          task_id: string
          updated_at: string
        }
        Insert: {
          author_member_id: string
          body_md: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_ai_generated?: boolean | null
          task_id: string
          updated_at?: string
        }
        Update: {
          author_member_id?: string
          body_md?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_ai_generated?: boolean | null
          task_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'task_comments_author_member_id_fkey'
            columns: ['author_member_id']
            isOneToOne: false
            referencedRelation: 'v_member_workload'
            referencedColumns: ['member_id']
          },
          {
            foreignKeyName: 'task_comments_author_member_id_fkey'
            columns: ['author_member_id']
            isOneToOne: false
            referencedRelation: 'workspace_members'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'task_comments_task_id_fkey'
            columns: ['task_id']
            isOneToOne: false
            referencedRelation: 'tasks'
            referencedColumns: ['id']
          },
        ]
      }
      task_dependencies: {
        Row: {
          blocked_task_id: string
          blocking_task_id: string
          created_at: string
          id: string
        }
        Insert: {
          blocked_task_id: string
          blocking_task_id: string
          created_at?: string
          id?: string
        }
        Update: {
          blocked_task_id?: string
          blocking_task_id?: string
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'task_dependencies_blocked_task_id_fkey'
            columns: ['blocked_task_id']
            isOneToOne: false
            referencedRelation: 'tasks'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'task_dependencies_blocking_task_id_fkey'
            columns: ['blocking_task_id']
            isOneToOne: false
            referencedRelation: 'tasks'
            referencedColumns: ['id']
          },
        ]
      }
      task_required_skills: {
        Row: {
          is_mandatory: boolean | null
          min_proficiency: string
          skill_id: string
          task_id: string
        }
        Insert: {
          is_mandatory?: boolean | null
          min_proficiency: string
          skill_id: string
          task_id: string
        }
        Update: {
          is_mandatory?: boolean | null
          min_proficiency?: string
          skill_id?: string
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'task_required_skills_skill_id_fkey'
            columns: ['skill_id']
            isOneToOne: false
            referencedRelation: 'skills'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'task_required_skills_task_id_fkey'
            columns: ['task_id']
            isOneToOne: false
            referencedRelation: 'tasks'
            referencedColumns: ['id']
          },
        ]
      }
      task_statuses: {
        Row: {
          category: string
          color_hex: string | null
          created_at: string
          id: string
          is_default: boolean | null
          name: string
          project_id: string | null
          sort_order: number
          workspace_id: string
        }
        Insert: {
          category: string
          color_hex?: string | null
          created_at?: string
          id?: string
          is_default?: boolean | null
          name: string
          project_id?: string | null
          sort_order?: number
          workspace_id: string
        }
        Update: {
          category?: string
          color_hex?: string | null
          created_at?: string
          id?: string
          is_default?: boolean | null
          name?: string
          project_id?: string | null
          sort_order?: number
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'task_statuses_project_id_fkey'
            columns: ['project_id']
            isOneToOne: false
            referencedRelation: 'projects'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'task_statuses_project_id_fkey'
            columns: ['project_id']
            isOneToOne: false
            referencedRelation: 'v_project_health'
            referencedColumns: ['project_id']
          },
          {
            foreignKeyName: 'task_statuses_workspace_id_fkey'
            columns: ['workspace_id']
            isOneToOne: false
            referencedRelation: 'workspaces'
            referencedColumns: ['id']
          },
        ]
      }
      task_tag_assignments: {
        Row: {
          tag_id: string
          task_id: string
        }
        Insert: {
          tag_id: string
          task_id: string
        }
        Update: {
          tag_id?: string
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'task_tag_assignments_tag_id_fkey'
            columns: ['tag_id']
            isOneToOne: false
            referencedRelation: 'task_tags'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'task_tag_assignments_task_id_fkey'
            columns: ['task_id']
            isOneToOne: false
            referencedRelation: 'tasks'
            referencedColumns: ['id']
          },
        ]
      }
      task_tags: {
        Row: {
          color_hex: string | null
          id: string
          name: string
          workspace_id: string
        }
        Insert: {
          color_hex?: string | null
          id?: string
          name: string
          workspace_id: string
        }
        Update: {
          color_hex?: string | null
          id?: string
          name?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'task_tags_workspace_id_fkey'
            columns: ['workspace_id']
            isOneToOne: false
            referencedRelation: 'workspaces'
            referencedColumns: ['id']
          },
        ]
      }
      tasks: {
        Row: {
          actual_hours: number | null
          ai_last_analyzed_at: string | null
          ai_risk_score: number | null
          assignee_member_id: string | null
          blocked_reason: string | null
          completed_at: string | null
          created_at: string
          deleted_at: string | null
          description_md: string | null
          dor_score: number | null
          due_date: string | null
          estimated_hours: number | null
          id: string
          is_blocked: boolean | null
          parent_task_id: string | null
          phase_id: string | null
          priority: string | null
          priority_locked_until: string | null
          project_id: string
          reporter_member_id: string | null
          sequence_number: number
          sort_order: number | null
          start_date: string | null
          status_id: string
          title: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          actual_hours?: number | null
          ai_last_analyzed_at?: string | null
          ai_risk_score?: number | null
          assignee_member_id?: string | null
          blocked_reason?: string | null
          completed_at?: string | null
          created_at?: string
          deleted_at?: string | null
          description_md?: string | null
          dor_score?: number | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          is_blocked?: boolean | null
          parent_task_id?: string | null
          phase_id?: string | null
          priority?: string | null
          priority_locked_until?: string | null
          project_id: string
          reporter_member_id?: string | null
          sequence_number: number
          sort_order?: number | null
          start_date?: string | null
          status_id: string
          title: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          actual_hours?: number | null
          ai_last_analyzed_at?: string | null
          ai_risk_score?: number | null
          assignee_member_id?: string | null
          blocked_reason?: string | null
          completed_at?: string | null
          created_at?: string
          deleted_at?: string | null
          description_md?: string | null
          dor_score?: number | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          is_blocked?: boolean | null
          parent_task_id?: string | null
          phase_id?: string | null
          priority?: string | null
          priority_locked_until?: string | null
          project_id?: string
          reporter_member_id?: string | null
          sequence_number?: number
          sort_order?: number | null
          start_date?: string | null
          status_id?: string
          title?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'tasks_assignee_member_id_fkey'
            columns: ['assignee_member_id']
            isOneToOne: false
            referencedRelation: 'v_member_workload'
            referencedColumns: ['member_id']
          },
          {
            foreignKeyName: 'tasks_assignee_member_id_fkey'
            columns: ['assignee_member_id']
            isOneToOne: false
            referencedRelation: 'workspace_members'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'tasks_parent_task_id_fkey'
            columns: ['parent_task_id']
            isOneToOne: false
            referencedRelation: 'tasks'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'tasks_phase_id_fkey'
            columns: ['phase_id']
            isOneToOne: false
            referencedRelation: 'project_phases'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'tasks_project_id_fkey'
            columns: ['project_id']
            isOneToOne: false
            referencedRelation: 'projects'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'tasks_project_id_fkey'
            columns: ['project_id']
            isOneToOne: false
            referencedRelation: 'v_project_health'
            referencedColumns: ['project_id']
          },
          {
            foreignKeyName: 'tasks_reporter_member_id_fkey'
            columns: ['reporter_member_id']
            isOneToOne: false
            referencedRelation: 'v_member_workload'
            referencedColumns: ['member_id']
          },
          {
            foreignKeyName: 'tasks_reporter_member_id_fkey'
            columns: ['reporter_member_id']
            isOneToOne: false
            referencedRelation: 'workspace_members'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'tasks_status_id_fkey'
            columns: ['status_id']
            isOneToOne: false
            referencedRelation: 'task_statuses'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'tasks_workspace_id_fkey'
            columns: ['workspace_id']
            isOneToOne: false
            referencedRelation: 'workspaces'
            referencedColumns: ['id']
          },
        ]
      }
      team_members: {
        Row: {
          id: string
          member_id: string
          role: string | null
          team_id: string
        }
        Insert: {
          id?: string
          member_id: string
          role?: string | null
          team_id: string
        }
        Update: {
          id?: string
          member_id?: string
          role?: string | null
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'team_members_member_id_fkey'
            columns: ['member_id']
            isOneToOne: false
            referencedRelation: 'v_member_workload'
            referencedColumns: ['member_id']
          },
          {
            foreignKeyName: 'team_members_member_id_fkey'
            columns: ['member_id']
            isOneToOne: false
            referencedRelation: 'workspace_members'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'team_members_team_id_fkey'
            columns: ['team_id']
            isOneToOne: false
            referencedRelation: 'teams'
            referencedColumns: ['id']
          },
        ]
      }
      teams: {
        Row: {
          color_hex: string | null
          created_at: string
          deleted_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          color_hex?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          color_hex?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'teams_workspace_id_fkey'
            columns: ['workspace_id']
            isOneToOne: false
            referencedRelation: 'workspaces'
            referencedColumns: ['id']
          },
        ]
      }
      time_entries: {
        Row: {
          created_at: string
          description: string | null
          entry_date: string
          hourly_rate: number | null
          hours: number
          id: string
          is_billable: boolean | null
          member_id: string
          project_id: string
          task_id: string | null
          updated_at: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          entry_date: string
          hourly_rate?: number | null
          hours: number
          id?: string
          is_billable?: boolean | null
          member_id: string
          project_id: string
          task_id?: string | null
          updated_at?: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          entry_date?: string
          hourly_rate?: number | null
          hours?: number
          id?: string
          is_billable?: boolean | null
          member_id?: string
          project_id?: string
          task_id?: string | null
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'time_entries_member_id_fkey'
            columns: ['member_id']
            isOneToOne: false
            referencedRelation: 'v_member_workload'
            referencedColumns: ['member_id']
          },
          {
            foreignKeyName: 'time_entries_member_id_fkey'
            columns: ['member_id']
            isOneToOne: false
            referencedRelation: 'workspace_members'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'time_entries_project_id_fkey'
            columns: ['project_id']
            isOneToOne: false
            referencedRelation: 'projects'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'time_entries_project_id_fkey'
            columns: ['project_id']
            isOneToOne: false
            referencedRelation: 'v_project_health'
            referencedColumns: ['project_id']
          },
          {
            foreignKeyName: 'time_entries_task_id_fkey'
            columns: ['task_id']
            isOneToOne: false
            referencedRelation: 'tasks'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'time_entries_workspace_id_fkey'
            columns: ['workspace_id']
            isOneToOne: false
            referencedRelation: 'workspaces'
            referencedColumns: ['id']
          },
        ]
      }
      workspace_invitations: {
        Row: {
          accepted_at: string | null
          accepted_by_user_id: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by_user_id: string
          role: string
          token: string
          workspace_id: string
        }
        Insert: {
          accepted_at?: string | null
          accepted_by_user_id?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by_user_id: string
          role?: string
          token: string
          workspace_id: string
        }
        Update: {
          accepted_at?: string | null
          accepted_by_user_id?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by_user_id?: string
          role?: string
          token?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'workspace_invitations_workspace_id_fkey'
            columns: ['workspace_id']
            isOneToOne: false
            referencedRelation: 'workspaces'
            referencedColumns: ['id']
          },
        ]
      }
      workspace_members: {
        Row: {
          capacity_hours_week: number | null
          created_at: string
          focus_auto_reply: string | null
          focus_mode_until: string | null
          hourly_rate: number | null
          id: string
          invited_at: string
          invited_by_user_id: string | null
          is_active: boolean
          is_in_focus_mode: boolean | null
          job_title: string | null
          joined_at: string | null
          role: string
          skills_json: Json | null
          updated_at: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          capacity_hours_week?: number | null
          created_at?: string
          focus_auto_reply?: string | null
          focus_mode_until?: string | null
          hourly_rate?: number | null
          id?: string
          invited_at?: string
          invited_by_user_id?: string | null
          is_active?: boolean
          is_in_focus_mode?: boolean | null
          job_title?: string | null
          joined_at?: string | null
          role: string
          skills_json?: Json | null
          updated_at?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          capacity_hours_week?: number | null
          created_at?: string
          focus_auto_reply?: string | null
          focus_mode_until?: string | null
          hourly_rate?: number | null
          id?: string
          invited_at?: string
          invited_by_user_id?: string | null
          is_active?: boolean
          is_in_focus_mode?: boolean | null
          job_title?: string | null
          joined_at?: string | null
          role?: string
          skills_json?: Json | null
          updated_at?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'workspace_members_workspace_id_fkey'
            columns: ['workspace_id']
            isOneToOne: false
            referencedRelation: 'workspaces'
            referencedColumns: ['id']
          },
        ]
      }
      workspaces: {
        Row: {
          archived_at: string | null
          cnpj: string | null
          created_at: string
          deleted_at: string | null
          id: string
          industry: string | null
          logo_url: string | null
          name: string
          owner_user_id: string
          plan: string
          plan_expires_at: string | null
          plan_renewed_at: string | null
          plan_seats: number
          settings_json: Json
          slug: string
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          cnpj?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          name: string
          owner_user_id: string
          plan?: string
          plan_expires_at?: string | null
          plan_renewed_at?: string | null
          plan_seats?: number
          settings_json?: Json
          slug: string
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          cnpj?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          name?: string
          owner_user_id?: string
          plan?: string
          plan_expires_at?: string | null
          plan_renewed_at?: string | null
          plan_seats?: number
          settings_json?: Json
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      v_member_workload: {
        Row: {
          blocked_tasks_count: number | null
          capacity_hours_week: number | null
          full_name: string | null
          member_id: string | null
          open_estimated_hours: number | null
          open_tasks_count: number | null
          user_id: string | null
          workspace_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'workspace_members_workspace_id_fkey'
            columns: ['workspace_id']
            isOneToOne: false
            referencedRelation: 'workspaces'
            referencedColumns: ['id']
          },
        ]
      }
      v_project_health: {
        Row: {
          blocked_tasks: number | null
          budget_amount: number | null
          code: string | null
          done_tasks: number | null
          due_date: string | null
          estimated_hours: number | null
          hours_logged: number | null
          name: string | null
          percent_done: number | null
          project_id: string | null
          status: string | null
          total_tasks: number | null
          workspace_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'projects_workspace_id_fkey'
            columns: ['workspace_id']
            isOneToOne: false
            referencedRelation: 'workspaces'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Functions: {
      accept_workspace_invitation: {
        Args: { p_token: string }
        Returns: {
          archived_at: string | null
          cnpj: string | null
          created_at: string
          deleted_at: string | null
          id: string
          industry: string | null
          logo_url: string | null
          name: string
          owner_user_id: string
          plan: string
          plan_expires_at: string | null
          plan_renewed_at: string | null
          plan_seats: number
          settings_json: Json
          slug: string
          updated_at: string
        }
        SetofOptions: {
          from: '*'
          to: 'workspaces'
          isOneToOne: true
          isSetofReturn: false
        }
      }
      apply_ai_action: {
        Args: { p_action_id: string }
        Returns: {
          action_type: string
          approved_at: string | null
          approved_by_user_id: string | null
          conversation_id: string | null
          created_at: string
          error_message: string | null
          executed_at: string | null
          id: string
          insight_id: string | null
          payload_json: Json
          requires_approval: boolean | null
          result_json: Json | null
          status: string | null
          user_id: string
          workspace_id: string
        }
        SetofOptions: {
          from: '*'
          to: 'ai_actions'
          isOneToOne: true
          isSetofReturn: false
        }
      }
      archive_workspace: {
        Args: { p_workspace_id: string }
        Returns: undefined
      }
      bootstrap_workspace: {
        Args: {
          p_industry?: string
          p_name: string
          p_plan?: string
          p_seats?: number
          p_slug: string
        }
        Returns: {
          archived_at: string | null
          cnpj: string | null
          created_at: string
          deleted_at: string | null
          id: string
          industry: string | null
          logo_url: string | null
          name: string
          owner_user_id: string
          plan: string
          plan_expires_at: string | null
          plan_renewed_at: string | null
          plan_seats: number
          settings_json: Json
          slug: string
          updated_at: string
        }
        SetofOptions: {
          from: '*'
          to: 'workspaces'
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_workspace_invitation: {
        Args: { p_email: string; p_role?: string; p_workspace_id: string }
        Returns: {
          accepted_at: string | null
          accepted_by_user_id: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by_user_id: string
          role: string
          token: string
          workspace_id: string
        }
        SetofOptions: {
          from: '*'
          to: 'workspace_invitations'
          isOneToOne: true
          isSetofReturn: false
        }
      }
      is_workspace_member: { Args: { _workspace_id: string }; Returns: boolean }
      preview_workspace_invitation: {
        Args: { p_token: string }
        Returns: {
          accepted_at: string
          email: string
          expires_at: string
          role: string
          workspace_id: string
          workspace_name: string
        }[]
      }
      reject_ai_action: {
        Args: { p_action_id: string }
        Returns: {
          action_type: string
          approved_at: string | null
          approved_by_user_id: string | null
          conversation_id: string | null
          created_at: string
          error_message: string | null
          executed_at: string | null
          id: string
          insight_id: string | null
          payload_json: Json
          requires_approval: boolean | null
          result_json: Json | null
          status: string | null
          user_id: string
          workspace_id: string
        }
        SetofOptions: {
          from: '*'
          to: 'ai_actions'
          isOneToOne: true
          isSetofReturn: false
        }
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { '': string }; Returns: string[] }
      update_workspace: {
        Args: {
          p_industry: string
          p_name: string
          p_plan: string
          p_seats: number
          p_slug: string
          p_workspace_id: string
        }
        Returns: {
          archived_at: string | null
          cnpj: string | null
          created_at: string
          deleted_at: string | null
          id: string
          industry: string | null
          logo_url: string | null
          name: string
          owner_user_id: string
          plan: string
          plan_expires_at: string | null
          plan_renewed_at: string | null
          plan_seats: number
          settings_json: Json
          slug: string
          updated_at: string
        }
        SetofOptions: {
          from: '*'
          to: 'workspaces'
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
