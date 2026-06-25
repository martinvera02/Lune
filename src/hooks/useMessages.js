import { useEffect, useRef, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'

export function useMessages(connectionId) {
  const { profile } = useAuth()
  const [messages, setMessages]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [typingUsers, setTypingUsers] = useState([]) // IDs escribiendo
  const channelRef   = useRef(null)
  const typingTimer  = useRef(null)
  const isTypingRef  = useRef(false)

  useEffect(() => {
    if (!connectionId || !profile) return
    fetchMessages()
    const unsub = subscribeToMessages()
    return unsub
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

    if (profile?.id) {
      await supabase
        .from('messages')
        .update({ is_read: true, status: 'read' })
        .eq('connection_id', connectionId)
        .neq('sender_id', profile.id)
        .eq('is_read', false)
    }
  }

  function subscribeToMessages() {
    if (channelRef.current) supabase.removeChannel(channelRef.current)

    const channel = supabase
      .channel(`chat-${connectionId}`)
      // Nuevos mensajes
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `connection_id=eq.${connectionId}`,
      }, (payload) => {
        setMessages(prev => {
          // Evitar duplicados (optimistic update)
          if (prev.find(m => m.id === payload.new.id)) return prev
          return [...prev, payload.new]
        })
        if (profile?.id && payload.new.sender_id !== profile.id) {
          supabase.from('messages')
            .update({ is_read: true, status: 'read' })
            .eq('id', payload.new.id)
          // Quitar typing indicator del remitente
          setTypingUsers(prev => prev.filter(id => id !== payload.new.sender_id))
        }
      })
      // Actualizaciones de estado (read receipts)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        filter: `connection_id=eq.${connectionId}`,
      }, (payload) => {
        setMessages(prev => prev.map(m => m.id === payload.new.id ? payload.new : m))
      })
      // Typing indicator via Presence
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        const typing = Object.values(state)
          .flat()
          .filter(p => p.typing && p.profile_id !== profile?.id)
          .map(p => p.profile_id)
        setTypingUsers(typing)
      })
      .subscribe()

    channelRef.current = channel
    return () => {
      supabase.removeChannel(channel)
      channelRef.current = null
    }
  }

  // Llamar mientras el usuario escribe
  const sendTypingSignal = useCallback(() => {
    if (!channelRef.current || !profile?.id) return

    if (!isTypingRef.current) {
      isTypingRef.current = true
      channelRef.current.track({ profile_id: profile.id, typing: true })
    }

    // Dejar de typing tras 2s de inactividad
    clearTimeout(typingTimer.current)
    typingTimer.current = setTimeout(() => {
      isTypingRef.current = false
      channelRef.current?.track({ profile_id: profile.id, typing: false })
    }, 2000)
  }, [profile?.id])

  async function sendMessage(content, replyTo = null) {
    if (!content.trim() || !profile?.id) return { error: new Error('Invalid') }

    const optimisticId = `optimistic-${Date.now()}`
    const optimisticMsg = {
      id:            optimisticId,
      connection_id: connectionId,
      sender_id:     profile.id,
      content:       content.trim(),
      reply_to:      replyTo,
      is_read:       false,
      status:        'sending',
      created_at:    new Date().toISOString(),
    }

    // Añadir mensaje optimista inmediatamente
    setMessages(prev => [...prev, optimisticMsg])

    // Parar typing
    clearTimeout(typingTimer.current)
    isTypingRef.current = false
    channelRef.current?.track({ profile_id: profile.id, typing: false })

    const { data, error } = await supabase.from('messages').insert({
      connection_id: connectionId,
      sender_id:     profile.id,
      content:       content.trim(),
      reply_to:      replyTo,
      status:        'sent',
    }).select().single()

    if (error) {
      // Marcar como fallido
      setMessages(prev => prev.map(m =>
        m.id === optimisticId ? { ...m, status: 'error' } : m
      ))
      return { error }
    }

    // Reemplazar optimista con real
    setMessages(prev => prev.map(m =>
      m.id === optimisticId ? data : m
    ))

    return { error: null }
  }

  return {
    messages,
    loading,
    typingUsers,
    sendMessage,
    sendTypingSignal,
    myProfileId: profile?.id,
  }
}