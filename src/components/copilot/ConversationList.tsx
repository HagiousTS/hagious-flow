import { Plus, Sparkles } from 'lucide-react'
import { cn, relativeDays } from '@/lib/utils'
import type { AIConversation } from '@/types/database'

interface ConversationListProps {
  conversations: AIConversation[]
  activeId: string | null
  onSelect: (id: string) => void
  onCreate: () => void
  isCreating: boolean
}

export function ConversationList({
  conversations,
  activeId,
  onSelect,
  onCreate,
  isCreating,
}: ConversationListProps) {
  return (
    <aside className="w-[260px] shrink-0 border-r bg-panel/40 flex flex-col h-full">
      <div className="p-3 border-b">
        <button
          type="button"
          onClick={onCreate}
          disabled={isCreating}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg grad-brand text-white text-sm font-semibold hover:opacity-90 transition disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          {isCreating ? 'Criando...' : 'Nova conversa'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-2 space-y-0.5">
        {conversations.length === 0 ? (
          <div className="text-center px-4 py-10 text-muted text-xs">
            <Sparkles className="w-6 h-6 mx-auto mb-2 opacity-50" />
            Sem conversas ainda. Crie a primeira para começar.
          </div>
        ) : (
          conversations.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelect(c.id)}
              className={cn(
                'w-full text-left px-3 py-2 mx-1 rounded-lg transition',
                c.id === activeId
                  ? 'bg-brand/15 border border-brand/30'
                  : 'hover:bg-panel2 border border-transparent'
              )}
            >
              <div className="text-sm font-medium truncate">
                {c.title ?? 'Sem título'}
              </div>
              <div className="text-[10px] text-muted mt-0.5">
                {relativeDays(c.updated_at)}
              </div>
            </button>
          ))
        )}
      </div>
    </aside>
  )
}
