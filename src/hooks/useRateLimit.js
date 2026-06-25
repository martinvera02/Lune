import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'

// Límites configurables
export const RATE_LIMITS = {
  send_message:    { max: 50,  windowMinutes: 60,  label: '50 mensajes por hora'   },
  send_connection: { max: 20,  windowMinutes: 60,  label: '20 conexiones por hora' },
  join_event:      { max: 5,   windowMinutes: 60,  label: '5 eventos por hora'     },
}

export function useRateLimit() {
  const { profile } = useAuth()

  // Verifica en el cliente antes de llamar a la DB
  // La DB tiene el trigger como segunda línea de defensa
  async function checkAndLog(action) {
    if (!profile?.id) return { allowed: false, reason: 'Sin perfil' }

    const limit = RATE_LIMITS[action]
    if (!limit) return { allowed: true }

    const { data, error } = await supabase.rpc('log_rate_action', {
      p_profile_id:      profile.id,
      p_action:          action,
      p_max_count:       limit.max,
      p_window_minutes:  limit.windowMinutes,
    })

    if (error) {
      // Si el trigger ya bloqueó, el error viene del trigger
      if (error.message?.includes('Rate limit')) {
        return { allowed: false, reason: `Límite alcanzado: ${limit.label}` }
      }
      // Otros errores: dejar pasar (fail open para no bloquear usuarios legítimos)
      console.warn('Rate limit check failed:', error)
      return { allowed: true }
    }

    return data || { allowed: true }
  }

  return { checkAndLog }
}