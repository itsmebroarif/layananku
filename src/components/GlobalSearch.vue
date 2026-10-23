<template>
  <v-dialog :model-value="modelValue" max-width="720" scrollable @update:model-value="close">
    <v-card class="search-card">
      <v-text-field
        v-model="query"
        autofocus
        variant="plain"
        density="default"
        placeholder="Cari pelanggan, tiket, produk, transaksi…"
        prepend-inner-icon="mdi-magnify"
        hide-details
        class="search-input"
        @keydown.down.prevent="move(1)"
        @keydown.up.prevent="move(-1)"
        @keydown.enter.prevent="chooseActive"
        @keydown.esc.prevent="close"
      />
      <v-divider />
      <v-card-text class="pa-0" style="max-height:56vh">
        <div v-if="!query.trim()" class="pa-5">
          <div class="text-caption text-medium-emphasis mb-2">Pintasan</div>
          <div v-for="s in shortcuts" :key="s.path" class="d-flex align-center justify-space-between mb-1">
            <v-btn variant="text" size="small" :prepend-icon="s.icon" :to="s.path" @click="close">{{ s.title }}</v-btn>
            <span class="text-caption text-grey">{{ s.path }}</span>
          </div>
        </div>

        <div v-else-if="!flatResults.length" class="pa-6 text-center">
          <v-icon icon="mdi-magnify-close" size="44" color="grey-lighten-1" class="mb-2" />
          <div class="text-body-2 text-medium-emphasis">Tidak ada hasil untuk “{{ query }}”</div>
        </div>

        <div v-else>
          <template v-for="group in groups" :key="group.key">
            <div v-if="group.items.length" class="text-caption font-weight-bold text-medium-emphasis px-5 pt-3 pb-1">
              {{ group.title }} ({{ group.items.length }})
            </div>
            <v-list density="compact" class="py-0">
              <v-list-item
                v-for="item in group.items"
                :key="item.key"
                :active="item.key === activeKey"
                :title="item.title"
                :subtitle="item.subtitle"
                :prepend-icon="item.icon"
                color="primary"
                @mouseenter="setActive(item.key)"
                @click="go(item)"
              >
                <template #append>
                  <v-chip size="x-small" variant="tonal" color="grey">{{ item.badge }}</v-chip>
                </template>
              </v-list-item>
            </v-list>
          </template>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

export default {
  name: 'GlobalSearch',
  props: { modelValue: { type: Boolean, default: false } },
  emits: ['update:modelValue'],
  setup (props, { emit }) {
    const store = useStore()
    const router = useRouter()
    const query = ref('')
    const activeKey = ref('')

    const shortcuts = [
      { title: 'Dashboard', icon: 'mdi-view-dashboard-outline', path: '/' },
      { title: 'Tiket Dukungan', icon: 'mdi-lifebuoy', path: '/tickets' },
      { title: 'POS — Kasir', icon: 'mdi-cash-register', path: '/pos' },
      { title: 'Laporan', icon: 'mdi-chart-box-outline', path: '/reports' },
      { title: 'Pelanggan', icon: 'mdi-account-group-outline', path: '/customers' },
      { title: 'Produk & Jasa', icon: 'mdi-package-variant-closed', path: '/catalog' }
    ]

    const groups = computed(() => {
      const q = query.value.toLowerCase().trim()
      if (!q) return []

      const customers = store.getters['customers/list']
        .filter(c => [c.name, c.company, c.email, c.phone].some(v => String(v || '').toLowerCase().includes(q)))
        .slice(0, 5)
        .map(c => ({
          key: `cus-${c.id}`,
          title: c.name,
          subtitle: [c.company, c.phone, c.email].filter(Boolean).join(' · '),
          icon: 'mdi-account-outline',
          badge: 'Pelanggan',
          route: { path: '/customers' }
        }))

      const tickets = store.getters['tickets/list']
        .filter(t => [t.code, t.subject, t.description, t.assignee].some(v => String(v || '').toLowerCase().includes(q)))
        .slice(0, 5)
        .map(t => ({
          key: `tkt-${t.id}`,
          title: `${t.code} — ${t.subject}`,
          subtitle: t.assignee ? `Penanggung jawab: ${t.assignee}` : 'Tiket dukungan',
          icon: 'mdi-lifebuoy',
          badge: 'Tiket',
          route: { path: '/tickets' }
        }))

      const products = store.getters['catalog/list']
        .filter(p => [p.name, p.sku, p.category].some(v => String(v || '').toLowerCase().includes(q)))
        .slice(0, 5)
        .map(p => ({
          key: `prd-${p.id}`,
          title: p.name,
          subtitle: `${p.sku} · ${p.type === 'product' ? 'Produk' : 'Jasa'}`,
          icon: p.type === 'product' ? 'mdi-cube-outline' : 'mdi-tools',
          badge: 'Katalog',
          route: { path: '/catalog' }
        }))

      const transactions = store.getters['transactions/list']
        .filter(t => String(t.invoice || '').toLowerCase().includes(q))
        .slice(0, 5)
        .map(t => ({
          key: `trx-${t.id}`,
          title: t.invoice,
          subtitle: `${(t.items || []).length} item`,
          icon: 'mdi-receipt',
          badge: 'Transaksi',
          route: { path: '/pos' }
        }))

      return [
        { key: 'customers', title: 'Pelanggan', items: customers },
        { key: 'tickets', title: 'Tiket', items: tickets },
        { key: 'catalog', title: 'Produk & Jasa', items: products },
        { key: 'transactions', title: 'Transaksi', items: transactions }
      ]
    })

    const flatResults = computed(() => groups.value.flatMap(g => g.items))

    watch(() => props.modelValue, open => {
      if (open) {
        query.value = ''
        activeKey.value = ''
      }
    })

    watch(flatResults, list => {
      activeKey.value = list.length ? list[0].key : ''
    })

    function move (delta) {
      const list = flatResults.value
      if (!list.length) return
      const idx = list.findIndex(i => i.key === activeKey.value)
      const next = (idx + delta + list.length) % list.length
      activeKey.value = list[next].key
    }

    function chooseActive () {
      const item = flatResults.value.find(i => i.key === activeKey.value)
      if (item) go(item)
    }

    function setActive (key) { activeKey.value = key }

    function go (item) {
      router.push(item.route)
      close()
    }

    function close () { emit('update:modelValue', false) }

    return { query, activeKey, groups, flatResults, shortcuts, move, chooseActive, setActive, go, close }
  }
}
</script>

<style scoped>
.search-input :deep(input) { font-size: 1rem; }
</style>
