import { useState } from 'react'
import { motion } from 'framer-motion'
import { useEventContext } from '@/context/EventContext'

export default function JoinEventModal({ onClose, onJoined }) {
  const { joinEvent, joining, error } = useEventContext()
  const [code, setCode] = useState('')

  async function handleJoin() {
    if (!code.trim()) return
    const { event, error } = await joinEvent(code)
    if (!error && event) {
      onJoined(event)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(10,8,18,0.9)', backdropFilter: 'blur(16px)',
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
          padding: '32px 24px 48px',
          border: '1px solid var(--border2)', borderBottom: 'none',
          display: 'flex', flexDirection: 'column', gap: 20,
        }}
      >
        <div style={{ width: 40, height: 4, borderRadius: 4, background: 'var(--surface2)', margin: '-16px auto 4px' }} />

        {/* Icon */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%', margin: '0 auto 16px',
            background: 'linear-gradient(135deg, rgba(192,132,252,0.2), rgba(240,171,252,0.1))',
            border: '1px solid rgba(192,132,252,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32,
          }}>
            🎉
          </div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 24, marginBottom: 8 }}>
            Unirse a un evento
          </h3>
          <p style={{ color: 'var(--text2)', fontSize: 14, lineHeight: 1.6 }}>
            Introduce el código que encontrarás en la entrada del local
          </p>
        </div>

        {/* Code input */}
        <div>
          <input
            className="input"
            placeholder="Código del evento (ej: MONDOTEST2026)"
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === 'Enter' && handleJoin()}
            style={{ textAlign: 'center', fontSize: 18, letterSpacing: 3, fontWeight: 600 }}
            autoFocus
          />
        </div>

        {/* Error */}
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              color: 'var(--red)', fontSize: 13, textAlign: 'center',
              padding: '10px 14px', background: 'rgba(251,113,133,0.08)',
              borderRadius: 'var(--radius-xs)', border: '1px solid rgba(251,113,133,0.2)',
            }}
          >
            {error}
          </motion.p>
        )}

        {/* Info */}
        <div style={{
          padding: '14px 16px', borderRadius: 'var(--radius-sm)',
          background: 'var(--surface)', border: '1px solid var(--border)',
          display: 'flex', gap: 10, alignItems: 'flex-start',
        }}>
          <span style={{ fontSize: 16, flexShrink: 0 }}>🔒</span>
          <p style={{ fontSize: 12, color: 'var(--text3)', lineHeight: 1.5 }}>
            Solo verás perfiles de personas en el local esa noche. Al salir del evento, los perfiles desaparecen.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={handleJoin}
          disabled={!code.trim() || joining}
          style={{ width: '100%' }}
        >
          {joining ? 'Uniéndose...' : 'Entrar al evento 🎉'}
        </button>
      </motion.div>
    </motion.div>
  )
}