import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'

export function useEvent() {
  const { profile } = useAuth()
  const [activeEvent, setActiveEvent]   = useState(null)  // evento activo
  const [members, setMembers]           = useState([])     // perfiles en el evento
  const [loading, setLoading]           = useState(false)
  const [joining, setJoining]           = useState(false)
  const [error, setError]               = useState(null)
  const channelRef = useRef(null)

  // Al montar, comprobar si el usuario ya está en un evento activo
  useEffect(() => {
    if (!profile?.id) return
    checkActiveEvent()
  }, [profile?.id])

  async function checkActiveEvent() {
    const { data } = await supabase
      .from('event_members')
      .select('event_id, events(*, venues(*))')
      .eq('profile_id', profile.id)
      .gte('events.ends_at', new Date().toISOString())
      .order('joined_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (data?.events) {
      setActiveEvent(data.events)
      fetchMembers(data.event_id)
      subscribeToMembers(data.event_id)
    }
  }

  // Unirse a un evento por código QR
  async function joinEvent(qrCode) {
    if (!profile?.id) return { error: new Error('Sin perfil') }
    setJoining(true)
    setError(null)

    try {
      // Buscar el evento por QR
      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('*, venues(*)')
        .eq('qr_code', qrCode.trim().toUpperCase())
        .eq('active', true)
        .gte('ends_at', new Date().toISOString())
        .single()

      if (eventError || !event) {
        throw new Error('Código no válido o evento terminado')
      }

      // Unirse al evento
      const { error: joinError } = await supabase
        .from('event_members')
        .upsert(
          { event_id: event.id, profile_id: profile.id },
          { onConflict: 'event_id,profile_id', ignoreDuplicates: true }
        )

      if (joinError) throw joinError

      setActiveEvent(event)
      await fetchMembers(event.id)
      subscribeToMembers(event.id)

      return { event, error: null }
    } catch (err) {
      setError(err.message)
      return { event: null, error: err }
    } finally {
      setJoining(false)
    }
  }

  // Salir del evento
  async function leaveEvent() {
    if (!activeEvent || !profile?.id) return
    await supabase
      .from('event_members')
      .delete()
      .eq('event_id', activeEvent.id)
      .eq('profile_id', profile.id)

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
      channelRef.current = null
    }
    setActiveEvent(null)
    setMembers([])
  }

  async function fetchMembers(eventId) {
    setLoading(true)
    const { data } = await supabase
      .from('event_members')
      .select('profile_id, profiles(*, profile_answers(*, questions(content)))')
      .eq('event_id', eventId)
      .neq('profile_id', profile.id) // excluir al propio usuario

    setMembers((data || []).map(m => m.profiles).filter(Boolean))
    setLoading(false)
  }

  function subscribeToMembers(eventId) {
    if (channelRef.current) supabase.removeChannel(channelRef.current)

    const channel = supabase
      .channel(`event-members-${eventId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'event_members',
        filter: `event_id=eq.${eventId}`,
      }, () => fetchMembers(eventId))
      .subscribe()

    channelRef.current = channel
    return () => {
      supabase.removeChannel(channel)
      channelRef.current = null
    }
  }

  // Tiempo restante del evento
  function timeRemaining() {
    if (!activeEvent) return null
    const diff = new Date(activeEvent.ends_at) - new Date()
    if (diff <= 0) return 'Terminado'
    const h = Math.floor(diff / 3600000)
    const m = Math.floor((diff % 3600000) / 60000)
    if (h > 0) return `${h}h ${m}m`
    return `${m} min`
  }

  return {
    activeEvent,
    members,
    loading,
    joining,
    error,
    joinEvent,
    leaveEvent,
    timeRemaining,
  }
}