import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'

export function useNotifications() {
  const { profile } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unread, setUnread]               = useState(0)
  const channelRef = useRef(null)

  useEffect(() => {
    if (!profile?.id) return
    fetchNotifications()
    return subscribe()
  }, [profile?.id])

  async function fetchNotifications() {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(30)

    setNotifications(data || [])
    setUnread((data || []).filter(n => !n.read).length)
  }

  function subscribe() {
    if (channelRef.current) supabase.removeChannel(channelRef.current)

    const channel = supabase
      .channel(`notifications-${profile.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${profile.id}`,
      }, (payload) => {
        setNotifications(prev => [payload.new, ...prev])
        setUnread(u => u + 1)
      })
      .subscribe()

    channelRef.current = channel
    return () => {
      supabase.removeChannel(channel)
      channelRef.current = null
    }
  }

  async function markAllRead() {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', profile.id)
      .eq('read', false)
    setUnread(0)
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  return { notifications, unread, markAllRead, refetch: fetchNotifications }
}