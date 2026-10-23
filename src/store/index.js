import { createStore } from 'vuex'
import settings from './modules/settings'
import customers from './modules/customers'
import tickets from './modules/tickets'
import catalog from './modules/catalog'
import transactions from './modules/transactions'
import events from './modules/events'
import ui from './modules/ui'
import menu from './modules/menu'
import staff from './modules/staff'
import mitras from './modules/mitras'
import projects from './modules/projects'
import prospects from './modules/prospects'
import kanban from './modules/kanban'

const store = createStore({
  modules: {
    settings, customers, tickets, catalog, transactions, events, ui, menu,
    staff, mitras, projects, prospects, kanban
  },
  actions: {
    exportData ({ state }) {
      return {
        app: 'service-management-tools',
        version: 4,
        exportedAt: new Date().toISOString(),
        settings: state.settings,
        customers: state.customers.list,
        tickets: state.tickets.list,
        catalog: state.catalog.list,
        transactions: state.transactions.list,
        events: state.events.list,
        staff: state.staff.list,
        staffCustom: state.staff.custom,
        mitras: state.mitras.list,
        projects: state.projects.list,
        prospects: state.prospects.list,
        kanban: state.kanban.list
      }
    },
    importData ({ commit }, payload) {
      if (!payload || typeof payload !== 'object') throw new Error('Format berkas tidak valid.')
      if (payload.settings) commit('settings/UPDATE_SETTINGS', payload.settings)
      if (Array.isArray(payload.customers)) commit('customers/REPLACE_ALL', payload.customers)
      if (Array.isArray(payload.tickets)) commit('tickets/REPLACE_ALL', payload.tickets)
      if (Array.isArray(payload.catalog)) commit('catalog/REPLACE_ALL', payload.catalog)
      if (Array.isArray(payload.transactions)) commit('transactions/REPLACE_ALL', payload.transactions)
      if (Array.isArray(payload.events)) commit('events/REPLACE_ALL', payload.events)
      if (Array.isArray(payload.staff)) commit('staff/REPLACE_ALL', payload.staff)
      if (payload.staffCustom && typeof payload.staffCustom === 'object') commit('staff/REPLACE_CUSTOM', payload.staffCustom)
      if (Array.isArray(payload.mitras)) commit('mitras/REPLACE_ALL', payload.mitras)
      if (Array.isArray(payload.projects)) commit('projects/REPLACE_ALL', payload.projects)
      if (Array.isArray(payload.prospects)) commit('prospects/REPLACE_ALL', payload.prospects)
      if (Array.isArray(payload.kanban)) commit('kanban/REPLACE_ALL', payload.kanban)
    },
    resetAll ({ commit }) {
      commit('customers/REPLACE_ALL', [])
      commit('tickets/REPLACE_ALL', [])
      commit('catalog/REPLACE_ALL', [])
      commit('transactions/REPLACE_ALL', [])
      commit('events/REPLACE_ALL', [])
      commit('staff/REPLACE_ALL', [])
      commit('staff/RESET_CUSTOM')
      commit('mitras/REPLACE_ALL', [])
      commit('projects/REPLACE_ALL', [])
      commit('prospects/REPLACE_ALL', [])
      commit('kanban/REPLACE_ALL', [])
      commit('settings/RESET_SETTINGS')
    }
  }
})

export default store
