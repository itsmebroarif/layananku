const PREFIX = 'smt_'

export function read (key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    return raw ? JSON.parse(raw) : fallback
  } catch (e) {
    return fallback
  }
}

export function write (key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
    return true
  } catch (e) {
    return false
  }
}

export function remove (key) {
  try {
    localStorage.removeItem(PREFIX + key)
  } catch (e) { /* ignore */ }
}

export function hasKey (key) {
  try {
    return localStorage.getItem(PREFIX + key) !== null
  } catch (e) {
    return false
  }
}
