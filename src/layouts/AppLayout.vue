<template>
  <div>
    <v-navigation-drawer
      v-model="drawer"
      :rail="rail && !mobile"
      :temporary="mobile"
      app
      width="260"
      rail-width="72"
    >
      <div class="d-flex align-center pa-4 pb-2">
        <v-avatar color="primary" size="40" class="mr-3">
          <v-icon icon="mdi-headset"></v-icon>
        </v-avatar>
        <div v-if="!rail || mobile" class="overflow-hidden">
          <div class="text-body-1 font-weight-bold text-truncate">ServiceTools</div>
          <div class="text-caption text-medium-emphasis text-truncate">Customer Support Suite</div>
        </div>
      </div>

      <v-divider />

      <v-list nav density="compact" class="px-2 py-2">
        <template v-for="(group, gi) in navGroups" :key="group.id">
          <v-divider v-if="gi > 0" class="my-2 mx-3" style="opacity:.4" />
          <div
            v-if="!(rail && !mobile) && group.title"
            class="text-caption font-weight-bold text-medium-emphasis px-3 pt-1 pb-1 menu-group-title"
          >
            {{ group.title }}
          </div>
          <v-list-item
            v-for="item in group.items"
            :key="item.id"
            :to="item.external ? undefined : item.path"
            :href="item.external ? item.path : undefined"
            :target="item.external ? '_blank' : undefined"
            :rel="item.external ? 'noopener' : undefined"
            :prepend-icon="item.icon || 'mdi-link-variant'"
            :title="item.title"
            color="primary"
            rounded="lg"
            class="mb-1"
          />
        </template>
      </v-list>

      <template #append>
        <v-divider />
        <div class="pa-3 d-flex align-center justify-space-between">
          <div class="d-flex align-center gap-2">
            <v-icon :color="online ? 'success' : 'error'" size="16" :icon="online ? 'mdi-wifi' : 'mdi-wifi-off'" />
            <span class="text-caption text-medium-emphasis">{{ online ? 'Online' : 'Offline' }}</span>
          </div>
          <v-btn
            icon="mdi-chevron-left"
            size="x-small"
            variant="text"
            :disabled="mobile"
            @click="rail = !rail"
          />
        </div>
      </template>
    </v-navigation-drawer>

    <v-app-bar flat color="surface" height="60" border="b">
      <v-app-bar-nav-icon v-if="mobile" @click="drawer = !drawer" />
      <v-btn v-else icon variant="text" @click="rail = !rail">
        <v-icon :icon="rail ? 'mdi-chevron-right' : 'mdi-chevron-left'" />
      </v-btn>

      <v-toolbar-title class="text-body-1 font-weight-bold">
        {{ title }}
      </v-toolbar-title>

      <v-spacer />

      <v-chip v-if="!online" size="small" color="warning" variant="tonal" class="mr-2" prepend-icon="mdi-wifi-off">
        Offline
      </v-chip>

      <v-btn
        v-if="installPrompt"
        size="small"
        variant="tonal"
        color="primary"
        class="mr-2"
        prepend-icon="mdi-download"
        @click="installApp"
      >
        Pasang Aplikasi
      </v-btn>

      <v-tooltip text="Cari (Ctrl+K)" location="bottom">
        <template #activator="{ props }">
          <v-btn v-bind="props" icon variant="text" class="mr-1" @click="searchOpen = true">
            <v-icon icon="mdi-magnify" />
          </v-btn>
        </template>
      </v-tooltip>

      <v-tooltip :text="isDark ? 'Mode terang' : 'Mode gelap'" location="bottom">
        <template #activator="{ props }">
          <v-btn v-bind="props" icon variant="text" class="mr-1" @click="toggleTheme">
            <v-icon :icon="isDark ? 'mdi-white-balance-sunny' : 'mdi-weather-night'" />
          </v-btn>
        </template>
      </v-tooltip>

      <alerts-menu />
      <global-search v-model="searchOpen" />
    </v-app-bar>

    <v-main>
      <v-container fluid class="pa-4 pa-md-5">
        <router-view v-slot="{ Component }">
          <v-fade-transition mode="out-in">
            <component :is="Component" />
          </v-fade-transition>
        </router-view>
      </v-container>
    </v-main>

    <v-bottom-navigation v-if="mobile" v-model="bottomValue" grow elevation="8" height="60">
      <v-btn value="dashboard" to="/">
        <v-icon>mdi-view-dashboard-outline</v-icon>
        <span class="text-caption">Beranda</span>
      </v-btn>
      <v-btn value="tickets" to="/tickets">
        <v-badge :content="openTickets" color="error" :model-value="openTickets > 0" offset-x="10" offset-y="-4">
          <v-icon>mdi-lifebuoy</v-icon>
        </v-badge>
        <span class="text-caption">Tiket</span>
      </v-btn>
      <v-btn value="pos" to="/pos">
        <v-icon>mdi-cash-register</v-icon>
        <span class="text-caption">POS</span>
      </v-btn>
      <v-btn value="calendar" to="/calendar">
        <v-icon>mdi-calendar-month-outline</v-icon>
        <span class="text-caption">Event</span>
      </v-btn>
      <v-btn value="more" @click="drawer = true">
        <v-icon>mdi-menu</v-icon>
        <span class="text-caption">Lainnya</span>
      </v-btn>
    </v-bottom-navigation>
  </div>
</template>

<script>
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useDisplay, useTheme } from 'vuetify'
import AlertsMenu from '@/components/AlertsMenu.vue'
import GlobalSearch from '@/components/GlobalSearch.vue'

export default {
  name: 'AppLayout',
  components: { AlertsMenu, GlobalSearch },
  setup () {
    const route = useRoute()
    const router = useRouter()
    const store = useStore()
    const { mobile } = useDisplay()
    const theme = useTheme()

    const rail = ref(false)
    const bottomValue = ref('dashboard')
    const searchOpen = ref(false)

    const navGroups = computed(() => store.getters['menu/visibleGroups'])
    const title = computed(() => (route.meta && route.meta.title) || 'Dashboard')
    const online = computed(() => store.state.ui.online)
    const installPrompt = computed(() => store.state.ui.installPrompt)
    const openTickets = computed(() => store.getters['tickets/openCount'])
    const isDark = computed(() => theme.global.name.value === 'dark')

    const drawer = computed({
      get () {
        if (mobile.value) return store.state.ui.drawer
        return !rail.value
      },
      set (v) {
        if (mobile.value) store.commit('ui/SET_DRAWER', v)
        else if (!v) rail.value = true
        else rail.value = false
      }
    })

    watch(mobile, v => {
      if (v) store.commit('ui/SET_DRAWER', false)
    }, { immediate: true })

    watch(() => route.fullPath, () => {
      const name = route.name
      if (['dashboard', 'tickets', 'pos', 'calendar'].includes(name)) bottomValue.value = name
    })

    const onOnline = () => store.commit('ui/SET_ONLINE', true)
    const onOffline = () => store.commit('ui/SET_ONLINE', false)

    function toggleTheme () {
      const next = isDark.value ? 'light' : 'dark'
      store.commit('settings/UPDATE_SETTINGS', { theme: next })
      theme.global.name.value = next
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', next === 'dark' ? '#121212' : '#1976D2')
    }

    function onKeydown (e) {
      const tag = (e.target.tagName || '').toLowerCase()
      const typing = ['input', 'textarea', 'select'].includes(tag) || e.target.isContentEditable
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault()
        searchOpen.value = !searchOpen.value
      } else if (e.key === '/' && !typing && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        searchOpen.value = true
      }
    }

    onMounted(() => {
      window.addEventListener('online', onOnline)
      window.addEventListener('offline', onOffline)
      window.addEventListener('keydown', onKeydown)
      store.commit('ui/SET_ONLINE', navigator.onLine !== false)
    })
    onBeforeUnmount(() => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
      window.removeEventListener('keydown', onKeydown)
    })

    async function installApp () {
      const prompt = installPrompt.value
      if (!prompt) return
      prompt.prompt()
      const choice = await prompt.userChoice
      if (choice && choice.outcome === 'accepted') store.dispatch('ui/notify', 'Pemasangan aplikasi dimulai…')
      store.commit('ui/SET_INSTALL_PROMPT', null)
    }

    return {
      rail, drawer, bottomValue, navGroups, title, online, installPrompt, openTickets, mobile, installApp,
      searchOpen, isDark, toggleTheme
    }
  }
}
</script>

<style scoped>
.menu-group-title {
  text-transform: uppercase;
  font-size: 10.5px;
  letter-spacing: .8px;
}
</style>
