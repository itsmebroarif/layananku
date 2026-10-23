export function currencyFormatter (currency = 'IDR') {
  try {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency,
      minimumFractionDigits: currency === 'IDR' ? 0 : 2,
      maximumFractionDigits: currency === 'IDR' ? 0 : 2
    })
  } catch (e) {
    return new Intl.NumberFormat('id-ID')
  }
}

export function money (value, currency = 'IDR') {
  const n = Number(value) || 0
  return currencyFormatter(currency).format(n)
}

export function number (value) {
  return new Intl.NumberFormat('id-ID').format(Number(value) || 0)
}

export function dateLong (value) {
  if (!value) return '—'
  const d = new Date(String(value).length <= 10 ? `${value}T00:00:00` : value)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

export function dateShort (value) {
  if (!value) return '—'
  const d = new Date(String(value).length <= 10 ? `${value}T00:00:00` : value)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function dateTimeShort (value) {
  if (!value) return '—'
  const d = new Date(value)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export function timeShort (value) {
  if (!value) return ''
  const d = new Date(value)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

export function relativeTime (value) {
  if (!value) return '—'
  const diff = Date.now() - new Date(value).getTime()
  const mins = Math.round(diff / 60000)
  if (mins < 1) return 'baru saja'
  if (mins < 60) return `${mins} menit lalu`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours} jam lalu`
  const days = Math.round(hours / 24)
  if (days < 30) return `${days} hari lalu`
  return dateShort(value)
}

export function daysLeft (dateISO) {
  if (!dateISO) return null
  const a = new Date(`${dateISO}T00:00:00`).getTime()
  const b = new Date(`${todayISO()}T00:00:00`).getTime()
  return Math.round((a - b) / 86400000)
}

function todayISO () {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
