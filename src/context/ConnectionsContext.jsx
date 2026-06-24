import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { CONNECTION_STATUS } from '@/lib/constants'

const ConnectionsContext = createContext(null)

export function ConnectionsProvider({ children }) {
  const { user, profile } = useAuth()
  const [connections, setConnections] = useState([])
  const [loading, setLoading]         = useState(true)

  useEffect(() => {
    if (!user || !profile) return
    fetchConnections()
  }, [user?.id, profile?.id])

  async function fetchConnections() {
    if (!profile?.id) return
    setLoading(true)

    const { data, error } = await supabase
      .from('connections')
      .select(`
        *,
        sender:profiles!connections_sender_id_fkey(*),
        receiver:profiles!connections_receiver_id_fkey(*),
        messages(id, content, sender_id, created_at, is_read)
      `)
      .or(`sender_id.eq.${profile.id},receiver_id.eq.${profile.id}`)
      .eq('status', CONNECTION_STATUS.MATCHED)
      .order('matched_at', { ascending: false })

    if (!error) setConnections(data || [])
    setLoading(false)
  }

  async function sendOpening({ receiverId, questionId, message }) {
    if (!profile?.id) return { data: null, error: new Error('Perfil no encontrado') }

    const { data, error } = await supabase
      .from('connections')
      .upsert(
        {
          sender_id:       profile.id,
          receiver_id:     receiverId,
          question_id:     questionId,
          opening_message: message,
          status:          CONNECTION_STATUS.MATCHED,
          matched_at:      new Date().toISOString(),
        },
        { onConflict: 'sender_id,receiver_id', ignoreDuplicates: false }
      )
      .select()
      .single()

    if (!error) await fetchConnections()
    return { data, error }
  }

  async function acceptConnection(connectionId) {
    const { data, error } = await supabase
      .from('connections')
      .update({ status: CONNECTION_STATUS.MATCHED, matched_at: new Date().toISOString() })
      .eq('id', connectionId)
      .select()
      .single()

    if (!error) await fetchConnections()
    return { data, error }
  }

  function otherProfile(connection) {
    if (!profile?.id) return null
    return connection.sender_id === profile.id ? connection.receiver : connection.sender
  }

  function unreadCount(connection) {
    if (!profile?.id) return 0
    return (connection.messages || []).filter(
      m => m.sender_id !== profile.id && !m.is_read
    ).length
  }

  const totalUnread = connections.reduce((sum, c) => sum + unreadCount(c), 0)

  return (
    <ConnectionsContext.Provider value={{
      connections,
      loading,
      totalUnread,
      sendOpening,
      acceptConnection,
      otherProfile,
      unreadCount,
      refetch: fetchConnections,
    }}>
      {children}
    </ConnectionsContext.Provider>
  )
}

export function useConnections() {
  const ctx = useContext(ConnectionsContext)
  if (!ctx) throw new Error('useConnections must be used inside <ConnectionsProvider>')
  return ctx
}