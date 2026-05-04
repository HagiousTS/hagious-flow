import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { initSentry, SentryErrorBoundary } from './lib/sentry'
import { ErrorFallback } from './components/ErrorFallback'
import './styles/globals.css'

initSentry()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SentryErrorBoundary fallback={ErrorFallback}>
      <App />
    </SentryErrorBoundary>
  </StrictMode>
)
