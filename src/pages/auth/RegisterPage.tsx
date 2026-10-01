import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { registerSchema, type RegisterFormData } from '@/schemas/auth.schema'
import { signUpWithEmail } from '@/services/auth.service'

export function RegisterPage() {
  const [serverError, setServerError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  async function onSubmit(data: RegisterFormData) {
    setServerError(null)
    setSuccessMessage(null)

    try {
      const { needsEmailConfirmation } = await signUpWithEmail(data)

      if (needsEmailConfirmation) {
        setSuccessMessage(
          'Conta criada! Verifique seu e-mail para confirmar o cadastro antes de entrar.',
        )
      } else {
        setSuccessMessage('Conta criada com sucesso! Você já pode entrar.')
      }
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Erro ao criar conta.')
    }
  }

  return (
    <AuthLayout
      title="Criar conta"
      subtitle="Cadastre-se para acompanhar os quadros da NIZ TECH"
      footer={
        <p>
          Já tem conta?{' '}
          <Link to="/" className="font-medium text-caramel hover:text-caramel/80">
            Entrar
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

        {successMessage && (
          <div
            role="status"
            className="rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm text-success"
          >
            {successMessage}
          </div>
        )}

        <Input
          label="Nome completo"
          type="text"
          autoComplete="name"
          placeholder="Seu nome"
          error={errors.fullName?.message}
          {...register('fullName')}
        />

        <Input
          label="E-mail"
          type="email"
          autoComplete="email"
          inputMode="email"
          spellCheck={false}
          placeholder="seu@email.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Senha"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder="••••••••••••"
          hint="Mínimo 8 caracteres, com maiúscula, minúscula, número e caractere especial"
          error={errors.password?.message}
          {...register('password')}
        />

        <Input
          label="Confirmar senha"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder="••••••••••••"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="text-xs text-cream/50 transition-colors hover:text-cream/80"
        >
          {showPassword ? 'Ocultar senhas' : 'Mostrar senhas'}
        </button>

        <Button type="submit" fullWidth isLoading={isSubmitting} disabled={!!successMessage}>
          Criar conta
        </Button>
      </form>
    </AuthLayout>
  )
}
