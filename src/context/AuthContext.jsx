import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession]     = useState(undefined)
  const [profile, setProfile]     = useState(null)
  const [loading, setLoading]     = useState(true)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    // Carga inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) {
        fetchProfile(session.user.id).finally(() => {
          setLoading(false)
          setInitialized(true)
        })
      } else {
        setLoading(false)
        setInitialized(true)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Ignorar eventos que no son cambios reales de sesión
      if (!initialized) return
      if (event === 'TOKEN_REFRESHED') return

      setSession(session)
      if (session) {
        // Refetch silencioso — sin poner loading a true
        fetchProfile(session.user.id, false)
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [initialized])

  async function fetchProfile(userId, showLoading = true) {
    if (showLoading) setLoading(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('*, profile_answers(*, questions(content))')
      .eq('user_id', userId)
      .maybeSingle()

    if (!error) setProfile(data ?? null)
    if (showLoading) setLoading(false)
  }

  async function signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({ email, password })
    return { data, error }
  }

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  }

  async function signOut() {
    await supabase.auth.signOut()
    setProfile(null)
    setSession(null)
  }

  async function updateProfile(updates) {
    if (!session) return { error: new Error('No session') }
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', session.user.id)
      .select()
      .single()
    if (!error) setProfile(prev => ({ ...prev, ...data }))
    return { data, error }
  }

  const value = {
    session,
    user: session?.user ?? null,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    refetchProfile: () => session && fetchProfile(session.user.id, false),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}