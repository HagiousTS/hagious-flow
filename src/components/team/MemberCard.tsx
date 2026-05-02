import { Mail, Target, AlertOctagon, Briefcase } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Card } from '@/components/ui/Card'
import { cn, formatBRL } from '@/lib/utils'
import type { SkillProficiency } from '@/types/database'
import type { TeamMember } from '@/hooks/useTeam'

interface MemberCardProps {
  member: TeamMember
}

const ROLE_LABEL: Record<string, string> = {
  owner: 'Owner',
  manager: 'Manager',
  member: 'Membro',
  viewer: 'Viewer',
}

const ROLE_CLS: Record<string, string> = {
  owner: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  manager:
    'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30',
  member: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  viewer: 'bg-panel2 text-muted border-border',
}

const PROFICIENCY_CLS: Record<SkillProficiency, string> = {
  aprendiz: 'bg-panel2 border border-border text-muted',
  pleno: 'bg-warn/20 text-warn border border-warn/30',
  senior: 'bg-brand/20 text-brand border border-brand/30',
  especialista: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
}

const PROFICIENCY_LABEL: Record<SkillProficiency, string> = {
  aprendiz: 'Ap',
  pleno: 'Pl',
  senior: 'Sr',
  especialista: 'Es',
}

function utilizationCls(pct: number): string {
  if (pct >= 95) return 'bg-danger'
  if (pct >= 75) return 'bg-warn'
  if (pct >= 40) return 'bg-brand'
  return 'bg-info'
}

export function MemberCard({ member }: MemberCardProps) {
  const roleCls = ROLE_CLS[member.role] ?? ROLE_CLS.member
  const roleLabel = ROLE_LABEL[member.role] ?? member.role
  const utilPct = Math.min(100, Math.round(member.utilizationPct))
  const inactive = !member.isActive

  return (
    <Card className={cn('flex flex-col gap-4', inactive && 'opacity-60')}>
      <div className="flex items-start gap-3">
        <Avatar name={member.fullName} src={member.avatarUrl} size="lg" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-[15px] leading-tight truncate">
              {member.fullName}
            </h3>
            <span
              className={cn(
                'text-[10px] px-1.5 py-0.5 rounded border',
                roleCls
              )}
            >
              {roleLabel}
            </span>
          </div>
          <div className="text-xs text-muted mt-0.5 truncate">
            {member.jobTitle ?? '—'}
          </div>
          {member.email && (
            <div className="flex items-center gap-1 mt-1 text-[11px] text-muted truncate">
              <Mail className="w-3 h-3 shrink-0" />
              <span className="truncate">{member.email}</span>
            </div>
          )}
        </div>
        {member.isInFocus && (
          <span
            className="text-[10px] px-1.5 py-0.5 rounded chip-status-doing flex items-center gap-1 shrink-0"
            title="Em modo foco"
          >
            <Target className="w-3 h-3" />
            Foco
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-panel2 rounded-lg py-2">
          <div className="text-[10px] text-muted uppercase tracking-wider">
            Capacidade
          </div>
          <div className="text-sm font-bold mt-0.5">
            {member.capacityHoursWeek}h
          </div>
        </div>
        <div className="bg-panel2 rounded-lg py-2">
          <div className="text-[10px] text-muted uppercase tracking-wider">
            Hora
          </div>
          <div className="text-sm font-bold mt-0.5">
            {member.hourlyRate != null ? formatBRL(member.hourlyRate) : '—'}
          </div>
        </div>
        <div className="bg-panel2 rounded-lg py-2">
          <div className="text-[10px] text-muted uppercase tracking-wider">
            Tasks
          </div>
          <div className="text-sm font-bold mt-0.5">
            {member.openTasks}
            {member.blockedTasks > 0 && (
              <span className="text-danger ml-1">
                <AlertOctagon className="w-3 h-3 inline" />{' '}
                {member.blockedTasks}
              </span>
            )}
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between text-[11px] mb-1">
          <span className="text-muted uppercase tracking-wider">Carga</span>
          <span className="font-semibold">
            {Math.round(member.openHours)}h / {member.capacityHoursWeek}h ·{' '}
            {utilPct}%
          </span>
        </div>
        <div className="h-2 rounded-full bg-panel2 overflow-hidden">
          <div
            className={cn('h-full transition-all', utilizationCls(utilPct))}
            style={{ width: `${Math.max(2, utilPct)}%` }}
          />
        </div>
      </div>

      {member.skills.length > 0 && (
        <div>
          <div className="text-[10px] text-muted uppercase tracking-wider mb-1.5">
            Skills
          </div>
          <div className="flex flex-wrap gap-1">
            {member.skills.slice(0, 6).map((s) => (
              <span
                key={s.skillId}
                className={cn(
                  'text-[10px] px-1.5 py-0.5 rounded',
                  PROFICIENCY_CLS[s.proficiency]
                )}
                title={`${s.name} · ${s.proficiency}${
                  s.isCertified ? ' · certificado' : ''
                }`}
              >
                {s.name}{' '}
                <span className="opacity-70">
                  {PROFICIENCY_LABEL[s.proficiency]}
                </span>
              </span>
            ))}
            {member.skills.length > 6 && (
              <span className="text-[10px] text-muted px-1.5 py-0.5">
                +{member.skills.length - 6}
              </span>
            )}
          </div>
        </div>
      )}

      {member.activeProjects.length > 0 && (
        <div className="border-t pt-3">
          <div className="text-[10px] text-muted uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <Briefcase className="w-3 h-3" />
            Projetos ativos · {member.activeProjects.length}
          </div>
          <div className="flex flex-wrap gap-1">
            {member.activeProjects.slice(0, 4).map((p) => (
              <span
                key={p.id}
                className="text-[10px] px-1.5 py-0.5 rounded bg-panel2 text-text"
                title={p.name}
              >
                {p.code}
              </span>
            ))}
            {member.activeProjects.length > 4 && (
              <span className="text-[10px] text-muted px-1.5 py-0.5">
                +{member.activeProjects.length - 4}
              </span>
            )}
          </div>
        </div>
      )}
    </Card>
  )
}
