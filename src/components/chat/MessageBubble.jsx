import { useState } from 'react'
import { motion } from 'framer-motion'

export default function MessageBubble({ msg, isMine, onReply, replyTarget }) {
  const [pressed, setPressed] = useState(false)

  function formatTime(ts) {
    if (!ts) return ''
    return new Date(ts).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  }

  function StatusIcon() {
    if (!isMine) return null
    if (msg.status === 'sending') return <span style={{ fontSize: 10, opacity: 0.5 }}>○</span>
    if (msg.status === 'error')   return <span style={{ fontSize: 10, color: 'var(--red)' }}>✕</span>
    if (msg.status === 'read')    return <span style={{ fontSize: 10, color: 'var(--teal)' }}>✓✓</span>
    return <span style={{ fontSize: 10, opacity: 0.6 }}>✓</span>
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isMine ? 'flex-end' : 'flex-start',
        gap: 2,
      }}
    >
      {/* Reply preview */}
      {msg.reply_to && replyTarget && (
        <div style={{
          maxWidth: '70%',
          padding: '6px 12px',
          borderRadius: '10px 10px 0 0',
          background: 'var(--bg3)',
          borderLeft: '2px solid var(--accent)',
          fontSize: 12,
          color: 'var(--text3)',
          fontStyle: 'italic',
          marginBottom: -4,
          marginLeft: isMine ? 'auto' : 0,
          marginRight: isMine ? 0 : 'auto',
        }}>
          ↩ {replyTarget.content.slice(0, 50)}{replyTarget.content.length > 50 ? '...' : ''}
        </div>
      )}

      {/* Bubble */}
      <motion.div
        onTapStart={() => setPressed(true)}
        onTap={() => {
          setPressed(false)
          onReply?.(msg)
        }}
        onTapCancel={() => setPressed(false)}
        animate={{ scale: pressed ? 0.97 : 1 }}
        transition={{ duration: 0.1 }}
        style={{
          maxWidth: '75%',
          padding: '11px 15px',
          borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
          fontSize: 14,
          lineHeight: 1.55,
          background: isMine
            ? msg.status === 'error'
              ? 'rgba(251,113,133,0.3)'
              : 'linear-gradient(135deg, var(--accent), #9333ea)'
            : 'var(--surface2)',
          color: isMine ? 'white' : 'var(--text)',
          cursor: 'pointer',
          userSelect: 'none',
          wordBreak: 'break-word',
          position: 'relative',
        }}
      >
        {msg.content}
        {msg.status === 'error' && (
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>
            Error al enviar. Toca para reintentar.
          </div>
        )}
      </motion.div>

      {/* Meta: time + status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, paddingInline: 4 }}>
        <span style={{ fontSize: 10, color: 'var(--text3)' }}>{formatTime(msg.created_at)}</span>
        <StatusIcon />
      </div>
    </motion.div>
  )
}