<template>
  <div>
    <div class="d-flex flex-wrap justify-space-between align-center mb-4 ga-3">
      <div class="text-body-2 text-grey">Kelola katalog produk fisik dan jasa/layanan yang dijual melalui POS maupun penawaran.</div>
      <v-btn color="primary" variant="elevated" prepend-icon="mdi-plus" @click="openForm()">Tambah Item</v-btn>
    </div>

    <v-row dense class="mb-4">
      <v-col cols="6" md="3">
        <stat-card label="Total Item" :value="count" icon="mdi-package-variant-closed" color="primary" />
      </v-col>
      <v-col cols="6" md="3">
        <stat-card label="Produk Fisik" :value="products.length" icon="mdi-cube-outline" color="secondary" />
      </v-col>
      <v-col cols="6" md="3">
        <stat-card label="Jasa / Layanan" :value="services.length" icon="mdi-tools" color="accent" />
      </v-col>
      <v-col cols="6" md="3">
        <stat-card label="Nilai Stok (Modal)" :value="stockValue" format :currency="currency" icon="mdi-safe-square-outline" color="success" />
      </v-col>
    </v-row>

    <v-card border>
      <v-card-text class="py-3">
        <div class="d-flex flex-wrap gap-2">
          <v-text-field v-model="search" placeholder="Cari nama, SKU, kategori…" prepend-inner-icon="mdi-magnify" style="max-width:320px" clearable />
          <v-select v-model="category" :items="categories" label="Kategori" style="max-width:190px" clearable />
          <v-spacer />
          <v-btn variant="tonal" color="warning" prepend-icon="mdi-alert-outline" @click="onlyLow = !onlyLow">
            {{ onlyLow ? 'Semua Stok' : 'Stok Menipis' }}
          </v-btn>
        </div>
        <v-tabs v-model="tab" color="primary" density="compact" class="mt-1" hide-slider>
          <v-tab value="all">Semua ({{ count }})</v-tab>
          <v-tab value="product">Produk ({{ products.length }})</v-tab>
          <v-tab value="service">Jasa ({{ services.length }})</v-tab>
        </v-tabs>
      </v-card-text>

      <v-divider />

      <v-window v-model="tab">
        <v-window-item v-for="t in ['all', 'product', 'service']" :key="t" :value="t">
          <v-table v-if="filtered(t).length" density="compact">
            <thead>
              <tr>
                <th class="text-caption">Item</th>
                <th class="text-caption">Kategori</th>
                <th class="text-caption text-right">Harga Jual</th>
                <th class="text-caption text-right">Modal</th>
                <th class="text-caption text-right">Margin</th>
                <th class="text-caption">Stok</th>
                <th class="text-caption">Status</th>
                <th class="text-caption text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in filtered(t)" :key="p.id">
                <td>
                  <div class="d-flex align-center py-1">
                    <v-avatar :color="p.type === 'product' ? 'primary' : 'accent'" size="30" variant="tonal" class="mr-3">
                      <v-icon :icon="p.type === 'product' ? 'mdi-cube' : 'mdi-tools'" size="16" />
                    </v-avatar>
                    <div>
                      <div class="text-body-2 font-weight-medium">{{ p.name }}</div>
                      <div class="text-caption text-medium-emphasis">{{ p.sku }} · per {{ p.unit }}</div>
                    </div>
                  </div>
                </td>
                <td><v-chip size="x-small" variant="tonal" color="info">{{ p.category }}</v-chip></td>
                <td class="text-right text-body-2 font-weight-medium">{{ money(p.price, currency) }}</td>
                <td class="text-right text-caption text-medium-emphasis">{{ money(p.cost, currency) }}</td>
                <td class="text-right">
                  <span class="text-caption" :class="margin(p) >= 0 ? 'text-success' : 'text-error'">{{ margin(p) }}%</span>
                </td>
                <td>
                  <template v-if="p.type === 'product'">
                    <v-chip size="x-small" :color="stockColor(p)" variant="tonal" class="mr-1">{{ p.stock }} {{ p.unit }}</v-chip>
                    <v-btn icon="mdi-swap-vertical" size="x-small" variant="text" @click="openStock(p)" title="Penyesuaian stok" />
                  </template>
                  <span v-else class="text-caption text-grey">—</span>
                </td>
                <td>
                  <v-chip size="x-small" :color="p.active !== false ? 'success' : 'grey'" variant="flat">
                    {{ p.active !== false ? 'Aktif' : 'Nonaktif' }}
                  </v-chip>
                </td>
                <td class="text-right">
                  <v-btn icon="mdi-pencil" size="x-small" variant="text" @click="openForm(p)" />
                  <v-btn icon="mdi-delete-outline" size="x-small" variant="text" color="error" @click="confirmDelete(p)" />
                </td>
              </tr>
            </tbody>
          </v-table>
          <empty-state v-else icon="mdi-package-variant-closed" title="Item tidak ditemukan" text="Tambah item baru atau ubah filter.">
            <template #action>
              <v-btn color="primary" variant="tonal" size="small" @click="openForm()">Tambah Item</v-btn>
            </template>
          </empty-state>
        </v-window-item>
      </v-window>
    </v-card>

    <product-dialog v-model="dialog" :item="editing" :categories="categories" @save="saveItem" />

    <v-dialog v-model="stockDialog" max-width="420">
      <v-card v-if="stockItem">
        <v-card-title class="py-4 px-5 text-h6 font-weight-bold">Penyesuaian Stok</v-card-title>
        <v-divider />
        <v-card-text class="px-5 py-4">
          <div class="text-body-2 mb-1">{{ stockItem.name }}</div>
          <div class="text-caption text-medium-emphasis mb-4">Stok saat ini: <b>{{ stockItem.stock }} {{ stockItem.unit }}</b></div>
          <v-radio-group v-model="mode" density="compact" hide-details class="mb-3">
            <v-radio label="Tambah stok (masuk)" value="in" color="success" />
            <v-radio label="Kurangi stok (keluar / rusak)" value="out" color="error" />
          </v-radio-group>
          <v-text-field v-model.number="qty" type="number" min="1" label="Jumlah" prepend-inner-icon="mdi-numeric" />
        </v-card-text>
        <v-divider />
        <v-card-actions class="px-5 py-3">
          <v-spacer />
          <v-btn variant="text" @click="stockDialog = false">Batal</v-btn>
          <v-btn color="primary" variant="elevated" :disabled="!qty || qty <= 0" @click="applyStock">Terapkan</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import StatCard from '@/components/StatCard.vue'
import ProductDialog from '@/components/ProductDialog.vue'
import EmptyState from '@/components/EmptyState.vue'
import { money } from '@/utils/format'

export default {
  name: 'CatalogView',
  components: { StatCard, ProductDialog, EmptyState },
  setup () {
    const store = useStore()
    const search = ref('')
    const category = ref(null)
    const tab = ref('all')
    const onlyLow = ref(false)
    const dialog = ref(false)
    const editing = ref(null)
    const stockDialog = ref(false)
    const stockItem = ref(null)
    const mode = ref('in')
    const qty = ref(1)


    const count = computed(() => store.getters['catalog/count'])
    const products = computed(() => store.getters['catalog/products'])
    const services = computed(() => store.getters['catalog/services'])
    const categories = computed(() => store.getters['catalog/categories'])
    const stockValue = computed(() => store.getters['catalog/stockValue'])
    const currency = computed(() => store.getters['settings/currency'])

    function filtered (type) {
      const list = store.getters['catalog/search']({
        q: search.value,
        type: type === 'all' ? '' : type,
        category: category.value || ''
      })
      const lowIds = store.getters['catalog/lowStock'].map(p => p.id)
      return onlyLow.value ? list.filter(p => lowIds.includes(p.id)) : list
    }

    function openForm (item = null) { editing.value = item; dialog.value = true }
    function saveItem (data) {
      if (editing.value) {
        store.commit('catalog/UPDATE', { id: editing.value.id, data })
        store.dispatch('ui/notify', 'Item katalog diperbarui.')
      } else {
        store.commit('catalog/ADD', data)
        store.dispatch('ui/notify', 'Item katalog ditambahkan.')
      }
    }
    function confirmDelete (p) {
      if (window.confirm(`Hapus item "${p.name}" dari katalog?`)) {
        store.commit('catalog/REMOVE', p.id)
        store.dispatch('ui/notify', { text: 'Item dihapus.', color: 'error' })
      }
    }
    function openStock (p) { stockItem.value = p; mode.value = 'in'; qty.value = 1; stockDialog.value = true }
    function applyStock () {
      const delta = mode.value === 'in' ? Math.abs(qty.value) : -Math.abs(qty.value)
      store.commit('catalog/ADJUST_STOCK', { id: stockItem.value.id, delta })
      stockDialog.value = false
      store.dispatch('ui/notify', 'Stok disesuaikan.')
    }
    const margin = p => {
      if (!p.price) return 0
      return Math.round(((p.price - (p.cost || 0)) / p.price) * 100)
    }
    const stockColor = p => {
      const th = store.getters['settings/business'].lowStockThreshold || 5
      if (p.stock <= 0) return 'error'
      if (p.stock <= th) return 'warning'
      return 'success'
    }

    return {
      search, category, tab, onlyLow, dialog, editing, stockDialog, stockItem, mode, qty,
      count, products, services, categories, stockValue, currency, filtered,
      openForm, saveItem, confirmDelete, openStock, applyStock, margin, stockColor, money
    }
  }
}
</script>
