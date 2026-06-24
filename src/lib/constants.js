export const MOODS = [
  { id: 'soft',   emoji: '🌙', label: 'Soft mode',  desc: 'Contemplativo y tranquilo',  color: '#7c3aed' },
  { id: 'spark',  emoji: '⚡', label: 'Con chispa', desc: 'Energético y curioso',       color: '#f59e0b' },
  { id: 'tender', emoji: '🌸', label: 'Tierno',     desc: 'Abierto al afecto',          color: '#ec4899' },
  { id: 'wild',   emoji: '🔥', label: 'Salvaje',    desc: 'Intenso y apasionado',       color: '#ef4444' },
  { id: 'dreamy', emoji: '✨', label: 'Soñador',    desc: 'En otro plano mental',       color: '#8b5cf6' },
  { id: 'chill',  emoji: '🌊', label: 'Chill',      desc: 'Sin prisa, sin presión',     color: '#14b8a6' },
]

export const CULTURE_TAGS = {
  music: ['Indie', 'Post-punk', 'Shoegaze', 'Jazz', 'Hip-hop', 'Folk', 'Electrónica', 'Metal', 'Clásica', 'K-pop', 'Trap', 'Soul'],
  film:  ['Cine europeo', 'A24', 'Terror', 'Sci-fi', 'Comedia negra', 'Documental', 'Animación', 'Cine clásico', 'Thriller', 'Romance'],
  books: ['Filosofía', 'Poesía', 'Novela gráfica', 'Sci-fi', 'Literatura rusa', 'Ensayo', 'Fantasía', 'Autoficción', 'Misterio'],
}

export const DEEP_QUESTIONS = [
  '¿Cuál es la última cosa que te hizo llorar y por qué no te avergüenza?',
  'Si pudieras vivir en una canción, ¿cuál sería y en qué parte?',
  '¿Qué es algo que sabes sobre ti mismo que la mayoría de la gente no vería?',
  '¿Cuándo fue la última vez que cambiaste de opinión sobre algo importante?',
  '¿Qué textura tiene tu felicidad cuando la tocas de cerca?',
  '¿Hay algo que siempre quisiste decirle a alguien y nunca pudiste?',
  '¿Qué parte de ti crees que la gente suele malinterpretar?',
]

export const GENDERS = [
  { id: 'hombre',         label: 'Hombre',      emoji: '♂️' },
  { id: 'mujer',          label: 'Mujer',        emoji: '♀️' },
  { id: 'no_binario',     label: 'No binario',   emoji: '⚧️' },
  { id: 'no_especificado',label: 'Prefiero no decirlo', emoji: '✦' },
]

export const ORIENTATIONS = [
  { id: 'heterosexual',    label: 'Heterosexual',  desc: 'Me atraen personas del género opuesto' },
  { id: 'homosexual',      label: 'Gay / Lesbiana', desc: 'Me atraen personas de mi mismo género' },
  { id: 'bisexual',        label: 'Bisexual',       desc: 'Me atraen más de un género' },
  { id: 'pansexual',       label: 'Pansexual',      desc: 'La atracción no depende del género' },
  { id: 'no_especificado', label: 'Prefiero no decirlo', desc: '' },
]

export const CONNECTION_STATUS = {
  PENDING:  'pending',
  MATCHED:  'matched',
  REJECTED: 'rejected',
}