import { read, write } from '@/utils/storage'
import { uid, nowISO } from '@/utils/id'

const state = () => ({ list: read('staff', []) })

const getters = {
  list: s => s.list,
  count: s => s.list.length,
  byId: s => id => s.list.find(x => x.id === id),
  options: s => s.list.map(x => ({ value: x.id, title: x.name + (x.position ? ` — ${x.position}` : '') })),
  byDivision: s => div => s.list.filter(x => x.division === div),
  divisions: s => [...new Set(s.list.map(x => x.division).filter(Boolean))]
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
  }
}

export default { namespaced: true, state, getters, mutations }
