import { motion } from 'framer-motion'
import { MOODS } from '@/lib/constants'

export default function MatchScreen({ profile, onContinue }) {
  if (!profile) return null
  const mood = MOODS.find(m => m.id === profile?.mood_id) || MOODS[0]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 300,
        background: 'rgba(10,8,18,0.96)',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 28,
        padding: 40,
        textAlign: 'center',
      }}
    >
      {/* Label */}
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 3, color: 'var(--accent)', fontWeight: 600 }}
      >
        ✦ Conexión creada ✦
      </motion.p>

      {/* Avatars */}
      <motion.div
        initial={{ scale: 0.5, rotate: -8, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ delay: 0.3, type: 'spring', damping: 16 }}
        style={{ display: 'flex', alignItems: 'center', position: 'relative' }}
      >
        <div style={{
          width: 90,
          height: 90,
          borderRadius: '50%',
          border: '3px solid var(--accent)',
          background: 'var(--surface2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 44,
          boxShadow: '0 0 30px var(--glow)',
          transform: 'translateX(10px)',
          zIndex: 2,
        }}>
          🌙
        </div>

        <div style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: 24,
          zIndex: 3,
          animation: 'heartbeat 1.2s ease-in-out infinite',
        }}>
          💜
        </div>

        <div style={{
          width: 90,
          height: 90,
          borderRadius: '50%',
          border: '3px solid var(--accent)',
          background: `${mood.color}33`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 44,
          boxShadow: '0 0 30px var(--glow)',
          transform: 'translateX(-10px)',
          zIndex: 1,
        }}>
          {mood.emoji}
        </div>
      </motion.div>

      {/* Text */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          fontSize: 38,
          lineHeight: 1.2,
          background: 'linear-gradient(135deg, var(--accent2), var(--pink))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: 10,
        }}>
          ¡Habéis conectado!
        </h2>
        <p style={{ color: 'var(--text2)', fontSize: 15, lineHeight: 1.6, maxWidth: 280 }}>
          {profile.display_name} también quería conocerte. Su foto ya está desbloqueada.
        </p>
      </motion.div>

      {/* Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65 }}
        style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 280 }}
      >
        <button className="btn btn-primary" style={{ width: '100%' }} onClick={onContinue}>
          Ir al chat 💬
        </button>
        <button className="btn btn-ghost" style={{ width: '100%' }} onClick={onContinue}>
          Seguir explorando
        </button>
      </motion.div>
    </motion.div>
  )
}