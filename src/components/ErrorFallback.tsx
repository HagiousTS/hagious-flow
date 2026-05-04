interface ErrorFallbackProps {
  error: unknown
  resetError: () => void
}

export function ErrorFallback({ error, resetError }: ErrorFallbackProps) {
  const msg = (error as Error)?.message ?? 'Erro desconhecido'
  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-bg text-text">
      <div className="max-w-md text-center space-y-3">
        <h1 className="text-xl font-bold">Algo quebrou na interface</h1>
        <p className="text-sm text-muted">
          O erro foi registrado. Tente recarregar; se persistir, fale com o
          suporte.
        </p>
        <pre className="text-[11px] text-danger bg-danger/10 border border-danger/30 rounded-lg px-3 py-2 text-left overflow-auto max-h-40">
          {msg}
        </pre>
        <button
          onClick={resetError}
          className="grad-brand text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90"
        >
          Tentar de novo
        </button>
      </div>
    </div>
  )
}
