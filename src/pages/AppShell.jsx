import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useConnections } from '@/context/ConnectionsContext'
import { useEventContext } from '@/context/EventContext'
import { showToast } from '@/components/ui/Toast'
import ExplorePage      from './ExplorePage'
import VenueExplorePage from './VenueExplorePage'
import MessagesPage     from './MessagesPage'
import ProfilePage      from './ProfilePage'
import VenueBanner      from '@/components/venue/VenueBanner'
import JoinEventModal   from '@/components/venue/JoinEventModal'

const TABS = [
  { id: 'explore',  label: 'Explorar', icon: '✦' },
  { id: 'messages', label: 'Chats',    icon: '💬' },
  { id: 'profile',  label: 'Perfil',   icon: '🌙' },
]

export default function AppShell() {
  const [tab, setTab]           = useState('explore')
  const [showJoin, setShowJoin] = useState(false)
  const { totalUnread }         = useConnections()
  const { activeEvent }         = useEventContext()

  function handleJoined(event) {
    setShowJoin(false)
    showToast({ message: `¡Bienvenido/a a ${event.name}! 🎉`, type: 'success' })
  }

  return (
    <div style={{ maxWidth: 430, margin: '0 auto', height: '100dvh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'rgba(14,12,20,0.85)', backdropFilter: 'blur(20px)', flexShrink: 0, zIndex: 100, gap: 12 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 26, background: 'linear-gradient(135deg, #f0abfc, #f9a8d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', flexShrink: 0 }}>
          Lune
        </div>

        {activeEvent ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 100, background: 'rgba(94,234,212,0.1)', border: '1px solid rgba(94,234,212,0.3)', fontSize: 12, color: 'var(--teal)' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--teal)', flexShrink: 0 }} />
            Modo evento
          </div>
        ) : (
          <button
            onClick={() => setShowJoin(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 100, background: 'rgba(192,132,252,0.1)', border: '1px solid rgba(192,132,252,0.25)', color: 'var(--accent2)', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'all 0.2s' }}
          >
            🎉 Unirse a evento
          </button>
        )}

        <div style={{ fontSize: 11, color: 'var(--text3)', letterSpacing: 1, flexShrink: 0 }}>
          {tab === 'explore' && (activeEvent ? '🎉' : '✦')}
          {tab === 'messages' && '💬'}
          {tab === 'profile' && '🌙'}
        </div>
      </header>

      {activeEvent && tab === 'explore' && (
        <div style={{ padding: '10px 0 0', flexShrink: 0 }}>
          <VenueBanner />
        </div>
      )}

      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={`${tab}-${activeEvent?.id || 'normal'}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}
          >
            {tab === 'explore'  && (activeEvent ? <VenueExplorePage /> : <ExplorePage />)}
            {tab === 'messages' && <MessagesPage />}
            {tab === 'profile'  && <ProfilePage />}
          </motion.div>
        </AnimatePresence>
      </div>

      <nav style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '12px 8px calc(env(safe-area-inset-bottom, 0px) + 12px)', borderTop: '1px solid var(--border)', background: 'rgba(14,12,20,0.9)', backdropFilter: 'blur(24px)', flexShrink: 0, zIndex: 100 }}>
        {TABS.map(t => (
          <button key={t.id} className={`tab-item ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            <div style={{ position: 'relative' }}>
              <span className="tab-icon">{t.icon}</span>
              {t.id === 'messages' && totalUnread > 0 && tab !== 'messages' && (
                <div className="badge">{totalUnread > 9 ? '9+' : totalUnread}</div>
              )}
            </div>
            <span>{t.label}</span>
          </button>
        ))}
      </nav>

      <AnimatePresence>
        {showJoin && <JoinEventModal onClose={() => setShowJoin(false)} onJoined={handleJoined} />}
      </AnimatePresence>
    </div>
  )
}