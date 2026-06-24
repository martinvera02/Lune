import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { useUpload } from '@/hooks/useUpload'
import { supabase } from '@/lib/supabase'
import { MOODS, CULTURE_TAGS } from '@/lib/constants'

export default function EditProfile({ onClose }) {
  const { profile, updateProfile } = useAuth()
  const { uploadAvatar, uploading } = useUpload()

  const [displayName, setDisplayName] = useState(profile?.display_name || '')
  const [age, setAge]                 = useState(profile?.age || '')
  const [moodId, setMoodId]           = useState(profile?.mood_id || 'soft')
  const [tags, setTags]               = useState(profile?.cultural_tags || { music: [], film: [], books: [] })
  const [saving, setSaving]           = useState(false)
  const [photoFile, setPhotoFile]     = useState(null)
  const [photoPreview, setPhotoPreview] = useState(profile?.photo_url || null)
  const [activeTab, setActiveTab]     = useState('basic') // basic | culture | photo

  function toggleTag(cat, tag) {
    setTags(prev => {
      const arr = prev[cat] || []
      return { ...prev, [cat]: arr.includes(tag) ? arr.filter(t => t !== tag) : [...arr, tag] }
    })
  }

  function handlePhotoChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  async function handleSave() {
    setSaving(true)
    try {
      // Upload photo if changed
      if (photoFile) {
        await uploadAvatar(photoFile)
      }

      await updateProfile({
        display_name:  displayName.trim(),
        age:           Number(age),
        mood_id:       moodId,
        cultural_tags: tags,
      })

      onClose()
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const TABS = [
    { id: 'basic',   label: 'Básico' },
    { id: 'culture', label: 'Gustos' },
    { id: 'photo',   label: 'Foto' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(10,8,18,0.85)', backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        style={{
          width: '100%', maxWidth: 430,
          background: 'var(--bg2)',
          borderRadius: '28px 28px 0 0',
          maxHeight: '92dvh', display: 'flex', flexDirection: 'column',
          border: '1px solid var(--border2)', borderBottom: 'none',
        }}
      >
        {/* Handle + header */}
        <div style={{ padding: '20px 24px 0', flexShrink: 0 }}>
          <div style={{ width: 40, height: 4, borderRadius: 4, background: 'var(--surface2)', margin: '0 auto 20px' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 22 }}>Editar perfil</h3>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text3)', fontSize: 20, cursor: 'pointer' }}>✕</button>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, background: 'var(--surface)', borderRadius: 100, padding: 4, marginBottom: 24 }}>
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                style={{
                  flex: 1, padding: '8px', borderRadius: 100, border: 'none',
                  background: activeTab === t.id ? 'var(--surface2)' : 'transparent',
                  color: activeTab === t.id ? 'var(--accent)' : 'var(--text3)',
                  cursor: 'pointer', fontSize: 13, fontWeight: 500,
                  fontFamily: 'var(--font-body)', transition: 'all 0.2s',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px 24px' }}>

          {/* Basic tab */}
          {activeTab === 'basic' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text3)', display: 'block', marginBottom: 6 }}>Nombre</label>
                <input className="input" value={displayName} onChange={e => setDisplayName(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text3)', display: 'block', marginBottom: 6 }}>Edad</label>
                <input className="input" type="number" min={18} max={99} value={age} onChange={e => setAge(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text3)', display: 'block', marginBottom: 10 }}>Mood de hoy</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {MOODS.map(m => (
                    <button
                      key={m.id}
                      onClick={() => setMoodId(m.id)}
                      style={{
                        padding: '12px', borderRadius: 'var(--radius-sm)',
                        border: `2px solid ${moodId === m.id ? m.color : 'transparent'}`,
                        background: moodId === m.id ? `${m.color}22` : 'var(--surface)',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                        fontFamily: 'var(--font-body)', transition: 'all 0.2s',
                      }}
                    >
                      <span style={{ fontSize: 20 }}>{m.emoji}</span>
                      <span style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Culture tab */}
          {activeTab === 'culture' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {[
                { key: 'music', label: 'Música', icon: '🎵' },
                { key: 'film',  label: 'Cine',   icon: '🎬' },
                { key: 'books', label: 'Libros',  icon: '📖' },
              ].map(cat => (
                <div key={cat.key}>
                  <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 10 }}>{cat.icon} {cat.label}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                    {CULTURE_TAGS[cat.key].map(tag => {
                      const selected = (tags[cat.key] || []).includes(tag)
                      return (
                        <button
                          key={tag}
                          onClick={() => toggleTag(cat.key, tag)}
                          style={{
                            padding: '7px 13px', borderRadius: 100, fontSize: 12,
                            border: `1px solid ${selected ? 'var(--accent)' : 'var(--border2)'}`,
                            background: selected ? 'rgba(192,132,252,0.15)' : 'var(--surface)',
                            color: selected ? 'var(--accent2)' : 'var(--text2)',
                            cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'all 0.15s',
                          }}
                        >
                          {tag}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Photo tab */}
          {activeTab === 'photo' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
              {photoPreview ? (
                <>
                  <img
                    src={photoPreview}
                    alt=""
                    style={{ width: 130, height: 130, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--accent)', boxShadow: '0 0 30px var(--glow)' }}
                  />
                  <label className="btn btn-ghost" style={{ cursor: 'pointer', fontSize: 13, padding: '10px 20px' }}>
                    Cambiar foto
                    <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
                  </label>
                </>
              ) : (
                <label style={{
                  width: '100%', border: '2px dashed var(--border2)', borderRadius: 'var(--radius)',
                  padding: '48px 24px', textAlign: 'center', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                }}>
                  <span style={{ fontSize: 40, opacity: 0.5 }}>📷</span>
                  <span style={{ fontWeight: 500, color: 'var(--text2)' }}>Subir foto</span>
                  <span style={{ fontSize: 12, color: 'var(--text3)' }}>Solo visible tras el match</span>
                  <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
                </label>
              )}
              <p style={{ fontSize: 12, color: 'var(--text3)', textAlign: 'center', lineHeight: 1.5 }}>
                Tu foto permanece oculta hasta que hay match mutuo 🔒
              </p>
            </div>
          )}
        </div>

        {/* Save button */}
        <div style={{ padding: '16px 24px 32px', flexShrink: 0, borderTop: '1px solid var(--border)' }}>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving || uploading || !displayName.trim()}
            style={{ width: '100%' }}
          >
            {saving || uploading ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}