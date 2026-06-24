import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { ConnectionsProvider } from '@/context/ConnectionsContext'
import { EventProvider } from '@/context/EventContext'
import ToastProvider  from '@/components/ui/Toast'
import LandingPage    from '@/pages/LandingPage'
import AuthPage       from '@/pages/AuthPage'
import OnboardingPage from '@/pages/OnboardingPage'
import AppShell       from '@/pages/AppShell'

const Spinner = () => (
  <div className="app-loading"><div className="loading-orb" /></div>
)

function RequireAuth({ children }) {
  const { session, loading } = useAuth()
  if (loading) return <Spinner />
  if (!session) return <Navigate to="/auth" replace />
  return children
}

function RequireProfile({ children }) {
  const { session, profile, loading } = useAuth()
  // Esperar SIEMPRE a que loading sea false antes de decidir
  if (loading) return <Spinner />
  if (!session) return <Navigate to="/auth" replace />
  if (!profile) return <Navigate to="/onboarding" replace />
  return children
}

function AppRoutes() {
  const { session, profile, loading } = useAuth()

  // No renderizar rutas hasta tener el estado inicial resuelto
  if (loading) return <Spinner />

  return (
    <Routes>
      <Route path="/" element={
        session
          ? profile ? <Navigate to="/app" replace /> : <Navigate to="/onboarding" replace />
          : <LandingPage />
      }/>
      <Route path="/auth" element={
        session ? <Navigate to="/app" replace /> : <AuthPage />
      }/>
      <Route path="/onboarding" element={
        <RequireAuth><OnboardingPage /></RequireAuth>
      }/>
      <Route path="/app/*" element={
        <RequireProfile>
          <ConnectionsProvider>
            <EventProvider>
              <ToastProvider />
              <AppShell />
            </EventProvider>
          </ConnectionsProvider>
        </RequireProfile>
      }/>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}