import { cn } from '@/lib/utils'

const STYLES: Record<string, { bg: string; label: string; title: string }> = {
  whatsapp: { bg: 'bg-[#25D366] text-white', label: 'W', title: 'WhatsApp' },
  email: { bg: 'bg-[#EA4335] text-white', label: '@', title: 'E-mail' },
  sankhya: { bg: 'bg-brand text-white', label: 'SK', title: 'Ticket Sankhya' },
  ticket: { bg: 'bg-brand text-white', label: 'TK', title: 'Ticket' },
  portal: { bg: 'bg-info text-white', label: 'P', title: 'Portal' },
  slack: { bg: 'bg-[#4A154B] text-white', label: 'S', title: 'Slack' },
  manual: { bg: 'bg-[#475569] text-white', label: 'M', title: 'Manual' },
}

interface SourceIconProps {
  channel: string
  size?: 'sm' | 'md'
  className?: string
}

export function SourceIcon({ channel, size = 'md', className }: SourceIconProps) {
  const key = channel.toLowerCase()
  const style = STYLES[key] ?? STYLES.manual
  const dim = size === 'sm' ? 'w-[18px] h-[18px] text-[8px]' : 'w-6 h-6 text-[10px]'

  return (
    <span
      title={style.title}
      className={cn(
        'inline-flex items-center justify-center rounded-md font-bold shrink-0',
        dim,
        style.bg,
        className
      )}
    >
      {style.label}
    </span>
  )
}
