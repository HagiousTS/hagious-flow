import * as Sentry from '@sentry/react'

let initialized = false

/**
 * Inicializa Sentry se VITE_SENTRY_DSN estiver setada. No-op caso contrário.
 * Roda 1x na inicialização do app.
 */
export function initSentry() {
  if (initialized) return
  const dsn = import.meta.env.VITE_SENTRY_DSN
  if (!dsn) return

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    release: import.meta.env.VITE_RELEASE,
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
    // Privacidade: não envia dados de localStorage/cookies por padrão
    sendDefaultPii: false,
  })
  initialized = true
}

export const SentryErrorBoundary = Sentry.ErrorBoundary
