import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formata valor monetário em BRL.
 * Ex: 28400 → "R$ 28.400"
 */
export function formatBRL(
  value: number | null | undefined,
  opts?: { compact?: boolean }
): string {
  if (value == null) return '—'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    notation: opts?.compact ? 'compact' : 'standard',
    maximumFractionDigits: 0,
  }).format(value)
}

/**
 * Formata data ISO (YYYY-MM-DD) → "DD/MM"
 */
export function formatDateShort(iso: string | null | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  }).format(d)
}

/**
 * "em X dias" / "atrasado X dias" / "hoje"
 *
 * `YYYY-MM-DD` é parseado como local time (não UTC), pra evitar shift de TZ
 * que faria "2026-05-02" virar "2026-05-01" em fusos a oeste de UTC.
 */
export function relativeDays(iso: string | null | undefined): string {
  if (!iso) return '—'
  const ymd = iso.slice(0, 10).split('-').map(Number)
  const isYmdOnly = ymd.length === 3 && !iso.includes('T')
  const target = isYmdOnly
    ? new Date(ymd[0], ymd[1] - 1, ymd[2])
    : new Date(iso)
  if (Number.isNaN(target.getTime())) return '—'
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  target.setHours(0, 0, 0, 0)
  const diff = Math.round(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  )
  if (diff === 0) return 'hoje'
  if (diff === 1) return 'amanhã'
  if (diff === -1) return 'ontem'
  if (diff > 0) return `em ${diff} dias`
  return `${Math.abs(diff)} dias atrás`
}

export function getInitials(name?: string | null): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}
