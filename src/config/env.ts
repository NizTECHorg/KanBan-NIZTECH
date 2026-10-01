const SUPABASE_URL = String(import.meta.env.VITE_SUPABASE_URL ?? '').trim()
const SUPABASE_ANON_KEY = String(import.meta.env.VITE_SUPABASE_ANON_KEY ?? '').trim()

export function isEnvConfigured(): boolean {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return false
  if (SUPABASE_URL.includes('seu-projeto') || SUPABASE_ANON_KEY.includes('sua-chave')) return false

  try {
    const url = new URL(SUPABASE_URL)
    return url.protocol === 'https:'
  } catch {
    return false
  }
}

export const env = {
  supabaseUrl: SUPABASE_URL,
  supabaseAnonKey: SUPABASE_ANON_KEY,
  isDev: import.meta.env.DEV,
  isConfigured: isEnvConfigured(),
} as const
