import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useMessages } from '@/hooks/useMessages'
import { MOODS } from '@/lib/constants'

export default function ChatView({ connection, other, onBack }) {
  const { messages, loading, sendMessage, myProfileId } = useMessages(connection.id)
  const [input, setInput]     = useState('')
  const [sending, setSending] = useState(false)
  const endRef   = useRef(null)
  const inputRef = useRef(null)

  const mood = MOODS.find(m => m.id === other?.mood_id) || MOODS[0]

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend() {
    const text = input.trim()
    if (!text || sending) return
    setInput('')
    setSending(true)
    await sendMessage(text)
    setSending(false)
    inputRef.current?.focus()
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function formatTime(ts) {
    if (!ts) return ''
    return new Date(ts).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      minHeight: 0,
      height: '100%',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '14px 20px',
        borderBottom: '1px solid var(--border)',
        background: 'rgba(14,12,20,0.85)',
        backdropFilter: 'blur(20px)',
        flexShrink: 0,
      }}>
        <button
          onClick={onBack}
          style={{ background: 'none', border: 'none', color: 'var(--text2)', fontSize: 20, cursor: 'pointer', padding: 4, flexShrink: 0 }}
        >
          ←
        </button>
        <div style={{
          width: 38, height: 38, borderRadius: '50%',
          background: `${mood.color}33`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, flexShrink: 0, overflow: 'hidden',
        }}>
          {other?.photo_url
            ? <img src={other.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : mood.emoji
          }
        </div>
        <div>
          <div style={{ fontWeight: 500, fontSize: 15 }}>{other?.display_name}</div>
          <div style={{ fontSize: 11, color: 'var(--teal)' }}>Conectados ✦</div>
        </div>
      </div>

      {/* Context banner */}
      {connection.opening_message && (
        <div style={{
          margin: '10px 16px 0', padding: '12px 14px',
          borderRadius: 'var(--radius-sm)',
          background: 'linear-gradient(135deg, rgba(192,132,252,0.08), rgba(240,171,252,0.04))',
          border: '1px solid rgba(192,132,252,0.18)',
          display: 'flex', gap: 8, flexShrink: 0,
        }}>
          <span style={{ fontSize: 16, flexShrink: 0 }}>✦</span>
          <p style={{ fontSize: 12, color: 'var(--text3)', fontStyle: 'italic', lineHeight: 1.5 }}>
            Conectasteis con: <em style={{ color: 'var(--text2)' }}>"{connection.opening_message.slice(0, 70)}..."</em>
          </p>
        </div>
      )}

      {/* Messages — flex: 1 con minHeight: 0 para que haga scroll correctamente */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '12px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        minHeight: 0,
      }}>
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
            const isMine  = msg.sender_id === myProfileId
            const prevMsg = messages[i - 1]
            const showTime = !prevMsg || (new Date(msg.created_at) - new Date(prevMsg.created_at)) > 300000

            return (
              <div key={msg.id}>
                {showTime && (
                  <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--text3)', margin: '8px 0' }}>
                    {formatTime(msg.created_at)}
                  </div>
                )}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    maxWidth: '75%',
                    padding: '11px 15px',
                    borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    fontSize: 14, lineHeight: 1.55,
                    background: isMine
                      ? 'linear-gradient(135deg, var(--accent), #9333ea)'
                      : 'var(--surface2)',
                    color: isMine ? 'white' : 'var(--text)',
                    marginLeft: isMine ? 'auto' : 0,
                    marginRight: isMine ? 0 : 'auto',
                    wordBreak: 'break-word',
                  }}
                >
                  {msg.content}
                </motion.div>
              </div>
            )
          })
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div style={{
        display: 'flex', gap: 10, padding: '12px 16px',
        alignItems: 'flex-end',
        borderTop: '1px solid var(--border)',
        background: 'rgba(14,12,20,0.9)',
        backdropFilter: 'blur(20px)',
        flexShrink: 0,
      }}>
        <textarea
          ref={inputRef}
          className="input"
          rows={1}
          placeholder="Escribe algo real..."
          value={input}
          onChange={e => {
            setInput(e.target.value)
            e.target.style.height = 'auto'
            e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
          }}
          onKeyDown={handleKeyDown}
          style={{ resize: 'none', borderRadius: 100, padding: '12px 18px', lineHeight: 1.4, overflow: 'hidden' }}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || sending}
          style={{
            width: 44, height: 44, borderRadius: '50%', border: 'none',
            cursor: input.trim() ? 'pointer' : 'default',
            background: input.trim()
              ? 'linear-gradient(135deg, var(--accent), var(--accent2))'
              : 'var(--surface2)',
            fontSize: 18,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s', flexShrink: 0,
            boxShadow: input.trim() ? '0 4px 16px var(--glow)' : 'none',
          }}
        >
          ↑
        </button>
      </div>
    </div>
  )
}