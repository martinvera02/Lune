import { createContext, useContext } from 'react'
import { useEvent } from '@/hooks/useEvent'

const EventContext = createContext(null)

export function EventProvider({ children }) {
  const event = useEvent()
  return (
    <EventContext.Provider value={event}>
      {children}
    </EventContext.Provider>
  )
}

export function useEventContext() {
  const ctx = useContext(EventContext)
  if (!ctx) throw new Error('useEventContext must be used inside <EventProvider>')
  return ctx
}