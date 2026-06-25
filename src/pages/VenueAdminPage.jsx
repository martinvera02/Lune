import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useVenueAdmin } from '@/hooks/useVenueAdmin'
import { useAuth } from '@/context/AuthContext'
import { showToast } from '@/components/ui/Toast'
import { MOODS } from '@/lib/constants'
import { supabase } from '@/lib/supabase'

const TABS = [
  { id: 'dashboard', label: 'Dashboard',  icon: '📊' },
  { id: 'events',    label: 'Eventos',    icon: '🎉' },
  { id: 'live',      label: 'En directo', icon: '🟢' },
  { id: 'profile',   label: 'Perfil',     icon: '🏢' },
]

const VENUE_TYPES = {
  discoteca: '🪩 Discoteca',
  sala:      '🎸 Sala',
  bar:       '🍸 Bar',
  festival:  '🎪 Festival',
  club:      '🎶 Club',
  otro:      '🏢 Otro',
}

const VENUE_TYPE_LIST = [
  { id: 'discoteca', label: 'Discoteca', emoji: '🪩' },
  { id: 'sala',      label: 'Sala',      emoji: '🎸' },
  { id: 'bar',       label: 'Bar',       emoji: '🍸' },
  { id: 'festival',  label: 'Festival',  emoji: '🎪' },
  { id: 'club',      label: 'Club',      emoji: '🎶' },
  { id: 'otro',      label: 'Otro',      emoji: '🏢' },
]

export default function VenueAdminPage() {
  const { user, signOut } = useAuth()
  const admin = useVenueAdmin()
  const [tab, setTab] = useState('dashboard')

  if (admin.loading) return <div className="app-loading"><div className="loading-orb" /></div>

  if (!admin.isVenueOwner) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 32, textAlign: 'center' }}>
        <div style={{ fontSize: 48 }}>🔒</div>
        <h3 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 22 }}>Sin acceso</h3>
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
      <header style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--border)', background: 'rgba(14,12,20,0.9)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 100, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 12, color: 'var(--text3)', marginBottom: 2 }}>Lune for Venues</div>
            <div style={{ fontWeight: 600, fontSize: 17 }}>{admin.venue.name}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {liveEvent && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 100, background: 'rgba(94,234,212,0.1)', border: '1px solid rgba(94,234,212,0.3)', fontSize: 12, color: 'var(--teal)' }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--teal)' }} />
                En directo
              </div>
            )}
            <button onClick={signOut} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 12, fontFamily: 'var(--font-body)' }}>Salir</button>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 4, overflowX: 'auto', scrollbarWidth: 'none' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: '8px 14px', borderRadius: 100, border: 'none', whiteSpace: 'nowrap', flexShrink: 0,
              background: tab === t.id ? 'var(--surface2)' : 'transparent',
              color: tab === t.id ? 'var(--accent)' : 'var(--text3)',
              cursor: 'pointer', fontSize: 12, fontWeight: tab === t.id ? 600 : 400,
              fontFamily: 'var(--font-body)', transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', gap: 5,
            }}>
              {t.icon} {t.label}
              {t.id === 'live' && liveEvent && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--teal)' }} />}
            </button>
          ))}
        </div>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px 40px' }}>
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
            {tab === 'dashboard' && <DashboardTab admin={admin} liveEvent={liveEvent} setTab={setTab} />}
            {tab === 'events'    && <EventsTab    admin={admin} />}
            {tab === 'live'      && <LiveTab      admin={admin} liveEvent={liveEvent} />}
            {tab === 'profile'   && <ProfileTab   admin={admin} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
function DashboardTab({ admin, liveEvent, setTab }) {
  const { venue, stats, events } = admin

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {liveEvent && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          style={{ padding: '16px 18px', borderRadius: 'var(--radius)', background: 'linear-gradient(135deg, rgba(94,234,212,0.12), rgba(192,132,252,0.08))', border: '1px solid rgba(94,234,212,0.3)', cursor: 'pointer' }}
          onClick={() => setTab('live')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--teal)' }} />
            <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--teal)' }}>Evento en curso</span>
            <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text3)' }}>Ver en directo →</span>
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 18, marginBottom: 6 }}>{liveEvent.event_name}</div>
          <div style={{ display: 'flex', gap: 16, fontSize: 13 }}>
            <span style={{ color: 'var(--teal)' }}>👥 {liveEvent.attendees}</span>
            <span style={{ color: 'var(--pink)' }}>💜 {liveEvent.matches}</span>
            <span style={{ color: 'var(--gold)' }}>💬 {liveEvent.messages}</span>
          </div>
        </motion.div>
      )}

      <div style={{ padding: '14px 16px', borderRadius: 'var(--radius-sm)', background: 'var(--surface)', border: '1px solid var(--border2)', display: 'flex', alignItems: 'center', gap: 12 }}>
        {venue.logo_url
          ? <img src={venue.logo_url} alt="" style={{ width: 48, height: 48, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
          : <div style={{ width: 48, height: 48, borderRadius: 10, background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>🏢</div>
        }
        <div>
          <div style={{ fontWeight: 600, fontSize: 15 }}>{venue.name}</div>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>
            {VENUE_TYPES[venue.venue_type] || venue.venue_type} · {venue.city}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {[
          { icon: '🎉', label: 'Eventos',    value: stats.totalEvents,    color: 'var(--accent)' },
          { icon: '👥', label: 'Asistentes', value: stats.totalAttendees, color: 'var(--teal)'   },
          { icon: '💜', label: 'Matches',    value: stats.totalMatches,   color: 'var(--pink)'   },
          { icon: '💬', label: 'Mensajes',   value: stats.totalMessages,  color: 'var(--gold)'   },
        ].map(k => (
          <div key={k.label} className="card" style={{ padding: 14, textAlign: 'center' }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>{k.icon}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 24, color: k.color }}>{k.value}</div>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{k.label}</div>
          </div>
        ))}
      </div>

      {events.slice(0, 3).length > 0 && (
        <div>
          <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--accent)', fontWeight: 600, marginBottom: 12 }}>Últimos eventos</p>
          {events.slice(0, 3).map(e => <EventCard key={e.event_id} event={e} compact />)}
        </div>
      )}
    </div>
  )
}

// ── EVENTS ────────────────────────────────────────────────────────────────────
function EventsTab({ admin }) {
  const [showCreate, setShowCreate] = useState(false)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ fontSize: 14, color: 'var(--text2)' }}>{admin.events.length} eventos</p>
        <button className="btn btn-primary" style={{ padding: '10px 18px', fontSize: 13 }} onClick={() => setShowCreate(true)}>
          + Nuevo evento
        </button>
      </div>

      {admin.events.length === 0
        ? <EmptyState icon="🎉" title="Sin eventos todavía" text="Crea tu primer evento para empezar" />
        : admin.events.map(e => <EventCard key={e.event_id} event={e} onToggle={(id, active) => admin.toggleEventActive(id, active)} />)
      }

      <AnimatePresence>
        {showCreate && <CreateEventModal admin={admin} onClose={() => setShowCreate(false)} />}
      </AnimatePresence>
    </div>
  )
}

function EventCard({ event, compact, onToggle }) {
  const now     = new Date()
  const started = new Date(event.starts_at) <= now
  const ended   = new Date(event.ends_at) < now
  const isLive  = started && !ended && event.active

  const statusColor = isLive ? 'var(--teal)' : ended ? 'var(--text3)' : 'var(--gold)'
  const statusLabel = isLive ? '🟢 En directo' : ended ? 'Finalizado' : '⏳ Programado'

  return (
    <div className="card" style={{ padding: '14px 16px', marginBottom: compact ? 0 : 0 }}>
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
              <button onClick={() => onToggle(event.event_id, !event.active)} style={{ fontSize: 12, padding: '6px 14px', borderRadius: 100, border: `1px solid ${event.active ? 'rgba(251,113,133,0.3)' : 'var(--border2)'}`, background: event.active ? 'rgba(251,113,133,0.08)' : 'var(--surface)', color: event.active ? 'var(--red)' : 'var(--text3)', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
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

  if (!liveEvent) return <EmptyState icon="🌙" title="Sin evento activo" text="Cuando tengas un evento en curso, aquí verás quién está dentro en tiempo real." />

  async function handleOpen() {
    await admin.openEvent(liveEvent)
    setLoaded(true)
  }

  if (!loaded) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ padding: '18px', borderRadius: 'var(--radius)', background: 'rgba(94,234,212,0.08)', border: '1px solid rgba(94,234,212,0.2)' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--teal)' }} />
          <span style={{ fontWeight: 600, fontSize: 15 }}>{liveEvent.event_name}</span>
        </div>
        <div style={{ display: 'flex', gap: 16, fontSize: 13 }}>
          <span style={{ color: 'var(--teal)' }}>👥 {liveEvent.attendees}</span>
          <span style={{ color: 'var(--pink)' }}>💜 {liveEvent.matches}</span>
        </div>
        <div style={{ marginTop: 10, padding: '8px 12px', borderRadius: 'var(--radius-xs)', background: 'var(--bg3)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>🎫</span>
          <span style={{ fontFamily: 'monospace', fontWeight: 700, letterSpacing: 2, color: 'var(--accent2)' }}>{liveEvent.qr_code}</span>
        </div>
      </div>
      <button className="btn btn-primary" onClick={handleOpen} style={{ width: '100%' }}>🟢 Ver asistentes en tiempo real</button>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 13, color: 'var(--teal)', fontWeight: 600 }}>🟢 {admin.attendees.length} personas dentro</div>
        <button onClick={admin.closeEvent} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-body)' }}>Cerrar</button>
      </div>
      {admin.attendees.length === 0
        ? <p style={{ color: 'var(--text3)', fontSize: 13, textAlign: 'center', padding: '32px 0' }}>Aún no hay nadie · código: <strong style={{ color: 'var(--accent2)' }}>{liveEvent.qr_code}</strong></p>
        : admin.attendees.map((a, i) => {
            const mood = MOODS.find(m => m.id === a?.mood_id) || MOODS[0]
            return (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 'var(--radius-sm)', background: 'var(--surface)', border: '1px solid var(--border)' }}
              >
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: `${mood.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{mood.emoji}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>{a.display_name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 1 }}>{a.age}a · {mood.label}</div>
                </div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: 90 }}>
                  {Object.values(a.cultural_tags || {}).flat().slice(0, 2).map(t => (
                    <span key={t} style={{ fontSize: 10, padding: '2px 7px', borderRadius: 100, background: 'var(--bg3)', color: 'var(--text3)', border: '1px solid var(--border)' }}>{t}</span>
                  ))}
                </div>
              </motion.div>
            )
          })
      }
    </div>
  )
}

// ── PROFILE ───────────────────────────────────────────────────────────────────
function ProfileTab({ admin }) {
  const { venue, updateVenue } = admin
  const { user } = useAuth()
  const [saving, setSaving]       = useState(false)
  const [uploadingLogo, setUploadingLogo]   = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)

  const [form, setForm] = useState({
    name:          venue?.name          || '',
    description:   venue?.description   || '',
    venue_type:    venue?.venue_type    || 'discoteca',
    address:       venue?.address       || '',
    city:          venue?.city          || '',
    contact_email: venue?.contact_email || '',
    contact_phone: venue?.contact_phone || '',
    instagram:     venue?.instagram     || '',
    website:       venue?.website       || '',
  })

  function update(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function uploadImage(file, type) {
    if (!file || !user) return null
    const ext  = file.name.split('.').pop()
    const path = `${user.id}/${type}.${ext}`
    const set  = type === 'logo' ? setUploadingLogo : setUploadingCover

    set(true)
    const { error } = await supabase.storage.from('venues').upload(path, file, { upsert: true, contentType: file.type })
    set(false)

    if (error) { showToast({ message: 'Error al subir imagen', type: 'error' }); return null }
    const { data } = supabase.storage.from('venues').getPublicUrl(path)
    return `${data.publicUrl}?t=${Date.now()}`
  }

  async function handleLogoChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = await uploadImage(file, 'logo')
    if (url) await updateVenue({ logo_url: url })
  }

  async function handleCoverChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = await uploadImage(file, 'cover')
    if (url) await updateVenue({ cover_url: url })
  }

  async function handleSave() {
    setSaving(true)
    const { error } = await updateVenue(form)
    if (error) showToast({ message: 'Error al guardar', type: 'error' })
    else showToast({ message: 'Cambios guardados ✓', type: 'success' })
    setSaving(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Cover photo */}
      <div>
        <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--accent)', fontWeight: 600, marginBottom: 10 }}>Foto de portada</p>
        <label style={{ display: 'block', cursor: 'pointer', position: 'relative' }}>
          <div style={{
            height: 140, borderRadius: 'var(--radius)', overflow: 'hidden',
            background: venue?.cover_url ? 'transparent' : 'var(--surface)',
            border: '2px dashed var(--border2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {venue?.cover_url
              ? <img src={venue.cover_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ textAlign: 'center', color: 'var(--text3)' }}>
                  <div style={{ fontSize: 32, marginBottom: 6 }}>🖼️</div>
                  <div style={{ fontSize: 13 }}>{uploadingCover ? 'Subiendo...' : 'Subir portada'}</div>
                </div>
            }
            {venue?.cover_url && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.opacity = 1}
                onMouseLeave={e => e.currentTarget.style.opacity = 0}
              >
                <span style={{ color: 'white', fontSize: 13, fontWeight: 500 }}>Cambiar portada</span>
              </div>
            )}
          </div>
          <input type="file" accept="image/*" onChange={handleCoverChange} style={{ display: 'none' }} />
        </label>
      </div>

      {/* Logo */}
      <div>
        <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--accent)', fontWeight: 600, marginBottom: 10 }}>Logo</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <label style={{ cursor: 'pointer', flexShrink: 0 }}>
            <div style={{ width: 72, height: 72, borderRadius: 14, overflow: 'hidden', background: 'var(--surface)', border: '2px dashed var(--border2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
              {venue?.logo_url
                ? <img src={venue.logo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : '🏢'
              }
            </div>
            <input type="file" accept="image/*" onChange={handleLogoChange} style={{ display: 'none' }} />
          </label>
          <div>
            <p style={{ fontSize: 13, fontWeight: 500 }}>{uploadingLogo ? 'Subiendo...' : 'Toca para cambiar el logo'}</p>
            <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>PNG o JPG · Cuadrado recomendado</p>
          </div>
        </div>
      </div>

      {/* Basic info */}
      <div>
        <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--accent)', fontWeight: 600, marginBottom: 12 }}>Información básica</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Field label="Nombre del local">
            <input className="input" value={form.name} onChange={e => update('name', e.target.value)} />
          </Field>
          <Field label="Tipo de local">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 7 }}>
              {VENUE_TYPE_LIST.map(t => (
                <button key={t.id} onClick={() => update('venue_type', t.id)} style={{
                  padding: '9px 6px', borderRadius: 'var(--radius-sm)',
                  border: `1px solid ${form.venue_type === t.id ? 'var(--accent)' : 'var(--border2)'}`,
                  background: form.venue_type === t.id ? 'rgba(192,132,252,0.12)' : 'var(--surface)',
                  cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 11,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                  color: form.venue_type === t.id ? 'var(--accent2)' : 'var(--text2)',
                  transition: 'all 0.15s',
                }}>
                  <span style={{ fontSize: 18 }}>{t.emoji}</span>{t.label}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Ciudad">
            <input className="input" value={form.city} onChange={e => update('city', e.target.value)} />
          </Field>
          <Field label="Dirección">
            <input className="input" value={form.address} onChange={e => update('address', e.target.value)} />
          </Field>
          <Field label="Descripción">
            <textarea className="input" rows={3} value={form.description} onChange={e => update('description', e.target.value)} style={{ resize: 'none' }} />
          </Field>
        </div>
      </div>

      {/* Contact */}
      <div>
        <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--accent)', fontWeight: 600, marginBottom: 12 }}>Contacto</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Field label="Email de contacto">
            <input className="input" type="email" value={form.contact_email} onChange={e => update('contact_email', e.target.value)} />
          </Field>
          <Field label="Teléfono">
            <input className="input" type="tel" value={form.contact_phone} onChange={e => update('contact_phone', e.target.value)} />
          </Field>
        </div>
      </div>

      {/* Social */}
      <div>
        <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--accent)', fontWeight: 600, marginBottom: 12 }}>Redes sociales</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Field label="Instagram">
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)', fontSize: 14 }}>@</span>
              <input className="input" placeholder="salomondo" value={form.instagram} onChange={e => update('instagram', e.target.value)} style={{ paddingLeft: 30 }} />
            </div>
          </Field>
          <Field label="Sitio web">
            <input className="input" placeholder="https://salomondo.com" value={form.website} onChange={e => update('website', e.target.value)} />
          </Field>
        </div>
      </div>

      <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ width: '100%' }}>
        {saving ? 'Guardando...' : 'Guardar cambios'}
      </button>
    </div>
  )
}

// ── CREATE EVENT MODAL ────────────────────────────────────────────────────────
function CreateEventModal({ admin, onClose }) {
  const [name, setName]   = useState('')
  const [desc, setDesc]   = useState('')
  const [date, setDate]   = useState('')
  const [start, setStart] = useState('22:00')
  const [end, setEnd]     = useState('04:00')
  const [cap, setCap]     = useState('')
  const [saving, setSaving] = useState(false)

  async function handleCreate() {
    if (!name.trim() || !date) return
    setSaving(true)
    const startsAt = new Date(`${date}T${start}:00`)
    const endsAt   = new Date(`${date}T${end}:00`)
    if (endsAt <= startsAt) endsAt.setDate(endsAt.getDate() + 1)

    const { data, error } = await admin.createEvent({
      name: name.trim(), description: desc.trim(),
      startsAt: startsAt.toISOString(), endsAt: endsAt.toISOString(),
      maxCapacity: cap ? Number(cap) : null,
    })
    setSaving(false)
    if (error) showToast({ message: 'Error al crear el evento', type: 'error' })
    else { showToast({ message: `Evento creado · Código: ${data.qr_code} 🎉`, type: 'success' }); onClose() }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(10,8,18,0.85)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        style={{ width: '100%', maxWidth: 430, background: 'var(--bg2)', borderRadius: '28px 28px 0 0', padding: '32px 24px 48px', border: '1px solid var(--border2)', borderBottom: 'none', display: 'flex', flexDirection: 'column', gap: 14, maxHeight: '90dvh', overflowY: 'auto' }}
      >
        <div style={{ width: 40, height: 4, borderRadius: 4, background: 'var(--surface2)', margin: '-16px auto 4px' }} />
        <h3 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 22 }}>Nuevo evento</h3>

        <Field label="Nombre *"><input className="input" placeholder="Noche Indie Vol. 4" value={name} onChange={e => setName(e.target.value)} autoFocus /></Field>
        <Field label="Descripción"><textarea className="input" rows={2} placeholder="Una noche de conexiones reales..." value={desc} onChange={e => setDesc(e.target.value)} style={{ resize: 'none' }} /></Field>
        <Field label="Fecha *"><input className="input" type="date" value={date} onChange={e => setDate(e.target.value)} min={new Date().toISOString().split('T')[0]} /></Field>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Field label="Hora inicio"><input className="input" type="time" value={start} onChange={e => setStart(e.target.value)} /></Field>
          <Field label="Hora fin"><input className="input" type="time" value={end} onChange={e => setEnd(e.target.value)} /></Field>
        </div>

        <Field label="Aforo máximo (opcional)"><input className="input" type="number" placeholder="Sin límite" value={cap} onChange={e => setCap(e.target.value)} /></Field>

        <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-sm)', background: 'rgba(192,132,252,0.08)', border: '1px solid rgba(192,132,252,0.2)', fontSize: 13, color: 'var(--text2)' }}>
          🎫 Se generará un código QR único para este evento.
        </div>

        <button className="btn btn-primary" onClick={handleCreate} disabled={!name.trim() || !date || saving} style={{ width: '100%' }}>
          {saving ? 'Creando...' : 'Crear evento 🎉'}
        </button>
      </motion.div>
    </motion.div>
  )
}

// ── HELPERS ───────────────────────────────────────────────────────────────────
function Field({ label, children }) {
  return (
    <div>
      <label style={{ fontSize: 12, color: 'var(--text3)', display: 'block', marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  )
}

function EmptyState({ icon, title, text }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <div style={{ fontSize: 48 }}>{icon}</div>
      <h3 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 20 }}>{title}</h3>
      <p style={{ color: 'var(--text2)', fontSize: 14, lineHeight: 1.6, maxWidth: 240 }}>{text}</p>
    </div>
  )
}