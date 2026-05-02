import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { AIConversation, AIMessage } from '@/types/database'

const MOCK_MODEL = 'mock-coo-v0'

const MOCK_REPLIES = [
  'Recebi sua mensagem. Estou em modo simulado — quando a integração com OpenAI for ligada, vou conectar contexto do workspace, riscos e tasks para responder de verdade.',
  'Anotado. Por enquanto sou um esqueleto. Sua mensagem ficou salva em `ai_messages` e vai virar contexto real quando o backend de IA estiver plugado.',
  'Posso buscar projetos em risco, equipe sobrecarregada e OS na inbox. Hoje só registro intenção; em breve executo de fato.',
  'Comando registrado. Próxima iteração: tool calls reais (criar task, escalar OS, ajustar prioridade) com aprovação humana antes de executar.',
]

function pickMockReply(seed: string): string {
  let h = 0
  for (let i = 0; i < seed.length; i += 1) h = (h * 31 + seed.charCodeAt(i)) | 0
  return MOCK_REPLIES[Math.abs(h) % MOCK_REPLIES.length]
}

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

      const startedAt = Date.now()

      const { data: userMsg, error: userErr } = await supabase
        .from('ai_messages')
        .insert({
          conversation_id: conversationId,
          role: 'user',
          content_md: trimmed,
        })
        .select('*')
        .single()
      if (userErr) throw userErr

      const reply = pickMockReply(trimmed)
      const latency = Date.now() - startedAt

      const { data: assistantMsg, error: asstErr } = await supabase
        .from('ai_messages')
        .insert({
          conversation_id: conversationId,
          role: 'assistant',
          content_md: reply,
          model_used: MOCK_MODEL,
          tokens_in: trimmed.length,
          tokens_out: reply.length,
          latency_ms: latency,
        })
        .select('*')
        .single()
      if (asstErr) throw asstErr

      await supabase
        .from('ai_conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId)

      return {
        userMsg: userMsg as AIMessage,
        assistantMsg: assistantMsg as AIMessage,
      }
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
