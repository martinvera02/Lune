import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'

// Cache de signed URLs para no regenerar en cada render
const urlCache = new Map()

export function useSignedUrl(photoUrl, targetUserId) {
  const { user } = useAuth()
  const [signedUrl, setSignedUrl] = useState(null)
  const [loading, setLoading]     = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    if (!photoUrl || !targetUserId || !user) return

    // Si no es una URL de Storage privado, usarla directamente
    if (!photoUrl.includes('/storage/v1/object/')) {
      setSignedUrl(photoUrl)
      return
    }

    // Extraer el path del storage desde la URL
    const path = extractStoragePath(photoUrl)
    if (!path) { setSignedUrl(photoUrl); return }

    // Comprobar cache
    const cacheKey = `${path}-${user.id}`
    const cached = urlCache.get(cacheKey)
    if (cached && cached.expires > Date.now()) {
      setSignedUrl(cached.url)
      return
    }

    generateSignedUrl(path, cacheKey)

    return () => clearTimeout(timerRef.current)
  }, [photoUrl, targetUserId, user?.id])

  async function generateSignedUrl(path, cacheKey) {
    setLoading(true)
    const { data, error } = await supabase.storage
      .from('avatars')
      .createSignedUrl(path, 3600) // 1 hora de validez

    if (!error && data?.signedUrl) {
      const expires = Date.now() + 3500 * 1000 // renovar 100s antes de expirar
      urlCache.set(cacheKey, { url: data.signedUrl, expires })
      setSignedUrl(data.signedUrl)

      // Renovar automáticamente antes de que expire
      timerRef.current = setTimeout(() => {
        urlCache.delete(cacheKey)
        generateSignedUrl(path, cacheKey)
      }, 3500 * 1000)
    }

    setLoading(false)
  }

  return { signedUrl, loading }
}

function extractStoragePath(url) {
  try {
    // URL format: .../storage/v1/object/public/avatars/USER_ID/avatar.jpg
    // o .../storage/v1/object/sign/avatars/USER_ID/avatar.jpg
    const match = url.match(/\/avatars\/(.+?)(?:\?|$)/)
    return match ? match[1] : null
  } catch {
    return null
  }
}

// Componente de avatar que gestiona automáticamente signed URLs
export function SecureAvatar({ photoUrl, userId, hasMatch, size = 44, fallback, style = {} }) {
  const { signedUrl } = useSignedUrl(hasMatch ? photoUrl : null, userId)

  const src = hasMatch ? signedUrl : null

  if (!src) {
    return (
      <div style={{
        width: size, height: size, borderRadius: '50%',
        background: 'var(--surface2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.5,
        overflow: 'hidden',
        flexShrink: 0,
        ...style,
      }}>
        {fallback || '🌙'}
      </div>
    )
  }

  return (
    <img
      src={src}
      alt=""
      style={{
        width: size, height: size, borderRadius: '50%',
        objectFit: 'cover', flexShrink: 0,
        ...style,
      }}
    />
  )
}