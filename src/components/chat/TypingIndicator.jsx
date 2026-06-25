import { motion } from 'framer-motion'

export default function TypingIndicator({ name }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}
    >
      <div style={{
        display: 'flex', alignItems: 'center', gap: 4,
        padding: '10px 14px', borderRadius: '18px 18px 18px 4px',
        background: 'var(--surface2)',
      }}>
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
            style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text3)' }}
          />
        ))}
      </div>
      {name && (
        <span style={{ fontSize: 11, color: 'var(--text3)', fontStyle: 'italic' }}>
          {name} está escribiendo...
        </span>
      )}
    </motion.div>
  )
}