<template>
  <div>
    <div class="d-flex flex-wrap justify-space-between align-center mb-4 ga-3">
      <div class="text-body-2 text-grey">Database mitra/pelanggan project: kontak, project yang dipesan, nilai kontrak, dan status.</div>
      <v-btn color="primary" variant="elevated" prepend-icon="mdi-plus" @click="openForm()">Tambah Mitra</v-btn>
    </div>

    <v-row dense class="mb-2">
      <v-col cols="6" md="3"><stat-card label="Total Mitra" :value="list.length" icon="mdi-handshake" color="primary" /></v-col>
      <v-col cols="6" md="3"><stat-card label="Mitra Aktif" :value="list.filter(m => m.status === 'active').length" icon="mdi-check-circle" color="success" /></v-col>
      <v-col cols="6" md="3"><stat-card label="Total Nilai Kontrak" :value="grand.total" format :currency="currency" icon="mdi-file-signature" color="secondary" /></v-col>
      <v-col cols="6" md="3"><stat-card label="Tagihan Belum Lunas" :value="grand.remaining" format :currency="currency" icon="mdi-cash-remove" color="warning" /></v-col>
    </v-row>

    <v-card border>
      <v-card-text class="py-3">
        <div class="d-flex flex-wrap gap-2">
          <v-text-field v-model="search" placeholder="Cari nama, perusahaan, kontak…" prepend-inner-icon="mdi-magnify" style="max-width:340px" clearable />
          <v-select v-model="filterStatus" :items="mitraStatus" label="Status" style="max-width:180px" clearable />
        </div>
      </v-card-text>
      <v-divider />

      <v-table v-if="filtered.length" density="compact">
        <thead>
          <tr>
            <th class="text-caption">Mitra / Perusahaan</th>
            <th class="text-caption">Kontak</th>
            <th class="text-caption">Project Dipesan</th>
            <th class="text-caption text-right">Nilai</th>
            <th class="text-caption">Status</th>
            <th class="text-caption text-right">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="m in filtered" :key="m.id">
            <td>
              <div class="d-flex align-center" style="cursor:pointer" @click="openDetail(m)">
                <v-avatar :color="m.type === 'business' ? 'primary' : 'secondary'" size="32" variant="tonal" class="mr-3">
                  <v-icon :icon="m.type === 'business' ? 'mdi-office-building' : 'mdi-account'" size="18" />
                </v-avatar>
                <div>
                  <div class="text-body-2 font-weight-medium">{{ m.name }}</div>
                  <div class="text-caption text-medium-emphasis">{{ m.company || (m.type === 'business' ? 'Badan usaha' : 'Perorangan') }}</div>
                </div>
              </div>
            </td>
            <td>
              <div class="text-body-2">{{ m.phone || '—' }}</div>
              <div class="text-caption text-medium-emphasis">{{ m.email || '—' }}</div>
            </td>
            <td>
              <template v-if="projectsOf(m.id).length">
                <div v-for="p in projectsOf(m.id).slice(0, 3)" :key="p.id" class="text-body-2 d-flex align-center">
                  <v-icon icon="mdi-folder-outline" size="14" class="mr-1 text-grey" />
                  <span class="text-truncate" style="max-width:220px">{{ p.name }}</span>
                  <v-chip size="x-small" :color="statusColor(p.status)" class="ml-2" variant="tonal">{{ p.code }}</v-chip>
                </div>
                <div v-if="projectsOf(m.id).length > 3" class="text-caption text-grey">+{{ projectsOf(m.id).length - 3 }} project lain</div>
              </template>
              <span v-else class="text-caption text-grey">Belum ada project</span>
            </td>
            <td class="text-right text-body-2 font-weight-medium">{{ money(contractValue(m.id), currency) }}</td>
            <td><v-chip size="x-small" :color="mitraColor(m.status)" variant="flat">{{ mitraLabel(m.status) }}</v-chip></td>
            <td class="text-right">
              <v-btn icon="mdi-eye" size="x-small" variant="text" @click="openDetail(m)" />
              <v-btn icon="mdi-pencil" size="x-small" variant="text" @click="openForm(m)" />
              <v-btn icon="mdi-delete-outline" size="x-small" variant="text" color="error" @click="remove(m)" />
            </td>
          </tr>
        </tbody>
      </v-table>
      <empty-state v-else icon="mdi-handshake-outline" title="Belum ada mitra" text="Tambahkan mitra/ pelanggan project pertama Anda.">
        <template #action>
          <v-btn color="primary" variant="tonal" size="small" @click="openForm()">Tambah Mitra</v-btn>
        </template>
      </empty-state>
    </v-card>

    <v-dialog v-model="dialog" max-width="680" persistent>
      <v-card>
        <v-card-title class="text-h6 font-weight-bold py-4 px-5">{{ editing ? 'Edit Mitra' : 'Tambah Mitra' }}</v-card-title>
        <v-divider />
        <v-card-text class="px-5 py-4">
          <v-row dense>
            <v-col cols="12" sm="7"><v-text-field v-model="form.name" label="Nama *" :rules="[req]" prepend-inner-icon="mdi-account-outline" /></v-col>
            <v-col cols="12" sm="5">
              <v-select v-model="form.type" :items="CUSTOMER_TYPES" label="Jenis" prepend-inner-icon="mdi-domain" />
            </v-col>
            <v-col cols="12" sm="6"><v-text-field v-model="form.company" label="Nama perusahaan/instansi" prepend-inner-icon="mdi-office-building-outline" /></v-col>
            <v-col cols="12" sm="6"><v-text-field v-model="form.phone" label="Telepon / WhatsApp *" :rules="[req]" prepend-inner-icon="mdi-phone-outline" /></v-col>
            <v-col cols="12" sm="6"><v-text-field v-model="form.email" type="email" label="Email" prepend-inner-icon="mdi-email-outline" /></v-col>
            <v-col cols="12" sm="6"><v-text-field v-model="form.address" label="Alamat" prepend-inner-icon="mdi-map-marker-outline" /></v-col>
            <v-col cols="12" sm="6">
              <v-select v-model="form.status" :items="mitraStatus" label="Status" prepend-inner-icon="mdi-progress-clock" />
            </v-col>
            <v-col cols="12"><v-textarea v-model="form.notes" label="Catatan" rows="2" /></v-col>
          </v-row>
        </v-card-text>
        <v-divider />
        <v-card-actions class="px-5 py-3">
          <v-spacer />
          <v-btn variant="text" @click="dialog = false">Batal</v-btn>
          <v-btn color="primary" variant="elevated" @click="save">Simpan</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="detail" max-width="760" scrollable>
      <v-card v-if="selected">
        <v-card-title class="d-flex align-center justify-space-between py-4 px-5">
          <div class="d-flex align-center ga-3">
            <v-avatar :color="selected.type === 'business' ? 'primary' : 'secondary'" size="42" variant="tonal">
              <v-icon :icon="selected.type === 'business' ? 'mdi-office-building' : 'mdi-account'" />
            </v-avatar>
            <div>
              <div class="text-h6 font-weight-bold">{{ selected.name }}</div>
              <div class="text-caption text-medium-emphasis">{{ selected.company || 'Perorangan' }}</div>
            </div>
          </div>
          <v-btn icon="mdi-close" variant="text" size="small" @click="detail = false" />
        </v-card-title>
        <v-divider />
        <v-card-text style="max-height:64vh">
          <v-list density="compact">
            <v-list-item prepend-icon="mdi-phone-outline" :title="selected.phone || '—'" />
            <v-list-item prepend-icon="mdi-email-outline" :title="selected.email || '—'" />
            <v-list-item prepend-icon="mdi-map-marker-outline" :title="selected.address || '—'" />
            <v-list-item v-if="selected.notes" prepend-icon="mdi-note-text-outline" :title="selected.notes" />
          </v-list>

          <div class="text-subtitle-2 font-weight-bold mt-4 mb-1">Project yang dipesan ({{ mitraProjects.length }})</div>
          <v-table v-if="mitraProjects.length" density="compact">
            <thead>
              <tr><th class="text-caption">Kode</th><th class="text-caption">Nama</th><th class="text-caption">Status</th><th class="text-caption text-right">Total</th><th class="text-caption text-right">Sisa</th><th class="text-caption text-right">Aksi</th></tr>
            </thead>
            <tbody>
              <tr v-for="p in mitraProjects" :key="p.id">
                <td class="text-caption font-weight-bold text-primary">{{ p.code }}</td>
                <td class="text-body-2">{{ p.name }}</td>
                <td><v-chip size="x-small" :color="statusColor(p.status)" variant="tonal">{{ statusLabel(p.status) }}</v-chip></td>
                <td class="text-right text-body-2">{{ money(pTotals(p).total, currency) }}</td>
                <td class="text-right text-caption" :class="pTotals(p).remaining ? 'text-warning' : 'text-success'">{{ money(pTotals(p).remaining, currency) }}</td>
                <td class="text-right">
                  <v-btn icon="mdi-invoice-text-outline" size="x-small" variant="text" title="Cetak Invoice" @click="printInvoice(p, selected, business, currency)" />
                  <v-btn icon="mdi-cash-check" size="x-small" variant="text" title="Kwitansi terakhir" @click="printLastKw(p, selected)" />
                </td>
              </tr>
            </tbody>
          </v-table>
          <div v-else class="text-body-2 text-grey text-center py-4">Belum ada project dari mitra ini.</div>
        </v-card-text>
        <v-divider />
        <v-card-actions class="px-5 py-3">
          <v-btn variant="text" @click="openForm(selected); detail = false">Edit</v-btn>
          <v-spacer />
          <v-btn color="primary" variant="elevated" prepend-icon="mdi-folder-plus-outline" @click="newProject">Buat Project</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { ref, computed, reactive } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import StatCard from '@/components/StatCard.vue'
import EmptyState from '@/components/EmptyState.vue'
import { CUSTOMER_TYPES, optionLabel, optionColor } from '@/utils/options'
import { PROJECT_STATUS } from '@/utils/projectPresets'
import { money } from '@/utils/format'
import { printInvoice, printKwitansi } from '@/utils/printProject'
import { totals } from '@/store/modules/projects'

export default {
  name: 'MitrasView',
  components: { StatCard, EmptyState },
  setup () {
    const store = useStore()
    const router = useRouter()
    const search = ref('')
    const filterStatus = ref(null)
    const dialog = ref(false)
    const editing = ref(null)
    const detail = ref(false)
    const selected = ref(null)
    const req = v => !!(v && String(v).trim()) || 'Wajib diisi'
    const form = reactive({ name: '', type: 'business', company: '', phone: '', email: '', address: '', status: 'prospect', notes: '' })

    const mitraStatus = [
      { title: 'Prospect', value: 'prospect' },
      { title: 'Aktif', value: 'active' },
      { title: 'Nonaktif', value: 'inactive' }
    ]

    const list = computed(() => store.getters['mitras/list'])
    const currency = computed(() => store.getters['settings/currency'])
    const business = computed(() => store.getters['settings/business'])
    const grand = computed(() => store.getters['projects/grand'])

    const filtered = computed(() => {
      let l = store.getters['mitras/search'](search.value)
      if (filterStatus.value) l = l.filter(m => m.status === filterStatus.value)
      return l
    })

    const mitraProjects = computed(() => selected.value ? store.getters['projects/byMitra'](selected.value.id) : [])
    const projectsOf = id => store.getters['projects/byMitra'](id)
    const contractValue = id => projectsOf(id).reduce((s, p) => s + totals(p).total, 0)
    const pTotals = p => totals(p)

    function openForm (m = null) {
      editing.value = m
      Object.assign(form, m ? { ...m } : { name: '', type: 'business', company: '', phone: '', email: '', address: '', status: 'prospect', notes: '' })
      dialog.value = true
    }
    function save () {
      if (!req(form.name) || !req(form.phone)) return
      const data = { name: form.name.trim(), type: form.type, company: form.company.trim(), phone: form.phone.trim(), email: form.email.trim(), address: form.address.trim(), status: form.status, notes: form.notes.trim() }
      if (editing.value) {
        store.commit('mitras/UPDATE', { id: editing.value.id, data })
        store.dispatch('ui/notify', 'Mitra diperbarui.')
      } else {
        store.commit('mitras/ADD', data)
        store.dispatch('ui/notify', 'Mitra ditambahkan.')
      }
      dialog.value = false
    }
    function remove (m) {
      if (window.confirm(`Hapus mitra "${m.name}"? Project terkait tetap tersimpan tanpa mitra.`)) {
        store.commit('mitras/REMOVE', m.id)
        store.dispatch('ui/notify', { text: 'Mitra dihapus.', color: 'error' })
      }
    }
    function openDetail (m) { selected.value = m; detail.value = true }
    function newProject () {
      detail.value = false
      router.push({ path: '/projects', query: { new: '1', mitra: selected.value.id } })
    }
    function printLastKw (p, m) {
      const pays = (p.payments || [])
      if (!pays.length) {
        store.dispatch('ui/notify', { text: 'Belum ada pembayaran pada project ini.', color: 'warning' })
        return
      }
      printKwitansi(p, pays[pays.length - 1], m, business.value, currency.value)
    }

    const mitraLabel = v => { const f = mitraStatus.find(s => s.value === v); return f ? f.title : v }
    const mitraColor = v => ({ prospect: 'info', active: 'success', inactive: 'grey' }[v] || 'grey')
    const statusLabel = v => optionLabel(PROJECT_STATUS, v)
    const statusColor = v => optionColor(PROJECT_STATUS, v)

    return {
      search, filterStatus, dialog, editing, detail, selected, form, req, mitraStatus,
      list, currency, business, grand, filtered, mitraProjects, projectsOf, contractValue, pTotals,
      openForm, save, remove, openDetail, newProject, printLastKw,
      mitraLabel, mitraColor, statusLabel, statusColor, money, printInvoice
    }
  }
}
</script>
