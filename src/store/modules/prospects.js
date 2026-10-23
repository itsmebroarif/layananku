import { read, write } from '@/utils/storage'
import { uid, nowISO } from '@/utils/id'

const state = () => ({ list: read('prospects', []) })

const getters = {
  list: s => s.list,
  count: s => s.list.length,
  byStatus: s => st => s.list.filter(p => p.status === st),
  countsByStatus: s => {
    const map = {}
    s.list.forEach(p => { map[p.status] = (map[p.status] || 0) + 1 })
    return map
  },
  search: s => q => {
    const n = String(q || '').toLowerCase().trim()
    if (!n) return s.list
    return s.list.filter(p => [p.name, p.company, p.phone, p.email, p.interest, p.notes]
      .some(v => String(v || '').toLowerCase().includes(n)))
  }
}

const mutations = {
  ADD (s, payload) {
    s.list.unshift({ id: uid('lds'), status: 'new', createdAt: nowISO(), ...payload })
    write('prospects', s.list)
  },
  UPDATE (s, { id, data }) {
    const item = s.list.find(x => x.id === id)
    if (item) Object.assign(item, { ...data, updatedAt: nowISO() })
    write('prospects', s.list)
  },
  REMOVE (s, id) {
    s.list = s.list.filter(x => x.id !== id)
    write('prospects', s.list)
  },
  IMPORT_MERGE (s, rows) {
    const existing = s.list
    rows.forEach(row => {
      const phone = String(row.phone || '').replace(/\D/g, '')
      const dupe = existing.find(x =>
        phone && String(x.phone || '').replace(/\D/g, '') === phone) ||
        (row.email && String(x.email || '').toLowerCase() === String(row.email || '').toLowerCase())
      if (dupe) {
        Object.assign(dupe, { ...row, id: dupe.id, status: dupe.status, updatedAt: nowISO() })
      } else {
        existing.push({ id: uid('lds'), status: 'new', createdAt: nowISO(), ...row })
      }
    })
    s.list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
    write('prospects', s.list)
  },
  REPLACE_ALL (s, list) {
    s.list = Array.isArray(list) ? list : []
    write('prospects', s.list)
  }
}

export default { namespaced: true, state, getters, mutations }
