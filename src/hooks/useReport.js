import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'

export function useReport() {
  const { profile } = useAuth()
  const [loading, setLoading] = useState(false)

  async function reportProfile({ reportedId, reason, details }) {
    if (!profile?.id) return { error: new Error('Sin perfil') }
    setLoading(true)
    const { error } = await supabase.from('reports').upsert({
      reporter_id: profile.id,
      reported_id: reportedId,
      reason,
      details: details || null,
    }, { onConflict: 'reporter_id,reported_id', ignoreDuplicates: false })
    setLoading(false)
    return { error }
  }

  async function blockProfile(blockedId) {
    if (!profile?.id) return { error: new Error('Sin perfil') }
    setLoading(true)
    const { error } = await supabase.from('blocks').upsert({
      blocker_id: profile.id,
      blocked_id: blockedId,
    }, { onConflict: 'blocker_id,blocked_id', ignoreDuplicates: true })
    setLoading(false)
    return { error }
  }

  async function unblockProfile(blockedId) {
    if (!profile?.id) return { error: new Error('Sin perfil') }
    const { error } = await supabase.from('blocks')
      .delete()
      .eq('blocker_id', profile.id)
      .eq('blocked_id', blockedId)
    return { error }
  }

  return { reportProfile, blockProfile, unblockProfile, loading }
}