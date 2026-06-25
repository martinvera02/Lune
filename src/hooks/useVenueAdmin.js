import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'

export function useVenueAdmin() {
  const { user } = useAuth()
  const [venue, setVenue]           = useState(null)
  const [events, setEvents]         = useState([])
  const [activeEvent, setActiveEvent] = useState(null)
  const [attendees, setAttendees]   = useState([])
  const [loading, setLoading]       = useState(true)
  const channelRef = useRef(null)

  const isVenueOwner = !!venue

  useEffect(() => {
    if (!user) return
    fetchVenue()
  }, [user?.id])

  async function fetchVenue() {
    setLoading(true)
    const { data } = await supabase
      .from('venues')
      .select('*')
      .eq('owner_user_id', user.id)
      .single()

    if (data) {
      setVenue(data)
      await fetchEvents(data.id)
    }
    setLoading(false)
  }

  async function fetchEvents(venueId) {
    const { data } = await supabase
      .from('venue_event_stats')
      .select('*')
      .eq('venue_id', venueId)
      .order('starts_at', { ascending: false })
    setEvents(data || [])
  }

  async function fetchAttendees(eventId) {
    const { data } = await supabase
      .from('event_members')
      .select('*, profiles(display_name, age, mood_id, cultural_tags, profile_answers(answer))')
      .eq('event_id', eventId)
      .order('joined_at', { ascending: false })
    setAttendees((data || []).map(d => ({ ...d.profiles, joined_at: d.joined_at })))
  }

  function subscribeToEvent(eventId) {
    if (channelRef.current) supabase.removeChannel(channelRef.current)

    const channel = supabase
      .channel(`venue-event-${eventId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'event_members',
        filter: `event_id=eq.${eventId}`,
      }, () => {
        fetchAttendees(eventId)
        if (venue) fetchEvents(venue.id)
      })
      .subscribe()

    channelRef.current = channel
    return () => { supabase.removeChannel(channel); channelRef.current = null }
  }

  async function openEvent(event) {
    setActiveEvent(event)
    await fetchAttendees(event.event_id)
    return subscribeToEvent(event.event_id)
  }

  function closeEvent() {
    setActiveEvent(null)
    setAttendees([])
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
      channelRef.current = null
    }
  }

  async function createEvent({ name, description, startsAt, endsAt, maxCapacity }) {
    if (!venue) return { error: new Error('Sin venue') }
    const { data, error } = await supabase.rpc('create_venue_event', {
      p_venue_id:     venue.id,
      p_name:         name,
      p_description:  description || '',
      p_starts_at:    startsAt,
      p_ends_at:      endsAt,
      p_max_capacity: maxCapacity || null,
    })
    if (!error) await fetchEvents(venue.id)
    return { data, error }
  }

  async function toggleEventActive(eventId, active) {
    const { error } = await supabase
      .from('events')
      .update({ active })
      .eq('id', eventId)
    if (!error && venue) await fetchEvents(venue.id)
    return { error }
  }

  async function updateVenue(updates) {
    if (!venue) return { error: new Error('Sin venue') }
    const { data, error } = await supabase
      .from('venues')
      .update(updates)
      .eq('id', venue.id)
      .select()
      .single()
    if (!error) setVenue(data)
    return { data, error }
  }

  // Totales para el dashboard
  const stats = {
    totalEvents:   events.length,
    totalAttendees: events.reduce((s, e) => s + (e.attendees || 0), 0),
    totalMatches:  events.reduce((s, e) => s + (e.matches || 0), 0),
    totalMessages: events.reduce((s, e) => s + (e.messages || 0), 0),
  }

  return {
    venue, events, activeEvent, attendees, loading, isVenueOwner, stats,
    fetchVenue, fetchEvents, openEvent, closeEvent,
    createEvent, toggleEventActive, updateVenue,
  }
}