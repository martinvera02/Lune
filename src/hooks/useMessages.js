import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'

export function useMessages(connectionId) {
  const { user, profile } = useAuth()
  const [messages, setMessages] = useState([])
  const [loading, setLoading]   = useState(true)
  const channelRef = useRef(null)

  useEffect(() => {
    if (!connectionId || !profile) return
    fetchMessages()
    return subscribeToMessages()
  }, [connectionId, profile?.id])

  async function fetchMessages() {
    setLoading(true)
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('connection_id', connectionId)
      .order('created_at', { ascending: true })

    if (!error) setMessages(data || [])
    setLoading(false)

    // Marcar como leídos
    if (profile?.id) {
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('connection_id', connectionId)
        .neq('sender_id', profile.id)
        .eq('is_read', false)
    }
  }

  function subscribeToMessages() {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
    }

    const channel = supabase
      .channel(`messages-${connectionId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `connection_id=eq.${connectionId}`,
      }, (payload) => {
        setMessages(prev => [...prev, payload.new])
        if (profile?.id && payload.new.sender_id !== profile.id) {
          supabase.from('messages').update({ is_read: true }).eq('id', payload.new.id)
        }
      })
      .subscribe()

    channelRef.current = channel
    return () => {
      supabase.removeChannel(channel)
      channelRef.current = null
    }
  }

  async function sendMessage(content) {
    if (!content.trim() || !profile?.id) return
    const { error } = await supabase.from('messages').insert({
      connection_id: connectionId,
      sender_id:     profile.id,
      content:       content.trim(),
    })
    return { error }
  }

  return { messages, loading, sendMessage, myProfileId: profile?.id }
}