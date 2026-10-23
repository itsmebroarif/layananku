<template>
  <v-menu :close-on-content-click="false" location="bottom end">
    <template #activator="{ props }">
      <v-btn v-bind="props" icon variant="text" class="mr-1">
        <v-badge :content="alerts.length" color="error" :model-value="alerts.length > 0" offset-x="2" offset-y="2">
          <v-icon icon="mdi-bell-outline" />
        </v-badge>
      </v-btn>
    </template>

    <v-card width="360" max-height="460">
      <v-card-title class="d-flex align-center justify-space-between py-3 px-4 text-subtitle-2 font-weight-bold">
        Pemberitahuan
        <v-chip v-if="alerts.length" size="x-small" color="error" variant="tonal">{{ alerts.length }}</v-chip>
      </v-card-title>
      <v-divider />
      <v-list v-if="alerts.length" density="compact" lines="two" class="py-0" style="max-height:380px;overflow-y:auto">
        <v-list-item
          v-for="a in alerts"
          :key="a.key"
          :title="a.title"
          :subtitle="a.text"
          :prepend-icon="a.icon"
          :color="a.color"
          @click="go(a)"
        >
          <template #append>
            <v-icon icon="mdi-chevron-right" size="16" color="grey" />
          </template>
        </v-list-item>
      </v-list>
      <div v-else class="pa-6 text-center">
        <v-icon icon="mdi-bell-check-outline" size="40" color="success" class="mb-2" />
        <div class="text-body-2 text-medium-emphasis">Semua beres. Tidak ada perhatian yang dibutuhkan.</div>
      </div>
      <v-divider />
      <v-card-actions class="px-4 py-2">
        <v-btn variant="text" size="small" to="/reports" @click="close">Buka Laporan</v-btn>
        <v-spacer />
        <v-btn variant="text" size="small" to="/settings" @click="close">Pengaturan</v-btn>
      </v-card-actions>
    </v-card>
  </v-menu>
</template>

<script>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { dateShort } from '@/utils/format'

export default {
  name: 'AlertsMenu',
  emits: ['close'],
  setup (props, { emit }) {
    const store = useStore()
    const router = useRouter()

    const alerts = computed(() => {
      const list = []

      store.getters['tickets/overdue'].slice(0, 6).forEach(t => {
        list.push({
          key: `overdue-${t.id}`,
          icon: 'mdi-alert-clock-outline',
          color: 'error',
          title: `${t.code} melewati tenggat`,
          text: `${t.subject} · tenggat ${dateShort(t.dueDate)}`,
          route: { path: '/tickets' }
        })
      })

      store.getters['catalog/lowStock'].slice(0, 6).forEach(p => {
        list.push({
          key: `stock-${p.id}`,
          icon: 'mdi-package-up',
          color: 'warning',
          title: `Stok menipis: ${p.name}`,
          text: `Sisa ${p.stock} ${p.unit || 'unit'} · SKU ${p.sku}`,
          route: { path: '/catalog' }
        })
      })

      store.getters['events/todayEvents'].slice(0, 6).forEach(e => {
        list.push({
          key: `evt-${e.id}`,
          icon: 'mdi-calendar-clock',
          color: 'info',
          title: e.title,
          text: e.allDay ? 'Sepanjang hari' : `${e.startTime || ''}${e.endTime ? ' – ' + e.endTime : ''}`,
          route: { path: '/calendar' }
        })
      })

      return list
    })

    function go (a) {
      router.push(a.route)
      close()
    }
    function close () { emit('close') }

    return { alerts, go, close }
  }
}
</script>
