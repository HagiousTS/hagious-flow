import { cn, getInitials } from '@/lib/utils'

interface AvatarProps {
  name?: string | null
  src?: string | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = {
  sm: 'w-7 h-7 text-[10px]',
  md: 'w-9 h-9 text-xs',
  lg: 'w-12 h-12 text-base',
}

// Paleta determinística de cores por nome (visual divertido, mas estável)
const palette = [
  'bg-emerald-500/20 text-emerald-300',
  'bg-blue-500/20 text-blue-300',
  'bg-amber-500/20 text-amber-700 dark:text-amber-300',
  'bg-purple-500/20 text-purple-300',
  'bg-pink-500/20 text-pink-300',
  'bg-rose-500/20 text-rose-300',
  'bg-cyan-500/20 text-cyan-300',
  'bg-indigo-500/20 text-indigo-300',
]

function colorFor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++)
    hash = (hash * 31 + name.charCodeAt(i)) | 0
  return palette[Math.abs(hash) % palette.length]
}

export function Avatar({ name, src, size = 'md', className }: AvatarProps) {
  const initials = getInitials(name)
  const color = name ? colorFor(name) : palette[0]

  if (src) {
    return (
      <img
        src={src}
        alt={name ?? 'avatar'}
        className={cn(sizes[size], 'rounded-full object-cover', className)}
      />
    )
  }

  return (
    <div
      className={cn(
        sizes[size],
        'rounded-full flex items-center justify-center font-bold shrink-0',
        color,
        className
      )}
      title={name ?? ''}
    >
      {initials}
    </div>
  )
}
