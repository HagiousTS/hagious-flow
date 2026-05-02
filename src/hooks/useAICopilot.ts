import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { AIConversation, AIMessage } from '@/types/database'

export function useAIConversations(workspaceId: string | undefined) {
  return useQuery<AIConversation[]>({
    queryKey: ['ai', 'conversations', workspaceId],
    enabled: !!workspaceId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_conversations')
        .select('*')
        .eq('workspace_id', workspaceId!)
        .is('archived_at', null)
        .order('updated_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as AIConversation[]
    },
  })
}

export function useAIMessages(conversationId: string | undefined) {
  return useQuery<AIMessage[]>({
    queryKey: ['ai', 'messages', conversationId],
    enabled: !!conversationId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_messages')
        .select('*')
        .eq('conversation_id', conversationId!)
        .order('created_at', { ascending: true })
      if (error) throw error
      return (data ?? []) as AIMessage[]
    },
  })
}

interface CreateConversationArgs {
  workspaceId: string
  userId: string
  title?: string
}

export function useCreateConversation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      workspaceId,
      userId,
      title,
    }: CreateConversationArgs) => {
      const { data, error } = await supabase
        .from('ai_conversations')
        .insert({
          workspace_id: workspaceId,
          user_id: userId,
          title: title ?? 'Nova conversa',
          mode: 'chat',
        })
        .select('*')
        .single()
      if (error) throw error
      return data as AIConversation
    },
    onSuccess: (conv) => {
      qc.invalidateQueries({
        queryKey: ['ai', 'conversations', conv.workspace_id],
      })
    },
  })
}

interface SendMessageArgs {
  conversationId: string
  workspaceId: string
  content: string
}

export function useSendMessage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ conversationId, content }: SendMessageArgs) => {
      const trimmed = content.trim()
      if (!trimmed) throw new Error('Mensagem vazia')

      const { data, error } = await supabase.functions.invoke('ia-coo-chat', {
        body: { conversationId, content: trimmed },
      })
      if (error) throw error
      if (data && typeof data === 'object' && 'error' in data && data.error) {
        throw new Error(String(data.error))
      }
      return data as { userMsg: AIMessage; assistantMsg: AIMessage }
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({
        queryKey: ['ai', 'messages', vars.conversationId],
      })
      qc.invalidateQueries({
        queryKey: ['ai', 'conversations', vars.workspaceId],
      })
    },
  })
}

interface ArchiveArgs {
  conversationId: string
  workspaceId: string
}

export function useArchiveConversation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ conversationId }: ArchiveArgs) => {
      const { error } = await supabase
        .from('ai_conversations')
        .update({ archived_at: new Date().toISOString() })
        .eq('id', conversationId)
      if (error) throw error
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({
        queryKey: ['ai', 'conversations', vars.workspaceId],
      })
    },
  })
}
