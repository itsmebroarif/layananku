import { read, write } from '@/utils/storage'
import { uid, nowISO, nextCode } from '@/utils/id'

const state = () => ({ list: read('tickets', []) })

const getters = {
  list: s => s.list,
  count: s => s.list.length,
  openCount: s => s.list.filter(t => !['resolved', 'closed'].includes(t.status)).length,
  resolvedCount: s => s.list.filter(t => ['resolved', 'closed'].includes(t.status)).length,
  urgentOpen: s => s.list.filter(t => !['resolved', 'closed'].includes(t.status) && ['high', 'urgent'].includes(t.priority)).length,
  byId: s => id => s.list.find(t => t.id === id),
  byCustomer: s => id => s.list.filter(t => t.customerId === id),
  recent: s => n => [...s.list].sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || '')).slice(0, n || 5),
  overdue: s => {
    const today = new Date().toISOString().slice(0, 10)
    return s.list.filter(t => t.dueDate && t.dueDate < today && !['resolved', 'closed'].includes(t.status))
  }
}

function persist (s) { write('tickets', s.list) }

const mutations = {
  ADD (s, payload) {
    const code = nextCode(s.list, 'TK')
    s.list.unshift({
      id: uid('tkt'),
      code,
      status: 'open',
      priority: 'medium',
      channel: 'portal',
      createdAt: nowISO(),
      updatedAt: nowISO(),
      ...payload
    })
    persist(s)
  },
  UPDATE (s, { id, data }) {
    const item = s.list.find(t => t.id === id)
    if (item) Object.assign(item, data, { updatedAt: nowISO() })
    persist(s)
  },
  SET_STATUS (s, { id, status }) {
    const item = s.list.find(t => t.id === id)
    if (item) {
      item.status = status
      item.updatedAt = nowISO()
      if (['resolved', 'closed'].includes(status)) item.resolvedAt = nowISO()
      else delete item.resolvedAt
    }
    persist(s)
  },
  ADD_NOTE (s, { id, text, author }) {
    const item = s.list.find(t => t.id === id)
    if (item) {
      item.notes = item.notes || []
      item.notes.push({ id: uid('note'), text, author: author || 'Agent', createdAt: nowISO() })
      item.updatedAt = nowISO()
    }
    persist(s)
  },
  REMOVE (s, id) {
    s.list = s.list.filter(t => t.id !== id)
    persist(s)
  },
  REPLACE_ALL (s, list) {
    s.list = Array.isArray(list) ? list : []
    persist(s)
  }
}

export default { namespaced: true, state, getters, mutations }
