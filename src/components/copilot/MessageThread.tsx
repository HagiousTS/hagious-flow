import { useEffect, useRef } from 'react'
import { Sparkles, User as UserIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AIMessage, AIToolCallProposal } from '@/types/database'
import { ActionProposals } from '@/components/copilot/ActionProposal'

function parseToolCalls(raw: unknown): AIToolCallProposal[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((item) => {
      if (typeof item !== 'object' || item === null) return null
      const obj = item as Record<string, unknown>
      const id = obj.action_id
      const name = obj.name
      const input = obj.input
      if (typeof id !== 'string' || typeof name !== 'string') return null
      return {
        action_id: id,
        name,
        input:
          typeof input === 'object' && input !== null
            ? (input as Record<string, unknown>)
            : {},
      } as AIToolCallProposal
    })
    .filter((x): x is AIToolCallProposal => x !== null)
}

interface MessageThreadProps {
  messages: AIMessage[]
  isLoading: boolean
  isSending: boolean
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

function MessageBubble({ msg }: { msg: AIMessage }) {
  const isUser = msg.role === 'user'
  const isSystem = msg.role === 'system'

  if (isSystem) {
    return (
      <div className="text-center text-[11px] text-muted py-2">
        {msg.content_md}
      </div>
    )
  }

  const proposals = !isUser ? parseToolCalls(msg.tool_calls_json) : []

  return (
    <div
      className={cn(
        'flex gap-3 max-w-3xl',
        isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
      )}
    >
      <div
        className={cn(
          'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
          isUser ? 'bg-info/20 text-info' : 'grad-brand text-white'
        )}
      >
        {isUser ? (
          <UserIcon className="w-4 h-4" />
        ) : (
          <Sparkles className="w-4 h-4" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div
          className={cn(
            'rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap',
            isUser
              ? 'bg-info/10 text-text border border-info/20'
              : 'bg-panel border border-border'
          )}
        >
          {msg.content_md}
          <div className="flex items-center gap-2 text-[10px] text-muted mt-1.5">
            <span>{formatTime(msg.created_at)}</span>
            {msg.model_used && (
              <span className="opacity-70">· {msg.model_used}</span>
            )}
            {msg.latency_ms != null && (
              <span className="opacity-70">· {msg.latency_ms}ms</span>
            )}
            {proposals.length > 0 && (
              <span className="opacity-70">
                · {proposals.length} ação{proposals.length > 1 ? 'ões' : ''}{' '}
                proposta{proposals.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
        {proposals.length > 0 && <ActionProposals proposals={proposals} />}
      </div>
    </div>
  )
}

export function MessageThread({
  messages,
  isLoading,
  isSending,
}: MessageThreadProps) {
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length, isSending])

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted text-sm">
        Carregando mensagens...
      </div>
    )
  }

  if (messages.length === 0 && !isSending) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="w-14 h-14 rounded-2xl grad-brand flex items-center justify-center mb-4">
          <Sparkles className="w-7 h-7 text-white" />
        </div>
        <h3 className="text-lg font-semibold mb-2">IA COO</h3>
        <p className="text-sm text-muted max-w-md">
          Copiloto operacional. Pergunte sobre projetos, riscos, equipe ou OS.
          Conecta a Anthropic ou OpenAI quando a chave de API estiver definida
          nas secrets da edge function; sem chave, responde em modo simulado.
        </p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
      {messages.map((m) => (
        <MessageBubble key={m.id} msg={m} />
      ))}
      {isSending && (
        <div className="flex gap-3 max-w-3xl mr-auto">
          <div className="w-8 h-8 rounded-lg grad-brand text-white flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div className="rounded-2xl px-4 py-3 bg-panel border border-border">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-muted animate-bounce" />
              <span
                className="w-1.5 h-1.5 rounded-full bg-muted animate-bounce"
                style={{ animationDelay: '0.15s' }}
              />
              <span
                className="w-1.5 h-1.5 rounded-full bg-muted animate-bounce"
                style={{ animationDelay: '0.3s' }}
              />
            </div>
          </div>
        </div>
      )}
      <div ref={endRef} />
    </div>
  )
}
