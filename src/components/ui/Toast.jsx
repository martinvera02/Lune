import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

let toastFn = null

export function showToast({ message, type = 'info', duration = 3500 }) {
  if (toastFn) toastFn({ message, type, duration })
}

export default function ToastProvider() {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    toastFn = ({ message, type, duration }) => {
      const id = Date.now()
      setToasts(prev => [...prev, { id, message, type }])
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id))
      }, duration)
    }
    return () => { toastFn = null }
  }, [])

  const icons = { info: '✦', success: '✓', error: '✕', match: '💜' }
  const colors = {
    info:    'var(--accent)',
    success: 'var(--teal)',
    error:   'var(--red)',
    match:   'var(--pink)',
  }

  return (
    <div style={{
      position: 'fixed', top: 80, left: '50%', transform: 'translateX(-50%)',
      zIndex: 500, display: 'flex', flexDirection: 'column', gap: 8,
      maxWidth: 380, width: '90%', pointerEvents: 'none',
    }}>
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: -16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0,   scale: 1 }}
            exit={{   opacity: 0, y: -8,   scale: 0.95 }}
            transition={{ type: 'spring', damping: 24, stiffness: 300 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '12px 16px', borderRadius: 'var(--radius-sm)',
              background: 'var(--surface2)', border: `1px solid ${colors[t.type]}44`,
              boxShadow: `0 4px 24px rgba(0,0,0,0.4)`,
              backdropFilter: 'blur(20px)',
              pointerEvents: 'auto',
            }}
          >
            <span style={{ fontSize: 16, color: colors[t.type], flexShrink: 0 }}>{icons[t.type]}</span>
            <span style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.4 }}>{t.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}