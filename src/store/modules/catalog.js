import { read, write } from '@/utils/storage'
import { uid, nowISO } from '@/utils/id'

const state = () => ({ list: read('catalog', []) })

const getters = {
  list: s => s.list,
  count: s => s.list.length,
  products: s => s.list.filter(p => p.type === 'product'),
  services: s => s.list.filter(p => p.type === 'service'),
  activeItems: s => s.list.filter(p => p.active !== false),
  byId: s => id => s.list.find(p => p.id === id),
  categories: s => [...new Set(s.list.map(p => p.category).filter(Boolean))].sort(),
  lowStock: (s, g, _rootState, rootGetters) => {
    const threshold = rootGetters['settings/business'].lowStockThreshold || 5
    return s.list.filter(p => p.type === 'product' && p.active !== false && Number(p.stock) <= threshold)
  },
  stockValue: s => s.list
    .filter(p => p.type === 'product')
    .reduce((sum, p) => sum + (Number(p.cost) || 0) * (Number(p.stock) || 0), 0),
  search: s => ({ q, type, category }) => {
    const needle = String(q || '').toLowerCase().trim()
    return s.list.filter(p => {
      if (type && p.type !== type) return false
      if (category && p.category !== category) return false
      if (!needle) return true
      return [p.name, p.sku, p.category, p.description].some(v => String(v || '').toLowerCase().includes(needle))
    })
  }
}

const mutations = {
  ADD (s, payload) {
    s.list.unshift({ id: uid('prd'), active: true, stock: 0, createdAt: nowISO(), updatedAt: nowISO(), ...payload })
    write('catalog', s.list)
  },
  UPDATE (s, { id, data }) {
    const item = s.list.find(p => p.id === id)
    if (item) Object.assign(item, data, { updatedAt: nowISO() })
    write('catalog', s.list)
  },
  ADJUST_STOCK (s, { id, delta }) {
    const item = s.list.find(p => p.id === id)
    if (item) {
      item.stock = Math.max(0, (Number(item.stock) || 0) + Number(delta || 0))
      item.updatedAt = nowISO()
    }
    write('catalog', s.list)
  },
  DECREASE_STOCK (s, { id, qty }) {
    const item = s.list.find(p => p.id === id)
    if (item) {
      item.stock = Math.max(0, (Number(item.stock) || 0) - Number(qty || 0))
      item.updatedAt = nowISO()
      write('catalog', s.list)
    }
  },
  REMOVE (s, id) {
    s.list = s.list.filter(p => p.id !== id)
    write('catalog', s.list)
  },
  REPLACE_ALL (s, list) {
    s.list = Array.isArray(list) ? list : []
    write('catalog', s.list)
  }
}

export default { namespaced: true, state, getters, mutations }
