import { useEffect, useRef, useState } from 'react'
import { Palette } from 'lucide-react'
import { cn } from '@/lib/utils'

type ThemeId = 'sankhya-light' | 'sankhya-dark' | 'hagious-purple'

const THEMES: { id: ThemeId; label: string; gradient: string }[] = [
  {
    id: 'sankhya-light',
    label: 'Sankhya Light',
    gradient: 'linear-gradient(135deg, #009A4E, #7AC143)',
  },
  {
    id: 'sankhya-dark',
    label: 'Sankhya Dark',
    gradient: 'linear-gradient(135deg, #0F1B16, #22C55E)',
  },
  {
    id: 'hagious-purple',
    label: 'Hagious Purple',
    gradient: 'linear-gradient(135deg, #7C5CFF, #5B8DEF)',
  },
]

const STORAGE_KEY = 'hagious-flow-theme'

function getInitial(): ThemeId {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as ThemeId | null
    if (saved && THEMES.some((t) => t.id === saved)) return saved
  } catch {
    // localStorage indisponível (SSR, modo privado): cai no default
  }
  return 'sankhya-light'
}

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<ThemeId>(getInitial)
  const [isOpen, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      // localStorage indisponível: tema persiste só na sessão
    }
  }, [theme])

  // Fecha ao clicar fora ou apertar Esc
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('click', handleClickOutside)
    document.addEventListener('keydown', handleEsc)
    return () => {
      document.removeEventListener('click', handleClickOutside)
      document.removeEventListener('keydown', handleEsc)
    }
  }, [])

  return (
    <div
      ref={ref}
      className={cn(
        'fixed bottom-[18px] right-[18px] z-50 flex items-center bg-panel border rounded-full transition-all duration-200 overflow-hidden',
        isOpen ? 'gap-1.5 px-3 py-1.5 max-w-[280px]' : 'gap-0 p-0 max-w-[44px]'
      )}
      style={{ boxShadow: '0 12px 32px rgb(0 0 0 / 0.12)' }}
      aria-label="Seletor de tema"
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          setOpen(!isOpen)
        }}
        className="w-11 h-11 flex items-center justify-center text-muted hover:text-brand transition-colors shrink-0"
        title="Trocar tema"
        aria-label="Alternar seletor de tema"
      >
        <Palette className="w-[18px] h-[18px]" />
      </button>

      <span
        className={cn(
          'text-[9px] uppercase tracking-wider font-semibold text-muted whitespace-nowrap transition-opacity',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
      >
        Tema
      </span>

      {THEMES.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setTheme(t.id)
          }}
          className={cn(
            'w-[22px] h-[22px] rounded-full border-[1.5px] transition-all shrink-0 hover:scale-110',
            isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none',
            theme === t.id ? 'border-text' : 'border-transparent'
          )}
          style={{ background: t.gradient }}
          title={t.label}
          aria-label={`Tema ${t.label}`}
        />
      ))}
    </div>
  )
}
