import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useEventContext } from '@/context/EventContext'

export default function VenueBanner() {
  const { activeEvent, members, timeRemaining, leaveEvent } = useEventContext()
  const [confirmLeave, setConfirmLeave] = useState(false)
  const [leaving, setLeaving] = useState(false)

  if (!activeEvent) return null

  const venue = activeEvent.venues
  const time  = timeRemaining()
  const count = members.length + 1

  async function handleLeave() {
    setLeaving(true)
    // Cerrar el modal primero
    setConfirmLeave(false)
    // Esperar a que la animación de salida del modal termine
    await new Promise(r => setTimeout(r, 300))
    // Luego limpiar el estado del evento
    await leaveEvent()
    setLeaving(false)
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          margin: '0 16px',
          padding: '12px 16px',
          borderRadius: 'var(--radius-sm)',
          background: 'linear-gradient(135deg, rgba(192,132,252,0.15), rgba(94,234,212,0.08))',
          border: '1px solid rgba(192,132,252,0.3)',
          display: 'flex', alignItems: 'center', gap: 12,
          flexShrink: 0,
        }}
      >
        {/* Pulse dot */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--teal)' }} />
          <div style={{
            position: 'absolute', inset: -3, borderRadius: '50%',
            border: '2px solid var(--teal)',
            animation: 'pulseRing 1.5s ease-out infinite', opacity: 0.5,
          }} />
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>
            {venue?.name || activeEvent.name}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 1 }}>
            {activeEvent.name} · {count} {count === 1 ? 'persona' : 'personas'} · {time}
          </div>
        </div>

        {/* Leave button */}
        <button
          onClick={() => setConfirmLeave(true)}
          disabled={leaving}
          style={{
            background: 'none', border: 'none', color: 'var(--text3)',
            fontSize: 11, cursor: 'pointer', flexShrink: 0,
            fontFamily: 'var(--font-body)', padding: '4px 8px',
          }}
        >
          {leaving ? '...' : 'Salir'}
        </button>
      </motion.div>

      <style>{`
        @keyframes pulseRing {
          0%   { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(2.5); opacity: 0; }
        }
      `}</style>

      {/* Confirm dialog — renderizado fuera del banner, en un portal propio */}
      <AnimatePresence>
        {confirmLeave && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 300,
              background: 'rgba(10,8,18,0.85)', backdropFilter: 'blur(12px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 32,
            }}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                background: 'var(--bg2)', borderRadius: 'var(--radius)',
                padding: 28, border: '1px solid var(--border2)',
                maxWidth: 320, width: '100%', textAlign: 'center',
                display: 'flex', flexDirection: 'column', gap: 16,
              }}
            >
              <div style={{ fontSize: 40 }}>👋</div>
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 20, marginBottom: 8 }}>
                  ¿Salir del evento?
                </h3>
                <p style={{ color: 'var(--text2)', fontSize: 14, lineHeight: 1.5 }}>
                  Dejarás de ver los perfiles de esta noche en {venue?.name || activeEvent.name}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  className="btn btn-ghost"
                  style={{ flex: 1 }}
                  onClick={() => setConfirmLeave(false)}
                >
                  Quedarme
                </button>
                <button
                  className="btn btn-primary"
                  style={{ flex: 1, background: 'var(--red)', boxShadow: 'none' }}
                  onClick={handleLeave}
                >
                  Salir
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}