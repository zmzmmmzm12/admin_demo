import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { DialogRenderer } from './components/dialog/DialogRenderer'
import { AppPreferencesProvider } from './contexts/AppPreferencesContext'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

async function prepareApp() {
  if (import.meta.env.DEV) {
    const { worker } = await import('./mocks/browser')
    await worker.start({ onUnhandledRequest: 'bypass' })
  }
}

void prepareApp().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <AppPreferencesProvider>
        <QueryClientProvider client={queryClient}>
          <App />
          <DialogRenderer />
        </QueryClientProvider>
      </AppPreferencesProvider>
    </StrictMode>,
  )
})
