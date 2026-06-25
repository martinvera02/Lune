import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { useNotifications } from '@/hooks/useNotifications'
import { MOODS, DEEP_QUESTIONS } from '@/lib/constants'
import MoodSelector from '@/components/profile/MoodSelector'
import EditProfile  from '@/components/profile/EditProfile'

export default function ProfilePage() {
  const { profile, updateProfile, signOut } = useAuth()
  const { notifications, unread, markAllRead } = useNotifications()
  const [editMood, setEditMood]       = useState(false)
  const [editProfile, setEditProfile] = useState(false)
  const [showNotifs, setShowNotifs]   = useState(false)
  const [signingOut, setSigningOut]   = useState(false)

  if (!profile) return <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="loading-orb" /></div>

  const mood    = MOODS.find(m => m.id === profile.mood_id) || MOODS[0]
  const tags    = profile.cultural_tags || { music: [], film: [], books: [] }
  const allTags = [
    ...(tags.music || []).map(t => ({ label: t, icon: '🎵', cat: 'music' })),
    ...(tags.film  || []).map(t => ({ label: t, icon: '🎬', cat: 'film'  })),
    ...(tags.books || []).map(t => ({ label: t, icon: '📖', cat: 'books' })),
  ]
  const answers = profile.profile_answers || []

  async function handleMoodChange(m) { await updateProfile({ mood_id: m.id }); setEditMood(false) }
  async function handleSignOut() { setSigningOut(true); await signOut() }

  return (
    <div className="page-scroll">
      <div style={{ position: 'relative', height: 220 }}>
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${mood.color}44, #1c1728)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 80, overflow: 'hidden' }}>
          {profile.photo_url ? <img src={profile.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }} /> : <span style={{ opacity: 0.3 }}>🌙</span>}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent, var(--bg))' }} />
        </div>
        <div style={{ position: 'absolute', bottom: -44, left: 24, width: 88, height: 88, borderRadius: '50%', border: '3px solid var(--bg)', background: `${mood.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, boxShadow: '0 4px 20px rgba(0,0,0,0.5)', overflow: 'hidden' }}>
          {profile.photo_url ? <img src={profile.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : mood.emoji}
        </div>
        <button onClick={() => { setShowNotifs(s => !s); if (unread > 0) markAllRead() }} style={{ position: 'absolute', top: 16, right: 16, width: 40, height: 40, borderRadius: '50%', background: 'rgba(14,12,20,0.7)', backdropFilter: 'blur(10px)', border: '1px solid var(--border2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
          🔔{unread > 0 && <div style={{ position: 'absolute', top: -2, right: -2, width: 16, height: 16, borderRadius: '50%', background: 'var(--red)', fontSize: 9, fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{unread}</div>}
        </button>
      </div>

      {showNotifs && (
        <div style={{ margin: '60px 24px 0', padding: 16, borderRadius: 'var(--radius-sm)', background: 'var(--surface)', border: '1px solid var(--border2)' }}>
          <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--accent)', fontWeight: 600, marginBottom: 12 }}>Notificaciones</p>
          {notifications.length === 0
            ? <p style={{ color: 'var(--text3)', fontSize: 13, textAlign: 'center', padding: '16px 0' }}>Sin notificaciones</p>
            : notifications.slice(0, 10).map(n => (
              <div key={n.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)', display: 'flex', gap: 10 }}>
                <span style={{ fontSize: 16 }}>{n.type === 'new_message' ? '💬' : '💜'}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: n.read ? 400 : 600 }}>{n.title}</div>
                  {n.body && <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{n.body}</div>}
                </div>
              </div>
            ))
          }
        </div>
      )}

      <div style={{ padding: '56px 24px 40px', display: 'flex', flexDirection: 'column', gap: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 28 }}>{profile.display_name}</h2>
            <p style={{ color: 'var(--text3)', fontSize: 13, marginTop: 2 }}>{profile.age} años · Lune</p>
          </div>
          <button className="btn btn-ghost" style={{ padding: '10px 18px', fontSize: 13 }} onClick={() => setEditProfile(true)}>Editar</button>
        </div>

        <div>
          <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--accent)', fontWeight: 600, marginBottom: 10 }}>Mood de hoy</p>
          <button onClick={() => setEditMood(true)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 'var(--radius-sm)', background: 'var(--surface)', border: `1px solid ${mood.color}44`, cursor: 'pointer', width: '100%', textAlign: 'left', fontFamily: 'var(--font-body)' }}>
            <span style={{ fontSize: 22 }}>{mood.emoji}</span>
            <div><div style={{ fontWeight: 500, color: 'var(--text)', fontSize: 14 }}>{mood.label}</div><div style={{ fontSize: 12, color: 'var(--text3)' }}>{mood.desc}</div></div>
            <span style={{ marginLeft: 'auto', color: 'var(--text3)', fontSize: 12 }}>Cambiar →</span>
          </button>
        </div>

        {allTags.length > 0 && (
          <div>
            <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--accent)', fontWeight: 600, marginBottom: 10 }}>Gustos culturales</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {allTags.map(({ label, icon, cat }) => <span key={`${cat}-${label}`} className="tag">{icon} {label}</span>)}
            </div>
          </div>
        )}

        {answers.length > 0 && (
          <div>
            <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--accent)', fontWeight: 600, marginBottom: 10 }}>Tus respuestas</p>
            {answers.map(a => (
              <div key={a.id} style={{ padding: '14px 16px', borderRadius: 'var(--radius-sm)', background: 'var(--surface)', border: '1px solid var(--border)', marginBottom: 8 }}>
                <p style={{ fontSize: 12, color: 'var(--text3)', fontStyle: 'italic', marginBottom: 6 }}>{a.questions?.content || DEEP_QUESTIONS[0]}</p>
                <p style={{ fontSize: 14, lineHeight: 1.6 }}>{a.answer}</p>
              </div>
            ))}
          </div>
        )}

        {(profile.role === 'admin' || profile.role === 'moderator') && (
          <a href="/admin" style={{ display: 'block', textDecoration: 'none' }}>
            <button className="btn btn-ghost" style={{ width: '100%', marginBottom: 8 }}>
              🛡️ Panel de administración
            </button>
          </a>
        )}
        <button className="btn btn-ghost" onClick={handleSignOut} disabled={signingOut}>{signingOut ? 'Cerrando...' : 'Cerrar sesión'}</button>
      </div>

      <AnimatePresence>
        {editMood && <MoodSelector current={mood} onSelect={handleMoodChange} onClose={() => setEditMood(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {editProfile && <EditProfile onClose={() => setEditProfile(false)} />}
      </AnimatePresence>
    </div>
  )
}