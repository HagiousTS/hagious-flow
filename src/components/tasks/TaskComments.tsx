import { useMemo, useState, type FormEvent, type KeyboardEvent } from 'react'
import { Check, Loader2, MessageSquare, Pencil, Send, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import {
  extractMentions,
  useCreateTaskComment,
  useDeleteTaskComment,
  useTaskComments,
  useUpdateTaskComment,
} from '@/hooks/useTaskComments'
import { useAuth } from '@/hooks/useAuth'
import { cn, getInitials, relativeDays } from '@/lib/utils'

interface TaskCommentsProps {
  taskId: string
  taskTitle: string
  projectHref: string
  workspaceId: string
  currentMemberId: string | null
  members: { id: string; full_name: string }[]
}

export function TaskComments({
  taskId,
  taskTitle,
  projectHref,
  workspaceId,
  currentMemberId,
  members,
}: TaskCommentsProps) {
  const { user } = useAuth()
  const comments = useTaskComments(taskId)
  const create = useCreateTaskComment()
  const del = useDeleteTaskComment()
  const update = useUpdateTaskComment()

  const [body, setBody] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editBody, setEditBody] = useState('')

  const memberById = useMemo(
    () => new Map(members.map((m) => [m.id, m.full_name])),
    [members]
  )

  async function handleSubmit(e?: FormEvent) {
    e?.preventDefault()
    setError(null)
    const trimmed = body.trim()
    if (!trimmed) return
    if (!currentMemberId) {
      setError('Membro não resolvido pra este workspace.')
      return
    }
    const mentions = extractMentions(trimmed, members)
    try {
      await create.mutateAsync({
        taskId,
        authorMemberId: currentMemberId,
        body: trimmed,
        workspaceId,
        mentionMemberIds: mentions,
        taskTitle,
        taskHref: projectHref,
        authorName:
          (user?.user_metadata?.full_name as string | undefined) ??
          user?.email?.split('@')[0] ??
          'Alguém',
      })
      setBody('')
    } catch (err) {
      setError((err as Error).message)
    }
  }

  function handleKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSubmit()
    }
  }

  async function handleDelete(commentId: string) {
    if (!confirm('Excluir este comentário? Soft delete.')) return
    try {
      await del.mutateAsync({ commentId, taskId })
    } catch (err) {
      setError((err as Error).message)
    }
  }

  function startEdit(commentId: string, current: string) {
    setEditingId(commentId)
    setEditBody(current)
    setError(null)
  }

  async function handleSaveEdit() {
    if (!editingId) return
    setError(null)
    try {
      await update.mutateAsync({
        commentId: editingId,
        taskId,
        body: editBody,
      })
      setEditingId(null)
      setEditBody('')
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const list = comments.data ?? []
  const mentionsPreview = useMemo(
    () => extractMentions(body, members),
    [body, members]
  )

  return (
    <div className="border-t pt-4 space-y-3">
      <div className="flex items-center gap-2 text-[11px] text-muted uppercase tracking-wider font-semibold">
        <MessageSquare className="w-3.5 h-3.5" />
        Comentários
        {list.length > 0 && (
          <span className="bg-panel2 border px-1.5 py-0.5 rounded text-text">
            {list.length}
          </span>
        )}
      </div>

      <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
        {comments.isLoading ? (
          <div className="text-xs text-muted">Carregando...</div>
        ) : list.length === 0 ? (
          <div className="text-[11px] text-muted italic">
            Sem comentários ainda. Use @nome pra mencionar alguém.
          </div>
        ) : (
          list.map((c) => {
            const isOwn = c.author_member_id === currentMemberId
            const name = c.author?.profile?.full_name ?? 'Sem nome'
            const isEditing = editingId === c.id
            const wasEdited = c.updated_at && c.updated_at !== c.created_at
            return (
              <div key={c.id} className="flex gap-2 group">
                <div className="w-7 h-7 rounded-full bg-panel2 border border-border flex items-center justify-center text-[10px] font-bold shrink-0">
                  {getInitials(name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-[11px] text-muted">
                    <span className="font-semibold text-text">{name}</span>
                    <span>·</span>
                    <span>{relativeDays(c.created_at)}</span>
                    {wasEdited && !isEditing && (
                      <span className="text-[9px] italic">(editado)</span>
                    )}
                    {c.is_ai_generated && (
                      <span className="bg-purple-500/15 text-purple-300 px-1 py-0.5 rounded text-[9px] uppercase tracking-wider">
                        IA
                      </span>
                    )}
                    {isOwn && !isEditing && (
                      <div className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                        <button
                          type="button"
                          onClick={() => startEdit(c.id, c.body_md)}
                          className="text-muted hover:text-brand"
                          title="Editar comentário"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(c.id)}
                          className="text-muted hover:text-danger"
                          title="Excluir comentário"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                  {isEditing ? (
                    <div className="mt-1 space-y-1.5">
                      <textarea
                        value={editBody}
                        onChange={(e) => setEditBody(e.target.value)}
                        rows={2}
                        className="input resize-none"
                        autoFocus
                      />
                      <div className="flex items-center gap-2 justify-end">
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingId(null)
                            setEditBody('')
                          }}
                          disabled={update.isPending}
                        >
                          <X className="w-3 h-3" />
                          Cancelar
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleSaveEdit}
                          disabled={update.isPending || !editBody.trim()}
                        >
                          {update.isPending ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Check className="w-3 h-3" />
                          )}
                          Salvar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm whitespace-pre-wrap mt-0.5">
                      <CommentBody text={c.body_md} memberById={memberById} />
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-1.5">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={handleKey}
          rows={2}
          placeholder="Escreva um comentário... use @nome pra mencionar."
          className="input resize-none"
        />
        {error && (
          <div className="text-[11px] text-danger bg-danger/10 border border-danger/30 rounded px-2 py-1">
            {error}
          </div>
        )}
        <div className="flex items-center gap-2">
          <div className="text-[10px] text-muted flex-1">
            {mentionsPreview.length > 0 ? (
              <>
                Vai notificar:{' '}
                <span className="text-brand font-semibold">
                  {mentionsPreview
                    .map((id) => memberById.get(id) ?? id)
                    .join(', ')}
                </span>
              </>
            ) : (
              <>⌘+Enter pra enviar</>
            )}
          </div>
          <Button
            type="submit"
            size="sm"
            disabled={create.isPending || !body.trim()}
          >
            {create.isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            Comentar
          </Button>
        </div>
      </form>
    </div>
  )
}

function CommentBody({
  text,
  memberById,
}: {
  text: string
  memberById: Map<string, string>
}) {
  const parts = useMemo(() => splitMentions(text, memberById), [text, memberById])
  return (
    <>
      {parts.map((p, i) =>
        p.kind === 'mention' ? (
          <span
            key={i}
            className={cn(
              'bg-brand/15 text-brand px-1 rounded font-semibold',
              !p.matched && 'opacity-70'
            )}
            title={p.matched ? 'Mencionado' : 'Sem match no time'}
          >
            @{p.label}
          </span>
        ) : (
          <span key={i}>{p.text}</span>
        )
      )}
    </>
  )
}

interface MentionPart {
  kind: 'mention'
  label: string
  matched: boolean
}
interface TextPart {
  kind: 'text'
  text: string
}

function splitMentions(
  text: string,
  memberById: Map<string, string>
): (MentionPart | TextPart)[] {
  const result: (MentionPart | TextPart)[] = []
  const names = Array.from(memberById.values())
  const re = /@([\p{L}0-9_.-]+)/gu
  let lastIdx = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(text)) !== null) {
    if (m.index > lastIdx) {
      result.push({ kind: 'text', text: text.slice(lastIdx, m.index) })
    }
    const handle = m[1]
    const matched = names.some((n) => matchHandle(n, handle))
    result.push({ kind: 'mention', label: handle, matched })
    lastIdx = re.lastIndex
  }
  if (lastIdx < text.length) {
    result.push({ kind: 'text', text: text.slice(lastIdx) })
  }
  return result
}

function matchHandle(fullName: string, handle: string): boolean {
  const norm = (s: string) =>
    s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '')
  const h = norm(handle)
  const parts = fullName.split(/\s+/).map(norm)
  return parts.includes(h) || parts.join('').startsWith(h)
}
