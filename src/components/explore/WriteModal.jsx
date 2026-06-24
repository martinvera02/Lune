import { useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { DEEP_QUESTIONS } from '@/lib/constants'

export default function WriteModal({ profile, onClose, onSend }) {
  const [text, setText]       = useState('')
  const [loading, setLoading] = useState(false)
  const [questions, setQuestions] = useState(null)
  const [selectedQ, setSelectedQ] = useState(null)

  // Pick a random question from the DB on mount
  useState(() => {
    supabase
      .from('questions')
      .select('id, content')
      .eq('is_active', true)
      .then(({ data }) => {
        if (data?.length) {
          const q = data[Math.floor(Math.random() * data.length)]
          setSelectedQ(q)
          setQuestions(data)
        } else {
          setSelectedQ({ id: null, content: DEEP_QUESTIONS[Math.floor(Math.random() * DEEP_QUESTIONS.length)] })
        }
      })
  }, [])

  async function handleSend() {
    if (text.trim().length < 5 || loading) return
    setLoading(true)
    await onSend({ profile, questionId: selectedQ?.id, message: text.trim() })
    setLoading(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'rgba(10,8,18,0.85)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        style={{
          width: '100%',
          maxWidth: 430,
          background: 'var(--bg2)',
          borderRadius: '28px 28px 0 0',
          padding: '32px 24px 40px',
          border: '1px solid var(--border2)',
          borderBottom: 'none',
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
        }}
      >
        {/* Handle */}
        <div style={{ width: 40, height: 4, borderRadius: 4, background: 'var(--surface2)', margin: '-16px auto 4px' }} />

        {/* Question */}
        <div>
          <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--accent)', fontWeight: 600, marginBottom: 8 }}>
            ✦ Pregunta para conectar
          </p>
          <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 20, lineHeight: 1.4, color: 'var(--text)' }}>
            {selectedQ?.content || '...'}
          </p>
        </div>

        {/* Recipient */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'var(--surface2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
            border: '1px solid var(--border2)',
          }}>
            🌙
          </div>
          <div>
            <div style={{ fontWeight: 500, fontSize: 14 }}>{profile.display_name}</div>
            <div style={{ fontSize: 12, color: 'var(--text3)' }}>Tu respuesta irá directo a esta persona</div>
          </div>
        </div>

        {/* Text area */}
        <textarea
          className="input"
          rows={4}
          placeholder="Escribe tu respuesta..."
          value={text}
          onChange={e => setText(e.target.value)}
          style={{ resize: 'none', lineHeight: 1.65 }}
          autoFocus
        />

        <p style={{ fontSize: 12, color: 'var(--text3)', fontStyle: 'italic' }}>
          No hay likes vacíos aquí. Solo palabras reales.
        </p>

        <button
          className="btn btn-primary"
          onClick={handleSend}
          disabled={text.trim().length < 5 || loading}
          style={{ width: '100%' }}
        >
          {loading ? 'Enviando...' : 'Enviar y conectar ✦'}
        </button>
      </motion.div>
    </motion.div>
  )
}