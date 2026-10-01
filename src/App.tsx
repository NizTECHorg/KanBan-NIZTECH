import { BrowserRouter } from 'react-router-dom'
import { env } from '@/config/env'
import { ToastViewport } from '@/components/ui/ToastViewport'
import { AuthProvider } from '@/providers/AuthProvider'
import { SetupPage } from '@/pages/SetupPage'
import { AppRoutes } from '@/routes'

export function App() {
  if (!env.isConfigured) {
    return <SetupPage />
  }

  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <ToastViewport />
      </AuthProvider>
    </BrowserRouter>
  )
}
