import { useState, type FormEvent, type KeyboardEvent } from 'react'
import { Send } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChatInputProps {
  onSend: (content: string) => void
  disabled: boolean
  placeholder?: string
}

export function ChatInput({ onSend, disabled, placeholder }: ChatInputProps) {
  const [value, setValue] = useState('')

  function submit(e?: FormEvent) {
    e?.preventDefault()
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
  }

  function handleKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <form
      onSubmit={submit}
      className="border-t bg-panel/40 px-6 py-4"
    >
      <div className="max-w-3xl mx-auto flex items-end gap-2 bg-panel border rounded-2xl p-2 focus-within:border-brand/50 transition">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKey}
          rows={1}
          disabled={disabled}
          placeholder={placeholder ?? 'Pergunte ao IA COO...'}
          className="flex-1 bg-transparent outline-none resize-none px-2 py-1.5 text-sm placeholder:text-muted max-h-40"
          style={{ minHeight: '32px' }}
        />
        <button
          type="submit"
          disabled={disabled || !value.trim()}
          className={cn(
            'shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition',
            value.trim() && !disabled
              ? 'grad-brand text-white hover:opacity-90'
              : 'bg-panel2 text-muted cursor-not-allowed'
          )}
          title="Enviar (Enter)"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
      <div className="max-w-3xl mx-auto text-[10px] text-muted mt-2 text-center">
        Shift+Enter para nova linha · Modo simulado (OpenAI ainda não integrada)
      </div>
    </form>
  )
}
