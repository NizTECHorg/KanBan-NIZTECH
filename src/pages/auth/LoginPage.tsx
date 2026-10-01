import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { loginSchema, type LoginFormData } from '@/schemas/auth.schema'
import { safeRedirectPath } from '@/lib/security'
import { signInWithEmail } from '@/services/auth.service'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [serverError, setServerError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const from = safeRedirectPath(
    (location.state as { from?: { pathname: string } } | null)?.from?.pathname,
  )

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(data: LoginFormData) {
    setServerError(null)

    try {
      await signInWithEmail(data)
      navigate(from, { replace: true })
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Erro ao entrar.')
    }
  }

  return (
    <AuthLayout
      title="Entrar"
      subtitle="Acesse sua conta para gerenciar os projetos da NIZ TECH"
      footer={
        <p>
          Não tem conta?{' '}
          <Link to="/cadastro" className="font-medium text-caramel hover:text-caramel/80">
            Criar conta
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate autoComplete="off">
        {serverError && (
          <div
            role="alert"
            className="rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm text-error"
          >
            {serverError}
          </div>
        )}

        <Input
          label="E-mail"
          type="email"
          autoComplete="off"
          inputMode="email"
          spellCheck={false}
          placeholder="seu@email.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <div className="space-y-2">
          <Input
            label="Senha"
            type={showPassword ? 'text' : 'password'}
            autoComplete="off"
            placeholder="••••••••••••"
            error={errors.password?.message}
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="text-xs text-cream/50 transition-colors hover:text-cream/80"
          >
            {showPassword ? 'Ocultar senha' : 'Mostrar senha'}
          </button>
        </div>

        <Button type="submit" fullWidth isLoading={isSubmitting}>
          Entrar
        </Button>
      </form>
    </AuthLayout>
  )
}
