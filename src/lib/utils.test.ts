import { describe, expect, it } from 'vitest'
import {
  cn,
  formatBRL,
  formatDateShort,
  getInitials,
  relativeDays,
} from './utils'

describe('cn', () => {
  it('mescla classes simples', () => {
    expect(cn('a', 'b')).toBe('a b')
  })

  it('ignora valores falsy', () => {
    expect(cn('a', false, null, undefined, 'b')).toBe('a b')
  })

  it('aplica twMerge para resolver conflitos do Tailwind', () => {
    expect(cn('p-4', 'p-2')).toBe('p-2')
  })
})

describe('formatBRL', () => {
  it('retorna travessão para null/undefined', () => {
    expect(formatBRL(null)).toBe('—')
    expect(formatBRL(undefined)).toBe('—')
  })

  it('formata valores em reais sem decimais', () => {
    const result = formatBRL(1500)
    // separador NBSP ( ) entre R$ e número em pt-BR
    expect(result).toMatch(/^R\$\s?1\.500$/)
  })

  it('formata zero', () => {
    expect(formatBRL(0)).toMatch(/^R\$\s?0$/)
  })

  it('formata em modo compacto', () => {
    const result = formatBRL(28400, { compact: true })
    expect(result).toMatch(/28/)
    expect(result).toContain('R$')
  })
})

describe('formatDateShort', () => {
  it('retorna travessão para entrada vazia', () => {
    expect(formatDateShort(null)).toBe('—')
    expect(formatDateShort(undefined)).toBe('—')
    expect(formatDateShort('')).toBe('—')
  })

  it('retorna travessão para data inválida', () => {
    expect(formatDateShort('not-a-date')).toBe('—')
  })

  it('formata ISO em DD/MM', () => {
    // 15 de março: aceita "15/03" independente do timezone
    expect(formatDateShort('2026-03-15T12:00:00Z')).toMatch(/^\d{2}\/\d{2}$/)
  })
})

describe('relativeDays', () => {
  // Local-day stringification: toISOString() devolve UTC, que diverge
  // do dia local em fusos a oeste de UTC depois das 21h.
  function localISO(d: Date): string {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }

  it('retorna travessão para entrada vazia', () => {
    expect(relativeDays(null)).toBe('—')
    expect(relativeDays(undefined)).toBe('—')
  })

  it('retorna "hoje" para a data atual', () => {
    expect(relativeDays(localISO(new Date()))).toBe('hoje')
  })

  it('retorna "amanhã" para data 1 dia no futuro', () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    expect(relativeDays(localISO(tomorrow))).toBe('amanhã')
  })

  it('retorna "ontem" para data 1 dia no passado', () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    expect(relativeDays(localISO(yesterday))).toBe('ontem')
  })

  it('formata datas futuras com padrão "em N dias"', () => {
    const future = new Date()
    future.setDate(future.getDate() + 5)
    expect(relativeDays(localISO(future))).toMatch(/^em \d+ dias$/)
  })

  it('formata datas passadas com padrão "N dias atrás"', () => {
    const past = new Date()
    past.setDate(past.getDate() - 5)
    expect(relativeDays(localISO(past))).toMatch(/^\d+ dias atrás$/)
  })
})

describe('getInitials', () => {
  it('retorna ? para input vazio', () => {
    expect(getInitials(null)).toBe('?')
    expect(getInitials(undefined)).toBe('?')
    expect(getInitials('')).toBe('?')
  })

  it('pega primeira e última letra de nome composto', () => {
    expect(getInitials('Gusttavo Lopes')).toBe('GL')
    expect(getInitials('Letícia Souza Costa')).toBe('LC')
  })

  it('pega primeiras 2 letras de nome único', () => {
    expect(getInitials('Rafael')).toBe('RA')
  })

  it('lida com espaços extras', () => {
    expect(getInitials('  Júlia   Santos  ')).toBe('JS')
  })
})
