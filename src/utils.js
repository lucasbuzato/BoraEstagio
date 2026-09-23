export const routes = [
  '/',
  '/entrar',
  '/empresa/cadastro',
  '/empresa/vaga/nova',
  '/empresa/vaga/revisao',
  '/empresa/vaga/publicada',
  '/estudante/cadastro',
  '/vagas',
  '/vagas/frontend-horizonte',
  '/candidatura/revisao',
  '/candidatura/sucesso',
  '/minhas-candidaturas',
  '/empresa/candidatos',
  '/empresa/upgrade',
  '/empresa/planos',
  '/empresa/checkout',
  '/empresa/plano-ativo'
]

export function escapeHTML(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

export function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2
  }).format(value)
}

export function currentPath() {
  const raw = window.location.hash.replace(/^#/, '') || '/'
  const [path] = raw.split('?')
  return path.startsWith('/') ? path : `/${path}`
}

export function queryParams() {
  const raw = window.location.hash.replace(/^#/, '')
  const query = raw.includes('?') ? raw.split('?').slice(1).join('?') : ''
  return new URLSearchParams(query)
}

export function splitLines(value = '') {
  return value.split('\n').map((item) => item.trim()).filter(Boolean)
}

export function initials(name = '') {
  return name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
}

export function calculateMatch(studentSkills, jobSkills) {
  const normalized = studentSkills.map((skill) => skill.toLowerCase())
  if (!jobSkills.length) return 0
  const hits = jobSkills.filter((skill) => normalized.some((item) => item.includes(skill.toLowerCase()) || skill.toLowerCase().includes(item))).length
  return Math.round((hits / jobSkills.length) * 100)
}

export function normalizeCardNumber(value = '') {
  return value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
}

export function normalizeExpiry(value = '') {
  const digits = value.replace(/\D/g, '').slice(0, 4)
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits
}


export function contrastRatio(foreground, background) {
  const parse = (hex) => {
    const clean = hex.replace('#', '')
    return [0, 2, 4].map((index) => Number.parseInt(clean.slice(index, index + 2), 16) / 255)
  }
  const luminance = (hex) => {
    const channels = parse(hex).map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4)
    return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]
  }
  const a = luminance(foreground)
  const b = luminance(background)
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
}
