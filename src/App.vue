<template>
  <v-app>
    <app-layout />
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="snackbar.timeout"
      location="bottom right"
    >
      {{ snackbar.text }}
      <template #actions>
        <v-btn variant="text" size="small" @click="hide">Tutup</v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<script>
import { computed, watch, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useTheme } from 'vuetify'
import AppLayout from '@/layouts/AppLayout.vue'

export default {
  name: 'App',
  components: { AppLayout },
  setup () {
    const store = useStore()
    const theme = useTheme()
    const snackbar = computed(() => store.state.ui.snackbar)

    watch(() => store.getters['settings/theme'], v => {
      theme.global.name.value = v
    }, { immediate: true })

    onMounted(() => {
      const events = store.getters['events/todayEvents']
      if (events.length) {
        store.dispatch('ui/notify', {
          text: `Hari ini ada ${events.length} agenda: ${events[0].title}${events.length > 1 ? ', dst.' : '.'}`,
          color: 'info',
          timeout: 5000
        })
      }
      const low = store.getters['catalog/lowStock']
      if (low.length) {
        setTimeout(() => store.dispatch('ui/notify', {
          text: `${low.length} item katalog stoknya menipis. Periksa halaman Produk & Jasa.`,
          color: 'warning',
          timeout: 5000
        }), 900)
      }
    })

    return { snackbar, hide: () => store.commit('ui/HIDE_SNACKBAR') }
  }
}
</script>

<style>
html, body, #app { height: 100%; }
body { margin: 0; font-family: Roboto, system-ui, -apple-system, 'Segoe UI', Arial, sans-serif; }
::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-thumb { background: rgba(0,0,0,.22); border-radius: 8px; }
::-webkit-scrollbar-track { background: transparent; }
</style>
