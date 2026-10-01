import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { safeRedirectPath } from '@/lib/security'

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-dark">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-caramel border-t-transparent" />
    </div>
  )
}

function AccountWithoutProfile() {
  const { signOut } = useAuth()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 auth-gradient">
      <div className="w-full max-w-md rounded-xl border border-dark-border bg-dark-surface p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-error/20 bg-error/10 text-error">
          <ShieldAlert size={22} />
        </div>
        <h1 className="mt-5 text-xl font-semibold text-cream">Conta sem perfil ativo</h1>
        <p className="mt-3 text-sm leading-6 text-cream/50">
          Sua conta foi autenticada, mas não possui um perfil ativo no sistema. Isso acontece
          quando o usuário foi criado antes da configuração do banco ou quando o perfil foi
          desativado por um administrador.
        </p>
        <div className="mt-6">
          <Button variant="secondary" fullWidth onClick={() => void signOut()}>
            Sair e voltar ao login
          </Button>
        </div>
      </div>
    </div>
  )
}

export function ProtectedRoute() {
  const { session, isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <LoadingScreen />
  }

  if (!session) {
    return <Navigate to="/" state={{ from: location }} replace />
  }

  if (!isAuthenticated) {
    return <AccountWithoutProfile />
  }

  return <Outlet />
}

export function GuestRoute() {
  const { session, isLoading } = useAuth()
  const location = useLocation()
  const from = safeRedirectPath(
    (location.state as { from?: { pathname: string } } | null)?.from?.pathname,
  )

  if (isLoading) {
    return <LoadingScreen />
  }

  // Basta ter sessão: quem não tiver perfil verá a tela explicativa na rota protegida,
  // em vez de ficar preso no formulário de login sem feedback.
  if (session) {
    return <Navigate to={from} replace />
  }

  return <Outlet />
}
