import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
})

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 32px',
      textAlign: 'center',
      gap: 32,
    }}>
      {/* Orb */}
      <motion.div
        {...fadeUp(0.05)}
        style={{ position: 'relative', display: 'inline-block' }}
      >
        <div style={{
          width: 160,
          height: 160,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 35%, #f0abfc, #c084fc, #6d28d9)',
          boxShadow: '0 0 60px rgba(192,132,252,0.4), 0 0 120px rgba(192,132,252,0.15)',
          animation: 'float 6s ease-in-out infinite, pulseGlow 3s ease-in-out infinite',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 64,
          position: 'relative',
        }}>
          🌙
          <div style={{
            position: 'absolute',
            inset: -20,
            border: '1px dashed rgba(200,180,255,0.2)',
            borderRadius: '50%',
          }} />
        </div>
      </motion.div>

      {/* Title */}
      <motion.div {...fadeUp(0.15)}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(48px, 12vw, 64px)',
          fontStyle: 'italic',
          lineHeight: 1.1,
          background: 'linear-gradient(160deg, #f0eaf8 0%, #f0abfc 50%, #f9a8d4 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: 12,
        }}>
          Lune
        </h1>
        <p style={{ color: 'var(--text2)', fontSize: 16, lineHeight: 1.7, maxWidth: 300, margin: '0 auto' }}>
          No swipes. No likes vacíos.<br />
          Solo conexiones que importan.
        </p>
      </motion.div>

      {/* Pills */}
      <motion.div {...fadeUp(0.25)} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
        {['🔒 Foto oculta hasta el match', '✍️ Escribe antes de conectar', '✦ Compatibilidad cultural'].map(t => (
          <span key={t} className="tag" style={{ fontSize: 12 }}>{t}</span>
        ))}
      </motion.div>

      {/* CTAs */}
      <motion.div {...fadeUp(0.35)} style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 300 }}>
        <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => navigate('/auth?mode=signup')}>
          Empezar mi viaje 🌙
        </button>
        <button className="btn btn-ghost" style={{ width: '100%' }} onClick={() => navigate('/auth?mode=login')}>
          Ya tengo cuenta
        </button>
      </motion.div>

      <motion.p {...fadeUp(0.45)} style={{ fontSize: 11, color: 'var(--text3)' }}>
        18+ · Solo personas reales ✦
      </motion.p>
    </div>
  )
}