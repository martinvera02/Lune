import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { CONNECTION_STATUS } from '@/lib/constants'

export function useConnections() {
  const { user } = useAuth()
  const [connections, setConnections] = useState([])
  const [loading, setLoading]         = useState(true)

  useEffect(() => {
    if (!user) return
    fetchConnections()
  }, [user?.id])

  async function fetchConnections() {
    setLoading(true)
    const { data, error } = await supabase
      .from('connections')
      .select(`
        *,
        sender:profiles!connections_sender_id_fkey(*),
        receiver:profiles!connections_receiver_id_fkey(*),
        messages(id, content, sender_id, created_at, is_read)
      `)
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .eq('status', CONNECTION_STATUS.MATCHED)
      .order('matched_at', { ascending: false })

    if (!error) setConnections(data || [])
    setLoading(false)
  }

  async function sendOpening({ receiverId, questionId, message }) {
  // Obtener el profile.id del usuario actual
  const { data: myProfile, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (profileError || !myProfile) {
    return { data: null, error: profileError || new Error('Perfil no encontrado') }
  }

  const { data, error } = await supabase
    .from('connections')
    .insert({
      sender_id:       myProfile.id,
      receiver_id:     receiverId,
      question_id:     questionId,
      opening_message: message,
      status: CONNECTION_STATUS.MATCHED,
      matched_at: new Date().toISOString(),
    })
    .select()
    .single()

  return { data, error }
}

  async function acceptConnection(connectionId) {
    const { data, error } = await supabase
      .from('connections')
      .update({ status: CONNECTION_STATUS.MATCHED, matched_at: new Date().toISOString() })
      .eq('id', connectionId)
      .select()
      .single()
    return { data, error }
  }

  function otherProfile(connection) {
    return connection.sender_id === user.id ? connection.receiver : connection.sender
  }

  function unreadCount(connection) {
    return (connection.messages || []).filter(
      m => m.sender_id !== user.id && !m.is_read
    ).length
  }

  return {
    connections,
    loading,
    sendOpening,
    acceptConnection,
    otherProfile,
    unreadCount,
    refetch: fetchConnections,
  }
}