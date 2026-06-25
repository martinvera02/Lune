import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useMessages } from '@/hooks/useMessages'
import { MOODS } from '@/lib/constants'
import MessageBubble   from './MessageBubble'
import TypingIndicator from './TypingIndicator'
import ReportModal     from './ReportModal'

export default function ChatView({ connection, other, onBack }) {
  const { messages, loading, typingUsers, sendMessage, sendTypingSignal, myProfileId } = useMessages(connection.id)
  const [input, setInput]       = useState('')
  const [sending, setSending]   = useState(false)
  const [replyTo, setReplyTo]   = useState(null)
  const [showReport, setShowReport] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const endRef   = useRef(null)
  const inputRef = useRef(null)

  const mood = MOODS.find(m => m.id === other?.mood_id) || MOODS[0]
  const isOtherTyping = typingUsers.length > 0

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isOtherTyping])

  async function handleSend() {
    const text = input.trim()
    if (!text || sending) return
    setInput('')
    setReplyTo(null)
    setSending(true)
    await sendMessage(text, replyTo?.id || null)
    setSending(false)
    inputRef.current?.focus()
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
    if (e.key === 'Escape' && replyTo) {
      setReplyTo(null)
    }
  }

  function handleInputChange(e) {
    setInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
    if (e.target.value.trim()) sendTypingSignal()
  }

  // Agrupar mensajes por tiempo para mostrar separadores
  function shouldShowTime(msg, prev) {
    if (!prev) return true
    return (new Date(msg.created_at) - new Date(prev.created_at)) > 300000
  }

  function formatTime(ts) {
    return new Date(ts).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, height: '100%' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '14px 20px', borderBottom: '1px solid var(--border)',
        background: 'rgba(14,12,20,0.85)', backdropFilter: 'blur(20px)', flexShrink: 0,
      }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--text2)', fontSize: 20, cursor: 'pointer', padding: 4, flexShrink: 0 }}>←</button>
        <div style={{ width: 38, height: 38, borderRadius: '50%', background: `${mood.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0, overflow: 'hidden' }}>
          {other?.photo_url
            ? <img src={other.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : mood.emoji
          }
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 500, fontSize: 15 }}>{other?.display_name}</div>
          <div style={{ fontSize: 11, color: isOtherTyping ? 'var(--accent2)' : 'var(--teal)' }}>
            {isOtherTyping ? 'escribiendo...' : 'Conectados ✦'}
          </div>
        </div>
        {/* Menu */}
        <button
          onClick={() => setShowMenu(s => !s)}
          style={{ background: 'none', border: 'none', color: 'var(--text3)', fontSize: 20, cursor: 'pointer', padding: 4, flexShrink: 0 }}
        >
          ⋯
        </button>
      </div>

      {/* Dropdown menu */}
      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            style={{
              position: 'absolute', top: 72, right: 16, zIndex: 200,
              background: 'var(--surface2)', border: '1px solid var(--border2)',
              borderRadius: 'var(--radius-sm)', overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              minWidth: 180,
            }}
          >
            <button
              onClick={() => { setShowMenu(false); setShowReport(true) }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '13px 16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', fontSize: 14, fontFamily: 'var(--font-body)', textAlign: 'left' }}
            >
              <span>⚠️</span> Reportar / Bloquear
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Context banner */}
      {connection.opening_message && (
        <div style={{ margin: '10px 16px 0', padding: '12px 14px', borderRadius: 'var(--radius-sm)', background: 'linear-gradient(135deg, rgba(192,132,252,0.08), rgba(240,171,252,0.04))', border: '1px solid rgba(192,132,252,0.18)', display: 'flex', gap: 8, flexShrink: 0 }}>
          <span style={{ fontSize: 16, flexShrink: 0 }}>✦</span>
          <p style={{ fontSize: 12, color: 'var(--text3)', fontStyle: 'italic', lineHeight: 1.5 }}>
            Conectasteis con: <em style={{ color: 'var(--text2)' }}>"{connection.opening_message.slice(0, 70)}..."</em>
          </p>
        </div>
      )}

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 6, minHeight: 0 }}
        onClick={() => showMenu && setShowMenu(false)}
      >
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 20 }}>
            <div className="loading-orb" style={{ width: 32, height: 32 }} />
          </div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text3)', fontSize: 13 }}>
            El silencio también tiene textura 🌙<br />
            <span style={{ fontSize: 12, marginTop: 4, display: 'block' }}>Sé el primero en escribir</span>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isMine     = msg.sender_id === myProfileId
            const prev       = messages[i - 1]
            const showTime   = shouldShowTime(msg, prev)
            const replyTarget = msg.reply_to ? messages.find(m => m.id === msg.reply_to) : null

            return (
              <div key={msg.id}>
                {showTime && (
                  <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--text3)', margin: '10px 0 6px' }}>
                    {formatTime(msg.created_at)}
                  </div>
                )}
                <MessageBubble
                  msg={msg}
                  isMine={isMine}
                  replyTarget={replyTarget}
                  onReply={m => { setReplyTo(m); inputRef.current?.focus() }}
                />
              </div>
            )
          })
        )}

        {/* Typing indicator */}
        <AnimatePresence>
          {isOtherTyping && (
            <TypingIndicator name={other?.display_name} />
          )}
        </AnimatePresence>

        <div ref={endRef} />
      </div>

      {/* Reply preview bar */}
      <AnimatePresence>
        {replyTo && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{
              background: 'var(--surface)', borderTop: '1px solid var(--border)',
              padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
            }}
          >
            <div style={{ flex: 1, borderLeft: '2px solid var(--accent)', paddingLeft: 10 }}>
              <div style={{ fontSize: 11, color: 'var(--accent)', marginBottom: 2 }}>Respondiendo</div>
              <div style={{ fontSize: 13, color: 'var(--text2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {replyTo.content}
              </div>
            </div>
            <button
              onClick={() => setReplyTo(null)}
              style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 18, flexShrink: 0 }}
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <div style={{ display: 'flex', gap: 10, padding: '12px 16px', alignItems: 'flex-end', borderTop: '1px solid var(--border)', background: 'rgba(14,12,20,0.9)', backdropFilter: 'blur(20px)', flexShrink: 0 }}>
        <textarea
          ref={inputRef}
          className="input"
          rows={1}
          placeholder="Escribe algo real..."
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          style={{ resize: 'none', borderRadius: 100, padding: '12px 18px', lineHeight: 1.4, overflow: 'hidden' }}
        />
        <motion.button
          onClick={handleSend}
          disabled={!input.trim() || sending}
          whileTap={{ scale: 0.9 }}
          style={{
            width: 44, height: 44, borderRadius: '50%', border: 'none',
            cursor: input.trim() ? 'pointer' : 'default',
            background: input.trim()
              ? 'linear-gradient(135deg, var(--accent), var(--accent2))'
              : 'var(--surface2)',
            fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.2s', flexShrink: 0,
            boxShadow: input.trim() ? '0 4px 16px var(--glow)' : 'none',
          }}
        >
          ↑
        </motion.button>
      </div>

      {/* Report modal */}
      <AnimatePresence>
        {showReport && other && (
          <ReportModal
            profile={other}
            onClose={() => setShowReport(false)}
            onBlocked={onBack}
          />
        )}
      </AnimatePresence>
    </div>
  )
}