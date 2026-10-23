let seq = 0

export function uid (prefix = 'id') {
  seq = (seq + 1) % 1000
  return `${prefix}-${Date.now().toString(36)}-${seq.toString(36)}${Math.random().toString(36).slice(2, 6)}`
}

export function nextCode (list, prefix, pad = 4) {
  let max = 0
  list.forEach(item => {
    const match = String(item.code || item.invoice || '').match(/(\d+)$/)
    if (match) max = Math.max(max, parseInt(match[1], 10))
  })
  return `${prefix}-${String(max + 1).padStart(pad, '0')}`
}

export function todayISO () {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function nowISO () {
  return new Date().toISOString()
}
