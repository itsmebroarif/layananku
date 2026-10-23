<template>
  <div>
    <div class="d-flex flex-wrap justify-space-between align-center mb-5 ga-3">
      <div>
        <div class="text-caption text-medium-emphasis font-weight-medium">{{ greeting }}, Tim Support</div>
        <div class="text-h5 font-weight-bold mt-1">{{ business.businessName }}</div>
        <div class="text-body-2 text-grey mt-1">Ringkasan operasional layanan pelanggan hari ini, {{ todayLabel }}.</div>
      </div>
      <div class="d-flex flex-wrap gap-2">
        <v-btn color="primary" variant="elevated" prepend-icon="mdi-plus" @click="newTicket">
          Tiket Baru
        </v-btn>
        <v-btn color="secondary" variant="tonal" prepend-icon="mdi-cash-register" to="/pos">
          Buka POS
        </v-btn>
        <v-btn variant="tonal" color="accent" prepend-icon="mdi-calendar-plus" @click="newEvent">
          Event
        </v-btn>
      </div>
    </div>

    <v-card v-if="showOnboarding" border class="mb-4">
      <v-card-title class="d-flex align-center py-3 px-4">
        <v-icon start icon="mdi-rocket-launch-outline" color="primary" />
        <span class="text-subtitle-1 font-weight-bold">Mulai Cepat — {{ businessNameStatus }}</span>
      </v-card-title>
      <v-divider />
      <v-card-text class="px-4 py-3">
        <v-row dense>
          <v-col v-for="step in onboardingSteps" :key="step.title" cols="12" sm="6" lg="3">
            <v-card
              :variant="step.done ? 'tonal' : 'outlined'"
              :color="step.done ? 'success' : undefined"
              class="h-100"
              border
            >
              <v-card-text class="d-flex align-center pa-3">
                <v-icon :icon="step.done ? 'mdi-check-circle' : step.icon" :color="step.done ? 'success' : 'primary'" size="28" class="mr-3" />
                <div class="flex-grow-1">
                  <div class="text-body-2 font-weight-bold">{{ step.title }}</div>
                  <div class="text-caption text-medium-emphasis" style="white-space:normal">{{ step.text }}</div>
                </div>
                <v-btn v-if="!step.done" size="x-small" color="primary" class="ml-1" :to="step.to">Mulai</v-btn>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-row dense class="mb-2">
      <v-col cols="6" md="3">
        <stat-card label="Tiket Aktif" :value="openTickets" icon="mdi-lifebuoy" color="primary" :sub="`${urgentTickets} prioritas tinggi/mendesak`" />
      </v-col>
      <v-col cols="6" md="3">
        <stat-card label="Pelanggan" :value="customerCount" icon="mdi-account-group" color="secondary" :sub="`${activeCustomers} aktif`" />
      </v-col>
      <v-col cols="6" md="3">
        <stat-card label="Penjualan Hari Ini" :value="todaySales" format :currency="currency" icon="mdi-cash-multiple" color="success" :sub="`${todayCount} transaksi`" />
      </v-col>
      <v-col cols="6" md="3">
        <stat-card label="Event Hari Ini" :value="todayEvents.length" icon="mdi-calendar-clock" color="accent" :sub="`${upcomingCount} agenda mendatang`" />
      </v-col>
    </v-row>

    <v-row dense>
      <v-col cols="12" lg="8">
        <v-card class="mb-4" border>
          <v-card-title class="d-flex align-center justify-space-between py-3 px-4">
            <span class="text-subtitle-1 font-weight-bold">Tiket Terbaru</span>
            <v-btn variant="text" size="small" color="primary" append-icon="mdi-arrow-right" to="/tickets">Lihat semua</v-btn>
          </v-card-title>
          <v-divider />
          <v-table density="compact" v-if="recentTickets.length">
            <thead>
              <tr>
                <th class="text-caption">Kode</th>
                <th class="text-caption">Subjek</th>
                <th class="text-caption">Pelanggan</th>
                <th class="text-caption">Prioritas</th>
                <th class="text-caption">Status</th>
                <th class="text-caption">Diperbarui</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="t in recentTickets" :key="t.id" style="cursor:pointer" @click="$router.push('/tickets')">
                <td class="text-caption font-weight-bold text-primary">{{ t.code }}</td>
                <td class="text-body-2">{{ t.subject }}</td>
                <td class="text-body-2">{{ customerName(t.customerId) }}</td>
                <td><v-chip size="x-small" :color="priorityColor(t.priority)" variant="tonal">{{ priorityLabel(t.priority) }}</v-chip></td>
                <td><v-chip size="x-small" :color="statusColor(t.status)" variant="flat">{{ statusLabel(t.status) }}</v-chip></td>
                <td class="text-caption text-medium-emphasis">{{ relative(t.updatedAt) }}</td>
              </tr>
            </tbody>
          </v-table>
          <empty-state v-else icon="mdi-lifebuoy" title="Belum ada tiket" text="Buat tiket pertama untuk mulai melayani pelanggan.">
            <template #action>
              <v-btn color="primary" variant="tonal" size="small" @click="newTicket">Buat Tiket</v-btn>
            </template>
          </empty-state>
        </v-card>

        <v-card border>
          <v-card-title class="d-flex align-center justify-space-between py-3 px-4">
            <span class="text-subtitle-1 font-weight-bold">Penjualan Bulan Ini</span>
            <span class="text-body-2 font-weight-bold text-success">{{ money(monthSales, currency) }}</span>
          </v-card-title>
          <v-divider />
          <v-card-text v-if="topSellers.length">
            <div v-for="item in topSellers.slice(0, 5)" :key="item.name" class="mb-3">
              <div class="d-flex justify-space-between text-body-2 mb-1">
                <span class="text-truncate" style="max-width:70%">{{ item.name }}</span>
                <span class="text-medium-emphasis">{{ item.qty }} terjual</span>
              </div>
              <v-progress-linear :model-value="topRatio(item)" color="primary" rounded height="6" bg-color="grey-lighten-3" />
            </div>
          </v-card-text>
          <empty-state v-else icon="mdi-cart-outline" title="Belum ada penjualan" text="Transaksi dari POS akan muncul di sini." size="40" />
        </v-card>
      </v-col>

      <v-col cols="12" lg="4">
        <v-card class="mb-4" border>
          <v-card-title class="py-3 px-4 d-flex align-center justify-space-between">
            <span class="text-subtitle-1 font-weight-bold">Agenda Terdekat</span>
            <v-btn variant="text" size="small" color="primary" to="/calendar" append-icon="mdi-arrow-right">Kalender</v-btn>
          </v-card-title>
          <v-divider />
          <v-list v-if="upcomingEvents.length" density="compact" lines="two">
            <v-list-item
              v-for="e in upcomingEvents.slice(0, 5)"
              :key="e.id"
              :title="e.title"
              :subtitle="`${dateShort(e.date)}${e.startTime ? ' · ' + e.startTime : ' · Sepanjang hari'}`"
            >
              <template #prepend>
                <v-avatar :color="categoryColor(e.category)" size="10" class="mr-3 mt-2" />
              </template>
            </v-list-item>
          </v-list>
          <empty-state v-else icon="mdi-calendar-blank-outline" title="Tidak ada agenda" size="40" />
        </v-card>

        <v-card border>
          <v-card-title class="py-3 px-4 d-flex align-center justify-space-between">
            <span class="text-subtitle-1 font-weight-bold">Stok Menipis</span>
            <v-chip size="x-small" color="warning" variant="tonal">{{ lowStock.length }}</v-chip>
          </v-card-title>
          <v-divider />
          <v-list v-if="lowStock.length" density="compact">
            <v-list-item
              v-for="p in lowStock.slice(0, 5)"
              :key="p.id"
              :title="p.name"
              :subtitle="`Sisa ${p.stock} ${p.unit || 'unit'} · ${p.sku}`"
              :append-value="undefined"
            >
              <template #append>
                <v-chip size="x-small" color="warning" variant="flat">Menipis</v-chip>
              </template>
            </v-list-item>
          </v-list>
          <empty-state v-else icon="mdi-package-variant-closed-check" title="Stok aman" text="Tidak ada produk dengan stok menipis." size="40" />
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import StatCard from '@/components/StatCard.vue'
import EmptyState from '@/components/EmptyState.vue'
import { TICKET_STATUS, TICKET_PRIORITY, EVENT_CATEGORIES, optionLabel, optionColor } from '@/utils/options'
import { money, relativeTime, dateShort } from '@/utils/format'
import { todayISO } from '@/utils/id'

export default {
  name: 'DashboardView',
  components: { StatCard, EmptyState },
  setup () {
    const store = useStore()
    const router = useRouter()


    const business = computed(() => store.getters['settings/business'])
    const currency = computed(() => store.getters['settings/currency'])
    const openTickets = computed(() => store.getters['tickets/openCount'])
    const urgentTickets = computed(() => store.getters['tickets/urgentOpen'])
    const recentTickets = computed(() => store.getters['tickets/recent'](6))
    const customerCount = computed(() => store.getters['customers/count'])
    const activeCustomers = computed(() => store.getters['customers/activeCount'])
    const todaySales = computed(() => store.getters['transactions/todaySales'])
    const todayCount = computed(() => store.getters['transactions/todayCount'])
    const monthSales = computed(() => store.getters['transactions/monthSales'])
    const topSellers = computed(() => store.getters['transactions/topSellers'])
    const todayEvents = computed(() => store.getters['events/todayEvents'])
    const upcomingEvents = computed(() => store.getters['events/upcoming'])
    const lowStock = computed(() => store.getters['catalog/lowStock'])
    const upcomingCount = computed(() => upcomingEvents.value.length)

    const showOnboarding = computed(() =>
      !customerCount.value && !store.getters['catalog/count'] &&
      !openTickets.value && !store.getters['transactions/count'] &&
      !store.getters['events/count'])

    const businessNameStatus = computed(() => business.value.businessName
      ? business.value.businessName
      : 'Lengkapi profil usaha Anda dulu')

    const onboardingSteps = computed(() => ([
      {
        title: 'Profil Usaha',
        text: 'Nama, kontak, pajak & mata uang — dicetak pada struk POS.',
        icon: 'mdi-storefront-outline',
        to: '/settings',
        done: !!business.value.businessName
      },
      {
        title: 'Produk & Jasa',
        text: 'Tambahkan item yang akan dijual di katalog.',
        icon: 'mdi-package-variant-closed',
        to: '/catalog',
        done: store.getters['catalog/count'] > 0
      },
      {
        title: 'Pelanggan',
        text: 'Simpan kontak pelanggan & badan usaha.',
        icon: 'mdi-account-group-outline',
        to: '/customers',
        done: customerCount.value > 0
      },
      {
        title: 'Tiket / Transaksi',
        text: 'Buat tiket dukungan atau jalankan kasir POS.',
        icon: 'mdi-lifebuoy',
        to: '/tickets',
        done: !!(openTickets.value || store.getters['transactions/count'])
      }
    ]))

    const greeting = computed(() => {
      const h = new Date().getHours()
      if (h < 11) return 'Selamat pagi'
      if (h < 15) return 'Selamat siang'
      if (h < 18) return 'Selamat sore'
      return 'Selamat malam'
    })
    const todayLabel = computed(() => new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }))

    const customerName = id => {
      const c = store.getters['customers/byId'](id)
      return c ? c.name : '—'
    }
    const statusLabel = v => optionLabel(TICKET_STATUS, v)
    const statusColor = v => optionColor(TICKET_STATUS, v)
    const priorityLabel = v => optionLabel(TICKET_PRIORITY, v)
    const priorityColor = v => optionColor(TICKET_PRIORITY, v)
    const categoryColor = v => optionColor(EVENT_CATEGORIES, v)
    const relative = v => relativeTime(v)
    const topRatio = item => {
      const max = Math.max(...topSellers.value.map(i => i.qty), 1)
      return (item.qty / max) * 100
    }

    const newTicket = () => router.push({ path: '/tickets', query: { new: '1' } })
    const newEvent = () => router.push({ path: '/calendar', query: { new: '1', date: todayISO() } })

    return {
      business, currency, openTickets, urgentTickets, recentTickets, customerCount, activeCustomers,
      todaySales, todayCount, monthSales, topSellers, todayEvents, upcomingEvents, lowStock, upcomingCount,
      greeting, todayLabel, customerName, statusLabel, statusColor, priorityLabel, priorityColor,
      categoryColor, relative, topRatio, money, dateShort, newTicket, newEvent,
      showOnboarding, onboardingSteps, businessNameStatus
    }
  }
}
</script>
