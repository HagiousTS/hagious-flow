import { useEffect, useState } from 'react'
import { Calendar, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  matchPreset,
  presetRange,
  todayISO,
  type ReportPreset,
} from '@/lib/dateRange'
import type { ReportsRange } from '@/hooks/useReports'

interface DateRangePickerProps {
  value: ReportsRange
  onChange: (range: ReportsRange) => void
}

const PRESETS: { id: ReportPreset; label: string }[] = [
  { id: '7d', label: 'Últimos 7 dias' },
  { id: '30d', label: 'Últimos 30 dias' },
  { id: '90d', label: 'Últimos 90 dias' },
  { id: 'mtd', label: 'Mês atual' },
  { id: 'custom', label: 'Personalizado' },
]

function fmtBR(iso: string): string {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [open, setOpen] = useState(false)
  const [activePreset, setActivePreset] = useState<ReportPreset>(() =>
    matchPreset(value)
  )

  useEffect(() => {
    setActivePreset(matchPreset(value))
  }, [value])

  function pick(p: ReportPreset) {
    if (p === 'custom') {
      setActivePreset('custom')
      return
    }
    const r = presetRange(p)
    onChange(r)
    setOpen(false)
  }

  function setFrom(v: string) {
    if (!v) return
    onChange({ from: v, to: value.to })
  }

  function setTo(v: string) {
    if (!v) return
    onChange({ from: value.from, to: v })
  }

  const label =
    activePreset === 'custom'
      ? `${fmtBR(value.from)} – ${fmtBR(value.to)}`
      : (PRESETS.find((p) => p.id === activePreset)?.label ?? 'Período')

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg border bg-panel text-sm transition',
          open ? 'border-brand/50' : 'border-border hover:border-brand/30'
        )}
      >
        <Calendar className="w-4 h-4 text-muted" />
        <span className="font-medium">{label}</span>
        <ChevronDown className="w-3.5 h-3.5 text-muted" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-30 bg-panel border rounded-xl shadow-xl w-[320px]">
          <div className="p-2 space-y-0.5">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => pick(p.id)}
                className={cn(
                  'w-full text-left px-3 py-2 rounded-lg text-sm transition',
                  activePreset === p.id
                    ? 'bg-brand/10 text-brand font-semibold'
                    : 'hover:bg-panel2'
                )}
              >
                {p.label}
              </button>
            ))}
          </div>

          {activePreset === 'custom' && (
            <div className="border-t p-3 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <label className="block">
                  <span className="text-[10px] text-muted uppercase tracking-wider font-semibold block mb-1">
                    De
                  </span>
                  <input
                    type="date"
                    value={value.from}
                    onChange={(e) => setFrom(e.target.value)}
                    max={value.to}
                    className="input text-xs"
                  />
                </label>
                <label className="block">
                  <span className="text-[10px] text-muted uppercase tracking-wider font-semibold block mb-1">
                    Até
                  </span>
                  <input
                    type="date"
                    value={value.to}
                    onChange={(e) => setTo(e.target.value)}
                    min={value.from}
                    max={todayISO()}
                    className="input text-xs"
                  />
                </label>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-full text-xs py-1.5 rounded-lg grad-brand text-white font-semibold hover:opacity-90"
              >
                Aplicar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
