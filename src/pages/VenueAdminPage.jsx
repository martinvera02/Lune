import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useVenueAdmin } from '@/hooks/useVenueAdmin'
import { useAuth } from '@/context/AuthContext'
import { showToast } from '@/components/ui/Toast'
import { MOODS } from '@/lib/constants'

const TABS = [
  { id: 'dashboard', label: 'Dashboard',  icon: '📊' },
  { id: 'events',    label: 'Eventos',    icon: '🎉' },
  { id: 'live',      label: 'En directo', icon: '🟢' },
  { id: 'settings',  label: 'Ajustes',   icon: '⚙️' },
]

export default function VenueAdminPage() {
  const { user, signOut } = useAuth()
  const admin = useVenueAdmin()
  const [tab, setTab] = useState('dashboard')

  if (admin.loading) {
    return <div className="app-loading"><div className="loading-orb" /></div>
  }

  if (!admin.isVenueOwner) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 32, textAlign: 'center' }}>
        <div style={{ fontSize: 48 }}>🔒</div>
        <h3 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 22 }}>
          Sin acceso
        </h3>
        <p style={{ color: 'var(--text2)', fontSize: 14, maxWidth: 280, lineHeight: 1.6 }}>
          Esta cuenta no está vinculada a ningún local. Contacta con el equipo de Lune.
        </p>
        <p style={{ fontSize: 12, color: 'var(--text3)' }}>{user?.email}</p>
        <button className="btn btn-ghost" onClick={signOut}>Cerrar sesión</button>
      </div>
    )
  }

  const liveEvent = admin.events.find(e => {
    const now = new Date()
    return e.active && new Date(e.starts_at) <= now && new Date(e.ends_at) >= now
  })

  return (
    <div style={{ maxWidth: 430, margin: '0 auto', minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{
        padding: '20px 24px 16px',
        borderBottom: '1px solid var(--border)',
        background: 'rgba(14,12,20,0.9)',
        backdropFilter: 'blur(20px)',
        position: 'sticky', top: 0, zIndex: 100,
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 13, color: 'var(--text3)', marginBottom: 2 }}>
              Lune for Venues
            </div>
            <div style={{ fontWeight: 600, fontSize: 18, color: 'var(--text)' }}>
              {admin.venue.name}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {liveEvent && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 100, background: 'rgba(94,234,212,0.1)', border: '1px solid rgba(94,234,212,0.3)', fontSize: 12, color: 'var(--teal)' }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--teal)', animation: 'pulseRing 1.5s ease-out infinite' }} />
                En directo
              </div>
            )}
            <button onClick={signOut} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-body)' }}>
              Salir
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginTop: 14, overflowX: 'auto', scrollbarWidth: 'none' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: '8px 14px', borderRadius: 100, border: 'none',
              background: tab === t.id ? 'var(--surface2)' : 'transparent',
              color: tab === t.id ? 'var(--accent)' : 'var(--text3)',
              cursor: 'pointer', fontSize: 12, fontWeight: tab === t.id ? 600 : 400,
              fontFamily: 'var(--font-body)', transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap', flexShrink: 0,
            }}>
              {t.icon} {t.label}
              {t.id === 'live' && liveEvent && (
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--teal)' }} />
              )}
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px 40px' }}>
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
            {tab === 'dashboard' && <DashboardTab admin={admin} liveEvent={liveEvent} setTab={setTab} />}
            {tab === 'events'    && <EventsTab    admin={admin} />}
            {tab === 'live'      && <LiveTab      admin={admin} liveEvent={liveEvent} />}
            {tab === 'settings'  && <SettingsTab  admin={admin} />}
          </motion.div>
        </AnimatePresence>
      </div>

      <style>{`
        @keyframes pulseRing {
          0%   { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(2.5); }
        }
      `}</style>
    </div>
  )
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
function DashboardTab({ admin, liveEvent, setTab }) {
  const { venue, stats, events } = admin
  const recentEvents = events.slice(0, 3)

  const planColors = { trial: 'var(--gold)', monthly: 'var(--teal)', pay_per_event: 'var(--accent)' }
  const planLabels = { trial: 'Trial', monthly: 'Mensual', pay_per_event: 'Por evento' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Live banner */}
      {liveEvent && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: '16px 18px',
            borderRadius: 'var(--radius)',
            background: 'linear-gradient(135deg, rgba(94,234,212,0.12), rgba(192,132,252,0.08))',
            border: '1px solid rgba(94,234,212,0.3)',
            cursor: 'pointer',
          }}
          onClick={() => setTab('live')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--teal)', flexShrink: 0 }} />
            <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--teal)' }}>Evento en curso</span>
            <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text3)' }}>Ver en directo →</span>
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 18, marginBottom: 6 }}>{liveEvent.event_name}</div>
          <div style={{ display: 'flex', gap: 16, fontSize: 13 }}>
            <span style={{ color: 'var(--teal)' }}>👥 {liveEvent.attendees} asistentes</span>
            <span style={{ color: 'var(--pink)' }}>💜 {liveEvent.matches} matches</span>
            <span style={{ color: 'var(--gold)' }}>💬 {liveEvent.messages} msgs</span>
          </div>
        </motion.div>
      )}

      {/* Plan */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: 'var(--radius-sm)', background: 'var(--surface)', border: '1px solid var(--border2)' }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 2 }}>Plan activo</div>
          <div style={{ fontWeight: 600, fontSize: 15 }}>{planLabels[venue.plan] || venue.plan}</div>
        </div>
        <span style={{ fontSize: 12, padding: '4px 12px', borderRadius: 100, background: `${planColors[venue.plan]}22`, color: planColors[venue.plan], border: `1px solid ${planColors[venue.plan]}44`, fontWeight: 600 }}>
          {planLabels[venue.plan] || venue.plan}
        </span>
      </div>

      {/* KPIs */}
      <div>
        <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--accent)', fontWeight: 600, marginBottom: 12 }}>Totales históricos</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { icon: '🎉', label: 'Eventos',    value: stats.totalEvents,    color: 'var(--accent)'  },
            { icon: '👥', label: 'Asistentes', value: stats.totalAttendees, color: 'var(--teal)'    },
            { icon: '💜', label: 'Matches',    value: stats.totalMatches,   color: 'var(--pink)'    },
            { icon: '💬', label: 'Mensajes',   value: stats.totalMessages,  color: 'var(--gold)'    },
          ].map(k => (
            <div key={k.label} className="card" style={{ padding: '14px', textAlign: 'center' }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>{k.icon}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 24, color: k.color }}>{k.value}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{k.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent events */}
      {recentEvents.length > 0 && (
        <div>
          <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--accent)', fontWeight: 600, marginBottom: 12 }}>Últimos eventos</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recentEvents.map(e => (
              <EventCard key={e.event_id} event={e} compact />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── EVENTS ────────────────────────────────────────────────────────────────────
function EventsTab({ admin }) {
  const [showCreate, setShowCreate] = useState(false)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ fontSize: 14, color: 'var(--text2)' }}>{admin.events.length} eventos totales</p>
        <button className="btn btn-primary" style={{ padding: '10px 18px', fontSize: 13 }} onClick={() => setShowCreate(true)}>
          + Nuevo evento
        </button>
      </div>

      {admin.events.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 48 }}>🎉</div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 20 }}>Sin eventos todavía</h3>
          <p style={{ color: 'var(--text2)', fontSize: 14 }}>Crea tu primer evento para empezar</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {admin.events.map(e => (
            <EventCard key={e.event_id} event={e} onToggle={(id, active) => admin.toggleEventActive(id, active)} />
          ))}
        </div>
      )}

      <AnimatePresence>
        {showCreate && <CreateEventModal admin={admin} onClose={() => setShowCreate(false)} />}
      </AnimatePresence>
    </div>
  )
}

function EventCard({ event, compact, onToggle }) {
  const now       = new Date()
  const started   = new Date(event.starts_at) <= now
  const ended     = new Date(event.ends_at) < now
  const isLive    = started && !ended && event.active

  const statusColor = isLive ? 'var(--teal)' : ended ? 'var(--text3)' : 'var(--gold)'
  const statusLabel = isLive ? '🟢 En directo' : ended ? 'Finalizado' : '⏳ Programado'

  return (
    <div className="card" style={{ padding: '14px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: compact ? 0 : 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 3 }}>{event.event_name}</div>
          <div style={{ fontSize: 11, color: 'var(--text3)' }}>
            {new Date(event.starts_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
        <span style={{ fontSize: 11, color: statusColor, fontWeight: 600, flexShrink: 0, marginLeft: 8 }}>{statusLabel}</span>
      </div>

      {!compact && (
        <>
          <div style={{ display: 'flex', gap: 14, fontSize: 13, margin: '10px 0', color: 'var(--text2)' }}>
            <span>👥 {event.attendees || 0}</span>
            <span>💜 {event.matches || 0}</span>
            <span>💬 {event.messages || 0}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 'var(--radius-xs)', background: 'var(--bg3)', fontSize: 13 }}>
              <span style={{ fontSize: 16 }}>🎫</span>
              <span style={{ fontFamily: 'monospace', fontWeight: 700, letterSpacing: 2, color: 'var(--accent2)' }}>{event.qr_code}</span>
            </div>
            {!ended && onToggle && (
              <button
                onClick={() => onToggle(event.event_id, !event.active)}
                style={{
                  fontSize: 12, padding: '6px 14px', borderRadius: 100,
                  border: `1px solid ${event.active ? 'rgba(251,113,133,0.3)' : 'var(--border2)'}`,
                  background: event.active ? 'rgba(251,113,133,0.08)' : 'var(--surface)',
                  color: event.active ? 'var(--red)' : 'var(--text3)',
                  cursor: 'pointer', fontFamily: 'var(--font-body)',
                }}
              >
                {event.active ? 'Desactivar' : 'Activar'}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}

// ── LIVE ──────────────────────────────────────────────────────────────────────
function LiveTab({ admin, liveEvent }) {
  const [loaded, setLoaded] = useState(false)

  if (!liveEvent) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
        <div style={{ fontSize: 56 }}>🌙</div>
        <h3 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 20 }}>Sin evento activo ahora</h3>
        <p style={{ color: 'var(--text2)', fontSize: 14, lineHeight: 1.6, maxWidth: 240 }}>
          Cuando tengas un evento en curso, aquí verás quién está dentro en tiempo real.
        </p>
      </div>
    )
  }

  async function handleOpen() {
    await admin.openEvent(liveEvent)
    setLoaded(true)
  }

  if (!loaded) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ padding: '18px', borderRadius: 'var(--radius)', background: 'rgba(94,234,212,0.08)', border: '1px solid rgba(94,234,212,0.2)' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--teal)', flexShrink: 0 }} />
            <span style={{ fontWeight: 600, fontSize: 15 }}>{liveEvent.event_name}</span>
          </div>
          <div style={{ display: 'flex', gap: 16, fontSize: 13 }}>
            <span style={{ color: 'var(--teal)' }}>👥 {liveEvent.attendees}</span>
            <span style={{ color: 'var(--pink)' }}>💜 {liveEvent.matches}</span>
            <span style={{ color: 'var(--gold)' }}>💬 {liveEvent.messages}</span>
          </div>
          <div style={{ marginTop: 10, padding: '8px 12px', borderRadius: 'var(--radius-xs)', background: 'var(--bg3)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>🎫</span>
            <span style={{ fontFamily: 'monospace', fontWeight: 700, letterSpacing: 2, color: 'var(--accent2)' }}>{liveEvent.qr_code}</span>
          </div>
        </div>
        <button className="btn btn-primary" onClick={handleOpen} style={{ width: '100%' }}>
          🟢 Ver asistentes en tiempo real
        </button>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontWeight: 600, fontSize: 15 }}>{liveEvent.event_name}</span>
          <div style={{ fontSize: 12, color: 'var(--teal)', marginTop: 2 }}>🟢 {admin.attendees.length} dentro ahora</div>
        </div>
        <button onClick={admin.closeEvent} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-body)' }}>
          Cerrar
        </button>
      </div>

      {admin.attendees.length === 0 ? (
        <p style={{ color: 'var(--text3)', fontSize: 13, textAlign: 'center', padding: '32px 0' }}>
          Aún no hay nadie. Comparte el código <strong style={{ color: 'var(--accent2)' }}>{liveEvent.qr_code}</strong>
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {admin.attendees.map((a, i) => {
            const mood = MOODS.find(m => m.id === a?.mood_id) || MOODS[0]
            return (
              <motion.div
                key={a.display_name + i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 'var(--radius-sm)', background: 'var(--surface)', border: '1px solid var(--border)' }}
              >
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: `${mood.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                  {mood.emoji}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>{a.display_name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 1 }}>
                    {a.age}a · {mood.label} · Entró {new Date(a.joined_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: 100 }}>
                  {Object.values(a.cultural_tags || {}).flat().slice(0, 2).map(t => (
                    <span key={t} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 100, background: 'var(--bg3)', color: 'var(--text3)', border: '1px solid var(--border)' }}>{t}</span>
                  ))}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── SETTINGS ──────────────────────────────────────────────────────────────────
function SettingsTab({ admin }) {
  const { venue, updateVenue } = admin
  const [name, setName]           = useState(venue?.name || '')
  const [description, setDesc]    = useState(venue?.description || '')
  const [address, setAddress]     = useState(venue?.address || '')
  const [city, setCity]           = useState(venue?.city || '')
  const [phone, setPhone]         = useState(venue?.contact_phone || '')
  const [saving, setSaving]       = useState(false)

  async function handleSave() {
    setSaving(true)
    const { error } = await updateVenue({ name, description, address, city, contact_phone: phone })
    if (error) showToast({ message: 'Error al guardar', type: 'error' })
    else showToast({ message: 'Cambios guardados ✓', type: 'success' })
    setSaving(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <label style={{ fontSize: 12, color: 'var(--text3)', display: 'block', marginBottom: 6 }}>Nombre del local</label>
        <input className="input" value={name} onChange={e => setName(e.target.value)} />
      </div>
      <div>
        <label style={{ fontSize: 12, color: 'var(--text3)', display: 'block', marginBottom: 6 }}>Descripción</label>
        <textarea className="input" rows={3} value={description} onChange={e => setDesc(e.target.value)} style={{ resize: 'none' }} />
      </div>
      <div>
        <label style={{ fontSize: 12, color: 'var(--text3)', display: 'block', marginBottom: 6 }}>Dirección</label>
        <input className="input" value={address} onChange={e => setAddress(e.target.value)} />
      </div>
      <div>
        <label style={{ fontSize: 12, color: 'var(--text3)', display: 'block', marginBottom: 6 }}>Ciudad</label>
        <input className="input" value={city} onChange={e => setCity(e.target.value)} />
      </div>
      <div>
        <label style={{ fontSize: 12, color: 'var(--text3)', display: 'block', marginBottom: 6 }}>Teléfono de contacto</label>
        <input className="input" type="tel" value={phone} onChange={e => setPhone(e.target.value)} />
      </div>

      <div style={{ padding: '12px 16px', borderRadius: 'var(--radius-sm)', background: 'var(--surface)', border: '1px solid var(--border2)', fontSize: 13 }}>
        <div style={{ color: 'var(--text3)', marginBottom: 4 }}>Plan actual</div>
        <div style={{ fontWeight: 600, color: 'var(--teal)' }}>{venue?.plan === 'monthly' ? '✓ Mensual — Eventos ilimitados' : venue?.plan === 'trial' ? '⏳ Trial' : venue?.plan}</div>
      </div>

      <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ width: '100%' }}>
        {saving ? 'Guardando...' : 'Guardar cambios'}
      </button>
    </div>
  )
}

// ── CREATE EVENT MODAL ────────────────────────────────────────────────────────
function CreateEventModal({ admin, onClose }) {
  const [name, setName]       = useState('')
  const [desc, setDesc]       = useState('')
  const [date, setDate]       = useState('')
  const [startTime, setStart] = useState('22:00')
  const [endTime, setEnd]     = useState('04:00')
  const [capacity, setCap]    = useState('')
  const [saving, setSaving]   = useState(false)

  async function handleCreate() {
    if (!name.trim() || !date) return
    setSaving(true)

    const startsAt = new Date(`${date}T${startTime}:00`)
    let   endsAt   = new Date(`${date}T${endTime}:00`)
    // Si endTime < startTime, el evento acaba al día siguiente
    if (endsAt <= startsAt) endsAt.setDate(endsAt.getDate() + 1)

    const { data, error } = await admin.createEvent({
      name:         name.trim(),
      description:  desc.trim(),
      startsAt:     startsAt.toISOString(),
      endsAt:       endsAt.toISOString(),
      maxCapacity:  capacity ? Number(capacity) : null,
    })

    setSaving(false)
    if (error) {
      showToast({ message: 'Error al crear el evento', type: 'error' })
    } else {
      showToast({ message: `Evento creado · Código: ${data.qr_code} 🎉`, type: 'success' })
      onClose()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(10,8,18,0.85)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        style={{ width: '100%', maxWidth: 430, background: 'var(--bg2)', borderRadius: '28px 28px 0 0', padding: '32px 24px 48px', border: '1px solid var(--border2)', borderBottom: 'none', display: 'flex', flexDirection: 'column', gap: 16, maxHeight: '90dvh', overflowY: 'auto' }}
      >
        <div style={{ width: 40, height: 4, borderRadius: 4, background: 'var(--surface2)', margin: '-16px auto 4px' }} />
        <h3 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 22 }}>Nuevo evento</h3>

        <div>
          <label style={{ fontSize: 12, color: 'var(--text3)', display: 'block', marginBottom: 6 }}>Nombre del evento *</label>
          <input className="input" placeholder="Noche Indie Vol. 4" value={name} onChange={e => setName(e.target.value)} autoFocus />
        </div>
        <div>
          <label style={{ fontSize: 12, color: 'var(--text3)', display: 'block', marginBottom: 6 }}>Descripción</label>
          <textarea className="input" rows={2} placeholder="Una noche de conexiones reales..." value={desc} onChange={e => setDesc(e.target.value)} style={{ resize: 'none' }} />
        </div>
        <div>
          <label style={{ fontSize: 12, color: 'var(--text3)', display: 'block', marginBottom: 6 }}>Fecha *</label>
          <input className="input" type="date" value={date} onChange={e => setDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text3)', display: 'block', marginBottom: 6 }}>Hora inicio</label>
            <input className="input" type="time" value={startTime} onChange={e => setStart(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text3)', display: 'block', marginBottom: 6 }}>Hora fin</label>
            <input className="input" type="time" value={endTime} onChange={e => setEnd(e.target.value)} />
          </div>
        </div>
        <div>
          <label style={{ fontSize: 12, color: 'var(--text3)', display: 'block', marginBottom: 6 }}>Aforo máximo (opcional)</label>
          <input className="input" type="number" placeholder="Sin límite" value={capacity} onChange={e => setCap(e.target.value)} min={1} />
        </div>

        <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-sm)', background: 'rgba(192,132,252,0.08)', border: '1px solid rgba(192,132,252,0.2)', fontSize: 13, color: 'var(--text2)' }}>
          🎫 Se generará automáticamente un código QR único para este evento.
        </div>

        <button className="btn btn-primary" onClick={handleCreate} disabled={!name.trim() || !date || saving} style={{ width: '100%' }}>
          {saving ? 'Creando...' : 'Crear evento 🎉'}
        </button>
      </motion.div>
    </motion.div>
  )
}