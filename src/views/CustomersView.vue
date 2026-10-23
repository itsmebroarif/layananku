<template>
  <div>
    <div class="d-flex flex-wrap justify-space-between align-center mb-4 ga-3">
      <div>
        <div class="text-body-2 text-grey">Database pelanggan untuk segala jenis badan usaha maupun perorangan.</div>
      </div>
      <v-btn color="primary" variant="elevated" prepend-icon="mdi-account-plus" @click="openForm()">Tambah Pelanggan</v-btn>
    </div>

    <v-card border>
      <v-card-text class="py-3">
        <div class="d-flex flex-wrap gap-2">
          <v-text-field
            v-model="search"
            placeholder="Cari nama, usaha, email, telepon…"
            prepend-inner-icon="mdi-magnify"
            style="max-width:340px"
            clearable
          />
          <v-select v-model="filterStatus" :items="statusFilter" label="Status" style="max-width:180px" clearable />
          <v-select v-model="filterCategory" :items="categories" label="Kategori" style="max-width:190px" clearable />
          <v-spacer />
          <v-btn variant="tonal" color="secondary" prepend-icon="mdi-file-excel-outline" @click="exportCsv">Ekspor CSV</v-btn>
        </div>
      </v-card-text>

      <v-divider />

      <v-table v-if="filtered.length" density="compact">
        <thead>
          <tr>
            <th class="text-caption">Pelanggan</th>
            <th class="text-caption">Kontak</th>
            <th class="text-caption">Kategori</th>
            <th class="text-caption">Status</th>
            <th class="text-caption">Tiket</th>
            <th class="text-caption text-right">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in filtered" :key="c.id">
            <td>
              <div class="d-flex align-center py-1" style="cursor:pointer" @click="openDetail(c)">
                <v-avatar :color="c.type === 'business' ? 'primary' : 'secondary'" size="32" class="mr-3" variant="tonal">
                  <v-icon :icon="c.type === 'business' ? 'mdi-office-building' : 'mdi-account'" size="18" />
                </v-avatar>
                <div>
                  <div class="text-body-2 font-weight-medium">{{ c.name }}</div>
                  <div class="text-caption text-medium-emphasis">{{ c.company || (c.type === 'business' ? 'Badan usaha' : 'Perorangan') }}</div>
                </div>
              </div>
            </td>
            <td>
              <div class="text-body-2">{{ c.phone || '—' }}</div>
              <div class="text-caption text-medium-emphasis">{{ c.email || '—' }}</div>
            </td>
            <td><v-chip size="x-small" variant="tonal" color="info">{{ c.category }}</v-chip></td>
            <td><v-chip size="x-small" :color="statusColor(c.status)" variant="flat">{{ statusLabel(c.status) }}</v-chip></td>
            <td class="text-body-2">{{ ticketCount(c.id) }}</td>
            <td class="text-right">
              <v-btn icon="mdi-eye" size="x-small" variant="text" @click="openDetail(c)" />
              <v-btn icon="mdi-pencil" size="x-small" variant="text" @click="openForm(c)" />
              <v-btn icon="mdi-delete-outline" size="x-small" variant="text" color="error" @click="confirmDelete(c)" />
            </td>
          </tr>
        </tbody>
      </v-table>

      <empty-state
        v-else
        icon="mdi-account-group-outline"
        title="Belum ada pelanggan yang cocok"
        text="Tambahkan pelanggan baru atau ubah kata kunci pencarian."
      >
        <template #action>
          <v-btn color="primary" variant="tonal" size="small" @click="openForm()">Tambah Pelanggan</v-btn>
        </template>
      </empty-state>
    </v-card>

    <customer-dialog v-model="dialog" :customer="editing" @save="saveCustomer" />

    <v-dialog v-model="detail" max-width="760">
      <v-card v-if="selected">
        <v-card-title class="d-flex align-center justify-space-between py-4 px-5">
          <div class="d-flex align-center gap-3">
            <v-avatar :color="selected.type === 'business' ? 'primary' : 'secondary'" size="42" variant="tonal">
              <v-icon :icon="selected.type === 'business' ? 'mdi-office-building' : 'mdi-account'" />
            </v-avatar>
            <div>
              <div class="text-h6 font-weight-bold">{{ selected.name }}</div>
              <div class="text-caption text-medium-emphasis">{{ selected.company || 'Perorangan' }} · {{ selected.category }}</div>
            </div>
          </div>
          <v-btn icon="mdi-close" variant="text" size="small" @click="detail = false" />
        </v-card-title>
        <v-divider />
        <v-tabs v-model="tab" color="primary" density="compact">
          <v-tab value="info">Info</v-tab>
          <v-tab value="tickets">Tiket ({{ customerTickets.length }})</v-tab>
          <v-tab value="orders">Transaksi ({{ customerTransactions.length }})</v-tab>
        </v-tabs>
        <v-divider />
        <v-card-text class="py-4">
          <v-window v-model="tab">
            <v-window-item value="info">
              <v-list density="compact">
                <v-list-item prepend-icon="mdi-email-outline" :title="selected.email || '—'" />
                <v-list-item prepend-icon="mdi-phone-outline" :title="selected.phone || '—'" />
                <v-list-item prepend-icon="mdi-map-marker-outline" :title="selected.address || '—'" />
                <v-list-item prepend-icon="mdi-calendar-check-outline" :title="'Terdaftar ' + dateShort(selected.createdAt)" />
                <v-list-item v-if="selected.notes" prepend-icon="mdi-note-text-outline" :title="selected.notes" />
              </v-list>
            </v-window-item>
            <v-window-item value="tickets">
              <v-list v-if="customerTickets.length" density="compact">
                <v-list-item
                  v-for="t in customerTickets"
                  :key="t.id"
                  :title="`${t.code} — ${t.subject}`"
                  :subtitle="statusLabel(t.status) + ' · ' + dateShort(t.createdAt)"
                >
                  <template #append>
                    <v-chip size="x-small" :color="statusColor(t.status)" variant="tonal">{{ statusLabel(t.status) }}</v-chip>
                  </template>
                </v-list-item>
              </v-list>
              <div v-else class="text-body-2 text-grey text-center py-6">Belum ada tiket dari pelanggan ini.</div>
            </v-window-item>
            <v-window-item value="orders">
              <v-list v-if="customerTransactions.length" density="compact">
                <v-list-item
                  v-for="t in customerTransactions"
                  :key="t.id"
                  :title="`${t.invoice} — ${money(t.total, currency)}`"
                  :subtitle="dateShort(t.createdAt) + ' · ' + paymentLabel(t.paymentMethod)"
                />
              </v-list>
              <div v-else class="text-body-2 text-grey text-center py-6">Belum ada transaksi POS.</div>
            </v-window-item>
          </v-window>
        </v-card-text>
        <v-divider />
        <v-card-actions class="px-5 py-3">
          <v-btn
            v-if="selected.phone"
            variant="tonal"
            color="success"
            size="small"
            prepend-icon="mdi-whatsapp"
            :href="waLink(selected.phone)"
            target="_blank"
          >
            WhatsApp
          </v-btn>
          <v-btn
            v-if="selected.email"
            variant="tonal"
            size="small"
            prepend-icon="mdi-email-outline"
            :href="`mailto:${selected.email}`"
          >
            Email
          </v-btn>
          <v-spacer />
          <v-btn variant="text" @click="openForm(selected); detail = false">Edit</v-btn>
          <v-btn color="primary" variant="elevated" @click="newTicketForSelected">Buat Tiket</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useStore } from 'vuex'
import { useRouter, useRoute } from 'vue-router'
import CustomerDialog from '@/components/CustomerDialog.vue'
import EmptyState from '@/components/EmptyState.vue'
import { CUSTOMER_STATUS, PAYMENT_METHODS, optionLabel, optionColor } from '@/utils/options'
import { money, dateShort } from '@/utils/format'

export default {
  name: 'CustomersView',
  components: { CustomerDialog, EmptyState },
  setup () {
    const store = useStore()
    const router = useRouter()
    const route = useRoute()

    const search = ref('')
    const filterStatus = ref(null)
    const filterCategory = ref(null)
    const dialog = ref(false)
    const editing = ref(null)
    const detail = ref(false)
    const selected = ref(null)
    const tab = ref('info')


    const customers = computed(() => store.getters['customers/list'])
    const categories = computed(() => store.getters['customers/list'].map(c => c.category).filter(Boolean).filter((v, i, a) => a.indexOf(v) === i))
    const statusFilter = CUSTOMER_STATUS.map(s => ({ title: s.title, value: s.value }))
    const currency = computed(() => store.getters['settings/currency'])

    const filtered = computed(() => store.getters['customers/search'](search.value)
      .filter(c => !filterStatus.value || c.status === filterStatus.value)
      .filter(c => !filterCategory.value || c.category === filterCategory.value))

    const customerTickets = computed(() => selected.value ? store.getters['tickets/byCustomer'](selected.value.id) : [])
    const customerTransactions = computed(() => selected.value
      ? store.getters['transactions/list'].filter(t => t.customerId === selected.value.id)
      : [])

    watch(() => route.query.new, v => { if (v) openForm() })

    function openForm (customer = null) {
      editing.value = customer
      dialog.value = true
    }
    function saveCustomer (data) {
      if (editing.value) {
        store.commit('customers/UPDATE', { id: editing.value.id, data })
        store.dispatch('ui/notify', 'Pelanggan diperbarui.')
      } else {
        store.commit('customers/ADD', data)
        store.dispatch('ui/notify', 'Pelanggan berhasil ditambahkan.')
      }
    }
    function confirmDelete (c) {
      const count = store.getters['tickets/byCustomer'](c.id).length
      if (window.confirm(`Hapus pelanggan "${c.name}"?${count ? ` ${count} tiket terkait akan tetap tersimpan tanpa pelanggan.` : ''}`)) {
        store.commit('customers/REMOVE', c.id)
        store.dispatch('ui/notify', { text: 'Pelanggan dihapus.', color: 'error' })
      }
    }
    function openDetail (c) { selected.value = c; tab.value = 'info'; detail.value = true }
    function newTicketForSelected () {
      detail.value = false
      router.push({ path: '/tickets', query: { new: '1', customer: selected.value.id } })
    }
    function ticketCount (id) { return store.getters['tickets/byCustomer'](id).length }
    function waLink (phone) {
      const digits = String(phone).replace(/\D/g, '')
      const intl = digits.startsWith('0') ? '62' + digits.slice(1) : digits
      return `https://wa.me/${intl}`
    }
    function exportCsv () {
      const rows = [['Nama', 'Usaha', 'Jenis', 'Kategori', 'Email', 'Telepon', 'Alamat', 'Status']]
      filtered.value.forEach(c => rows.push([c.name, c.company || '', c.type, c.category, c.email || '', c.phone || '', c.address || '', c.status]))
      const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
      const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `pelanggan-${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(a.href)
      store.dispatch('ui/notify', 'Data pelanggan diekspor ke CSV.')
    }

    const statusLabel = v => optionLabel(CUSTOMER_STATUS, v)
    const statusColor = v => optionColor(CUSTOMER_STATUS, v)
    const paymentLabel = v => optionLabel(PAYMENT_METHODS, v)

    return {
      search, filterStatus, filterCategory, dialog, editing, detail, selected, tab,
      customers, categories, statusFilter, filtered, currency, customerTickets, customerTransactions,
      openForm, saveCustomer, confirmDelete, openDetail, newTicketForSelected, ticketCount, exportCsv, waLink,
      statusLabel, statusColor, paymentLabel, money, dateShort
    }
  }
}
</script>
