import { createApp } from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'

createApp(App).use(store).use(router).use(vuetify).mount('#app')

window.addEventListener('online', () => store.dispatch('ui/notify', { text: 'Koneksi internet tersambung kembali.', color: 'success' }))
window.addEventListener('offline', () => store.dispatch('ui/notify', { text: 'Anda sedang offline. Data tetap tersimpan di perangkat.', color: 'warning' }))
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault()
  store.commit('ui/SET_INSTALL_PROMPT', e)
})
window.addEventListener('appinstalled', () => {
  store.commit('ui/SET_INSTALL_PROMPT', null)
  store.dispatch('ui/notify', 'Aplikasi berhasil dipasang di perangkat Anda.')
})
