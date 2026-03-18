export const EMOTION_MAP = {
  happy:    { label: 'Feliz',      emoji: '😊', color: '#1D9E75' },
  calm:     { label: 'Tranquilo',  emoji: '😌', color: '#378ADD' },
  neutral:  { label: 'Neutro',     emoji: '😐', color: '#888780' },
  anxious:  { label: 'Ansioso',    emoji: '😰', color: '#BA7517' },
  sad:      { label: 'Triste',     emoji: '😢', color: '#5A3FBF' },
  stressed: { label: 'Estresado',  emoji: '😤', color: '#E24B4A' },
}

export const CATEGORIES = [
  'Comida', 'Transporte', 'Ocio', 'Salud',
  'Ropa', 'Suscripciones', 'Educación', 'Otro',
]

export const INCOME_CATEGORIES = [
  'Salario', 'Freelance', 'Inversión', 'Negocio', 'Otro ingreso',
]

export const fmt = (n) =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency', currency: 'MXN', maximumFractionDigits: 0,
  }).format(n || 0)

export const todayStr = () => new Date().toISOString().split('T')[0]

let _id = Date.now()
export const uid = () => String(++_id)