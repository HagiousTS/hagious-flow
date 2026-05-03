import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { TaskAttachment } from '@/types/database'

const BUCKET = 'task-attachments'

interface RawAttachment {
  id: string
  task_id: string
  workspace_id: string
  file_name: string
  file_size: number | null
  mime_type: string | null
  storage_url: string
  uploaded_by_member_id: string
  created_at: string
  uploader: {
    id: string
    profile: { id: string; full_name: string } | null
  } | null
}

export function useTaskAttachments(taskId: string | undefined) {
  return useQuery<TaskAttachment[]>({
    queryKey: ['task-attachments', taskId],
    enabled: !!taskId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('task_attachments')
        .select(
          'id, task_id, workspace_id, file_name, file_size, mime_type, storage_url, uploaded_by_member_id, created_at, uploader:workspace_members(id, profile:profiles(id, full_name))'
        )
        .eq('task_id', taskId!)
        .order('created_at', { ascending: false })
      if (error) throw error
      return ((data ?? []) as unknown as RawAttachment[]).map((row) => ({
        ...row,
        uploader: row.uploader
          ? {
              id: row.uploader.id,
              workspace_id: row.workspace_id,
              user_id: '',
              role: '',
              job_title: null,
              hourly_rate: null,
              capacity_hours_week: null,
              is_in_focus_mode: null,
              focus_mode_until: null,
              is_active: true,
              profile: row.uploader.profile
                ? {
                    id: row.uploader.profile.id,
                    full_name: row.uploader.profile.full_name,
                    avatar_url: null,
                    email: '',
                  }
                : undefined,
            }
          : null,
      })) as TaskAttachment[]
    },
  })
}

export interface UploadAttachmentArgs {
  file: File
  taskId: string
  workspaceId: string
  memberId: string
}

function safeFileName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '_')
    .slice(0, 100)
}

export function useUploadAttachment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      file,
      taskId,
      workspaceId,
      memberId,
    }: UploadAttachmentArgs) => {
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('Arquivo maior que 10 MB.')
      }
      const stamp = crypto.randomUUID()
      const path = `${workspaceId}/${taskId}/${stamp}-${safeFileName(file.name)}`

      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, {
          contentType: file.type || 'application/octet-stream',
          upsert: false,
        })
      if (upErr) throw upErr

      const { data, error } = await supabase
        .from('task_attachments')
        .insert({
          task_id: taskId,
          workspace_id: workspaceId,
          file_name: file.name,
          file_size: file.size,
          mime_type: file.type || null,
          storage_url: path,
          uploaded_by_member_id: memberId,
        })
        .select('*')
        .single()
      if (error) {
        // Rollback do upload se metadata falhou
        await supabase.storage.from(BUCKET).remove([path])
        throw error
      }
      return data
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({
        queryKey: ['task-attachments', vars.taskId],
      })
    },
  })
}

export function useDeleteAttachment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      attachmentId,
      storageUrl,
    }: {
      attachmentId: string
      storageUrl: string
      taskId: string
    }) => {
      // Apaga storage primeiro; mesmo se falhar, segue pra apagar metadata
      await supabase.storage.from(BUCKET).remove([storageUrl])
      const { error } = await supabase
        .from('task_attachments')
        .delete()
        .eq('id', attachmentId)
      if (error) throw error
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({
        queryKey: ['task-attachments', vars.taskId],
      })
    },
  })
}

export async function getAttachmentSignedUrl(
  storageUrl: string
): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storageUrl, 60 * 10) // 10 min
  if (error) return null
  return data.signedUrl
}
