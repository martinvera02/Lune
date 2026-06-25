import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { ConnectionsProvider } from '@/context/ConnectionsContext'
import { EventProvider } from '@/context/EventContext'
import ToastProvider     from '@/components/ui/Toast'
import LandingPage       from '@/pages/LandingPage'
import AuthPage          from '@/pages/AuthPage'
import OnboardingPage    from '@/pages/OnboardingPage'
import AppShell          from '@/pages/AppShell'
import AdminPage         from '@/pages/AdminPage'
import VenueAdminPage    from '@/pages/VenueAdminPage'

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
  if (loading) return <Spinner />
  if (!session) return <Navigate to="/auth" replace />
  if (!profile) return <Navigate to="/onboarding" replace />
  return children
}

function RequireAdmin({ children }) {
  const { profile, loading } = useAuth()
  if (loading) return <Spinner />
  if (!profile) return <Navigate to="/auth" replace />
  if (profile.role !== 'admin' && profile.role !== 'moderator') return <Navigate to="/app" replace />
  return children
}

// Solo requiere sesión — VenueAdminPage verifica si es dueño de venue
function RequireVenueAuth({ children }) {
  const { session, loading } = useAuth()
  if (loading) return <Spinner />
  if (!session) return <Navigate to="/auth?mode=login&redirect=/venue-admin" replace />
  return children
}

function AppRoutes() {
  const { session, profile, loading } = useAuth()
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
      <Route path="/admin/*" element={
        <RequireAdmin>
          <ConnectionsProvider>
            <EventProvider>
              <ToastProvider />
              <div style={{ maxWidth: 430, margin: '0 auto', minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
                <AdminPage onBack={() => window.history.back()} />
              </div>
            </EventProvider>
          </ConnectionsProvider>
        </RequireAdmin>
      }/>
      <Route path="/venue-admin/*" element={
        <RequireVenueAuth>
          <ToastProvider />
          <VenueAdminPage />
        </RequireVenueAuth>
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