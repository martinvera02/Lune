import { motion } from 'framer-motion'
import { MOODS, DEEP_QUESTIONS } from '@/lib/constants'

export default function PublicProfile({ profile, onClose, onWrite }) {
  const mood    = MOODS.find(m => m.id === profile.mood_id) || MOODS[0]
  const tags    = profile.cultural_tags || { music: [], film: [], books: [] }
  const allTags = [
    ...( tags.music || []).map(t => ({ label: t, icon: '🎵', cat: 'music' })),
    ...( tags.film  || []).map(t => ({ label: t, icon: '🎬', cat: 'film'  })),
    ...( tags.books || []).map(t => ({ label: t, icon: '📖', cat: 'books' })),
  ]
  const answers = profile.profile_answers || []

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(10,8,18,0.85)', backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        style={{
          width: '100%', maxWidth: 430,
          background: 'var(--bg2)',
          borderRadius: '28px 28px 0 0',
          maxHeight: '90dvh', overflowY: 'auto',
          border: '1px solid var(--border2)', borderBottom: 'none',
        }}
      >
        {/* Handle */}
        <div style={{ width: 40, height: 4, borderRadius: 4, background: 'var(--surface2)', margin: '16px auto 0' }} />

        {/* Hero */}
        <div style={{ position: 'relative', height: 180, marginTop: 12 }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: `linear-gradient(135deg, ${mood.color}44, #1c1728)`,
            borderRadius: '20px 20px 0 0',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden',
          }}>
            {profile.photo_url
              ? <img src={profile.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} />
              : <span style={{ fontSize: 64, opacity: 0.2 }}>🌙</span>
            }
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent, var(--bg2))' }} />
          </div>
          <div style={{
            position: 'absolute', bottom: -36, left: 24,
            width: 72, height: 72, borderRadius: '50%',
            border: '3px solid var(--bg2)',
            background: `${mood.color}33`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 34, overflow: 'hidden',
          }}>
            {profile.photo_url
              ? <img src={profile.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : mood.emoji
            }
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '48px 24px 32px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Name */}
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 26 }}>
              {profile.display_name}
            </h2>
            <p style={{ color: 'var(--text3)', fontSize: 13, marginTop: 2 }}>{profile.age} años</p>
          </div>

          {/* Mood */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '8px 14px', borderRadius: 100,
            background: `${mood.color}22`, color: mood.color,
            border: `1px solid ${mood.color}44`, fontSize: 13,
          }}>
            {mood.emoji} {mood.label} — <span style={{ opacity: 0.7 }}>{mood.desc}</span>
          </div>

          {/* Compat */}
          {profile.compatibility && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 12, color: 'var(--text3)' }}>Compatibilidad</span>
              <div style={{ flex: 1, height: 4, borderRadius: 4, background: 'var(--surface2)' }}>
                <div style={{ width: `${profile.compatibility}%`, height: '100%', borderRadius: 4, background: 'linear-gradient(90deg, var(--accent), var(--teal))' }} />
              </div>
              <span style={{ fontSize: 13, color: 'var(--teal)', fontWeight: 600 }}>{profile.compatibility}%</span>
            </div>
          )}

          {/* Tags */}
          {allTags.length > 0 && (
            <div>
              <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--accent)', fontWeight: 600, marginBottom: 10 }}>
                Gustos culturales
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {allTags.map(({ label, icon, cat }) => (
                  <span key={`${cat}-${label}`} className="tag">{icon} {label}</span>
                ))}
              </div>
            </div>
          )}

          {/* Answers */}
          {answers.length > 0 && (
            <div>
              <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--accent)', fontWeight: 600, marginBottom: 10 }}>
                Sus respuestas
              </p>
              {answers.map(a => (
                <div key={a.id} style={{ padding: '14px 16px', borderRadius: 'var(--radius-sm)', background: 'var(--surface)', border: '1px solid var(--border)', marginBottom: 8 }}>
                  <p style={{ fontSize: 12, color: 'var(--text3)', fontStyle: 'italic', marginBottom: 6 }}>
                    {a.questions?.content || DEEP_QUESTIONS[0]}
                  </p>
                  <p style={{ fontSize: 14, lineHeight: 1.6 }}>{a.answer}</p>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button className="btn btn-ghost" onClick={onClose} style={{ flex: 1 }}>
              Cerrar
            </button>
            <button className="btn btn-primary" onClick={onWrite} style={{ flex: 2 }}>
              ✍️ Escribirle
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}