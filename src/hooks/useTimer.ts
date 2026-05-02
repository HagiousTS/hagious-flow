import { useEffect, useState } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface ActiveTimer {
  taskId: string
  taskTitle: string
  taskCode: string | null
  projectId: string
  projectCode: string
  startedAt: number
}

interface TimerState {
  active: ActiveTimer | null
  start: (t: ActiveTimer) => void
  clear: () => void
}

export const useTimerStore = create<TimerState>()(
  persist(
    (set) => ({
      active: null,
      start: (t) => set({ active: t }),
      clear: () => set({ active: null }),
    }),
    { name: 'hagious.activeTimer' }
  )
)

export function useTimer() {
  return useTimerStore((s) => s.active)
}

export function useStartTimer() {
  const start = useTimerStore((s) => s.start)
  return start
}

export function useClearTimer() {
  const clear = useTimerStore((s) => s.clear)
  return clear
}

/**
 * Tick a cada segundo enquanto houver timer ativo. Retorna duração em segundos.
 */
export function useElapsed(timer: ActiveTimer | null): number {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!timer) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [timer])
  if (!timer) return 0
  return Math.max(0, Math.floor((now - timer.startedAt) / 1000))
}

interface StopTimerArgs {
  workspaceId: string
  memberId: string
  description?: string
}

/**
 * Para o timer ativo e cria uma time_entry no banco. Mínimo de 60s pra
 * descartar cliques acidentais.
 */
export function useStopTimer() {
  const qc = useQueryClient()
  const clear = useTimerStore((s) => s.clear)
  const active = useTimerStore((s) => s.active)
  return useMutation({
    mutationFn: async (args: StopTimerArgs) => {
      if (!active) throw new Error('no_active_timer')
      const durationSec = Math.max(
        0,
        Math.floor((Date.now() - active.startedAt) / 1000)
      )
      if (durationSec < 60) {
        clear()
        throw new Error('too_short')
      }
      const hours = Number((durationSec / 3600).toFixed(2))
      const today = new Date().toISOString().slice(0, 10)
      const { data, error } = await supabase
        .from('time_entries')
        .insert({
          workspace_id: args.workspaceId,
          project_id: active.projectId,
          task_id: active.taskId,
          member_id: args.memberId,
          entry_date: today,
          hours,
          description: args.description?.trim() || null,
          is_billable: true,
        })
        .select('*')
        .single()
      if (error) throw error
      clear()
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['capacity'] })
      qc.invalidateQueries({ queryKey: ['reports'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      qc.invalidateQueries({ queryKey: ['project-detail'] })
      qc.invalidateQueries({ queryKey: ['task-time'] })
    },
  })
}
