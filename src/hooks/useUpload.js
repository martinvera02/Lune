import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'

export function useUpload() {
  const { user, updateProfile } = useAuth()
  const [uploading, setUploading] = useState(false)
  const [error, setError]         = useState(null)

  async function uploadAvatar(file) {
    if (!file || !user) return { url: null, error: new Error('No file or user') }

    setUploading(true)
    setError(null)

    try {
      const ext      = file.name.split('.').pop()
      const path     = `${user.id}/avatar.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true, contentType: file.type })

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      const url = `${data.publicUrl}?t=${Date.now()}` // cache bust

      // Actualizar profile con la nueva URL
      await updateProfile({ photo_url: url })

      return { url, error: null }
    } catch (err) {
      setError(err)
      return { url: null, error: err }
    } finally {
      setUploading(false)
    }
  }

  return { uploadAvatar, uploading, error }
}