/**
 * Serializa rows pra CSV (RFC 4180-ish) e dispara download no browser.
 */

export type CsvRow = (string | number | null | undefined)[]

function escape(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return ''
  const s = String(value)
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

export function toCsv(headers: string[], rows: CsvRow[]): string {
  const lines = [headers.map(escape).join(',')]
  for (const r of rows) {
    lines.push(r.map(escape).join(','))
  }
  return lines.join('\n')
}

export function downloadCsv(filename: string, csv: string) {
  // BOM pra Excel reconhecer UTF-8 com acentos corretamente
  const blob = new Blob(['﻿' + csv], {
    type: 'text/csv;charset=utf-8;',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
