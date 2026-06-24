import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useEventContext } from '@/context/EventContext'
import { useConnections } from '@/context/ConnectionsContext'
import { showToast } from '@/components/ui/Toast'
import { MOODS } from '@/lib/constants'
import WriteModal    from '@/components/explore/WriteModal'
import MatchScreen   from '@/components/explore/MatchScreen'
import PublicProfile from '@/components/profile/PublicProfile'

export default function VenueExplorePage() {
  const { activeEvent, members, loading } = useEventContext()
  const { sendOpening } = useConnections()

  const [writeFor, setWriteFor] = useState(null)
  const [matched, setMatched]   = useState(null)
  const [viewing, setViewing]   = useState(null)
  const [skipped, setSkipped]   = useState([])

  // Guard — si el evento ya no existe (usuario salió) no renderizar nada
  if (!activeEvent) return null

  const visible = members.filter(m => !skipped.includes(m.id))
  const venue   = activeEvent.venues || {}

  async function handleSend({ profile, questionId, message }) {
    const { error } = await sendOpening({ receiverId: profile.id, questionId, message })
    if (error) { showToast({ message: 'No se pudo enviar.', type: 'error' }); return }
    setWriteFor(null)
    setMatched(profile)
    setSkipped(s => [...s, profile.id])
  }

  if (loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="loading-orb" />
    </div>
  )

  return (
    <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Venue header */}
      <div style={{ padding: '16px 24px 12px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          {venue.logo_url
            ? <img src={venue.logo_url} alt="" style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover' }} />
            : <span style={{ fontSize: 24 }}>🎉</span>
          }
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 22 }}>
              {activeEvent.name}
            </h2>
            <p style={{ color: 'var(--text3)', fontSize: 12 }}>
              {venue.name || ''} · {members.length + 1} personas esta noche
            </p>
          </div>
        </div>
      </div>

      {/* Members list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px 24px' }}>
        {visible.length === 0 ? (
          <EmptyVenue membersTotal={members.length} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {visible.map(member => (
              <VenueMemberCard
                key={member.id}
                member={member}
                onView={() => setViewing(member)}
                onWrite={() => setWriteFor(member)}
                onSkip={() => setSkipped(s => [...s, member.id])}
              />
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {viewing && (
          <PublicProfile
            profile={viewing}
            onClose={() => setViewing(null)}
            onWrite={() => { setViewing(null); setWriteFor(viewing) }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {writeFor && (
          <WriteModal
            profile={writeFor}
            onClose={() => setWriteFor(null)}
            onSend={handleSend}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {matched && <MatchScreen profile={matched} onContinue={() => setMatched(null)} />}
      </AnimatePresence>
    </div>
  )
}

function VenueMemberCard({ member, onView, onWrite, onSkip }) {
  const mood   = MOODS.find(m => m.id === member.mood_id) || MOODS[0]
  const tags   = Object.values(member.cultural_tags || {}).flat().slice(0, 3)
  const answer = member.profile_answers?.[0]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'var(--surface)', border: '1px solid var(--border2)',
        borderRadius: 'var(--radius)', overflow: 'hidden', cursor: 'pointer',
      }}
      onClick={onView}
    >
      <div style={{ height: 4, background: `linear-gradient(90deg, ${mood.color}, ${mood.color}88)` }} />

      <div style={{ padding: '16px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <div style={{
            width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
            background: `${mood.color}33`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26, overflow: 'hidden', border: `1px solid ${mood.color}44`,
          }}>
            {member.photo_url
              ? <img src={member.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : mood.emoji
            }
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 18 }}>{member.display_name}</span>
              <span style={{ fontSize: 13, color: 'var(--text3)' }}>{member.age}</span>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 100, fontSize: 11, marginTop: 3, background: `${mood.color}22`, color: mood.color }}>
              {mood.emoji} {mood.label}
            </div>
          </div>
          <div style={{ flexShrink: 0, display: 'flex', gap: 6 }}>
            <button onClick={e => { e.stopPropagation(); onSkip() }} className="btn btn-ghost" style={{ width: 36, height: 36, padding: 0, fontSize: 16, borderRadius: '50%' }}>👋</button>
            <button onClick={e => { e.stopPropagation(); onWrite() }} className="btn btn-primary" style={{ width: 36, height: 36, padding: 0, fontSize: 16, borderRadius: '50%' }}>✍️</button>
          </div>
        </div>

        {answer && (
          <p style={{ fontSize: 13, color: 'var(--text2)', fontStyle: 'italic', lineHeight: 1.5, marginBottom: 10, borderLeft: `2px solid ${mood.color}66`, paddingLeft: 10 }}>
            "{answer.answer.slice(0, 80)}{answer.answer.length > 80 ? '...' : ''}"
          </p>
        )}

        {tags.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {tags.map(t => <span key={t} className="tag" style={{ fontSize: 11, padding: '3px 9px' }}>{t}</span>)}
          </div>
        )}
      </div>
    </motion.div>
  )
}

function EmptyVenue({ membersTotal }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '60px 0', textAlign: 'center' }}>
      <div style={{ fontSize: 56 }}>🎶</div>
      {membersTotal === 0 ? (
        <>
          <h3 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 20 }}>Eres el primero</h3>
          <p style={{ color: 'var(--text2)', fontSize: 14, maxWidth: 240, lineHeight: 1.6 }}>Aún no hay más gente. Comparte el código para que se unan.</p>
        </>
      ) : (
        <>
          <h3 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 20 }}>Has visto a todos</h3>
          <p style={{ color: 'var(--text2)', fontSize: 14, maxWidth: 240, lineHeight: 1.6 }}>Ya has interactuado con toda la gente del evento esta noche.</p>
        </>
      )}
    </div>
  )
}