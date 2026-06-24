import { motion } from 'framer-motion'
import { MOODS } from '@/lib/constants'

export default function MoodSelector({ current, onSelect, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'rgba(10,8,18,0.8)',
        backdropFilter: 'blur(10px)',
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          maxWidth: 430,
          margin: '0 auto',
          background: 'var(--bg2)',
          borderRadius: '28px 28px 0 0',
          padding: '32px 24px 48px',
          border: '1px solid var(--border2)',
          borderBottom: 'none',
        }}
      >
        <div style={{ width: 40, height: 4, borderRadius: 4, background: 'var(--surface2)', margin: '-16px auto 20px' }} />

        <h3 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 22, marginBottom: 6 }}>
          ¿Cómo estás hoy?
        </h3>
        <p style={{ color: 'var(--text3)', fontSize: 13, marginBottom: 20 }}>
          Tu mood es visible para quienes exploran
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {MOODS.map(m => (
            <button
              key={m.id}
              onClick={() => onSelect(m)}
              style={{
                padding: '16px 12px',
                borderRadius: 'var(--radius)',
                cursor: 'pointer',
                border: `2px solid ${current?.id === m.id ? m.color : 'transparent'}`,
                background: current?.id === m.id ? `${m.color}22` : 'var(--surface)',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 5,
                transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                fontFamily: 'var(--font-body)',
              }}
            >
              <span style={{ fontSize: 26 }}>{m.emoji}</span>
              <span style={{ fontWeight: 500, fontSize: 13, color: 'var(--text)' }}>{m.label}</span>
              <span style={{ fontSize: 11, color: 'var(--text3)' }}>{m.desc}</span>
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}