import { Card } from '@/components/ui/Card'
import { cn, getInitials } from '@/lib/utils'
import type { SkillMatrix } from '@/hooks/useCapacity'
import type { SkillProficiency } from '@/types/database'

interface SkillMatrixGridProps {
  matrix: SkillMatrix
}

const PROFICIENCY_LABEL: Record<SkillProficiency, string> = {
  aprendiz: 'Ap',
  pleno: 'Pl',
  senior: 'Sr',
  especialista: 'Es',
}

const PROFICIENCY_CLS: Record<SkillProficiency, string> = {
  aprendiz: 'bg-panel2 border border-border text-text',
  pleno: 'bg-warn/30 text-warn',
  senior: 'grad-brand text-white',
  especialista: 'bg-purple-500 text-white',
}

const LEGEND: { label: string; key: SkillProficiency }[] = [
  { key: 'aprendiz', label: 'Ap = Aprendiz' },
  { key: 'pleno', label: 'Pl = Pleno' },
  { key: 'senior', label: 'Sr = Sênior' },
  { key: 'especialista', label: 'Es = Especialista' },
]

export function SkillMatrixGrid({ matrix }: SkillMatrixGridProps) {
  if (matrix.skills.length === 0 || matrix.members.length === 0) {
    return (
      <Card className="p-5">
        <h3 className="font-semibold text-[15px] mb-2">Skill Matrix</h3>
        <div className="text-center py-10 text-muted text-sm border border-dashed border-border rounded-xl">
          Nenhuma skill cadastrada ainda.
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h3 className="font-semibold text-[15px]">
            Skill Matrix · alocação inteligente
          </h3>
          <p className="text-xs text-muted">
            Quem pode pegar o quê. A IA usa isso pra sugerir realocação.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto scrollbar">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-[11px] text-muted">
              <th className="text-left font-medium pb-2 pr-3 sticky left-0 bg-panel z-[1]">
                Pessoa
              </th>
              {matrix.skills.map((s) => (
                <th
                  key={s.id}
                  className="text-center font-medium pb-2 px-2 min-w-[110px]"
                >
                  <div className="leading-tight">{s.name}</div>
                  {s.category && (
                    <div className="text-[9px] uppercase tracking-wider opacity-60">
                      {s.category}
                    </div>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.members.map((m) => {
              const memberCells = matrix.cells[m.id] ?? {}
              return (
                <tr key={m.id} className="border-t border-border">
                  <td className="py-2 pr-3 sticky left-0 bg-panel z-[1]">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-panel2 border border-border text-text flex items-center justify-center text-[9px] font-bold">
                        {getInitials(m.full_name)}
                      </div>
                      <span className="text-[12px] font-semibold whitespace-nowrap">
                        {m.full_name.split(' ')[0]}
                      </span>
                    </div>
                  </td>
                  {matrix.skills.map((s) => {
                    const cell = memberCells[s.id]
                    if (!cell) {
                      return (
                        <td key={s.id} className="text-center py-1 px-2">
                          <div className="inline-flex w-7 h-7 rounded bg-panel2 border border-border text-muted text-[10px] items-center justify-center">
                            —
                          </div>
                        </td>
                      )
                    }
                    const profLabel = cell.proficiency
                      ? PROFICIENCY_LABEL[cell.proficiency]
                      : '?'
                    return (
                      <td key={s.id} className="text-center py-1 px-2">
                        <div
                          className={cn(
                            'inline-flex min-w-[28px] h-7 px-1.5 rounded items-center justify-center text-[10px] font-bold gap-0.5',
                            cell.proficiency
                              ? PROFICIENCY_CLS[cell.proficiency]
                              : 'bg-panel2 border border-border text-muted'
                          )}
                          title={`${m.full_name} · ${s.name} · ${cell.proficiency ?? '—'}${
                            cell.isCertified ? ' · certificado' : ''
                          }`}
                        >
                          {profLabel}
                          {cell.isCertified && (
                            <span className="text-[8px]">★</span>
                          )}
                        </div>
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-3 mt-4 text-[10px] flex-wrap">
        {LEGEND.map((l) => (
          <div key={l.key} className="flex items-center gap-1.5">
            <div className={cn('w-4 h-4 rounded', PROFICIENCY_CLS[l.key])} />
            <span className="text-muted">{l.label}</span>
          </div>
        ))}
        <span className="text-muted">★ = Certificado</span>
      </div>
    </Card>
  )
}
