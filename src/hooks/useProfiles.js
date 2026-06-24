import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'

export function useProfiles() {
  const { user, profile } = useAuth()
  const [profiles, setProfiles]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)

  useEffect(() => {
    if (!user || !profile) return
    fetchProfiles()
  }, [user?.id, profile?.id])

  async function fetchProfiles() {
    setLoading(true)

    // IDs ya vistos (en DB)
    const { data: views } = await supabase
      .from('profile_views')
      .select('viewed_id')
      .eq('viewer_id', profile.id)

    // IDs con conexión ya existente
    const { data: conns } = await supabase
      .from('connections')
      .select('receiver_id, sender_id')
      .or(`sender_id.eq.${profile.id},receiver_id.eq.${profile.id}`)

    const viewedIds = (views || []).map(v => v.viewed_id)
    const connIds   = (conns  || []).flatMap(c => [c.sender_id, c.receiver_id])
    const excludeIds = [...new Set([...viewedIds, ...connIds, profile.id])]

    let query = supabase
      .from('profiles')
      .select('*, profile_answers(*, questions(content))')
      .eq('onboarding_done', true)

    if (excludeIds.length > 0) {
      query = query.not('id', 'in', `(${excludeIds.join(',')})`)
    }

    const { data, error } = await query.limit(20)

    if (error) setError(error)
    else setProfiles(computeCompatibility(data || [], profile))

    setLoading(false)
  }

  // Marcar perfil como visto en DB
  async function markAsViewed(viewedProfileId) {
    if (!profile?.id) return
    await supabase
      .from('profile_views')
      .upsert(
        { viewer_id: profile.id, viewed_id: viewedProfileId },
        { onConflict: 'viewer_id,viewed_id', ignoreDuplicates: true }
      )
  }

  // Comprobar si ya existe conexión con un perfil
  async function hasExistingConnection(targetProfileId) {
    const { data } = await supabase
      .from('connections')
      .select('id, status')
      .or(
        `and(sender_id.eq.${profile.id},receiver_id.eq.${targetProfileId}),` +
        `and(sender_id.eq.${targetProfileId},receiver_id.eq.${profile.id})`
      )
      .maybeSingle()
    return data
  }

  return { profiles, loading, error, refetch: fetchProfiles, markAsViewed, hasExistingConnection }
}

function computeCompatibility(profiles, myProfile) {
  const myTags = Object.values(myProfile?.cultural_tags || {}).flat()
  return profiles
    .map(p => {
      const theirTags = Object.values(p.cultural_tags || {}).flat()
      const shared    = myTags.filter(t => theirTags.includes(t)).length
      const total     = new Set([...myTags, ...theirTags]).size || 1
      const score     = Math.round((shared / total) * 100)
      return { ...p, compatibility: Math.max(score, 20) }
    })
    .sort((a, b) => b.compatibility - a.compatibility)
}