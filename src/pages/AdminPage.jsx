import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAdmin } from '@/hooks/useAdmin'
import { showToast } from '@/components/ui/Toast'
import { MOODS } from '@/lib/constants'

const TABS = [
  { id: 'metrics',       label: 'Métricas',     icon: '📊' },
  { id: 'users',         label: 'Usuarios',     icon: '👥' },
  { id: 'reports',       label: 'Reportes',     icon: '⚠️' },
  { id: 'conversations', label: 'Chats',        icon: '💬' },
  { id: 'broadcast',     label: 'Broadcast',    icon: '📣' },
  { id: 'logs',          label: 'Auditoría',    icon: '🗂️' },
]

const REASON_LABELS = {
  spam: 'Spam', inappropriate: 'Contenido inapropiado',
  harassment: 'Acoso', fake: 'Perfil falso', other: 'Otro',
}

const LOG_LABELS = {
  ban: '🚫 Ban', unban: '✅ Unban', warn: '⚠️ Advertencia',
  resolve_report: '📋 Reporte', broadcast: '📣 Broadcast', delete_message: '🗑️ Mensaje eliminado',
}

export default function AdminPage({ onBack }) {
  const [tab, setTab] = useState('metrics')
  const admin = useAdmin()
  const pendingReports = admin.reports.filter(r => r.status === 'pending').length

  if (!admin.isAdmin) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 32, textAlign: 'center' }}>
        <div style={{ fontSize: 48 }}>🔒</div>
        <h3 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 22 }}>Acceso restringido</h3>
        <p style={{ color: 'var(--text2)', fontSize: 14 }}>No tienes permisos de administrador.</p>
        <button className="btn btn-ghost" onClick={onBack}>← Volver</button>
      </div>
    )
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '20px 24px 0', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--text3)', fontSize: 20, cursor: 'pointer' }}>←</button>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 24 }}>Panel Admin</h2>
            <p style={{ color: 'var(--text3)', fontSize: 12 }}>Lune Dashboard</p>
          </div>
          {pendingReports > 0 && (
            <div style={{ padding: '5px 12px', borderRadius: 100, background: 'rgba(251,113,133,0.15)', border: '1px solid rgba(251,113,133,0.3)', fontSize: 12, color: 'var(--red)', fontWeight: 600 }}>
              ⚠️ {pendingReports} pendientes
            </div>
          )}
        </div>

        {/* Tabs — horizontal scroll */}
        <div style={{ display: 'flex', gap: 4, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 2 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: '8px 14px', borderRadius: 100, border: 'none', whiteSpace: 'nowrap', flexShrink: 0,
              background: tab === t.id ? 'var(--surface2)' : 'var(--surface)',
              color: tab === t.id ? 'var(--accent)' : 'var(--text3)',
              cursor: 'pointer', fontSize: 12, fontWeight: tab === t.id ? 600 : 400,
              fontFamily: 'var(--font-body)', transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', gap: 5,
            }}>
              {t.icon} {t.label}
              {t.id === 'reports' && pendingReports > 0 && (
                <span style={{ background: 'var(--red)', color: 'white', borderRadius: 100, padding: '0px 5px', fontSize: 9, fontWeight: 700 }}>{pendingReports}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px 40px' }}>
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
            {tab === 'metrics'       && <MetricsTab       admin={admin} />}
            {tab === 'users'         && <UsersTab         admin={admin} />}
            {tab === 'reports'       && <ReportsTab       admin={admin} />}
            {tab === 'conversations' && <ConversationsTab admin={admin} />}
            {tab === 'broadcast'     && <BroadcastTab     admin={admin} />}
            {tab === 'logs'          && <LogsTab          admin={admin} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

// ── METRICS ───────────────────────────────────────────────────────────────────
function MetricsTab({ admin }) {
  const { kpis, kpisLoading, metrics } = admin
  if (kpisLoading) return <Loader />

  const cards = kpis ? [
    { label: 'Usuarios totales',    value: kpis.total_users,     icon: '👥', color: 'var(--accent)' },
    { label: 'Nuevos (7 días)',     value: kpis.new_users_7d,    icon: '✨', color: 'var(--teal)'   },
    { label: 'Matches totales',     value: kpis.total_matches,   icon: '💜', color: 'var(--pink)'   },
    { label: 'Mensajes totales',    value: kpis.total_messages,  icon: '💬', color: 'var(--gold)'   },
    { label: 'Reportes pendientes', value: kpis.pending_reports, icon: '⚠️', color: 'var(--red)'    },
    { label: 'Usuarios baneados',   value: kpis.banned_users,    icon: '🚫', color: 'var(--text3)'  },
  ] : []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {cards.map(k => (
          <div key={k.label} className="card" style={{ padding: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 22, marginBottom: 4 }}>{k.icon}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 26, color: k.color }}>{k.value ?? '—'}</div>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 3 }}>{k.label}</div>
          </div>
        ))}
      </div>
      {[
        { data: metrics.users,    key: 'new_users', color: 'var(--accent)', label: 'Nuevos usuarios — 30 días' },
        { data: metrics.matches,  key: 'matches',   color: 'var(--pink)',   label: 'Matches — 30 días' },
        { data: metrics.messages, key: 'messages',  color: 'var(--teal)',   label: 'Mensajes — 30 días' },
      ].map(chart => chart.data.length > 0 && (
        <div key={chart.label}>
          <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: chart.color, fontWeight: 600, marginBottom: 12 }}>{chart.label}</p>
          <MiniBarChart data={chart.data} valueKey={chart.key} color={chart.color} />
        </div>
      ))}
    </div>
  )
}

function MiniBarChart({ data, valueKey, color }) {
  const max = Math.max(...data.map(d => d[valueKey]), 1)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 72 }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, height: '100%', display: 'flex', alignItems: 'flex-end' }}>
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${(d[valueKey] / max) * 100}%` }}
            transition={{ duration: 0.4, delay: i * 0.01 }}
            style={{ width: '100%', background: color, borderRadius: 3, minHeight: 3, opacity: 0.75 }}
          />
        </div>
      ))}
    </div>
  )
}

// ── USERS ─────────────────────────────────────────────────────────────────────
function UsersTab({ admin }) {
  const { users, usersLoading, userSearch, setUserSearch, fetchUsers, banUser, unbanUser, warnUser, getUserWarnings } = admin
  const [banTarget, setBanTarget]   = useState(null)
  const [warnTarget, setWarnTarget] = useState(null)
  const [banReason, setBanReason]   = useState('')
  const [warnReason, setWarnReason] = useState('')
  const [processing, setProcessing] = useState(false)
  const [expanded, setExpanded]     = useState(null)
  const [warnings, setWarnings]     = useState({})

  useEffect(() => {
    const t = setTimeout(() => fetchUsers(userSearch), 300)
    return () => clearTimeout(t)
  }, [userSearch])

  async function loadWarnings(profileId) {
    if (warnings[profileId]) return
    const data = await getUserWarnings(profileId)
    setWarnings(prev => ({ ...prev, [profileId]: data }))
  }

  async function handleBan() {
    if (!banReason.trim()) return
    setProcessing(true)
    const { error } = await banUser(banTarget.id, banReason.trim())
    if (error) showToast({ message: 'Error al banear', type: 'error' })
    else showToast({ message: `${banTarget.display_name} baneado`, type: 'success' })
    setBanTarget(null); setBanReason(''); setProcessing(false)
  }

  async function handleWarn() {
    if (!warnReason.trim()) return
    setProcessing(true)
    const { error } = await warnUser(warnTarget.id, warnReason.trim())
    if (error) showToast({ message: 'Error', type: 'error' })
    else { showToast({ message: `Advertencia enviada a ${warnTarget.display_name}`, type: 'success' }); setWarnings(prev => ({ ...prev, [warnTarget.id]: undefined })) }
    setWarnTarget(null); setWarnReason(''); setProcessing(false)
  }

  async function handleUnban(u) {
    const { error } = await unbanUser(u.id)
    if (error) showToast({ message: 'Error', type: 'error' })
    else showToast({ message: `${u.display_name} desbaneado`, type: 'success' })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Search */}
      <div style={{ position: 'relative' }}>
        <input className="input" placeholder="Buscar por nombre..." value={userSearch} onChange={e => setUserSearch(e.target.value)} autoFocus />
        {usersLoading && <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)' }}><div className="loading-orb" style={{ width: 16, height: 16 }} /></div>}
        {userSearch && !usersLoading && (
          <button onClick={() => setUserSearch('')} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 16 }}>✕</button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {users.map(u => {
          const mood    = MOODS.find(m => m.id === u?.mood_id) || MOODS[0]
          const isOpen  = expanded === u.id
          const userWarnings = warnings[u.id] || []

          return (
            <div key={u.id} className="card" style={{ padding: '14px 16px', opacity: u.banned ? 0.65 : 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: `${mood.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{mood.emoji}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 500, fontSize: 14 }}>{u.display_name}</span>
                    <span style={{ fontSize: 12, color: 'var(--text3)' }}>{u.age}a</span>
                    {u.role === 'admin' && <Badge color="var(--accent)">admin</Badge>}
                    {u.banned && <Badge color="var(--red)">baneado</Badge>}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>
                    Registro: {new Date(u.created_at).toLocaleDateString('es-ES')}
                    {u.banned_reason && ` · ${u.banned_reason}`}
                  </div>
                </div>
                <button
                  onClick={() => { setExpanded(isOpen ? null : u.id); if (!isOpen) loadWarnings(u.id) }}
                  style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 18, padding: 4, transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' }}
                >▾</button>
              </div>

              {/* Expanded */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                    <div style={{ paddingTop: 14, borderTop: '1px solid var(--border)', marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {/* Warnings history */}
                      {userWarnings.length > 0 && (
                        <div style={{ padding: '10px 12px', borderRadius: 'var(--radius-xs)', background: 'rgba(252,211,77,0.06)', border: '1px solid rgba(252,211,77,0.2)' }}>
                          <p style={{ fontSize: 11, color: 'var(--gold)', fontWeight: 600, marginBottom: 8 }}>⚠️ {userWarnings.length} advertencia{userWarnings.length > 1 ? 's' : ''}</p>
                          {userWarnings.map(w => (
                            <div key={w.id} style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 4 }}>
                              · {w.reason} <span style={{ color: 'var(--text3)' }}>({new Date(w.created_at).toLocaleDateString('es-ES')})</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {u.banned ? (
                          <button className="btn btn-ghost" style={{ fontSize: 12, padding: '8px 14px' }} onClick={() => handleUnban(u)}>✅ Desbanear</button>
                        ) : u.role !== 'admin' ? (
                          <>
                            <button onClick={() => setWarnTarget(u)} style={{ fontSize: 12, padding: '8px 14px', borderRadius: 100, border: '1px solid rgba(252,211,77,0.3)', background: 'rgba(252,211,77,0.08)', color: 'var(--gold)', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                              ⚠️ Advertir
                            </button>
                            <button onClick={() => setBanTarget(u)} style={{ fontSize: 12, padding: '8px 14px', borderRadius: 100, border: '1px solid rgba(251,113,133,0.3)', background: 'rgba(251,113,133,0.08)', color: 'var(--red)', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                              🚫 Banear
                            </button>
                          </>
                        ) : null}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
        {!usersLoading && users.length === 0 && <EmptyMsg text="Sin resultados" />}
      </div>

      {/* Ban modal */}
      <Modal show={!!banTarget} onClose={() => { setBanTarget(null); setBanReason('') }}>
        <div style={{ fontSize: 36, textAlign: 'center', marginBottom: 8 }}>🚫</div>
        <h3 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 20, marginBottom: 6, textAlign: 'center' }}>Banear a {banTarget?.display_name}</h3>
        <input className="input" placeholder="Motivo del ban..." value={banReason} onChange={e => setBanReason(e.target.value)} />
        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => { setBanTarget(null); setBanReason('') }}>Cancelar</button>
          <button className="btn btn-primary" style={{ flex: 1, background: 'var(--red)', boxShadow: 'none' }} onClick={handleBan} disabled={!banReason.trim() || processing}>
            {processing ? '...' : 'Confirmar'}
          </button>
        </div>
      </Modal>

      {/* Warn modal */}
      <Modal show={!!warnTarget} onClose={() => { setWarnTarget(null); setWarnReason('') }}>
        <div style={{ fontSize: 36, textAlign: 'center', marginBottom: 8 }}>⚠️</div>
        <h3 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 20, marginBottom: 6, textAlign: 'center' }}>Advertir a {warnTarget?.display_name}</h3>
        <input className="input" placeholder="Motivo de la advertencia..." value={warnReason} onChange={e => setWarnReason(e.target.value)} />
        <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 6 }}>El usuario recibirá una notificación con este mensaje.</p>
        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => { setWarnTarget(null); setWarnReason('') }}>Cancelar</button>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleWarn} disabled={!warnReason.trim() || processing}>
            {processing ? '...' : 'Enviar aviso'}
          </button>
        </div>
      </Modal>
    </div>
  )
}

// ── REPORTS ───────────────────────────────────────────────────────────────────
function ReportsTab({ admin }) {
  const { reports, reportsLoading, resolveReport, banUser, warnUser } = admin
  const [filter, setFilter]       = useState('pending')
  const [processing, setProcessing] = useState(null)

  const filtered = reports.filter(r => filter === 'all' || r.status === filter)
  const statusColor = { pending: 'var(--gold)', resolved: 'var(--teal)', dismissed: 'var(--text3)' }

  async function handleAction(type, report) {
    setProcessing(report.id)
    if (type === 'dismiss')  await resolveReport(report.id, 'dismissed')
    if (type === 'resolve')  await resolveReport(report.id, 'resolved')
    if (type === 'warn') {
      await warnUser(report.reported_id, `Reporte: ${REASON_LABELS[report.reason]}`, report.id)
      await resolveReport(report.id, 'resolved')
      showToast({ message: 'Advertencia enviada', type: 'success' })
    }
    if (type === 'ban') {
      await banUser(report.reported_id, `Reporte: ${REASON_LABELS[report.reason]}`)
      await resolveReport(report.id, 'resolved')
      showToast({ message: `${report.reported?.display_name} baneado`, type: 'success' })
    }
    setProcessing(null)
  }

  if (reportsLoading) return <Loader />

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {['pending','resolved','dismissed','all'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '7px 14px', borderRadius: 100, fontSize: 12,
            border: `1px solid ${filter === f ? 'var(--accent)' : 'var(--border2)'}`,
            background: filter === f ? 'rgba(192,132,252,0.15)' : 'var(--surface)',
            color: filter === f ? 'var(--accent)' : 'var(--text3)',
            cursor: 'pointer', fontFamily: 'var(--font-body)',
          }}>
            {{ pending: 'Pendientes', resolved: 'Resueltos', dismissed: 'Descartados', all: 'Todos' }[f]}
            {f === 'pending' && reports.filter(r => r.status === 'pending').length > 0 && (
              <span style={{ marginLeft: 5, background: 'var(--red)', color: 'white', borderRadius: 100, padding: '1px 5px', fontSize: 9 }}>
                {reports.filter(r => r.status === 'pending').length}
              </span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 && <EmptyMsg text={filter === 'pending' ? 'No hay reportes pendientes 🎉' : 'Sin reportes'} />}

      {filtered.map(r => (
        <div key={r.id} className="card" style={{ padding: 16, borderColor: r.status === 'pending' ? 'rgba(251,113,133,0.2)' : 'var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--red)' }}>{REASON_LABELS[r.reason] || r.reason}</span>
            <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 100, background: `${statusColor[r.status]}22`, color: statusColor[r.status], fontWeight: 600 }}>{r.status}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: r.details ? 10 : 0 }}>
            <InfoBox label="REPORTADO POR" value={r.reporter?.display_name} />
            <InfoBox label="REPORTADO" value={r.reported?.display_name} accent={r.reported?.banned} />
          </div>
          {r.details && <p style={{ fontSize: 13, color: 'var(--text2)', fontStyle: 'italic', padding: '10px 12px', background: 'var(--bg3)', borderRadius: 'var(--radius-xs)', borderLeft: '2px solid var(--border2)', marginBottom: 10 }}>"{r.details}"</p>}
          <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: r.status === 'pending' ? 12 : 0 }}>
            {new Date(r.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
          </div>
          {r.status === 'pending' && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <ActionBtn onClick={() => handleAction('dismiss', r)} disabled={processing === r.id} color="var(--text3)">Descartar</ActionBtn>
              <ActionBtn onClick={() => handleAction('resolve', r)}  disabled={processing === r.id} color="var(--teal)">Resolver</ActionBtn>
              {!r.reported?.banned && (
                <>
                  <ActionBtn onClick={() => handleAction('warn', r)} disabled={processing === r.id} color="var(--gold)">⚠️ Advertir</ActionBtn>
                  <ActionBtn onClick={() => handleAction('ban', r)}  disabled={processing === r.id} color="var(--red)">🚫 Banear</ActionBtn>
                </>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ── CONVERSATIONS ─────────────────────────────────────────────────────────────
function ConversationsTab({ admin }) {
  const { conversations, convsLoading, activeConv, activeConvMessages, fetchConversations, fetchConvMessages, deleteMessage } = admin
  const [search, setSearch] = useState('')

  useEffect(() => {
    const t = setTimeout(() => fetchConversations(search), 300)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => { fetchConversations() }, [])

  if (activeConv) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button onClick={() => admin.fetchConvMessages(null)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-body)', alignSelf: 'flex-start', padding: '4px 0' }}>← Volver</button>
        <p style={{ fontSize: 11, color: 'var(--text3)' }}>{activeConvMessages.length} mensajes · toca para eliminar</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {activeConvMessages.map(m => (
            <div key={m.id} style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--surface)', border: '1px solid var(--border)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, color: 'var(--accent)', marginBottom: 4, fontWeight: 600 }}>{m.sender?.display_name}</div>
                <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.5, wordBreak: 'break-word' }}>{m.content}</div>
                <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 4 }}>{new Date(m.created_at).toLocaleString('es-ES')}</div>
              </div>
              <button
                onClick={() => { if (confirm('¿Eliminar este mensaje?')) deleteMessage(m.id) }}
                style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 16, flexShrink: 0, padding: 4 }}
              >🗑️</button>
            </div>
          ))}
          {activeConvMessages.length === 0 && <EmptyMsg text="Sin mensajes" />}
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ position: 'relative' }}>
        <input className="input" placeholder="Buscar por nombre de usuario..." value={search} onChange={e => setSearch(e.target.value)} />
        {convsLoading && <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)' }}><div className="loading-orb" style={{ width: 16, height: 16 }} /></div>}
      </div>
      {conversations.map(c => (
        <div key={c.id} className="card" style={{ padding: '14px 16px', cursor: 'pointer' }} onClick={() => fetchConvMessages(c.id)}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
            <div>
              <span style={{ fontWeight: 500, fontSize: 14 }}>{c.sender_name}</span>
              <span style={{ color: 'var(--text3)', margin: '0 6px' }}>↔</span>
              <span style={{ fontWeight: 500, fontSize: 14 }}>{c.receiver_name}</span>
            </div>
            <span style={{ fontSize: 11, color: 'var(--accent)', background: 'rgba(192,132,252,0.1)', padding: '2px 8px', borderRadius: 100 }}>{c.message_count} msgs</span>
          </div>
          {c.last_message && <p style={{ fontSize: 12, color: 'var(--text3)', fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>"{c.last_message}"</p>}
          <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>{c.matched_at ? new Date(c.matched_at).toLocaleDateString('es-ES') : '—'}</p>
        </div>
      ))}
      {!convsLoading && conversations.length === 0 && <EmptyMsg text="Sin conversaciones" />}
    </div>
  )
}

// ── BROADCAST ─────────────────────────────────────────────────────────────────
function BroadcastTab({ admin }) {
  const { sendBroadcast } = admin
  const [title, setTitle]       = useState('')
  const [body, setBody]         = useState('')
  const [sending, setSending]   = useState(false)
  const [preview, setPreview]   = useState(false)
  const [lastSent, setLastSent] = useState(null)

  async function handleSend() {
    if (!title.trim() || !body.trim()) return
    setSending(true)
    const { count, error } = await sendBroadcast(title.trim(), body.trim())
    setSending(false)
    if (error) {
      showToast({ message: 'Error al enviar', type: 'error' })
    } else {
      showToast({ message: `Enviado a ${count} usuarios ✓`, type: 'success' })
      setLastSent({ title, body, count, time: new Date() })
      setTitle(''); setBody(''); setPreview(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ padding: '14px 16px', borderRadius: 'var(--radius-sm)', background: 'rgba(192,132,252,0.08)', border: '1px solid rgba(192,132,252,0.2)', fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>
        📣 Envía una notificación a <strong>todos los usuarios activos</strong> no baneados. Úsalo con criterio.
      </div>

      <div>
        <label style={{ fontSize: 12, color: 'var(--text3)', display: 'block', marginBottom: 6 }}>Título</label>
        <input className="input" placeholder="Ej: Nueva funcionalidad disponible" value={title} onChange={e => setTitle(e.target.value)} maxLength={80} />
        <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4, textAlign: 'right' }}>{title.length}/80</div>
      </div>

      <div>
        <label style={{ fontSize: 12, color: 'var(--text3)', display: 'block', marginBottom: 6 }}>Mensaje</label>
        <textarea className="input" rows={4} placeholder="Escribe el mensaje aquí..." value={body} onChange={e => setBody(e.target.value)} style={{ resize: 'none' }} maxLength={300} />
        <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4, textAlign: 'right' }}>{body.length}/300</div>
      </div>

      {/* Preview */}
      {title && body && (
        <div style={{ padding: '14px 16px', borderRadius: 'var(--radius-sm)', background: 'var(--surface2)', border: '1px solid var(--border2)' }}>
          <p style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Vista previa</p>
          <div style={{ display: 'flex', gap: 10 }}>
            <span style={{ fontSize: 18 }}>📣</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 3 }}>{title}</div>
              <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>{body}</div>
            </div>
          </div>
        </div>
      )}

      <button
        className="btn btn-primary"
        onClick={handleSend}
        disabled={!title.trim() || !body.trim() || sending}
        style={{ width: '100%' }}
      >
        {sending ? 'Enviando...' : '📣 Enviar a todos'}
      </button>

      {lastSent && (
        <div style={{ padding: '12px 16px', borderRadius: 'var(--radius-sm)', background: 'rgba(94,234,212,0.08)', border: '1px solid rgba(94,234,212,0.2)', fontSize: 13, color: 'var(--teal)' }}>
          ✓ Último envío: <strong>{lastSent.title}</strong> → {lastSent.count} usuarios · {lastSent.time.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
        </div>
      )}
    </div>
  )
}

// ── LOGS ──────────────────────────────────────────────────────────────────────
function LogsTab({ admin }) {
  const { logs, logsLoading, fetchLogs } = admin

  useEffect(() => { fetchLogs() }, [])

  if (logsLoading) return <Loader />

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <p style={{ fontSize: 12, color: 'var(--text3)' }}>{logs.length} acciones recientes</p>
        <button className="btn btn-ghost" style={{ fontSize: 12, padding: '7px 14px' }} onClick={fetchLogs}>Actualizar</button>
      </div>
      {logs.length === 0 && <EmptyMsg text="Sin acciones registradas" />}
      {logs.map(l => (
        <div key={l.id} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border)', alignItems: 'flex-start' }}>
          <div style={{ fontSize: 18, flexShrink: 0 }}>{LOG_LABELS[l.action]?.split(' ')[0] || '📋'}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>
              {LOG_LABELS[l.action] || l.action}
              {l.details?.reason && <span style={{ color: 'var(--text3)', fontWeight: 400 }}> · {l.details.reason}</span>}
              {l.details?.title  && <span style={{ color: 'var(--text3)', fontWeight: 400 }}> "{l.details.title}"</span>}
              {l.details?.recipients && <span style={{ color: 'var(--text3)', fontWeight: 400 }}> → {l.details.recipients} usuarios</span>}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>
              por {l.admin?.display_name || 'admin'} · {new Date(l.created_at).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── SHARED COMPONENTS ─────────────────────────────────────────────────────────
function Loader() {
  return <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div className="loading-orb" style={{ width: 32, height: 32 }} /></div>
}

function EmptyMsg({ text }) {
  return <p style={{ color: 'var(--text3)', fontSize: 13, textAlign: 'center', padding: '32px 0' }}>{text}</p>
}

function Badge({ color, children }) {
  return <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 100, background: `${color}22`, color }}>{children}</span>
}

function InfoBox({ label, value, accent }) {
  return (
    <div style={{ padding: '8px 10px', borderRadius: 'var(--radius-xs)', background: accent ? 'rgba(251,113,133,0.06)' : 'var(--bg3)' }}>
      <div style={{ fontSize: 9, color: accent ? 'var(--red)' : 'var(--text3)', marginBottom: 3, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 500 }}>{value || '—'}</div>
    </div>
  )
}

function ActionBtn({ onClick, disabled, color, children }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{ fontSize: 12, padding: '7px 14px', borderRadius: 100, border: `1px solid ${color}44`, background: `${color}11`, color, cursor: 'pointer', fontFamily: 'var(--font-body)', opacity: disabled ? 0.5 : 1 }}>
      {children}
    </button>
  )
}

function Modal({ show, onClose, children }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(10,8,18,0.85)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}
          onClick={e => e.target === e.currentTarget && onClose()}
        >
          <motion.div initial={{ scale: 0.92 }} animate={{ scale: 1 }} exit={{ scale: 0.92 }}
            style={{ background: 'var(--bg2)', borderRadius: 'var(--radius)', padding: 28, border: '1px solid var(--border2)', maxWidth: 340, width: '100%', display: 'flex', flexDirection: 'column', gap: 14 }}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}