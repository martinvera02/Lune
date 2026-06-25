import { useState } from 'react'
import { motion } from 'framer-motion'
import { useReport } from '@/hooks/useReport'
import { showToast } from '@/components/ui/Toast'

const REASONS = [
  { id: 'spam',          label: 'Spam o publicidad',       emoji: '🚫' },
  { id: 'inappropriate', label: 'Contenido inapropiado',   emoji: '⚠️' },
  { id: 'harassment',    label: 'Acoso o amenazas',        emoji: '😡' },
  { id: 'fake',          label: 'Perfil falso o bot',      emoji: '🤖' },
  { id: 'other',         label: 'Otro motivo',             emoji: '📝' },
]

export default function ReportModal({ profile, onClose, onBlocked }) {
  const { reportProfile, blockProfile, loading } = useReport()
  const [step, setStep]     = useState('menu')    // menu | report | confirm
  const [reason, setReason] = useState(null)
  const [details, setDetails] = useState('')

  async function handleReport() {
    const { error } = await reportProfile({
      reportedId: profile.id,
      reason,
      details,
    })
    if (error) {
      showToast({ message: 'Error al enviar el reporte', type: 'error' })
    } else {
      showToast({ message: 'Reporte enviado. Lo revisaremos pronto.', type: 'success' })
      onClose()
    }
  }

  async function handleBlock() {
    const { error } = await blockProfile(profile.id)
    if (!error) {
      showToast({ message: `Has bloqueado a ${profile.display_name}`, type: 'info' })
      onBlocked?.()
      onClose()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        background: 'rgba(10,8,18,0.85)', backdropFilter: 'blur(12px)',
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
          display: 'flex', flexDirection: 'column', gap: 16,
        }}
      >
        <div style={{ width: 40, height: 4, borderRadius: 4, background: 'var(--surface2)', margin: '-16px auto 4px' }} />

        {step === 'menu' && (
          <>
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 22, marginBottom: 4 }}>
                {profile.display_name}
              </h3>
              <p style={{ color: 'var(--text3)', fontSize: 13 }}>¿Qué quieres hacer?</p>
            </div>

            <button
              onClick={() => setStep('report')}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '16px', borderRadius: 'var(--radius-sm)',
                background: 'var(--surface)', border: '1px solid var(--border2)',
                cursor: 'pointer', fontFamily: 'var(--font-body)', textAlign: 'left',
                transition: 'all 0.2s',
              }}
            >
              <span style={{ fontSize: 22 }}>⚠️</span>
              <div>
                <div style={{ fontWeight: 500, fontSize: 14, color: 'var(--text)' }}>Reportar perfil</div>
                <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>Contenido inapropiado, spam, acoso...</div>
              </div>
            </button>

            <button
              onClick={() => setStep('confirm')}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '16px', borderRadius: 'var(--radius-sm)',
                background: 'rgba(251,113,133,0.08)', border: '1px solid rgba(251,113,133,0.2)',
                cursor: 'pointer', fontFamily: 'var(--font-body)', textAlign: 'left',
                transition: 'all 0.2s',
              }}
            >
              <span style={{ fontSize: 22 }}>🚫</span>
              <div>
                <div style={{ fontWeight: 500, fontSize: 14, color: 'var(--red)' }}>Bloquear</div>
                <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>No volverá a aparecer ni podrá escribirte</div>
              </div>
            </button>

            <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          </>
        )}

        {step === 'report' && (
          <>
            <div>
              <button onClick={() => setStep('menu')} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-body)', marginBottom: 12 }}>
                ← Atrás
              </button>
              <h3 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 20 }}>¿Por qué reportas este perfil?</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {REASONS.map(r => (
                <button
                  key={r.id}
                  onClick={() => setReason(r.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '13px 16px', borderRadius: 'var(--radius-sm)',
                    border: `1px solid ${reason === r.id ? 'var(--accent)' : 'var(--border2)'}`,
                    background: reason === r.id ? 'rgba(192,132,252,0.1)' : 'var(--surface)',
                    cursor: 'pointer', fontFamily: 'var(--font-body)', textAlign: 'left',
                    transition: 'all 0.15s',
                  }}
                >
                  <span style={{ fontSize: 18 }}>{r.emoji}</span>
                  <span style={{ fontSize: 14, color: 'var(--text)', fontWeight: reason === r.id ? 500 : 400 }}>{r.label}</span>
                  {reason === r.id && <span style={{ marginLeft: 'auto', color: 'var(--accent)' }}>✓</span>}
                </button>
              ))}
            </div>

            {reason === 'other' && (
              <textarea
                className="input"
                rows={3}
                placeholder="Cuéntanos más..."
                value={details}
                onChange={e => setDetails(e.target.value)}
                style={{ resize: 'none' }}
              />
            )}

            <button
              className="btn btn-primary"
              onClick={handleReport}
              disabled={!reason || loading}
              style={{ width: '100%' }}
            >
              {loading ? 'Enviando...' : 'Enviar reporte'}
            </button>
          </>
        )}

        {step === 'confirm' && (
          <>
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 48 }}>🚫</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 20 }}>
                ¿Bloquear a {profile.display_name}?
              </h3>
              <p style={{ color: 'var(--text2)', fontSize: 14, lineHeight: 1.6, maxWidth: 260 }}>
                No aparecerá en tu explorar y no podrá enviarte mensajes. Podrás desbloquearlo desde tu perfil.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setStep('menu')}>Cancelar</button>
              <button
                className="btn btn-primary"
                style={{ flex: 1, background: 'var(--red)', boxShadow: 'none' }}
                onClick={handleBlock}
                disabled={loading}
              >
                {loading ? '...' : 'Bloquear'}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  )
}