import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { showToast } from '@/components/ui/Toast'

const VENUE_TYPES = [
  { id: 'discoteca', label: 'Discoteca',  emoji: '🪩' },
  { id: 'sala',      label: 'Sala',       emoji: '🎸' },
  { id: 'bar',       label: 'Bar',        emoji: '🍸' },
  { id: 'festival',  label: 'Festival',   emoji: '🎪' },
  { id: 'club',      label: 'Club',       emoji: '🎶' },
  { id: 'otro',      label: 'Otro',       emoji: '🏢' },
]

export default function CreateVenueModal({ onClose, onCreated }) {
  const { profile } = useAuth()
  const [step, setStep]     = useState(1) // 1: datos básicos, 2: contacto y redes, 3: credenciales
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState(null) // credenciales generadas

  const [form, setForm] = useState({
    name:          '',
    description:   '',
    venue_type:    'discoteca',
    address:       '',
    city:          '',
    contact_email: '',
    contact_phone: '',
    instagram:     '',
    website:       '',
    plan:          'monthly',
    owner_email:   '',
    temp_password: '',
  })

  function update(k, v) { setForm(f => ({ ...f, [k]: v })) }

  function generatePassword() {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
    return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  }

  function canNext() {
    if (step === 1) return form.name.trim() && form.city.trim() && form.venue_type
    if (step === 2) return form.contact_email.trim() && form.owner_email.trim()
    return false
  }

  async function handleCreate() {
    setSaving(true)
    const pwd = form.temp_password || generatePassword()

    // Crear venue — el usuario se crea manualmente en Supabase Auth
    const { data: venue, error: venueError } = await supabase
      .from('venues')
      .insert({
        name:          form.name.trim(),
        description:   form.description.trim(),
        venue_type:    form.venue_type,
        address:       form.address.trim(),
        city:          form.city.trim(),
        contact_email: form.contact_email.trim(),
        contact_phone: form.contact_phone.trim(),
        instagram:     form.instagram.trim(),
        website:       form.website.trim(),
        owner_email:   form.owner_email.trim(),
        plan:          form.plan,
        active:        true,
      })
      .select()
      .single()

    setSaving(false)

    if (venueError) {
      showToast({ message: 'Error al crear el local', type: 'error' })
      return
    }

    setResult({
      venueName:   venue.name,
      ownerEmail:  form.owner_email,
      password:    pwd,
      loginUrl:    `${window.location.origin}/venue-admin`,
      venueId:     venue.id,
    })
    setStep(3)
    onCreated?.()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(10,8,18,0.88)', backdropFilter: 'blur(14px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
      onClick={e => e.target === e.currentTarget && step !== 3 && onClose()}
    >
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        style={{ width: '100%', maxWidth: 430, background: 'var(--bg2)', borderRadius: '28px 28px 0 0', padding: '32px 24px 48px', border: '1px solid var(--border2)', borderBottom: 'none', maxHeight: '92dvh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 18 }}
      >
        <div style={{ width: 40, height: 4, borderRadius: 4, background: 'var(--surface2)', margin: '-16px auto 4px' }} />

        {/* Step indicator */}
        {step < 3 && (
          <div style={{ display: 'flex', gap: 6 }}>
            {[1, 2].map(s => (
              <div key={s} style={{ flex: 1, height: 3, borderRadius: 3, background: s <= step ? 'var(--accent)' : 'var(--surface2)', transition: 'all 0.3s' }} />
            ))}
          </div>
        )}

        {/* Step 1 — Datos básicos */}
        {step === 1 && (
          <>
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 22, marginBottom: 4 }}>Nuevo local</h3>
              <p style={{ color: 'var(--text3)', fontSize: 13 }}>Información básica del negocio</p>
            </div>

            <Field label="Nombre del local *">
              <input className="input" placeholder="Sala Mondo" value={form.name} onChange={e => update('name', e.target.value)} autoFocus />
            </Field>

            <Field label="Tipo de local *">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {VENUE_TYPES.map(t => (
                  <button key={t.id} onClick={() => update('venue_type', t.id)} style={{
                    padding: '10px 8px', borderRadius: 'var(--radius-sm)', border: `1px solid ${form.venue_type === t.id ? 'var(--accent)' : 'var(--border2)'}`,
                    background: form.venue_type === t.id ? 'rgba(192,132,252,0.12)' : 'var(--surface)',
                    cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 12,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                    color: form.venue_type === t.id ? 'var(--accent2)' : 'var(--text2)',
                    transition: 'all 0.15s',
                  }}>
                    <span style={{ fontSize: 20 }}>{t.emoji}</span>
                    {t.label}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Ciudad *">
              <input className="input" placeholder="Madrid" value={form.city} onChange={e => update('city', e.target.value)} />
            </Field>

            <Field label="Dirección">
              <input className="input" placeholder="Calle de las Huertas 12" value={form.address} onChange={e => update('address', e.target.value)} />
            </Field>

            <Field label="Descripción">
              <textarea className="input" rows={3} placeholder="El templo del indie en Madrid..." value={form.description} onChange={e => update('description', e.target.value)} style={{ resize: 'none' }} />
            </Field>

            <Field label="Plan">
              <div style={{ display: 'flex', gap: 8 }}>
                {[{ id: 'trial', label: 'Trial', desc: 'Gratis 30 días' }, { id: 'monthly', label: 'Mensual', desc: '€79/mes' }, { id: 'pay_per_event', label: 'Por evento', desc: '€19/evento' }].map(p => (
                  <button key={p.id} onClick={() => update('plan', p.id)} style={{
                    flex: 1, padding: '10px 8px', borderRadius: 'var(--radius-sm)', border: `1px solid ${form.plan === p.id ? 'var(--teal)' : 'var(--border2)'}`,
                    background: form.plan === p.id ? 'rgba(94,234,212,0.1)' : 'var(--surface)',
                    cursor: 'pointer', fontFamily: 'var(--font-body)', textAlign: 'center',
                    color: form.plan === p.id ? 'var(--teal)' : 'var(--text2)', transition: 'all 0.15s',
                  }}>
                    <div style={{ fontWeight: 600, fontSize: 12 }}>{p.label}</div>
                    <div style={{ fontSize: 10, marginTop: 2, opacity: 0.7 }}>{p.desc}</div>
                  </button>
                ))}
              </div>
            </Field>
          </>
        )}

        {/* Step 2 — Contacto y redes */}
        {step === 2 && (
          <>
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 22, marginBottom: 4 }}>Contacto y acceso</h3>
              <p style={{ color: 'var(--text3)', fontSize: 13 }}>Datos de contacto y credenciales del panel</p>
            </div>

            <Field label="Email del responsable * (acceso al panel)">
              <input className="input" type="email" placeholder="manager@salomondo.com" value={form.owner_email} onChange={e => update('owner_email', e.target.value)} />
            </Field>

            <Field label="Email de contacto público *">
              <input className="input" type="email" placeholder="info@salomondo.com" value={form.contact_email} onChange={e => update('contact_email', e.target.value)} />
            </Field>

            <Field label="Teléfono">
              <input className="input" type="tel" placeholder="+34 600 000 000" value={form.contact_phone} onChange={e => update('contact_phone', e.target.value)} />
            </Field>

            <Field label="Instagram">
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)', fontSize: 14 }}>@</span>
                <input className="input" placeholder="salomondo" value={form.instagram} onChange={e => update('instagram', e.target.value)} style={{ paddingLeft: 30 }} />
              </div>
            </Field>

            <Field label="Sitio web">
              <input className="input" placeholder="https://salomondo.com" value={form.website} onChange={e => update('website', e.target.value)} />
            </Field>

            <Field label="Contraseña temporal (opcional — se genera automáticamente si se deja vacío)">
              <input className="input" placeholder="Se genera automáticamente" value={form.temp_password} onChange={e => update('temp_password', e.target.value)} />
            </Field>
          </>
        )}

        {/* Step 3 — Credenciales generadas */}
        {step === 3 && result && (
          <>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 22, marginBottom: 6 }}>
                {result.venueName} creado
              </h3>
              <p style={{ color: 'var(--text2)', fontSize: 14 }}>Envía estas credenciales al responsable del local</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <CredentialRow label="URL de acceso"    value={result.loginUrl}    copyable />
              <CredentialRow label="Email"            value={result.ownerEmail}  copyable />
              <CredentialRow label="Contraseña"       value={result.password}    copyable secret />
            </div>

            <div style={{ padding: '14px 16px', borderRadius: 'var(--radius-sm)', background: 'rgba(252,211,77,0.08)', border: '1px solid rgba(252,211,77,0.25)', fontSize: 13, color: 'var(--gold)', lineHeight: 1.6 }}>
              <strong>Pasos para activar el acceso:</strong>
              <br/>1. Ve a <strong>Supabase → Authentication → Users → Add user</strong>
              <br/>2. Crea el usuario con el email y contraseña de arriba
              <br/>3. Ejecuta en SQL Editor:
              <pre style={{ marginTop: 8, fontSize: 11, background: 'var(--bg3)', padding: '8px 10px', borderRadius: 6, overflowX: 'auto', color: 'var(--text2)', whiteSpace: 'pre-wrap' }}>
{`UPDATE venues SET owner_user_id = (SELECT id FROM auth.users WHERE email = '${result.ownerEmail}') WHERE id = '${result.venueId}';`}
              </pre>
            </div>

            <button className="btn btn-primary" onClick={onClose} style={{ width: '100%' }}>
              Cerrar
            </button>
          </>
        )}

        {/* Navigation */}
        {step < 3 && (
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            {step > 1 && (
              <button className="btn btn-ghost" onClick={() => setStep(s => s - 1)} style={{ flex: 1 }}>← Atrás</button>
            )}
            {step < 2 ? (
              <button className="btn btn-primary" onClick={() => canNext() && setStep(2)} disabled={!canNext()} style={{ flex: 2 }}>
                Continuar →
              </button>
            ) : (
              <button className="btn btn-primary" onClick={handleCreate} disabled={!canNext() || saving} style={{ flex: 2 }}>
                {saving ? 'Creando...' : 'Crear local 🎉'}
              </button>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label style={{ fontSize: 12, color: 'var(--text3)', display: 'block', marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  )
}

function CredentialRow({ label, value, copyable, secret }) {
  const [copied, setCopied] = useState(false)
  const [show, setShow]     = useState(!secret)

  function copy() {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--surface)', border: '1px solid var(--border2)', display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 3, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</div>
        <div style={{ fontSize: 13, fontWeight: 500, fontFamily: secret ? 'monospace' : 'var(--font-body)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {show ? value : '••••••••••'}
        </div>
      </div>
      {secret && (
        <button onClick={() => setShow(s => !s)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 16, flexShrink: 0 }}>
          {show ? '🙈' : '👁️'}
        </button>
      )}
      {copyable && (
        <button onClick={copy} style={{ background: 'none', border: 'none', color: copied ? 'var(--teal)' : 'var(--text3)', cursor: 'pointer', fontSize: 13, flexShrink: 0, fontFamily: 'var(--font-body)' }}>
          {copied ? '✓' : 'Copiar'}
        </button>
      )}
    </div>
  )
}