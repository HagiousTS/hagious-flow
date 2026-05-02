import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useWorkspace } from '@/hooks/useWorkspace'
import {
  useAIConversations,
  useAIMessages,
  useCreateConversation,
  useSendMessage,
} from '@/hooks/useAICopilot'
import { ConversationList } from '@/components/copilot/ConversationList'
import { MessageThread } from '@/components/copilot/MessageThread'
import { ChatInput } from '@/components/copilot/ChatInput'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'

export function AICopilotPage() {
  const { user } = useAuth()
  const { data: workspace, isLoading: wsLoading } = useWorkspace()
  const conversations = useAIConversations(workspace?.id)
  const [activeId, setActiveId] = useState<string | null>(null)
  const messages = useAIMessages(activeId ?? undefined)
  const createMut = useCreateConversation()
  const sendMut = useSendMessage()

  useEffect(() => {
    if (!activeId && conversations.data && conversations.data.length > 0) {
      setActiveId(conversations.data[0].id)
    }
  }, [activeId, conversations.data])

  async function handleCreate() {
    if (!workspace || !user) return
    try {
      const conv = await createMut.mutateAsync({
        workspaceId: workspace.id,
        userId: user.id,
        title: `Conversa ${new Date().toLocaleDateString('pt-BR')}`,
      })
      setActiveId(conv.id)
    } catch (err) {
      alert(`Erro ao criar conversa: ${(err as Error).message}`)
    }
  }

  async function handleSend(content: string) {
    if (!workspace) return
    let conversationId = activeId
    if (!conversationId) {
      if (!user) return
      try {
        const conv = await createMut.mutateAsync({
          workspaceId: workspace.id,
          userId: user.id,
          title: content.slice(0, 50),
        })
        conversationId = conv.id
        setActiveId(conv.id)
      } catch (err) {
        alert(`Erro ao criar conversa: ${(err as Error).message}`)
        return
      }
    }
    try {
      await sendMut.mutateAsync({
        conversationId,
        workspaceId: workspace.id,
        content,
      })
    } catch (err) {
      alert(`Erro ao enviar: ${(err as Error).message}`)
    }
  }

  if (wsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64 rounded-lg" />
        <Skeleton className="h-[600px] rounded-2xl" />
      </div>
    )
  }

  if (!workspace) {
    return (
      <Card>
        <div className="text-center py-12">
          <h3 className="font-semibold mb-2">Sem workspace ativo</h3>
        </div>
      </Card>
    )
  }

  return (
    <div className="-m-8 h-[calc(100vh-64px)] flex flex-col">
      <div className="px-6 py-4 border-b bg-panel/40 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            IA COO
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-warn/20 text-warn font-semibold uppercase tracking-wider">
              mock
            </span>
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Copiloto operacional · {workspace.name}
          </p>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <ConversationList
          conversations={conversations.data ?? []}
          activeId={activeId}
          onSelect={setActiveId}
          onCreate={handleCreate}
          isCreating={createMut.isPending}
        />

        <main className="flex-1 flex flex-col min-w-0">
          <MessageThread
            messages={messages.data ?? []}
            isLoading={messages.isLoading && !!activeId}
            isSending={sendMut.isPending}
          />
          <ChatInput
            onSend={handleSend}
            disabled={sendMut.isPending || createMut.isPending}
            placeholder={
              activeId
                ? 'Pergunte ao IA COO...'
                : 'Digite para criar uma nova conversa...'
            }
          />
        </main>
      </div>
    </div>
  )
}
