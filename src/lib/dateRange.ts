import type { ReportsRange } from '@/hooks/useReports'

export type ReportPreset = '7d' | '30d' | '90d' | 'mtd' | 'custom'

function fmtISO(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export function presetRange(p: Exclude<ReportPreset, 'custom'>): ReportsRange {
  const today = new Date()
  const to = fmtISO(today)
  if (p === 'mtd') {
    const first = new Date(today.getFullYear(), today.getMonth(), 1)
    return { from: fmtISO(first), to }
  }
  const days = p === '7d' ? 6 : p === '30d' ? 29 : 89
  const from = new Date(today)
  from.setDate(from.getDate() - days)
  return { from: fmtISO(from), to }
}

export function defaultReportRange(): ReportsRange {
  return presetRange('30d')
}

export function matchPreset(r: ReportsRange): ReportPreset {
  for (const p of ['7d', '30d', '90d', 'mtd'] as const) {
    const c = presetRange(p)
    if (c.from === r.from && c.to === r.to) return p
  }
  return 'custom'
}

export function todayISO(): string {
  return fmtISO(new Date())
}
