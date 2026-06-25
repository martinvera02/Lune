import { MOODS } from '@/lib/constants'
import { SecureAvatar } from '@/hooks/useSignedUrl'

export default function InboxItem({ connection, other, unread, onClick }) {
  const mood    = MOODS.find(m => m.id === other?.mood_id) || MOODS[0]
  const lastMsg = (connection.messages || []).at(-1)

  function timeAgo(ts) {
    if (!ts) return ''
    const diff = Date.now() - new Date(ts).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1)  return 'ahora'
    if (mins < 60) return `${mins}m`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24)  return `${hrs}h`
    return `${Math.floor(hrs / 24)}d`
  }

  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '16px 24px', cursor: 'pointer',
        borderBottom: '1px solid var(--border)', transition: 'background 0.15s',
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      {/* Avatar con signed URL — solo visible porque hay match */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <div style={{
          width: 54, height: 54, borderRadius: '50%',
          background: `${mood.color}33`,
          border: `1px solid ${mood.color}44`,
          overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 26,
        }}>
          <SecureAvatar
            photoUrl={other?.photo_url}
            userId={other?.user_id}
            hasMatch={true}
            size={54}
            fallback={mood.emoji}
          />
        </div>
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 500, fontSize: 15 }}>{other?.display_name || '...'}</div>
        <div style={{
          fontSize: 13,
          color: unread > 0 ? 'var(--text2)' : 'var(--text3)',
          marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          fontWeight: unread > 0 ? 500 : 400,
        }}>
          {lastMsg?.content || connection.opening_message || 'Sin mensajes aún'}
        </div>
      </div>

      {/* Meta */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5, flexShrink: 0 }}>
        <div style={{ fontSize: 11, color: 'var(--text3)' }}>
          {timeAgo(lastMsg?.created_at || connection.matched_at)}
        </div>
        {unread > 0 && (
          <div style={{
            width: 18, height: 18, borderRadius: '50%',
            background: 'var(--accent)', fontSize: 10, fontWeight: 700,
            color: '#1a0f2e', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {unread}
          </div>
        )}
      </div>
    </div>
  )
}