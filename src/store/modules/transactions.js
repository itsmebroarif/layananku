import { read, write } from '@/utils/storage'
import { uid, nowISO, nextCode, todayISO } from '@/utils/id'

const state = () => ({ list: read('transactions', []) })

const getters = {
  list: s => s.list,
  count: s => s.list.length,
  byId: s => id => s.list.find(t => t.id === id),
  sorted: s => [...s.list].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')),
  todaySales: s => {
    const today = todayISO()
    return s.list
      .filter(t => String(t.createdAt || '').slice(0, 10) === today)
      .reduce((sum, t) => sum + (Number(t.total) || 0), 0)
  },
  todayCount: s => {
    const today = todayISO()
    return s.list.filter(t => String(t.createdAt || '').slice(0, 10) === today).length
  },
  monthSales: s => {
    const month = todayISO().slice(0, 7)
    return s.list
      .filter(t => String(t.createdAt || '').slice(0, 7) === month)
      .reduce((sum, t) => sum + (Number(t.total) || 0), 0)
  },
  byDateRange: s => (from, to) => s.list.filter(t => {
    const d = String(t.createdAt || '').slice(0, 10)
    return (!from || d >= from) && (!to || d <= to)
  }),
  topSellers: s => {
    const map = {}
    s.list.forEach(t => (t.items || []).forEach(item => {
      const key = item.productId || item.name
      if (!map[key]) map[key] = { name: item.name, qty: 0, revenue: 0 }
      map[key].qty += Number(item.qty) || 0
      map[key].revenue += (Number(item.price) || 0) * (Number(item.qty) || 0)
    }))
    return Object.values(map).sort((a, b) => b.qty - a.qty)
  }
}

const mutations = {
  ADD (s, payload) {
    const invoice = nextCode(s.list, 'INV')
    s.list.unshift({ id: uid('trx'), invoice, createdAt: nowISO(), ...payload })
    write('transactions', s.list)
  },
  REMOVE (s, id) {
    s.list = s.list.filter(t => t.id !== id)
    write('transactions', s.list)
  },
  REPLACE_ALL (s, list) {
    s.list = Array.isArray(list) ? list : []
    write('transactions', s.list)
  }
}

export default { namespaced: true, state, getters, mutations }
