import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession]       = useState(undefined)
  const [profile, setProfile]       = useState(null)
  const [loading, setLoading]       = useState(true)  // true hasta que tengamos datos reales

  useEffect(() => {
    // Carga inicial — única vez que mostramos el orbe
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session)
      if (session) {
        await fetchProfile(session.user.id)
      }
      setLoading(false)
    })

    // Listener de cambios de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Ignorar token refresh — no queremos re-renderizar
      if (event === 'TOKEN_REFRESHED') return

      setSession(session)

      if (session) {
        // Fetch silencioso — sin poner loading a true
        fetchProfile(session.user.id, false)
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

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

  return (
    <AuthContext.Provider value={{
      session,
      user: session?.user ?? null,
      profile,
      loading,
      signUp,
      signIn,
      signOut,
      updateProfile,
      refetchProfile: () => session && fetchProfile(session.user.id, false),
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}