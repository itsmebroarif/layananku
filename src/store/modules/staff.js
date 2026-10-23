import { read, write } from '@/utils/storage'
import { uid, nowISO } from '@/utils/id'

const CUSTOM_KEY = 'staff_custom'

function cleanCustom (raw) {
  const data = raw && typeof raw === 'object' ? raw : {}
  const divisions = Array.isArray(data.divisions)
    ? [...new Set(data.divisions.map(x => String(x || '').trim()).filter(Boolean))]
    : []
  const positions = {}
  if (data.positions && typeof data.positions === 'object' && !Array.isArray(data.positions)) {
    Object.entries(data.positions).forEach(([division, items]) => {
      const title = String(division || '').trim()
      if (!title) return
      const list = Array.isArray(items)
        ? [...new Set(items.map(x => String(x || '').trim()).filter(Boolean))]
        : []
      if (list.length) positions[title] = list
    })
  }
  return { divisions, positions }
}

function sameText (a, b) {
  return String(a || '').trim().toLowerCase() === String(b || '').trim().toLowerCase()
}

function customKey (positions, division) {
  return Object.keys(positions).find(key => sameText(key, division)) || division
}

const state = () => ({
  list: read('staff', []),
  custom: cleanCustom(read(CUSTOM_KEY, {}))
})

const getters = {
  list: s => s.list,
  count: s => s.list.length,
  byId: s => id => s.list.find(x => x.id === id),
  options: s => s.list.map(x => ({ value: x.id, title: x.name + (x.position ? ` — ${x.position}` : '') })),
  byDivision: s => div => s.list.filter(x => x.division === div),
  divisions: s => [...new Set(s.list.map(x => x.division).filter(Boolean))],
  custom: s => s.custom,
  customDivisions: s => s.custom.divisions,
  customPositions: s => s.custom.positions
}

function persist (s) {
  write(CUSTOM_KEY, s.custom)
}

const mutations = {
  ADD (s, payload) {
    s.list.unshift({ id: uid('stf'), createdAt: nowISO(), updatedAt: nowISO(), ...payload })
    write('staff', s.list)
  },
  UPDATE (s, { id, data }) {
    const item = s.list.find(x => x.id === id)
    if (item) Object.assign(item, data, { updatedAt: nowISO() })
    write('staff', s.list)
  },
  REMOVE (s, id) {
    s.list = s.list.filter(x => x.id !== id)
    write('staff', s.list)
  },
  REPLACE_ALL (s, list) {
    s.list = Array.isArray(list) ? list : []
    write('staff', s.list)
  },
  ADD_CUSTOM_DIVISION (s, title) {
    const value = String(title || '').trim()
    if (!value) return
    if (!s.custom.divisions.some(d => sameText(d, value))) s.custom.divisions.push(value)
    persist(s)
  },
  ADD_CUSTOM_POSITION (s, { division, title }) {
    const div = String(division || '').trim()
    const value = String(title || '').trim()
    if (!div || !value) return
    const key = customKey(s.custom.positions, div)
    const list = Array.isArray(s.custom.positions[key]) ? s.custom.positions[key] : []
    if (!list.some(x => sameText(x, value))) list.push(value)
    s.custom.positions = { ...s.custom.positions, [key]: list }
    persist(s)
  },
  REMOVE_CUSTOM_DIVISION (s, title) {
    const value = String(title || '').trim()
    if (!value) return
    s.custom.divisions = s.custom.divisions.filter(d => !sameText(d, value))
    const key = customKey(s.custom.positions, value)
    if (s.custom.positions[key]) {
      const next = { ...s.custom.positions }
      delete next[key]
      s.custom.positions = next
    }
    persist(s)
  },
  REMOVE_CUSTOM_POSITION (s, { division, title }) {
    const div = String(division || '').trim()
    const value = String(title || '').trim()
    if (!div || !value) return
    const key = customKey(s.custom.positions, div)
    const list = (s.custom.positions[key] || []).filter(x => !sameText(x, value))
    const next = { ...s.custom.positions }
    if (list.length) next[key] = list
    else delete next[key]
    s.custom.positions = next
    persist(s)
  },
  REPLACE_CUSTOM (s, payload) {
    s.custom = cleanCustom(payload)
    persist(s)
  },
  RESET_CUSTOM (s) {
    s.custom = { divisions: [], positions: {} }
    persist(s)
  }
}

export default { namespaced: true, state, getters, mutations }
