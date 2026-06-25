import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'

export function useAdmin() {
  const { profile } = useAuth()
  const isAdmin = profile?.role === 'admin' || profile?.role === 'moderator'

  const [kpis, setKpis]                             = useState(null)
  const [kpisLoading, setKpisLoading]               = useState(true)
  const [metrics, setMetrics]                       = useState({ users: [], matches: [], messages: [] })
  const [metricsLoading, setMetricsLoading]         = useState(true)
  const [users, setUsers]                           = useState([])
  const [usersLoading, setUsersLoading]             = useState(false)
  const [userSearch, setUserSearch]                 = useState('')
  const [reports, setReports]                       = useState([])
  const [reportsLoading, setReportsLoading]         = useState(true)
  const [conversations, setConversations]           = useState([])
  const [convsLoading, setConvsLoading]             = useState(false)
  const [activeConv, setActiveConv]                 = useState(null)
  const [activeConvMessages, setActiveConvMessages] = useState([])
  const [logs, setLogs]                             = useState([])
  const [logsLoading, setLogsLoading]               = useState(false)

  async function fetchKpis() {
    setKpisLoading(true)
    const { data } = await supabase.from('admin_kpis').select('*').single()
    setKpis(data)
    setKpisLoading(false)
  }

  async function fetchMetrics() {
    setMetricsLoading(true)
    const [users, matches, messages] = await Promise.all([
      supabase.from('admin_daily_users').select('*'),
      supabase.from('admin_daily_matches').select('*'),
      supabase.from('admin_daily_messages').select('*'),
    ])
    setMetrics({ users: users.data || [], matches: matches.data || [], messages: messages.data || [] })
    setMetricsLoading(false)
  }

  async function fetchUsers(search = '') {
    setUsersLoading(true)
    let query = supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(50)
    if (search.trim()) query = query.ilike('display_name', `%${search.trim()}%`)
    const { data } = await query
    setUsers(data || [])
    setUsersLoading(false)
  }

  async function banUser(profileId, reason) {
    const { error } = await supabase.rpc('admin_ban_user', { p_profile_id: profileId, p_reason: reason })
    if (!error) await fetchUsers(userSearch)
    return { error }
  }

  async function unbanUser(profileId) {
    const { error } = await supabase.from('profiles')
      .update({ banned: false, banned_reason: null, banned_at: null })
      .eq('id', profileId)
    if (!error && profile?.id) {
      await supabase.from('admin_logs').insert({ admin_id: profile.id, action: 'unban', target_id: profileId })
    }
    if (!error) await fetchUsers(userSearch)
    return { error }
  }

  async function warnUser(profileId, reason, reportId = null) {
    const { error } = await supabase.rpc('admin_warn_user', {
      p_profile_id: profileId, p_reason: reason, p_report_id: reportId,
    })
    return { error }
  }

  async function getUserWarnings(profileId) {
    const { data } = await supabase
      .from('warnings')
      .select('*, admin:profiles!warnings_admin_id_fkey(display_name)')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false })
    return data || []
  }

  async function fetchReports() {
    setReportsLoading(true)
    const { data } = await supabase
      .from('reports')
      .select('*, reporter:profiles!reports_reporter_id_fkey(id,display_name,age), reported:profiles!reports_reported_id_fkey(id,display_name,age,banned)')
      .order('created_at', { ascending: false })
      .limit(100)
    setReports(data || [])
    setReportsLoading(false)
  }

  async function resolveReport(reportId, status) {
    const { error } = await supabase.rpc('admin_resolve_report', { p_report_id: reportId, p_status: status })
    if (!error) await fetchReports()
    return { error }
  }

  async function fetchConversations(search = '') {
    setConvsLoading(true)
    let query = supabase.from('admin_conversations').select('*').limit(50)
    if (search.trim()) query = query.or(`sender_name.ilike.%${search}%,receiver_name.ilike.%${search}%`)
    const { data } = await query
    setConversations(data || [])
    setConvsLoading(false)
  }

  async function fetchConvMessages(connectionId) {
    setActiveConv(connectionId)
    const { data } = await supabase
      .from('messages')
      .select('*, sender:profiles!messages_sender_id_fkey(display_name)')
      .eq('connection_id', connectionId)
      .order('created_at', { ascending: true })
    setActiveConvMessages(data || [])
  }

  async function deleteMessage(messageId) {
    const { error } = await supabase.from('messages').delete().eq('id', messageId)
    if (!error) {
      setActiveConvMessages(prev => prev.filter(m => m.id !== messageId))
      if (profile?.id) {
        await supabase.from('admin_logs').insert({ admin_id: profile.id, action: 'delete_message', details: { message_id: messageId } })
      }
    }
    return { error }
  }

  async function sendBroadcast(title, body) {
    const { data, error } = await supabase.rpc('admin_broadcast', { p_title: title, p_body: body })
    return { count: data, error }
  }

  async function fetchLogs() {
    setLogsLoading(true)
    const { data } = await supabase
      .from('admin_logs')
      .select('*, admin:profiles!admin_logs_admin_id_fkey(display_name)')
      .order('created_at', { ascending: false })
      .limit(100)
    setLogs(data || [])
    setLogsLoading(false)
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
    metrics, metricsLoading,
    users, usersLoading, userSearch, setUserSearch, fetchUsers, banUser, unbanUser, warnUser, getUserWarnings,
    reports, reportsLoading, fetchReports, resolveReport,
    conversations, convsLoading, activeConv, activeConvMessages, fetchConversations, fetchConvMessages, deleteMessage,
    sendBroadcast,
    logs, logsLoading, fetchLogs,
  }
}