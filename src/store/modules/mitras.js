import { read, write } from '@/utils/storage'
import { uid, nowISO } from '@/utils/id'

const state = () => ({ list: read('mitras', []) })

const getters = {
  list: s => s.list,
  count: s => s.list.length,
  byId: s => id => s.list.find(x => x.id === id),
  options: s => s.list.map(x => ({ value: x.id, title: x.company ? `${x.name} — ${x.company}` : x.name })),
  projectsOf: (s, g, rootGetters) => id => rootGetters['projects/byMitra'](id),
  search: s => q => {
    const n = String(q || '').toLowerCase().trim()
    if (!n) return s.list
    return s.list.filter(x => [x.name, x.company, x.email, x.phone, x.address, x.notes]
      .some(v => String(v || '').toLowerCase().includes(n)))
  }
}

const mutations = {
  ADD (s, payload) {
    s.list.unshift({ id: uid('mit'), createdAt: nowISO(), updatedAt: nowISO(), ...payload })
    write('mitras', s.list)
  },
  UPDATE (s, { id, data }) {
    const item = s.list.find(x => x.id === id)
    if (item) Object.assign(item, data, { updatedAt: nowISO() })
    write('mitras', s.list)
  },
  REMOVE (s, id) {
    s.list = s.list.filter(x => x.id !== id)
    write('mitras', s.list)
  },
  REPLACE_ALL (s, list) {
    s.list = Array.isArray(list) ? list : []
    write('mitras', s.list)
  }
}

export default { namespaced: true, state, getters, mutations }
