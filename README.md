<div align="center">

```
  ╔══════════════════════════════════════════╗
  ║                                          ║
  ║          🌙  L U N E               ║
  ║                                          ║
  ║   No swipes. No likes vacíos.            ║
  ║   Solo conexiones que importan.          ║
  ║                                          ║
  ╚══════════════════════════════════════════╝
```

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite)
![Supabase](https://img.shields.io/badge/Supabase-2-3ECF8E?style=flat-square&logo=supabase)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-11-0055FF?style=flat-square&logo=framer)
![Vercel](https://img.shields.io/badge/Vercel-Deploy-000000?style=flat-square&logo=vercel)

</div>

---

## ¿Qué es Lune?

**Lune** es una app de citas alternativa que rompe con el modelo tradicional de swipes y likes vacíos. Aquí, tu foto está **oculta hasta que hay un match real**, y para conectar con alguien tienes que **escribir algo de verdad** respondiendo a una pregunta profunda.

El resultado: conexiones más auténticas, menos superficialidad, y una experiencia diseñada para personas que buscan algo real.

---

## 🎯 La diferencia

| App tradicional | Lune |
|---|---|
| ✗ Swipe izquierda/derecha | ✓ Escribes antes de conectar |
| ✗ Like sin contexto | ✓ Pregunta profunda como primer mensaje |
| ✗ Foto como primer filtro | ✓ Foto oculta hasta el match |
| ✗ Match instantáneo sin intención | ✓ Match requiere acción real |
| ✗ Compatibilidad aleatoria | ✓ Score por gustos culturales |

---

## ✨ Flujo de usuario

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  1. REGISTRO                                        │
│  ┌─────────────────────────────────────────────┐   │
│  │  Email + contraseña                         │   │
│  └─────────────────────────────────────────────┘   │
│                           ↓                        │
│  2. ONBOARDING (8 pasos)                           │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐   │
│  │Nombre│→│Género│→│Orient│→│ Mood │→│Música│   │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘   │
│  ┌──────┐ ┌──────────────────────┐ ┌──────┐      │
│  │ Cine │→│  Pregunta profunda   │→│ Foto │      │
│  └──────┘ └──────────────────────┘ └──────┘      │
│                           ↓                        │
│  3. EXPLORAR                                       │
│  ┌─────────────────────────────────────────────┐   │
│  │  🔒 [Foto oculta]                          │   │
│  │  Sofía, 26 · ✨ Soñador                    │   │
│  │  Compatibilidad ████████░░ 78%             │   │
│  │  "Viviría en Holocene de Bon Iver..."      │   │
│  │  🎵 Indie  🎬 A24  📖 Ensayo              │   │
│  │                                             │   │
│  │  [👋 Pasar]  [✍️ Escribir algo]  [👁️]    │   │
│  └─────────────────────────────────────────────┘   │
│                           ↓                        │
│  4. ESCRIBIR (pregunta profunda)                   │
│  ┌─────────────────────────────────────────────┐   │
│  │  ✦ Si pudieras vivir en una canción,       │   │
│  │    ¿cuál sería y en qué parte?             │   │
│  │                                             │   │
│  │  [ Escribe tu respuesta...              ]  │   │
│  │                                             │   │
│  │  [   Enviar y conectar ✦   ]               │   │
│  └─────────────────────────────────────────────┘   │
│                           ↓                        │
│  5. ¡MATCH! → Foto desbloqueada 🔓                │
│                           ↓                        │
│  6. CHAT en tiempo real                            │
│  ┌─────────────────────────────────────────────┐   │
│  │  ← Sofía · Conectados ✦                   │   │
│  │                                             │   │
│  │              ¿Y en qué parte exactamente?  │   │
│  │  En el puente donde todo                   │   │
│  │  se vuelve etéreo 🌙                       │   │
│  │              Eso es exactamente lo que...  │   │
│  │  ● ● ●  (escribiendo...)                   │   │
│  │                                             │   │
│  │  [Escribe algo real...           ] [↑]    │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 🎉 Lune for Venues

Lune tiene un **modo evento** diseñado para discotecas y salas de música en vivo.

```
┌─────────────────────────────────────────────────────┐
│  🟢 Modo evento · Sala Mondo · 34 personas · 3h 20m │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Noche Indie Vol. 3                                 │
│  Sala Mondo · 35 personas esta noche               │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │  🌙 Lena, 23 · Soft mode                   │   │
│  │  ▌ "Lloré con Nick Cave conduciendo..."     │   │
│  │  🎵 Shoegaze  🎬 A24  📖 Poesía           │   │
│  │                              [👋] [✍️]    │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │  🔥 Ari, 24 · Salvaje                      │   │
│  │  ▌ "Proceso mejor siendo observador..."     │   │
│  │  🎵 Jazz  🎬 Cine clásico  📖 Filosofía   │   │
│  │                              [👋] [✍️]    │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

El local genera un **código QR** para la entrada. Los asistentes lo escanean, entran al evento y solo ven perfiles de personas que están **en ese local esa noche**. Al terminar el evento, los perfiles se archivan.

**Modelo de negocio:** €79/mes por local (eventos ilimitados) o €19/evento puntual.

---

## 🛡️ Panel de Administración

```
┌─────────────────────────────────────────────────────┐
│  ← Panel Admin · Lune Dashboard      ⚠️ 3 pendientes│
├─────────────────────────────────────────────────────┤
│  📊 Métricas  👥 Usuarios  ⚠️ Reportes             │
│  💬 Chats     📣 Broadcast  🗂️ Auditoría           │
├─────────────────────────────────────────────────────┤
│                                                     │
│  👥 1,247    ✨ 89     💜 3,891    💬 28,443       │
│  Usuarios    7 días   Matches     Mensajes         │
│                                                     │
│  Nuevos usuarios — 30 días                         │
│  ▁▂▃▄▅▆▇█▇▆▅▄▃▂▃▄▅▆▇▆▅▄▃▄▅▆▇▆▅                   │
│                                                     │
│  ─────────────────────────────────────────────────  │
│  ⚠️ Spam · Lena → Mar               [Banear] [✓]  │
│  ⚠️ Acoso · Theo → Cleo             [Advertir][✓]  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

Accede en `/admin`. Solo visible para usuarios con `role = 'admin'`.

---

## 🏗️ Stack técnico

```
Frontend                    Backend                     Infra
─────────────────────       ─────────────────────       ─────────────────────
React 18                    Supabase (Postgres)          Vercel
Vite 5                      Row Level Security           GitHub Actions
Framer Motion 11            Realtime (WebSockets)        Supabase Storage
React Router 6              Edge Functions              
TailwindCSS (via inline)    DB Triggers (rate limiting) 
```

---

## 📁 Estructura del proyecto

```
lune/
├── public/
│   ├── manifest.json          # PWA config
│   └── moon.svg               # Icono
├── src/
│   ├── pages/
│   │   ├── LandingPage.jsx    # Home con orbe animado
│   │   ├── AuthPage.jsx       # Login / registro
│   │   ├── OnboardingPage.jsx # 8 pasos de perfil
│   │   ├── AppShell.jsx       # Navbar + tabs + modo venue
│   │   ├── ExplorePage.jsx    # Cards con animación de skip
│   │   ├── MessagesPage.jsx   # Inbox + chat
│   │   ├── ProfilePage.jsx    # Perfil propio + notificaciones
│   │   ├── VenueExplorePage.jsx # Modo evento
│   │   └── AdminPage.jsx      # Panel admin (6 pestañas)
│   ├── components/
│   │   ├── explore/
│   │   │   ├── ProfileCard.jsx    # Card apilada con animación skip
│   │   │   ├── WriteModal.jsx     # Sheet de primer mensaje
│   │   │   └── MatchScreen.jsx    # Pantalla de match
│   │   ├── chat/
│   │   │   ├── ChatView.jsx       # Chat realtime completo
│   │   │   ├── MessageBubble.jsx  # Burbuja con estados + reply
│   │   │   ├── TypingIndicator.jsx # Puntos animados
│   │   │   ├── InboxItem.jsx      # Fila de conversación
│   │   │   ├── PendingRequests.jsx # Solicitudes entrantes
│   │   │   └── ReportModal.jsx    # Reportar / bloquear
│   │   ├── profile/
│   │   │   ├── PublicProfile.jsx  # Ver perfil ajeno
│   │   │   ├── EditProfile.jsx    # Editar perfil propio
│   │   │   └── MoodSelector.jsx   # Cambiar mood del día
│   │   ├── venue/
│   │   │   ├── VenueBanner.jsx    # Banner modo evento
│   │   │   └── JoinEventModal.jsx # Unirse con código
│   │   └── ui/
│   │       └── Toast.jsx          # Notificaciones toast
│   ├── context/
│   │   ├── AuthContext.jsx        # Sesión + perfil global
│   │   ├── ConnectionsContext.jsx # Matches + rate limiting
│   │   └── EventContext.jsx       # Estado del evento activo
│   ├── hooks/
│   │   ├── useProfiles.js         # Explorar + compatibilidad
│   │   ├── useMessages.js         # Chat + typing + optimistic
│   │   ├── useConnections.js      # Gestión de conexiones
│   │   ├── useEvent.js            # Lógica de eventos venue
│   │   ├── useNotifications.js    # Notificaciones realtime
│   │   ├── useSignedUrl.jsx       # URLs firmadas para fotos
│   │   ├── useRateLimit.js        # Anti-spam client-side
│   │   ├── useReport.js           # Reportar y bloquear
│   │   ├── useUpload.js           # Subida a Supabase Storage
│   │   └── useAdmin.js            # Lógica del panel admin
│   └── lib/
│       ├── supabase.js            # Cliente Supabase
│       └── constants.js           # Moods, tags, preguntas, géneros
├── vercel.json                    # SPA routing
├── supabase-schema.sql            # Schema inicial
├── supabase-beta.sql              # Notificaciones, fotos privadas
├── supabase-venues.sql            # Venues y eventos
├── supabase-security.sql          # Rate limiting + signed URLs
├── supabase-admin.sql             # Roles, vistas de métricas
├── supabase-moderation.sql        # Advertencias, auditoría, broadcast
├── supabase-ux.sql                # Reply, read receipts, reportes
└── supabase-orientation.sql       # Género y orientación
```

---

## 🚀 Setup local

### 1. Clonar e instalar

```bash
git clone https://github.com/martinvera02/lune.git
cd lune
npm install
```

### 2. Configurar Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com)
2. En **SQL Editor**, ejecuta los archivos `.sql` en este orden:

```
supabase-schema.sql          ← Schema base (ejecutar primero)
supabase-beta.sql            ← Notificaciones y fotos privadas
supabase-venues.sql          ← Venues y eventos
supabase-security.sql        ← Rate limiting y signed URLs
supabase-admin.sql           ← Roles y métricas admin
supabase-moderation.sql      ← Advertencias y auditoría
supabase-ux.sql              ← Reply y read receipts
supabase-orientation.sql     ← Género y orientación
```

3. En **Storage**, crea un bucket `avatars` (privado)

### 3. Variables de entorno

```bash
cp .env.example .env
```

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

### 4. Seed de datos de prueba (opcional)

```bash
# En Supabase SQL Editor:
seed-full.sql    ← 10 perfiles + 5 conversaciones activas
```

Todos los perfiles de prueba tienen contraseña `lune1234`.

### 5. Arrancar

```bash
npm run dev
# → http://localhost:5173
```

---

## 🔐 Seguridad

- **Rate limiting en DB** — triggers de Postgres bloquean más de 50 mensajes/hora y 20 conexiones/hora por usuario
- **Fotos privadas** — bucket de Supabase Storage privado, acceso solo via signed URLs con TTL de 1 hora
- **RLS en todas las tablas** — Row Level Security activo, cada usuario solo accede a sus datos
- **Panel admin protegido** — ruta `/admin` requiere `role = 'admin'` en DB, verificado en el router

### Hacerse admin

```sql
UPDATE profiles SET role = 'admin'
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'tu@email.com');
```

---

## 🎨 Sistema de diseño

```
Paleta
──────────────────────────────────────────
Background   #0e0c14   ██  Casi negro
Surface      #221d33   ██  Superficie oscura
Accent       #c084fc   ██  Púrpura suave
Accent 2     #f0abfc   ██  Lila claro
Pink         #f9a8d4   ██  Rosa pastel
Teal         #5eead4   ██  Verde azulado
Gold         #fcd34d   ██  Dorado

Tipografía
──────────────────────────────────────────
Display   Playfair Display (italic)
Body      DM Sans
```

---

## 🗺️ Roadmap

- [ ] Verificación por teléfono
- [ ] Notificaciones push (PWA)
- [ ] Panel web para venues (dashboard del local)
- [ ] Filtros avanzados (edad, distancia, mood)
- [ ] Cola de revisión de fotos antes de publicar
- [ ] Analytics de retención (día 1, 7, 30)
- [ ] App nativa via Capacitor

---

## 📄 Licencia

MIT © 2026 Martín Vera Ceca — [github.com/martinvera02](https://github.com/martinvera02)

---

<div align="center">

```
  🌙  Lune — Conexiones que importan
```

*Construido con React + Supabase + demasiado café*

</div>
