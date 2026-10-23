import { read, write } from '@/utils/storage'
import { uid, nowISO, nextCode } from '@/utils/id'

const featureSubtotal = p => (p.features || [])
  .reduce((sum, f) => sum + (Number(f.price) || 0) * (Number(f.qty) || 1), 0)

const hostingCost = p => (p.hostedBy === 'kita' ? (Number(p.hosting && p.hosting.price) || 0) : 0)

export function totals (p) {
  if (!p) return { subtotal: 0, discount: 0, total: 0, paid: 0, remaining: 0, fullyPaid: false }
  const subtotal = featureSubtotal(p) + hostingCost(p)
  const discount = Math.min(Number(p.discount) || 0, subtotal)
  const taxable = Math.max(0, subtotal - discount)
  const tax = Math.round(taxable * (Number(p.taxPercent) || 0) / 100)
  const total = taxable + tax
  const paid = (p.payments || []).reduce((s, pay) => s + (Number(pay.amount) || 0), 0)
  const remaining = Math.max(0, total - paid)
  return { subtotal, discount, tax, total, paid, remaining, fullyPaid: remaining <= 0 && total > 0 }
}

const state = () => ({ list: read('projects', []) })

const getters = {
  list: s => s.list,
  count: s => s.list.length,
  byId: s => id => s.list.find(x => x.id === id),
  byMitra: s => id => s.list.filter(p => p.mitraId === id),
  byStaff: s => id => s.list.filter(p => p.staffId === id),
  byStatus: s => status => s.list.filter(p => p.status === status),
  byType: s => type => s.list.filter(p => p.type === type),
  totalsOf: s => id => totals(s.list.find(x => x.id === id)),
  grand: s => {
    let total = 0, paid = 0
    s.list.forEach(p => {
      const t = totals(p)
      total += t.total
      paid += t.paid
    })
    return { total, paid, remaining: Math.max(0, total - paid) }
  }
}

const mutations = {
  ADD (s, payload) {
    s.list.unshift({
      id: uid('prj'),
      code: nextCode(s.list, 'PRJ'),
      features: [],
      payments: [],
      discount: 0,
      taxPercent: 0,
      hostedBy: 'mitra',
      createdAt: nowISO(),
      updatedAt: nowISO(),
      ...payload
    })
    write('projects', s.list)
  },
  UPDATE (s, { id, data }) {
    const item = s.list.find(x => x.id === id)
    if (item) Object.assign(item, data, { updatedAt: nowISO() })
    write('projects', s.list)
  },
  ADD_PAYMENT (s, { id, payment }) {
    const item = s.list.find(x => x.id === id)
    if (item) {
      item.payments = [...(item.payments || []), { id: uid('pay'), ...payment }]
      item.updatedAt = nowISO()
    }
    write('projects', s.list)
  },
  REMOVE_PAYMENT (s, { id, paymentId }) {
    const item = s.list.find(x => x.id === id)
    if (item) item.payments = (item.payments || []).filter(x => x.id !== paymentId)
    write('projects', s.list)
  },
  REMOVE (s, id) {
    s.list = s.list.filter(x => x.id !== id)
    write('projects', s.list)
  },
  REPLACE_ALL (s, list) {
    s.list = Array.isArray(list) ? list : []
    write('projects', s.list)
  }
}

export default { namespaced: true, state, getters, mutations }
