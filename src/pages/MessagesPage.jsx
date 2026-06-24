import { useState } from 'react'
import { useConnections } from '@/context/ConnectionsContext'
import ChatView        from '@/components/chat/ChatView'
import InboxItem       from '@/components/chat/InboxItem'
import PendingRequests from '@/components/chat/PendingRequests'

export default function MessagesPage() {
  const { connections, loading, otherProfile, unreadCount } = useConnections()
  const [activeConn, setActiveConn] = useState(null)

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="loading-orb" />
      </div>
    )
  }

  if (activeConn) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%' }}>
        <ChatView
          connection={activeConn}
          other={otherProfile(activeConn)}
          onBack={() => setActiveConn(null)}
        />
      </div>
    )
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto' }}>
      <div style={{ padding: '20px 24px 16px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 28, marginBottom: 4 }}>
          Mensajes
        </h2>
        <p style={{ color: 'var(--text3)', fontSize: 12 }}>Solo conversaciones reales</p>
      </div>

      <PendingRequests />

      {connections.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 32px', textAlign: 'center', gap: 14 }}>
          <span style={{ fontSize: 48 }}>✍️</span>
          <h3 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 20 }}>
            Aún no hay conversaciones
          </h3>
          <p style={{ color: 'var(--text2)', fontSize: 14, lineHeight: 1.6, maxWidth: 240 }}>
            Cuando conectes con alguien, aparecerá aquí
          </p>
        </div>
      ) : (
        connections.map(conn => (
          <InboxItem
            key={conn.id}
            connection={conn}
            other={otherProfile(conn)}
            unread={unreadCount(conn)}
            onClick={() => setActiveConn(conn)}
          />
        ))
      )}
    </div>
  )
}