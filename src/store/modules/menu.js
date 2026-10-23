import { read, write } from '@/utils/storage'
import { uid } from '@/utils/id'

const builtin = (id, title, icon, path) => ({ id, title, icon, path, external: false, hidden: false, builtin: true })

const defaultGroups = () => ([
  {
    id: 'utama',
    title: 'Utama',
    items: [builtin('m-dashboard', 'Dashboard', 'mdi-view-dashboard-outline', '/')]
  },
  {
    id: 'bisnis',
    title: 'Mitra & Project',
    items: [
      builtin('m-mitras', 'Data Mitra', 'mdi-handshake-outline', '/mitras'),
      builtin('m-projects', 'Data Project', 'mdi-folder-table-outline', '/projects'),
      builtin('m-staff', 'Data Staff', 'mdi-account-hard-hat-outline', '/staff')
    ]
  },
  {
    id: 'operasional',
    title: 'Operasional',
    items: [
      builtin('m-prospects', 'Calon Customer', 'mdi-bullhorn-outline', '/prospects'),
      builtin('m-customers', 'Pelanggan', 'mdi-account-group-outline', '/customers'),
      builtin('m-tickets', 'Tiket Dukungan', 'mdi-lifebuoy', '/tickets'),
      builtin('m-catalog', 'Produk & Jasa', 'mdi-package-variant-closed', '/catalog'),
      builtin('m-pos', 'POS — Kasir', 'mdi-cash-register', '/pos'),
      builtin('m-calendar', 'Kalender Event', 'mdi-calendar-month-outline', '/calendar')
    ]
  },
  {
    id: 'analisis',
    title: 'Analisis',
    items: [builtin('m-reports', 'Laporan', 'mdi-chart-box-outline', '/reports')]
  },
  {
    id: 'perkakas',
    title: 'Perkakas',
    items: [
      builtin('m-kanban', 'Todo Kanban', 'mdi-view-column-outline', '/kanban'),
      builtin('m-calculator', 'Kalkulator', 'mdi-calculator-variant-outline', '/calculator')
    ]
  },
  {
    id: 'sistem',
    title: 'Sistem',
    items: [builtin('m-settings', 'Pengaturan', 'mdi-cog-outline', '/settings')]
  }
])

const clone = v => JSON.parse(JSON.stringify(v))

function migrateGroups (stored) {
  const defs = defaultGroups()
  if (!Array.isArray(stored) || !stored.length) return defs
  const ids = new Set(stored.flatMap(g => (g.items || []).map(i => i.id)))
  if (!ids.has('m-projects') && !stored.find(s => s.id === 'bisnis')) {
    const group = clone(defs.find(d => d.id === 'bisnis'))
    const idx = stored.findIndex(s => s.id === 'utama')
    stored.splice(idx >= 0 ? idx + 1 : 0, 0, group)
  }
  if (!ids.has('m-kanban')) {
    const item = clone(defs.find(d => d.id === 'perkakas').items.find(i => i.id === 'm-kanban'))
    const perkakas = stored.find(s => s.id === 'perkakas')
    const target = perkakas || stored.find(s => (s.items || []).some(i => i.id === 'm-calculator'))
    if (target) target.items = [item, ...(target.items || [])]
    else stored.push({ id: 'perkakas', title: 'Perkakas', items: [item] })
  }
  if (!ids.has('m-prospects')) {
    const item = clone(defs.find(d => d.id === 'operasional').items.find(i => i.id === 'm-prospects'))
    const oper = stored.find(s => s.id === 'operasional')
    const target = oper || stored.find(s => (s.items || []).some(i => i.id === 'm-customers'))
    if (target) target.items = [...(target.items || []), item]
    else stored.push({ id: 'operasional', title: 'Operasional', items: [item] })
  }
  if (!stored.find(s => s.id === 'bisnis')) {
    const group = clone(defs.find(d => d.id === 'bisnis'))
    group.items = group.items.filter(i => ids.has(i.id) || i.id === 'm-staff')
    if (group.items.length) stored.splice(1, 0, group)
  }
  return stored
}

const freshState = () => {
  const stored = read('menu', null)
  if (Array.isArray(stored) && stored.length) return migrateGroups(stored)
  return defaultGroups()
}

const state = () => ({ groups: freshState() })

const getters = {
  groups: s => s.groups,
  visibleGroups: s => s.groups
    .map(g => ({ ...g, items: (g.items || []).filter(i => !i.hidden) }))
    .filter(g => (g.items || []).length)
}

function persist (s) { write('menu', s.groups) }

const mutations = {
  ADD_GROUP (s, title) {
    s.groups.push({ id: uid('grp'), title: String(title).trim() || 'Grup Baru', items: [] })
    persist(s)
  },
  UPDATE_GROUP (s, { id, title }) {
    const g = s.groups.find(x => x.id === id)
    if (g) {
      g.title = String(title).trim() || g.title
      persist(s)
    }
  },
  REMOVE_GROUP (s, id) {
    s.groups = s.groups.filter(g => g.id !== id)
    persist(s)
  },
  ADD_ITEM (s, { groupId, item }) {
    const g = s.groups.find(x => x.id === groupId)
    if (g) {
      g.items.push({
        id: uid('mnu'),
        external: false,
        hidden: false,
        builtin: false,
        ...item
      })
      persist(s)
    }
  },
  UPDATE_ITEM (s, { groupId, itemId, data }) {
    const g = s.groups.find(x => x.id === groupId)
    const item = g && (g.items || []).find(i => i.id === itemId)
    if (item) {
      Object.assign(item, data)
      persist(s)
    }
  },
  REMOVE_ITEM (s, { groupId, itemId }) {
    const g = s.groups.find(x => x.id === groupId)
    if (g) {
      g.items = (g.items || []).filter(i => i.id !== itemId)
      persist(s)
    }
  },
  MOVE_ITEM (s, { groupId, itemId, dir }) {
    const g = s.groups.find(x => x.id === groupId)
    if (!g) return
    const idx = (g.items || []).findIndex(i => i.id === itemId)
    const next = idx + dir
    if (idx >= 0 && next >= 0 && next < g.items.length) {
      const list = [...g.items]
      const [item] = list.splice(idx, 1)
      list.splice(next, 0, item)
      g.items = list
      persist(s)
    }
  },
  MOVE_ITEM_TO_GROUP (s, { fromGroup, toGroup, itemId }) {
    const from = s.groups.find(x => x.id === fromGroup)
    const to = s.groups.find(x => x.id === toGroup)
    const item = from && (from.items || []).find(i => i.id === itemId)
    if (item && to && fromGroup !== toGroup) {
      from.items = from.items.filter(i => i.id !== itemId)
      to.items = [...(to.items || []), item]
      persist(s)
    }
  },
  REPLACE_ALL (s, groups) {
    s.groups = Array.isArray(groups) && groups.length ? groups : defaultGroups()
    persist(s)
  },
  RESET_DEFAULTS (s) {
    s.groups = defaultGroups()
    persist(s)
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations
}
