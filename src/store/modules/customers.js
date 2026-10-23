import { read, write } from '@/utils/storage'
import { uid, nowISO } from '@/utils/id'

const state = () => ({ list: read('customers', []) })

const getters = {
  list: s => s.list,
  count: s => s.list.length,
  activeCount: s => s.list.filter(c => c.status === 'active').length,
  byId: s => id => s.list.find(c => c.id === id),
  options: s => s.list.map(c => ({ value: c.id, title: c.company ? `${c.name} — ${c.company}` : c.name })),
  search: s => q => {
    const needle = String(q || '').toLowerCase().trim()
    if (!needle) return s.list
    return s.list.filter(c =>
      [c.name, c.company, c.email, c.phone, c.category, c.address, c.notes]
        .some(v => String(v || '').toLowerCase().includes(needle))
    )
  }
}

const mutations = {
  ADD (s, payload) {
    s.list.unshift({ id: uid('cus'), createdAt: nowISO(), updatedAt: nowISO(), ...payload })
    write('customers', s.list)
  },
  UPDATE (s, { id, data }) {
    const item = s.list.find(c => c.id === id)
    if (item) Object.assign(item, data, { updatedAt: nowISO() })
    write('customers', s.list)
  },
  REMOVE (s, id) {
    s.list = s.list.filter(c => c.id !== id)
    write('customers', s.list)
  },
  REPLACE_ALL (s, list) {
    s.list = Array.isArray(list) ? list : []
    write('customers', s.list)
  }
}

export default { namespaced: true, state, getters, mutations }
