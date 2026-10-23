const state = () => ({
  drawer: true,
  rail: false,
  snackbar: { show: false, text: '', color: 'success', timeout: 2500 },
  installPrompt: null,
  online: typeof navigator !== 'undefined' ? navigator.onLine : true
})

const mutations = {
  SET_DRAWER (s, v) { s.drawer = v },
  TOGGLE_RAIL (s) { s.rail = !s.rail },
  SHOW_SNACKBAR (s, { text, color = 'success', timeout = 2500 }) {
    s.snackbar = { show: true, text, color, timeout }
  },
  HIDE_SNACKBAR (s) { s.snackbar = { ...s.snackbar, show: false } },
  SET_INSTALL_PROMPT (s, payload) { s.installPrompt = payload },
  SET_ONLINE (s, v) { s.online = v }
}

const actions = {
  notify ({ commit }, payload) {
    const opts = typeof payload === 'string' ? { text: payload } : payload
    commit('SHOW_SNACKBAR', opts)
  }
}

export default { namespaced: true, state, mutations, actions }
