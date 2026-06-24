import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { MOODS, CULTURE_TAGS, DEEP_QUESTIONS, GENDERS, ORIENTATIONS } from '@/lib/constants'

const TOTAL_STEPS = 8

const slideVariants = {
  enter:  { opacity: 0, x: 40 },
  center: { opacity: 1, x: 0 },
  exit:   { opacity: 0, x: -40 },
}

export default function OnboardingPage() {
  const { user, refetchProfile } = useAuth()
  const navigate = useNavigate()

  const [step, setStep]     = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  const [data, setData] = useState({
    displayName: '', age: '',
    gender: null, orientation: null,
    mood: null,
    music: [], film: [], books: [],
    answer: '', photo: null,
  })

  function update(key, val) { setData(d => ({ ...d, [key]: val })) }

  function toggleTag(cat, tag) {
    setData(d => {
      const arr = d[cat]
      return { ...d, [cat]: arr.includes(tag) ? arr.filter(t => t !== tag) : [...arr, tag] }
    })
  }

  function canAdvance() {
    switch (step) {
      case 0: return data.displayName.trim().length >= 2 && Number(data.age) >= 18
      case 1: return data.gender !== null
      case 2: return data.orientation !== null
      case 3: return data.mood !== null
      case 4: return data.music.length >= 1
      case 5: return data.film.length >= 1
      case 6: return data.answer.trim().length >= 15
      case 7: return true
      default: return false
    }
  }

  async function finish() {
    setSaving(true)
    setError('')
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .upsert({
          user_id:         user.id,
          display_name:    data.displayName.trim(),
          age:             Number(data.age),
          gender:          data.gender,
          orientation:     data.orientation,
          mood_id:         data.mood.id,
          cultural_tags:   { music: data.music, film: data.film, books: data.books },
          onboarding_done: true,
        }, { onConflict: 'user_id' })
        .select()
        .single()

      if (profileError) throw profileError

      const { data: question } = await supabase
        .from('questions')
        .select('id')
        .like('content', '%última cosa%')
        .single()

      if (question?.id) {
        await supabase.from('profile_answers').upsert({
          profile_id: profile.id, question_id: question.id, answer: data.answer.trim(),
        }, { onConflict: 'profile_id, question_id' })
      }

      await refetchProfile()
      navigate('/app')
    } catch (err) {
      setError('Algo salió mal. Inténtalo de nuevo.')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  function next() {
    if (step < TOTAL_STEPS - 1) setStep(s => s + 1)
    else finish()
  }

  const steps = [
    <StepName        data={data} update={update} />,
    <StepGender      data={data} update={update} />,
    <StepOrientation data={data} update={update} />,
    <StepMood        data={data} update={update} />,
    <StepCulture category="music" label="¿Qué música te define?"  data={data} toggle={toggleTag} />,
    <StepCulture category="film"  label="¿Qué cine te mueve?"    data={data} toggle={toggleTag} />,
    <StepQuestion    data={data} update={update} />,
    <StepPhoto       data={data} update={update} onSkip={finish} />,
  ]

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', padding: '48px 24px 32px', maxWidth: 430, margin: '0 auto' }}>
      {/* Progress */}
      <div style={{ display: 'flex', gap: 5, marginBottom: 36 }}>
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 3,
            background: i < step ? 'var(--accent)' : i === step
              ? 'linear-gradient(90deg, var(--accent), var(--accent2))'
              : 'var(--surface2)',
            transition: 'all 0.4s',
          }} />
        ))}
      </div>

      {/* Step */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            variants={slideVariants}
            initial="enter" animate="center" exit="exit"
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {steps[step]}
          </motion.div>
        </AnimatePresence>
      </div>

      {error && <p style={{ color: 'var(--red)', fontSize: 13, textAlign: 'center', marginBottom: 12 }}>{error}</p>}

      <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
        {step > 0 && (
          <button className="btn btn-ghost" onClick={() => setStep(s => s - 1)} style={{ flex: 1 }}>← Atrás</button>
        )}
        {canAdvance() && (
          <button className="btn btn-primary" onClick={next} disabled={saving} style={{ flex: 2 }}>
            {saving ? 'Guardando...' : step === TOTAL_STEPS - 1 ? 'Entrar a Lune 🌙' : 'Continuar →'}
          </button>
        )}
      </div>
    </div>
  )
}

// ── Steps ─────────────────────────────────────────────────────────────────────

function StepName({ data, update }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ marginBottom: 8 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 28, marginBottom: 6 }}>¿Cómo te llamas?</h2>
        <p style={{ color: 'var(--text2)', fontSize: 14 }}>El nombre que quieras usar aquí</p>
      </div>
      <input className="input" placeholder="Tu nombre..." value={data.displayName} onChange={e => update('displayName', e.target.value)} autoFocus />
      <input className="input" type="number" placeholder="¿Cuántos años tienes?" value={data.age} onChange={e => update('age', e.target.value)} min={18} max={99} />
      {data.age && Number(data.age) < 18 && <p style={{ color: 'var(--red)', fontSize: 12 }}>Debes tener al menos 18 años</p>}
    </div>
  )
}

function StepGender({ data, update }) {
  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 28, marginBottom: 6 }}>¿Con qué género te identificas?</h2>
        <p style={{ color: 'var(--text2)', fontSize: 14 }}>Solo tú decides cómo te defines</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {GENDERS.map(g => (
          <button
            key={g.id}
            onClick={() => update('gender', g.id)}
            style={{
              padding: '16px 20px', borderRadius: 'var(--radius-sm)',
              border: `2px solid ${data.gender === g.id ? 'var(--accent)' : 'var(--border2)'}`,
              background: data.gender === g.id ? 'rgba(192,132,252,0.12)' : 'var(--surface)',
              display: 'flex', alignItems: 'center', gap: 12,
              cursor: 'pointer', fontFamily: 'var(--font-body)', textAlign: 'left',
              transition: 'all 0.2s',
            }}
          >
            <span style={{ fontSize: 22 }}>{g.emoji}</span>
            <span style={{ fontWeight: 500, fontSize: 15, color: 'var(--text)' }}>{g.label}</span>
            {data.gender === g.id && <span style={{ marginLeft: 'auto', color: 'var(--accent)', fontSize: 18 }}>✓</span>}
          </button>
        ))}
      </div>
    </div>
  )
}

function StepOrientation({ data, update }) {
  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 26, marginBottom: 6 }}>¿Cuál es tu orientación sexual?</h2>
        <p style={{ color: 'var(--text2)', fontSize: 14 }}>Usado para mostrarte perfiles relevantes</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {ORIENTATIONS.map(o => (
          <button
            key={o.id}
            onClick={() => update('orientation', o.id)}
            style={{
              padding: '14px 20px', borderRadius: 'var(--radius-sm)',
              border: `2px solid ${data.orientation === o.id ? 'var(--accent)' : 'var(--border2)'}`,
              background: data.orientation === o.id ? 'rgba(192,132,252,0.12)' : 'var(--surface)',
              display: 'flex', alignItems: 'center', gap: 12,
              cursor: 'pointer', fontFamily: 'var(--font-body)', textAlign: 'left',
              transition: 'all 0.2s',
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 500, fontSize: 15, color: 'var(--text)' }}>{o.label}</div>
              {o.desc && <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{o.desc}</div>}
            </div>
            {data.orientation === o.id && <span style={{ color: 'var(--accent)', fontSize: 18, flexShrink: 0 }}>✓</span>}
          </button>
        ))}
      </div>
    </div>
  )
}

function StepMood({ data, update }) {
  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 28, marginBottom: 6 }}>¿Cuál es tu mood hoy?</h2>
        <p style={{ color: 'var(--text2)', fontSize: 14 }}>Actualizable cada día desde tu perfil</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {MOODS.map(m => (
          <button
            key={m.id}
            onClick={() => update('mood', m)}
            style={{
              padding: '18px 14px', borderRadius: 'var(--radius)',
              border: `2px solid ${data.mood?.id === m.id ? m.color : 'transparent'}`,
              background: data.mood?.id === m.id ? `${m.color}22` : 'var(--surface)',
              textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
              cursor: 'pointer', fontFamily: 'var(--font-body)',
              transition: 'all 0.2s cubic-bezier(0.34,1.56,0.64,1)',
              transform: data.mood?.id === m.id ? 'scale(1.03)' : 'scale(1)',
              boxShadow: data.mood?.id === m.id ? `0 0 20px ${m.color}33` : 'none',
            }}
          >
            <span style={{ fontSize: 30 }}>{m.emoji}</span>
            <span style={{ fontWeight: 500, fontSize: 14, color: 'var(--text)' }}>{m.label}</span>
            <span style={{ fontSize: 11, color: 'var(--text3)' }}>{m.desc}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function StepCulture({ category, label, data, toggle }) {
  const icons = { music: '🎵', film: '🎬', books: '📖' }
  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 26, marginBottom: 6 }}>{label}</h2>
        <p style={{ color: 'var(--text2)', fontSize: 14 }}>Elige los que resuenen contigo</p>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {CULTURE_TAGS[category].map(tag => {
          const selected = data[category].includes(tag)
          return (
            <button
              key={tag}
              onClick={() => toggle(category, tag)}
              style={{
                padding: '9px 16px', borderRadius: 100,
                border: `1px solid ${selected ? 'var(--accent)' : 'var(--border2)'}`,
                background: selected ? 'rgba(192,132,252,0.15)' : 'var(--surface)',
                color: selected ? 'var(--accent2)' : 'var(--text2)',
                cursor: 'pointer', fontSize: 13, transition: 'all 0.18s', fontFamily: 'var(--font-body)',
              }}
            >
              {icons[category]} {tag}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function StepQuestion({ data, update }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--accent)', fontWeight: 600, marginBottom: 10 }}>✦ Pregunta profunda</p>
        <h2 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 22, lineHeight: 1.4, marginBottom: 8 }}>{DEEP_QUESTIONS[0]}</h2>
        <p style={{ color: 'var(--text2)', fontSize: 13, lineHeight: 1.5 }}>Esto aparece en tu perfil. Es lo primero que alguien ve de ti.</p>
      </div>
      <textarea
        className="input"
        rows={6}
        placeholder="Escribe con honestidad..."
        value={data.answer}
        onChange={e => update('answer', e.target.value)}
        style={{ resize: 'none', lineHeight: 1.65 }}
      />
      <p style={{ fontSize: 11, color: 'var(--text3)', fontStyle: 'italic' }}>{data.answer.length} caracteres · mínimo 15</p>
    </div>
  )
}

function StepPhoto({ data, update, onSkip }) {
  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    update('photo', { file, preview: URL.createObjectURL(file) })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 26, marginBottom: 6 }}>Añade una foto</h2>
        <p style={{ color: 'var(--text2)', fontSize: 14, lineHeight: 1.5 }}>Solo se desvela cuando hay match mutuo 🔒</p>
      </div>
      {data.photo?.preview ? (
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <img src={data.photo.preview} alt="" style={{ width: 130, height: 130, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--accent)', boxShadow: '0 0 30px var(--glow)' }} />
          <label className="btn btn-ghost" style={{ fontSize: 13, padding: '10px 20px', cursor: 'pointer' }}>
            Cambiar foto
            <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
          </label>
        </div>
      ) : (
        <label style={{ width: '100%', border: '2px dashed var(--border2)', borderRadius: 'var(--radius)', padding: '48px 24px', textAlign: 'center', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 40, opacity: 0.5 }}>📷</span>
          <span style={{ fontWeight: 500, color: 'var(--text2)' }}>Subir foto</span>
          <span style={{ fontSize: 12, color: 'var(--text3)' }}>Solo visible tras el match</span>
          <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
        </label>
      )}
      <button
        style={{ background: 'none', border: 'none', color: 'var(--text3)', fontSize: 13, cursor: 'pointer', textAlign: 'center', fontFamily: 'var(--font-body)', marginTop: 4 }}
        onClick={onSkip}
      >
        Prefiero no añadir foto ahora
      </button>
    </div>
  )
}