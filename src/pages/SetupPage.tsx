import { env } from '@/config/env'

export function SetupPage() {
  const isProd = !env.isDev

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 auth-gradient">
      <div className="w-full max-w-lg rounded-xl border border-dark-border bg-dark-surface p-8 text-center">
        <h1 className="text-2xl font-semibold text-cream">Configuração necessária</h1>
        <p className="mt-4 text-sm text-cream/60">
          As variáveis do Supabase não foram encontradas neste build.
        </p>

        {isProd ? (
          <ol className="mt-6 space-y-3 text-left text-sm text-cream/80">
            <li>
              1. Na Vercel, vá em <code className="text-caramel">Settings → Environment Variables</code>
            </li>
            <li>
              2. Confirme <code className="text-caramel">VITE_SUPABASE_URL</code> e{' '}
              <code className="text-caramel">VITE_SUPABASE_ANON_KEY</code> (Production)
            </li>
            <li>
              3. Vá em <code className="text-caramel">Deployments</code> → abra o último deploy →{' '}
              <code className="text-caramel">Redeploy</code>
            </li>
            <li>
              4. Importante: no Vite as variáveis entram no <strong>build</strong>. Só cadastrar
              depois do deploy não atualiza o site — precisa rebuild.
            </li>
          </ol>
        ) : (
          <ol className="mt-6 space-y-3 text-left text-sm text-cream/80">
            <li>
              1. Copie <code className="text-caramel">.env.example</code> para{' '}
              <code className="text-caramel">.env</code>
            </li>
            <li>
              2. Preencha <code className="text-caramel">VITE_SUPABASE_URL</code> e{' '}
              <code className="text-caramel">VITE_SUPABASE_ANON_KEY</code>
            </li>
            <li>
              3. Execute as migrations em <code className="text-caramel">supabase/migrations/</code>
            </li>
            <li>4. Reinicie o servidor de desenvolvimento</li>
          </ol>
        )}

        <p className="mt-6 text-xs text-cream/40">
          Use apenas a chave anon (pública). Nunca exponha a service_role key no frontend.
        </p>
      </div>
    </div>
  )
}
