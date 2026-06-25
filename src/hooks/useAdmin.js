import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'

export function useAdmin() {
  const { profile } = useAuth()
  const isAdmin = profile?.role === 'admin' || profile?.role === 'moderator'

  // ── KPIs ──────────────────────────────────────────────────
  const [kpis, setKpis]       = useState(null)
  const [kpisLoading, setKpisLoading] = useState(true)

  async function fetchKpis() {
    setKpisLoading(true)
    const { data } = await supabase.from('admin_kpis').select('*').single()
    setKpis(data)
    setKpisLoading(false)
  }

  // ── Daily metrics ─────────────────────────────────────────
  const [metrics, setMetrics]       = useState({ users: [], matches: [], messages: [] })
  const [metricsLoading, setMetricsLoading] = useState(true)

  async function fetchMetrics() {
    setMetricsLoading(true)
    const [users, matches, messages] = await Promise.all([
      supabase.from('admin_daily_users').select('*'),
      supabase.from('admin_daily_matches').select('*'),
      supabase.from('admin_daily_messages').select('*'),
    ])
    setMetrics({
      users:    users.data    || [],
      matches:  matches.data  || [],
      messages: messages.data || [],
    })
    setMetricsLoading(false)
  }

  // ── Users ─────────────────────────────────────────────────
  const [users, setUsers]           = useState([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [userSearch, setUserSearch] = useState('')

  async function fetchUsers(search = '') {
    setUsersLoading(true)
    let query = supabase
      .from('profiles')
      .select('*, profile_answers(answer)')
      .order('created_at', { ascending: false })
      .limit(50)

    if (search.trim()) {
      query = query.ilike('display_name', `%${search.trim()}%`)
    }

    const { data } = await query
    setUsers(data || [])
    setUsersLoading(false)
  }

  async function banUser(profileId, reason) {
    const { error } = await supabase.rpc('admin_ban_user', {
      p_profile_id: profileId,
      p_reason:     reason,
    })
    if (!error) await fetchUsers(userSearch)
    return { error }
  }

  async function unbanUser(profileId) {
    const { error } = await supabase
      .from('profiles')
      .update({ banned: false, banned_reason: null, banned_at: null })
      .eq('id', profileId)
    if (!error) await fetchUsers(userSearch)
    return { error }
  }

  // ── Reports ───────────────────────────────────────────────
  const [reports, setReports]           = useState([])
  const [reportsLoading, setReportsLoading] = useState(true)

  async function fetchReports() {
    setReportsLoading(true)
    const { data } = await supabase
      .from('reports')
      .select(`
        *,
        reporter:profiles!reports_reporter_id_fkey(id, display_name, age),
        reported:profiles!reports_reported_id_fkey(id, display_name, age, banned)
      `)
      .order('created_at', { ascending: false })
      .limit(100)
    setReports(data || [])
    setReportsLoading(false)
  }

  async function resolveReport(reportId, status) {
    const { error } = await supabase.rpc('admin_resolve_report', {
      p_report_id: reportId,
      p_status:    status,
    })
    if (!error) await fetchReports()
    return { error }
  }

  useEffect(() => {
    if (!isAdmin) return
    fetchKpis()
    fetchMetrics()
    fetchReports()
    fetchUsers()
  }, [isAdmin])

  return {
    isAdmin,
    kpis, kpisLoading, fetchKpis,
    metrics, metricsLoading, fetchMetrics,
    users, usersLoading, userSearch, setUserSearch, fetchUsers, banUser, unbanUser,
    reports, reportsLoading, fetchReports, resolveReport,
  }
}