import { read, write } from '@/utils/storage'
import { uid, nowISO, todayISO } from '@/utils/id'

const state = () => ({ list: read('events', []) })

const getters = {
  list: s => s.list,
  count: s => s.list.length,
  byId: s => id => s.list.find(e => e.id === id),
  byDate: s => date => s.list.filter(e => e.date === date),
  upcoming: s => {
    const today = todayISO()
    return [...s.list]
      .filter(e => e.date >= today)
      .sort((a, b) => `${a.date}${a.startTime || ''}`.localeCompare(`${b.date}${b.startTime || ''}`))
  },
  monthRange: s => (year, month) => {
    const prefix = `${year}-${String(month + 1).padStart(2, '0')}`
    return s.list.filter(e => String(e.date).startsWith(prefix))
  },
  todayEvents: s => s.list.filter(e => e.date === todayISO())
}

const mutations = {
  ADD (s, payload) {
    s.list.push({ id: uid('evt'), category: 'other', allDay: false, createdAt: nowISO(), ...payload })
    write('events', s.list)
  },
  UPDATE (s, { id, data }) {
    const item = s.list.find(e => e.id === id)
    if (item) Object.assign(item, data, { updatedAt: nowISO() })
    write('events', s.list)
  },
  REMOVE (s, id) {
    s.list = s.list.filter(e => e.id !== id)
    write('events', s.list)
  },
  REPLACE_ALL (s, list) {
    s.list = Array.isArray(list) ? list : []
    write('events', s.list)
  }
}

export default { namespaced: true, state, getters, mutations }
