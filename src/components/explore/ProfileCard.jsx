import { motion } from 'framer-motion'
import { MOODS } from '@/lib/constants'

export default function ProfileCard({ profile, stackBehind = [], onView, onWrite, onSkip, checking, isLeaving }) {
  if (!profile) return null

  const mood   = MOODS.find(m => m.id === profile?.mood_id) || MOODS[0]
  const tags   = Object.values(profile.cultural_tags || {}).flat().slice(0, 4)
  const answer = profile.profile_answers?.[0]

  return (
    <div>
      <div style={{ position: 'relative', height: 480, marginBottom: 16 }}>
        {stackBehind.slice(0, 2).reverse().map((_, i) => (
          <div key={i} style={{
            position: 'absolute', inset: 0, borderRadius: 24,
            background: 'var(--surface)', border: '1px solid var(--border2)',
            transform: i === 0
              ? 'rotate(2deg) scale(0.91) translateY(14px)'
              : 'rotate(-1.5deg) scale(0.96) translateY(7px)',
            zIndex: i,
          }} />
        ))}

        <motion.div
          key={profile.id}
          animate={isLeaving
            ? { x: -340, rotate: -18, opacity: 0 }
            : { x: 0, rotate: 0, opacity: 1, scale: 1 }
          }
          initial={{ opacity: 0, scale: 0.97 }}
          transition={isLeaving
            ? { duration: 0.38, ease: [0.32, 0, 0.67, 0] }
            : { duration: 0.3 }
          }
          onClick={onView}
          style={{
            position: 'absolute', inset: 0, borderRadius: 24, overflow: 'hidden',
            background: 'var(--surface2)', border: '1px solid var(--border2)',
            zIndex: 3, display: 'flex', flexDirection: 'column',
            cursor: 'pointer', transformOrigin: 'bottom center',
          }}
        >
          {/* Stamp PASO */}
          <motion.div
            animate={{ opacity: isLeaving ? 1 : 0 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute', top: 32, right: 24, zIndex: 10,
              padding: '8px 18px', borderRadius: 100,
              border: '3px solid var(--text3)', color: 'var(--text3)',
              fontWeight: 700, fontSize: 20, letterSpacing: 2,
              textTransform: 'uppercase', transform: 'rotate(12deg)',
              pointerEvents: 'none',
            }}
          >
            Paso
          </motion.div>

          <div style={{ flex: 1, position: 'relative', background: `linear-gradient(135deg, ${mood.color}22, var(--bg3))` }}>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 80, opacity: 0.15, filter: 'blur(8px)' }}>
              {mood.emoji}
            </div>

            <div style={{
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -60%)',
              background: 'rgba(14,12,20,0.75)', backdropFilter: 'blur(12px)',
              padding: '16px 24px', borderRadius: 'var(--radius)', border: '1px solid var(--border2)', textAlign: 'center',
            }}>
              <div style={{ fontSize: 28, marginBottom: 4 }}>🔒</div>
              <div style={{ fontWeight: 500, fontSize: 14, color: 'var(--text)' }}>Foto oculta</div>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>Conecta para desvelarla</div>
            </div>

            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '55%', background: 'linear-gradient(to top, var(--surface2), transparent)' }} />

            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 26 }}>{profile.display_name}</h3>
                <span style={{ color: 'var(--text2)', fontSize: 15 }}>{profile.age}</span>
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 100, fontSize: 12, marginTop: 6, background: `${mood.color}33`, color: mood.color, border: `1px solid ${mood.color}55` }}>
                {mood.emoji} {mood.label}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                <span style={{ fontSize: 11, color: 'var(--text3)', flexShrink: 0 }}>Compatibilidad</span>
                <div style={{ flex: 1, height: 4, borderRadius: 4, background: 'var(--surface2)' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${profile.compatibility || 50}%` }}
                    transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
                    style={{ height: '100%', borderRadius: 4, background: 'linear-gradient(90deg, var(--accent), var(--teal))' }}
                  />
                </div>
                <span style={{ fontSize: 12, color: 'var(--teal)', fontWeight: 600, flexShrink: 0 }}>{profile.compatibility || 50}%</span>
              </div>
            </div>
          </div>

          {answer && (
            <div style={{ padding: '14px 18px', borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
              <p style={{ fontSize: 11, color: 'var(--accent)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>✦ Su respuesta</p>
              <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5, fontStyle: 'italic' }}>
                "{answer.answer.slice(0, 100)}{answer.answer.length > 100 ? '...' : ''}"
              </p>
            </div>
          )}

          {tags.length > 0 && (
            <div style={{ padding: '10px 18px 14px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {tags.map(t => <span key={t} className="tag" style={{ fontSize: 11, padding: '4px 10px' }}>{t}</span>)}
            </div>
          )}
        </motion.div>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <motion.button
          className="btn btn-ghost"
          onClick={onSkip}
          whileTap={{ scale: 0.9 }}
          style={{ flex: 1, fontSize: 20, padding: '14px' }}
          disabled={isLeaving}
        >
          👋
        </motion.button>
        <button
          className="btn btn-primary"
          onClick={e => { e.stopPropagation(); onWrite() }}
          disabled={checking || isLeaving}
          style={{ flex: 3, gap: 8 }}
        >
          {checking ? '...' : '✍️ Escribir algo'}
        </button>
        <button
          className="btn btn-ghost"
          onClick={onView}
          disabled={isLeaving}
          style={{ flex: 1, fontSize: 20, padding: '14px', background: 'rgba(249,168,212,0.1)', borderColor: 'rgba(249,168,212,0.3)' }}
        >
          👁️
        </button>
      </div>
    </div>
  )
}