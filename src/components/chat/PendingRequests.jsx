import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { useConnections } from '@/context/ConnectionsContext'
import { MOODS } from '@/lib/constants'

export default function PendingRequests() {
  const { profile } = useAuth()
  const { acceptConnection } = useConnections()
  const [pending, setPending]   = useState([])
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    if (!profile) return
    fetchPending()
  }, [profile?.id])

  async function fetchPending() {
    const { data } = await supabase
      .from('connections')
      .select('*, sender:profiles!connections_sender_id_fkey(*)')
      .eq('receiver_id', profile.id)
      .eq('status', 'pending')
    setPending(data || [])
  }

  async function accept(connectionId) {
    await acceptConnection(connectionId)
    setPending(p => p.filter(r => r.id !== connectionId))
  }

  async function reject(connectionId) {
    await supabase
      .from('connections')
      .update({ status: 'rejected' })
      .eq('id', connectionId)
    setPending(p => p.filter(r => r.id !== connectionId))
  }

  if (pending.length === 0) return null

  return (
    <div style={{ margin: '0 24px 16px' }}>
      <button
        onClick={() => setExpanded(e => !e)}
        style={{
          width: '100%', padding: '12px 16px',
          borderRadius: 'var(--radius-sm)',
          background: 'rgba(192,132,252,0.1)',
          border: '1px solid rgba(192,132,252,0.25)',
          display: 'flex', alignItems: 'center', gap: 10,
          cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font-body)',
        }}
      >
        <span style={{ fontSize: 18 }}>✉️</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 500, fontSize: 14, color: 'var(--text)' }}>
            {pending.length} solicitud{pending.length > 1 ? 'es' : ''} pendiente{pending.length > 1 ? 's' : ''}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text3)' }}>Alguien quiere conectar contigo</div>
        </div>
        <span style={{ color: 'var(--accent)', fontSize: 12, transition: 'transform 0.2s', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 10 }}>
              {pending.map(req => {
                const mood = MOODS.find(m => m.id === req.sender?.mood_id) || MOODS[0]
                return (
                  <div key={req.id} className="card" style={{ padding: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <div style={{ width: 42, height: 42, borderRadius: '50%', background: `${mood.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                        {mood.emoji}
                      </div>
                      <div>
                        <div style={{ fontWeight: 500, fontSize: 14 }}>{req.sender?.display_name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text3)' }}>{req.sender?.age} años</div>
                      </div>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text2)', fontStyle: 'italic', lineHeight: 1.5, marginBottom: 12 }}>
                      "{req.opening_message}"
                    </p>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-ghost" style={{ flex: 1, padding: '10px', fontSize: 13 }} onClick={() => reject(req.id)}>
                        Pasar
                      </button>
                      <button className="btn btn-primary" style={{ flex: 2, padding: '10px', fontSize: 13 }} onClick={() => accept(req.id)}>
                        Conectar ✦
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}