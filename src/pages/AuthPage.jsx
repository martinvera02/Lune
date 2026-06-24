import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'

export default function AuthPage() {
  const [params]       = useSearchParams()
  const [mode, setMode] = useState(params.get('mode') === 'login' ? 'login' : 'signup')
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = mode === 'login'
      ? await signIn(email, password)
      : await signUp(email, password)

    setLoading(false)

    if (error) {
      setError(translateError(error.message))
      return
    }

    navigate(mode === 'login' ? '/app' : '/onboarding')
  }

  function translateError(msg) {
    if (msg.includes('Invalid login')) return 'Email o contraseña incorrectos'
    if (msg.includes('already registered')) return 'Este email ya está registrado'
    if (msg.includes('Password should')) return 'La contraseña debe tener al menos 6 caracteres'
    return 'Algo salió mal. Inténtalo de nuevo.'
  }

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 28px',
    }}>
      {/* Back */}
      <Link to="/" style={{
        position: 'absolute', top: 24, left: 24,
        color: 'var(--text3)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6,
      }}>
        ← Volver
      </Link>

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 40, textAlign: 'center' }}
      >
        <div style={{
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          fontSize: 32,
          background: 'linear-gradient(135deg, #f0abfc, #f9a8d4)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: 6,
        }}>
          Lune
        </div>
        <p style={{ color: 'var(--text3)', fontSize: 13 }}>
          {mode === 'login' ? 'Bienvenida/o de vuelta 🌙' : 'Crea tu cuenta'}
        </p>
      </motion.div>

      {/* Form */}
      <motion.form
        key={mode}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        onSubmit={handleSubmit}
        style={{ width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', gap: 14 }}
      >
        <input
          className="input"
          type="email"
          placeholder="tu@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <input
          className="input"
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          minLength={6}
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
        />

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                color: 'var(--red)',
                fontSize: 13,
                padding: '10px 14px',
                background: 'rgba(251,113,133,0.08)',
                borderRadius: 'var(--radius-xs)',
                border: '1px solid rgba(251,113,133,0.2)',
              }}
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        <button
          className="btn btn-primary"
          type="submit"
          disabled={loading}
          style={{ width: '100%', marginTop: 4 }}
        >
          {loading
            ? 'Un momento...'
            : mode === 'login' ? 'Entrar' : 'Crear cuenta'}
        </button>

        <p style={{ textAlign: 'center', color: 'var(--text3)', fontSize: 13, marginTop: 4 }}>
          {mode === 'login' ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
          <button
            type="button"
            onClick={() => { setMode(m => m === 'login' ? 'signup' : 'login'); setError('') }}
            style={{
              background: 'none', border: 'none', color: 'var(--accent2)',
              cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-body)',
            }}
          >
            {mode === 'login' ? 'Regístrate' : 'Inicia sesión'}
          </button>
        </p>
      </motion.form>
    </div>
  )
}