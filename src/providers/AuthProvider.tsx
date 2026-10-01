import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'
import { fetchProfile, signOut as authSignOut } from '@/services/auth.service'
import { AuthContext, type AuthContextValue } from '@/hooks/useAuth'
import type { Profile } from '@/types/database.types'

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null)
  const [sessionLoaded, setSessionLoaded] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)

  useEffect(() => {
    let mounted = true

    void supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      setSession(data.session)
      setSessionLoaded(true)
    })

    // IMPORTANTE: este callback precisa ser síncrono. Fazer await de consultas
    // ao banco aqui causa deadlock no lock interno de auth do supabase-js
    // (o spinner infinito no login). O perfil é carregado no efeito abaixo.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!mounted) return
      setSession(newSession)
      setSessionLoaded(true)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const userId = session?.user.id ?? null

  useEffect(() => {
    if (!userId) {
      setProfile(null)
      setProfileLoading(false)
      return
    }

    let cancelled = false
    setProfileLoading(true)

    void fetchProfile(userId).then((userProfile) => {
      if (cancelled) return
      setProfile(userProfile)
      setProfileLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [userId])

  const signOut = useCallback(async () => {
    await authSignOut()
    setSession(null)
    setProfile(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      isLoading: !sessionLoaded || profileLoading,
      // Falha de forma segura: sessão sem perfil ativo não acessa a aplicação.
      // O Supabase RLS continua sendo a autoridade final no servidor.
      isAuthenticated: !!session && !!profile,
      signOut,
    }),
    [session, profile, sessionLoaded, profileLoading, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
