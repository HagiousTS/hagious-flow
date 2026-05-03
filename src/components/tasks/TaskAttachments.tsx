import { useRef, useState, type ChangeEvent, type DragEvent } from 'react'
import {
  Download,
  File as FileIcon,
  Image as ImageIcon,
  Loader2,
  Paperclip,
  Trash2,
  Upload,
} from 'lucide-react'
import {
  getAttachmentSignedUrl,
  useDeleteAttachment,
  useTaskAttachments,
  useUploadAttachment,
} from '@/hooks/useTaskAttachments'
import { cn, relativeDays } from '@/lib/utils'
import type { TaskAttachment } from '@/types/database'

interface TaskAttachmentsProps {
  taskId: string
  workspaceId: string
  currentMemberId: string | null
}

function fmtBytes(n: number | null | undefined): string {
  if (n == null) return ''
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / (1024 * 1024)).toFixed(1)} MB`
}

function isImage(mime: string | null | undefined): boolean {
  return !!mime && mime.startsWith('image/')
}

export function TaskAttachments({
  taskId,
  workspaceId,
  currentMemberId,
}: TaskAttachmentsProps) {
  const list = useTaskAttachments(taskId)
  const upload = useUploadAttachment()
  const del = useDeleteAttachment()

  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)

  async function handleFiles(files: FileList | null) {
    if (!files || !currentMemberId) return
    setError(null)
    for (const file of Array.from(files)) {
      try {
        await upload.mutateAsync({
          file,
          taskId,
          workspaceId,
          memberId: currentMemberId,
        })
      } catch (err) {
        setError((err as Error).message)
        break
      }
    }
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragOver(false)
    handleFiles(e.dataTransfer.files)
  }

  async function handleOpen(att: TaskAttachment) {
    const url = await getAttachmentSignedUrl(att.storage_url)
    if (!url) {
      setError('Não consegui gerar URL de download.')
      return
    }
    window.open(url, '_blank', 'noopener')
  }

  async function handleDelete(att: TaskAttachment) {
    if (!confirm(`Excluir o anexo "${att.file_name}"?`)) return
    try {
      await del.mutateAsync({
        attachmentId: att.id,
        storageUrl: att.storage_url,
        taskId,
      })
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const items = list.data ?? []

  return (
    <div className="border-t pt-4 space-y-3">
      <div className="flex items-center gap-2 text-[11px] text-muted uppercase tracking-wider font-semibold">
        <Paperclip className="w-3.5 h-3.5" />
        Anexos
        {items.length > 0 && (
          <span className="bg-panel2 border px-1.5 py-0.5 rounded text-text">
            {items.length}
          </span>
        )}
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition',
          dragOver
            ? 'border-brand bg-brand/5'
            : 'border-border hover:border-brand/40'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            handleFiles(e.target.files)
            e.target.value = ''
          }}
        />
        {upload.isPending ? (
          <div className="flex items-center justify-center gap-2 text-xs text-muted">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Enviando...
          </div>
        ) : (
          <div className="text-xs text-muted flex items-center justify-center gap-2">
            <Upload className="w-3.5 h-3.5" />
            Arraste arquivos ou clique para enviar (até 10 MB)
          </div>
        )}
      </div>

      {error && (
        <div className="text-[11px] text-danger bg-danger/10 border border-danger/30 rounded px-2 py-1">
          {error}
        </div>
      )}

      {items.length > 0 && (
        <div className="space-y-1">
          {items.map((a) => (
            <div
              key={a.id}
              className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-panel2 group transition"
            >
              <div className="w-7 h-7 rounded bg-panel2 border border-border flex items-center justify-center text-muted shrink-0">
                {isImage(a.mime_type) ? (
                  <ImageIcon className="w-3.5 h-3.5" />
                ) : (
                  <FileIcon className="w-3.5 h-3.5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <button
                  type="button"
                  onClick={() => handleOpen(a)}
                  className="text-xs font-medium truncate block w-full text-left hover:text-brand transition"
                >
                  {a.file_name}
                </button>
                <div className="text-[10px] text-muted">
                  {fmtBytes(a.file_size)} · {relativeDays(a.created_at)}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleOpen(a)}
                className="opacity-0 group-hover:opacity-100 text-muted hover:text-brand transition p-1"
                title="Baixar"
              >
                <Download className="w-3 h-3" />
              </button>
              {a.uploaded_by_member_id === currentMemberId && (
                <button
                  type="button"
                  onClick={() => handleDelete(a)}
                  className="opacity-0 group-hover:opacity-100 text-muted hover:text-danger transition p-1"
                  title="Excluir"
                  disabled={del.isPending}
                >
                  {del.isPending ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Trash2 className="w-3 h-3" />
                  )}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
