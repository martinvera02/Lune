import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useProfiles } from '@/hooks/useProfiles'
import { useConnections } from '@/context/ConnectionsContext'
import { showToast } from '@/components/ui/Toast'
import ProfileCard   from '@/components/explore/ProfileCard'
import WriteModal    from '@/components/explore/WriteModal'
import MatchScreen   from '@/components/explore/MatchScreen'
import PublicProfile from '@/components/profile/PublicProfile'

const FILTERS = ['Todos', 'Shoegaze', 'Jazz', 'Indie', 'Folk', 'Post-punk', 'Cine europeo', 'A24']

export default function ExplorePage() {
  const { profiles, loading, refetch, markAsViewed, hasExistingConnection } = useProfiles()
  const { sendOpening } = useConnections()

  const [filter, setFilter]     = useState('Todos')
  const [writeFor, setWriteFor] = useState(null)
  const [matched, setMatched]   = useState(null)
  const [skipped, setSkipped]   = useState([])
  const [viewing, setViewing]   = useState(null)
  const [checking, setChecking] = useState(false)

  const visible = profiles.filter(p => {
    if (skipped.includes(p.id)) return false
    if (filter === 'Todos') return true
    return Object.values(p.cultural_tags || {}).flat().includes(filter)
  })

  async function handleWrite(profile) {
    setChecking(true)
    const existing = await hasExistingConnection(profile.id)
    setChecking(false)
    if (existing) {
      const msg = existing.status === 'matched'
        ? `Ya estás conectado/a con ${profile.display_name} 💬`
        : 'Ya le has enviado un mensaje. Espera su respuesta.'
      showToast({ message: msg, type: 'info' })
      return
    }
    setViewing(null)
    setWriteFor(profile)
  }

  async function handleSend({ profile, questionId, message }) {
    const { error } = await sendOpening({ receiverId: profile.id, questionId, message })
    if (error) { showToast({ message: 'No se pudo enviar. Inténtalo de nuevo.', type: 'error' }); return }
    await markAsViewed(profile.id)
    setWriteFor(null)
    setMatched(profile)
    setSkipped(s => [...s, profile.id])
  }

  async function handleSkip(profileId) {
    await markAsViewed(profileId)
    setSkipped(s => [...s, profileId])
  }

  if (loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="loading-orb" />
    </div>
  )

  return (
    <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '20px 24px 12px', flexShrink: 0 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 28, marginBottom: 4 }}>Explorar</h2>
        <p style={{ color: 'var(--text3)', fontSize: 12 }}>{visible.length > 0 ? `${visible.length} personas cerca` : 'Has visto todo por hoy'}</p>
      </div>

      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '0 24px 16px', scrollbarWidth: 'none', flexShrink: 0 }}>
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '8px 16px', borderRadius: 100, fontSize: 13, whiteSpace: 'nowrap',
            border: `1px solid ${filter === f ? 'var(--accent)' : 'var(--border2)'}`,
            background: filter === f ? 'rgba(192,132,252,0.15)' : 'var(--surface)',
            color: filter === f ? 'var(--accent)' : 'var(--text2)',
            cursor: 'pointer', flexShrink: 0, transition: 'all 0.18s', fontFamily: 'var(--font-body)',
          }}>
            {f === 'Todos' ? '✦ Todos' : f}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px 24px' }}>
        {visible.length === 0
          ? <EmptyState onRefresh={refetch} />
          : <ProfileCard
              profile={visible[0]}
              stackBehind={visible.slice(1, 3)}
              onView={() => setViewing(visible[0])}
              onWrite={() => handleWrite(visible[0])}
              onSkip={() => handleSkip(visible[0].id)}
              checking={checking}
            />
        }
      </div>

      <AnimatePresence>
        {viewing && <PublicProfile profile={viewing} onClose={() => setViewing(null)} onWrite={() => handleWrite(viewing)} />}
      </AnimatePresence>
      <AnimatePresence>
        {writeFor && <WriteModal profile={writeFor} onClose={() => setWriteFor(null)} onSend={handleSend} />}
      </AnimatePresence>
      <AnimatePresence>
        {matched && <MatchScreen profile={matched} onContinue={() => setMatched(null)} />}
      </AnimatePresence>
    </div>
  )
}

function EmptyState({ onRefresh }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '60px 0', textAlign: 'center' }}>
      <div style={{ fontSize: 64, animation: 'float 4s ease-in-out infinite' }}>🌙</div>
      <h3 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 22 }}>Has visto a todos por hoy</h3>
      <p style={{ color: 'var(--text2)', fontSize: 14, maxWidth: 240, lineHeight: 1.6 }}>Vuelve mañana o revisa tus conversaciones pendientes</p>
      <button className="btn btn-ghost" onClick={onRefresh} style={{ marginTop: 8 }}>Actualizar</button>
    </div>
  )
}