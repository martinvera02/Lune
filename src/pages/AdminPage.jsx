import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAdmin } from '@/hooks/useAdmin'
import { showToast } from '@/components/ui/Toast'
import { MOODS } from '@/lib/constants'

const TABS = [
  { id: 'metrics', label: 'Métricas',  icon: '📊' },
  { id: 'users',   label: 'Usuarios',  icon: '👥' },
  { id: 'reports', label: 'Reportes',  icon: '⚠️' },
]

const REASON_LABELS = {
  spam:          'Spam',
  inappropriate: 'Contenido inapropiado',
  harassment:    'Acoso',
  fake:          'Perfil falso',
  other:         'Otro',
}

export default function AdminPage({ onBack }) {
  const [tab, setTab] = useState('metrics')
  const admin = useAdmin()

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
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 24 }}>Panel Admin</h2>
            <p style={{ color: 'var(--text3)', fontSize: 12 }}>Lune Dashboard</p>
          </div>
          {admin.kpis?.pending_reports > 0 && (
            <div style={{ marginLeft: 'auto', padding: '5px 12px', borderRadius: 100, background: 'rgba(251,113,133,0.15)', border: '1px solid rgba(251,113,133,0.3)', fontSize: 12, color: 'var(--red)', fontWeight: 600 }}>
              ⚠️ {admin.kpis.pending_reports} reportes pendientes
            </div>
          )}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, background: 'var(--surface)', borderRadius: 100, padding: 4 }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                flex: 1, padding: '9px', borderRadius: 100, border: 'none',
                background: tab === t.id ? 'var(--surface2)' : 'transparent',
                color: tab === t.id ? 'var(--accent)' : 'var(--text3)',
                cursor: 'pointer', fontSize: 13, fontWeight: 500,
                fontFamily: 'var(--font-body)', transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px 40px' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            {tab === 'metrics' && <MetricsTab admin={admin} />}
            {tab === 'users'   && <UsersTab   admin={admin} />}
            {tab === 'reports' && <ReportsTab admin={admin} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

// ── METRICS TAB ───────────────────────────────────────────────────────────────

function MetricsTab({ admin }) {
  const { kpis, kpisLoading, metrics } = admin

  const kpiCards = kpis ? [
    { label: 'Usuarios totales',  value: kpis.total_users,    icon: '👥', color: 'var(--accent)' },
    { label: 'Nuevos (7 días)',   value: kpis.new_users_7d,   icon: '✨', color: 'var(--teal)'   },
    { label: 'Matches totales',   value: kpis.total_matches,  icon: '💜', color: 'var(--pink)'   },
    { label: 'Mensajes totales',  value: kpis.total_messages, icon: '💬', color: 'var(--gold)'   },
    { label: 'Reportes pendientes', value: kpis.pending_reports, icon: '⚠️', color: 'var(--red)' },
    { label: 'Usuarios baneados', value: kpis.banned_users,   icon: '🚫', color: 'var(--text3)'  },
  ] : []

  if (kpisLoading) return <LoadingState />

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {kpiCards.map(k => (
          <div key={k.label} className="card" style={{ padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>{k.icon}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 28, color: k.color }}>{k.value ?? '—'}</div>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Daily chart — simple bar visualization */}
      {metrics.users.length > 0 && (
        <div>
          <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--accent)', fontWeight: 600, marginBottom: 14 }}>
            Nuevos usuarios — últimos 30 días
          </p>
          <MiniBarChart data={metrics.users} valueKey="new_users" color="var(--accent)" />
        </div>
      )}

      {metrics.matches.length > 0 && (
        <div>
          <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--pink)', fontWeight: 600, marginBottom: 14 }}>
            Matches — últimos 30 días
          </p>
          <MiniBarChart data={metrics.matches} valueKey="matches" color="var(--pink)" />
        </div>
      )}

      {metrics.messages.length > 0 && (
        <div>
          <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--teal)', fontWeight: 600, marginBottom: 14 }}>
            Mensajes — últimos 30 días
          </p>
          <MiniBarChart data={metrics.messages} valueKey="messages" color="var(--teal)" />
        </div>
      )}
    </div>
  )
}

function MiniBarChart({ data, valueKey, color }) {
  const max = Math.max(...data.map(d => d[valueKey]), 1)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 80 }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${(d[valueKey] / max) * 100}%` }}
            transition={{ duration: 0.5, delay: i * 0.02 }}
            style={{ width: '100%', background: color, borderRadius: 3, minHeight: 3, opacity: 0.8 }}
          />
        </div>
      ))}
    </div>
  )
}

// ── USERS TAB ─────────────────────────────────────────────────────────────────

function UsersTab({ admin }) {
  const { users, usersLoading, userSearch, setUserSearch, fetchUsers, banUser, unbanUser } = admin
  const [banTarget, setBanTarget] = useState(null)
  const [banReason, setBanReason] = useState('')
  const [processing, setProcessing] = useState(false)

  // Búsqueda en tiempo real con debounce de 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(userSearch)
    }, 300)
    return () => clearTimeout(timer)
  }, [userSearch])

  async function handleBan() {
    if (!banReason.trim()) return
    setProcessing(true)
    const { error } = await banUser(banTarget.id, banReason.trim())
    if (error) showToast({ message: 'Error al banear', type: 'error' })
    else showToast({ message: `${banTarget.display_name} baneado`, type: 'success' })
    setBanTarget(null)
    setBanReason('')
    setProcessing(false)
  }

  async function handleUnban(user) {
    const { error } = await unbanUser(user.id)
    if (error) showToast({ message: 'Error', type: 'error' })
    else showToast({ message: `${user.display_name} desbaneado`, type: 'success' })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Search */}
      <div style={{ position: 'relative' }}>
        <input
          className="input"
          placeholder="Buscar por nombre..."
          value={userSearch}
          onChange={e => setUserSearch(e.target.value)}
          autoFocus
        />
        {usersLoading && (
          <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)' }}>
            <div className="loading-orb" style={{ width: 16, height: 16 }} />
          </div>
        )}
        {userSearch && !usersLoading && (
          <button
            onClick={() => setUserSearch('')}
            style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 16 }}
          >
            ✕
          </button>
        )}
      </div>

      {usersLoading ? <LoadingState /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {users.map(u => {
            const mood = MOODS.find(m => m.id === u.mood_id) || MOODS[0]
            return (
              <div key={u.id} className="card" style={{ padding: '14px 16px', opacity: u.banned ? 0.6 : 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: `${mood.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                    {mood.emoji}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 500, fontSize: 14 }}>{u.display_name}</span>
                      <span style={{ fontSize: 12, color: 'var(--text3)' }}>{u.age}a</span>
                      {u.role === 'admin' && <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 100, background: 'rgba(192,132,252,0.2)', color: 'var(--accent)' }}>admin</span>}
                      {u.banned && <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 100, background: 'rgba(251,113,133,0.2)', color: 'var(--red)' }}>baneado</span>}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>
                      {new Date(u.created_at).toLocaleDateString('es-ES')}
                      {u.banned && u.banned_reason && ` · ${u.banned_reason}`}
                    </div>
                  </div>
                  <div style={{ flexShrink: 0 }}>
                    {u.banned ? (
                      <button className="btn btn-ghost" style={{ padding: '7px 14px', fontSize: 12 }} onClick={() => handleUnban(u)}>
                        Desbanear
                      </button>
                    ) : u.role !== 'admin' ? (
                      <button
                        style={{ padding: '7px 14px', fontSize: 12, borderRadius: 100, border: '1px solid rgba(251,113,133,0.3)', background: 'rgba(251,113,133,0.08)', color: 'var(--red)', cursor: 'pointer', fontFamily: 'var(--font-body)' }}
                        onClick={() => setBanTarget(u)}
                      >
                        Banear
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            )
          })}
          {users.length === 0 && (
            <p style={{ color: 'var(--text3)', fontSize: 13, textAlign: 'center', padding: '32px 0' }}>Sin resultados</p>
          )}
        </div>
      )}

      {/* Ban modal */}
      <AnimatePresence>
        {banTarget && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(10,8,18,0.85)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}
          >
            <motion.div
              initial={{ scale: 0.92 }} animate={{ scale: 1 }} exit={{ scale: 0.92 }}
              style={{ background: 'var(--bg2)', borderRadius: 'var(--radius)', padding: 28, border: '1px solid var(--border2)', maxWidth: 340, width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}
            >
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 20, marginBottom: 4 }}>Banear a {banTarget.display_name}</h3>
                <p style={{ color: 'var(--text3)', fontSize: 13 }}>Esto bloqueará su acceso a la app.</p>
              </div>
              <input className="input" placeholder="Motivo del ban..." value={banReason} onChange={e => setBanReason(e.target.value)} />
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => { setBanTarget(null); setBanReason('') }}>Cancelar</button>
                <button
                  className="btn btn-primary"
                  style={{ flex: 1, background: 'var(--red)', boxShadow: 'none' }}
                  onClick={handleBan}
                  disabled={!banReason.trim() || processing}
                >
                  {processing ? '...' : 'Confirmar ban'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── REPORTS TAB ───────────────────────────────────────────────────────────────

function ReportsTab({ admin }) {
  const { reports, reportsLoading, resolveReport, banUser } = admin
  const [filter, setFilter] = useState('pending')
  const [processing, setProcessing] = useState(null)

  const filtered = reports.filter(r => filter === 'all' || r.status === filter)

  async function handleResolve(reportId, status) {
    setProcessing(reportId)
    const { error } = await resolveReport(reportId, status)
    if (error) showToast({ message: 'Error', type: 'error' })
    else showToast({ message: status === 'resolved' ? 'Resuelto' : 'Descartado', type: 'success' })
    setProcessing(null)
  }

  async function handleBanFromReport(report) {
    setProcessing(report.id)
    await banUser(report.reported_id, `Reporte: ${REASON_LABELS[report.reason] || report.reason}`)
    await resolveReport(report.id, 'resolved')
    showToast({ message: `${report.reported?.display_name} baneado`, type: 'success' })
    setProcessing(null)
  }

  const statusColor = { pending: 'var(--gold)', resolved: 'var(--teal)', dismissed: 'var(--text3)' }

  if (reportsLoading) return <LoadingState />

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Filter */}
      <div style={{ display: 'flex', gap: 6 }}>
        {['pending', 'resolved', 'dismissed', 'all'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '7px 14px', borderRadius: 100, fontSize: 12,
              border: `1px solid ${filter === f ? 'var(--accent)' : 'var(--border2)'}`,
              background: filter === f ? 'rgba(192,132,252,0.15)' : 'var(--surface)',
              color: filter === f ? 'var(--accent)' : 'var(--text3)',
              cursor: 'pointer', fontFamily: 'var(--font-body)', textTransform: 'capitalize',
            }}
          >
            {f === 'all' ? 'Todos' : f === 'pending' ? 'Pendientes' : f === 'resolved' ? 'Resueltos' : 'Descartados'}
            {f === 'pending' && reports.filter(r => r.status === 'pending').length > 0 && (
              <span style={{ marginLeft: 6, background: 'var(--red)', color: 'white', borderRadius: 100, padding: '1px 6px', fontSize: 10, fontWeight: 700 }}>
                {reports.filter(r => r.status === 'pending').length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Report cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.length === 0 && (
          <p style={{ color: 'var(--text3)', fontSize: 13, textAlign: 'center', padding: '32px 0' }}>
            {filter === 'pending' ? 'No hay reportes pendientes 🎉' : 'Sin reportes'}
          </p>
        )}
        {filtered.map(r => (
          <div key={r.id} className="card" style={{ padding: '16px', borderColor: r.status === 'pending' ? 'rgba(251,113,133,0.2)' : 'var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--red)' }}>
                    {REASON_LABELS[r.reason] || r.reason}
                  </span>
                  <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 100, background: `${statusColor[r.status]}22`, color: statusColor[r.status], fontWeight: 600 }}>
                    {r.status}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text3)' }}>
                  {new Date(r.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
              <div style={{ padding: '10px 12px', borderRadius: 'var(--radius-xs)', background: 'var(--bg3)' }}>
                <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 4 }}>REPORTADO POR</div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{r.reporter?.display_name}</div>
              </div>
              <div style={{ padding: '10px 12px', borderRadius: 'var(--radius-xs)', background: 'rgba(251,113,133,0.06)' }}>
                <div style={{ fontSize: 10, color: 'var(--red)', marginBottom: 4 }}>PERFIL REPORTADO</div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>
                  {r.reported?.display_name}
                  {r.reported?.banned && <span style={{ fontSize: 10, marginLeft: 6, color: 'var(--red)' }}>● baneado</span>}
                </div>
              </div>
            </div>

            {r.details && (
              <p style={{ fontSize: 13, color: 'var(--text2)', fontStyle: 'italic', marginBottom: 12, padding: '10px 12px', background: 'var(--bg3)', borderRadius: 'var(--radius-xs)', borderLeft: '2px solid var(--border2)' }}>
                "{r.details}"
              </p>
            )}

            {r.status === 'pending' && (
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className="btn btn-ghost"
                  style={{ flex: 1, fontSize: 12, padding: '9px' }}
                  onClick={() => handleResolve(r.id, 'dismissed')}
                  disabled={processing === r.id}
                >
                  Descartar
                </button>
                <button
                  className="btn btn-ghost"
                  style={{ flex: 1, fontSize: 12, padding: '9px', borderColor: 'var(--teal)', color: 'var(--teal)' }}
                  onClick={() => handleResolve(r.id, 'resolved')}
                  disabled={processing === r.id}
                >
                  Resolver
                </button>
                {!r.reported?.banned && (
                  <button
                    style={{ flex: 1, fontSize: 12, padding: '9px', borderRadius: 100, border: '1px solid rgba(251,113,133,0.3)', background: 'rgba(251,113,133,0.08)', color: 'var(--red)', cursor: 'pointer', fontFamily: 'var(--font-body)' }}
                    onClick={() => handleBanFromReport(r)}
                    disabled={processing === r.id}
                  >
                    {processing === r.id ? '...' : 'Banear'}
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function LoadingState() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
      <div className="loading-orb" style={{ width: 32, height: 32 }} />
    </div>
  )
}