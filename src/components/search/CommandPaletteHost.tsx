import { useEffect } from 'react'
import { useCommandPalette } from '@/hooks/useCommandPalette'
import { CommandPalette } from './CommandPalette'

export function CommandPaletteHost() {
  const { open, setOpen, toggle } = useCommandPalette()

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      // Cmd+K (mac) ou Ctrl+K (win/linux)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        toggle()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [toggle])

  return <CommandPalette open={open} onClose={() => setOpen(false)} />
}
