<template>
  <div>
    <div class="d-flex flex-wrap justify-space-between align-center mb-4 ga-3">
      <div class="text-body-2 text-grey">Kelola project: jenis layanan, kategori &amp; harga fitur, hosting/domain, tagihan, invoice &amp; kwitansi.</div>
      <v-btn color="primary" variant="elevated" prepend-icon="mdi-plus" @click="openForm()">Tambah Project</v-btn>
    </div>

    <v-row dense class="mb-2">
      <v-col cols="6" md="3"><stat-card label="Total Project" :value="count" icon="mdi-folder-table" color="primary" /></v-col>
      <v-col cols="6" md="3"><stat-card label="Total Kontrak" :value="grand.total" format :currency="currency" icon="mdi-file-signature" color="secondary" /></v-col>
      <v-col cols="6" md="3"><stat-card label="Sudah Terbayar" :value="grand.paid" format :currency="currency" icon="mdi-cash-check" color="success" /></v-col>
      <v-col cols="6" md="3"><stat-card label="Sisa Tagihan" :value="grand.remaining" format :currency="currency" icon="mdi-cash-remove" color="warning" /></v-col>
    </v-row>

    <v-card border>
      <v-card-text class="py-3">
        <div class="d-flex flex-wrap gap-2">
          <v-text-field v-model="search" placeholder="Cari kode/judul project, mitra…" prepend-inner-icon="mdi-magnify" style="max-width:320px" clearable />
          <v-select v-model="filterType" :items="typeOptions" label="Jenis" style="max-width:250px" clearable />
          <v-select v-model="filterStatus" :items="statusOptions" label="Status" style="max-width:220px" clearable />
        </div>
      </v-card-text>
      <v-divider />

      <v-table v-if="filtered.length" density="compact">
        <thead>
          <tr>
            <th class="text-caption">Kode</th>
            <th class="text-caption">Project</th>
            <th class="text-caption">Mitra</th>
            <th class="text-caption">PJ</th>
            <th class="text-caption text-right">Nilai</th>
            <th class="text-caption">Pembayaran</th>
            <th class="text-caption">Status</th>
            <th class="text-caption text-right">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in filtered" :key="p.id">
            <td class="text-caption font-weight-bold text-primary" style="cursor:pointer" @click="openDetail(p)">{{ p.code }}</td>
            <td>
              <div class="text-body-2 font-weight-medium" style="cursor:pointer" @click="openDetail(p)">{{ p.name }}</div>
              <div class="text-caption text-medium-emphasis">{{ typeLabel(p.type) }} · {{ p.features ? p.features.length : 0 }} fitur</div>
            </td>
            <td class="text-body-2">{{ mitraName(p.mitraId) }}</td>
            <td class="text-body-2">{{ p.staffName || '—' }}</td>
            <td class="text-right text-body-2 font-weight-medium">{{ money(pTotals(p).total, currency) }}</td>
            <td>
              <v-chip v-if="pTotals(p).fullyPaid" size="x-small" color="success" variant="flat">Lunas</v-chip>
              <template v-else>
                <v-chip size="x-small" color="warning" variant="tonal">{{ money(pTotals(p).remaining, currency) }}</v-chip>
                <div class="text-caption text-grey">bayar {{ money(pTotals(p).paid, currency) }}</div>
              </template>
            </td>
            <td><v-chip size="x-small" :color="statusColor(p.status)" variant="flat">{{ statusLabel(p.status) }}</v-chip></td>
            <td class="text-right">
              <v-btn icon="mdi-invoice-text-outline" size="x-small" variant="text" title="Cetak Invoice/Nota" @click="openPrint(p)" />
              <v-btn icon="mdi-pencil" size="x-small" variant="text" @click="openForm(p)" />
              <v-btn icon="mdi-delete-outline" size="x-small" variant="text" color="error" @click="remove(p)" />
            </td>
          </tr>
        </tbody>
      </v-table>
      <empty-state v-else icon="mdi-folder-plus-outline" title="Belum ada project" text="Tambahkan project beserta kategori fitur & harganya.">
        <template #action>
          <v-btn color="primary" variant="tonal" size="small" @click="openForm()">Tambah Project</v-btn>
        </template>
      </empty-state>
    </v-card>

    <project-dialog v-model="dialog" :project="editing" :preset-mitra-id="presetMitra" @save="saveProject" />

    <v-dialog v-model="detail" max-width="860" scrollable>
      <v-card v-if="selected">
        <v-card-title class="d-flex align-center justify-space-between py-4 px-5">
          <div>
            <div class="d-flex align-center ga-2">
              <span class="text-h6 font-weight-bold">{{ selected.name }}</span>
              <v-chip size="small" color="primary" variant="tonal">{{ selected.code }}</v-chip>
              <v-chip size="small" :color="statusColor(selected.status)" variant="flat">{{ statusLabel(selected.status) }}</v-chip>
            </div>
            <div class="text-caption text-medium-emphasis mt-1">
              {{ typeLabel(selected.type) }} · Mitra: {{ mitraName(selected.mitraId) }} · PJ: {{ selected.staffName || '—' }}
            </div>
          </div>
          <v-btn icon="mdi-close" variant="text" size="small" @click="detail = false" />
        </v-card-title>
        <v-divider />
        <v-card-text class="px-5 py-4" style="max-height:66vh">
          <div v-if="selected.description" class="text-body-2 mb-4" style="white-space:pre-wrap">{{ selected.description }}</div>

          <div class="text-subtitle-2 font-weight-bold mb-2">Rincian Fitur ({{ featSum }})</div>
          <div v-for="cat in featureCategories" :key="cat" class="mb-3">
            <div class="text-caption font-weight-bold text-medium-emphasis">{{ cat }}</div>
            <v-table v-if="catItems(selected, cat).length" density="compact" class="mb-1">
              <tbody>
                <tr v-for="f in catItems(selected, cat)" :key="f.name + f.price">
                  <td class="text-body-2">{{ f.name }}<span v-if="f.qty > 1" class="text-caption"> ×{{ f.qty }}</span></td>
                  <td class="text-right text-body-2" style="width:150px">{{ money((f.price || 0) * (f.qty || 1), currency) }}</td>
                </tr>
              </tbody>
            </v-table>
          </div>
          <div v-if="!featSum" class="text-body-2 text-grey mb-3">Tidak ada rincian fitur.</div>

          <div class="text-subtitle-2 font-weight-bold mt-3 mb-1">Penanggung Hosting &amp; Domain</div>
          <div v-if="selected.hostedBy === 'kita' && selected.hosting" class="text-body-2">
            Provider <b>{{ selected.hosting.provider || '—' }}</b> · {{ selected.hosting.spec || '—' }} · Domain: {{ selected.hosting.domain || '—' }} ·
            Harga: <b>{{ money(selected.hosting.price, currency) }}/tahun</b>
          </div>
          <div v-else class="text-body-2 text-grey">{{ hostedLabel(selected.hostedBy) }}</div>

          <v-divider class="my-3" />
          <div class="text-body-2">
            <div class="d-flex justify-space-between"><span class="text-medium-emphasis">Subtotal fitur + layanan</span><span>{{ money(t.subtotal, currency) }}</span></div>
            <div v-if="t.discount" class="d-flex justify-space-between"><span class="text-medium-emphasis">Diskon</span><span class="text-error">-{{ money(t.discount, currency) }}</span></div>
            <div v-if="Number(selected.taxPercent)" class="d-flex justify-space-between"><span class="text-medium-emphasis">Pajak ({{ selected.taxPercent }}%)</span><span>{{ money(t.tax, currency) }}</span></div>
            <div class="d-flex justify-space-between text-h6 mt-1"><b>TOTAL</b><b class="text-primary">{{ money(t.total, currency) }}</b></div>
            <div class="d-flex justify-space-between text-body-2"><span>Sudah dibayar</span><span>{{ money(t.paid, currency) }}</span></div>
            <div class="d-flex justify-space-between text-body-2 font-weight-bold"><span>Sisa</span><span :class="t.remaining ? 'text-warning' : 'text-success'">{{ money(t.remaining, currency) }}</span></div>
          </div>

          <v-divider class="my-3" />
          <div class="d-flex align-center justify-space-between mb-2">
            <div class="text-subtitle-2 font-weight-bold">Pembayaran ({{ (selected.payments || []).length }})</div>
            <v-btn size="x-small" color="success" variant="tonal" prepend-icon="mdi-cash-plus" @click="payDialog = true">
              Terima Pembayaran
            </v-btn>
          </div>
          <v-table v-if="(selected.payments || []).length" density="compact">
            <thead><tr><th class="text-caption">Tanggal</th><th class="text-caption">Metode</th><th class="text-caption text-right">Jumlah</th><th class="text-caption text-right">Cetak</th></tr></thead>
            <tbody>
              <tr v-for="pay in selected.payments" :key="pay.id">
                <td class="text-body-2">{{ pay.date }}</td>
                <td class="text-body-2">{{ pay.method || '—' }}<span v-if="pay.note" class="text-caption"> · {{ pay.note }}</span></td>
                <td class="text-right text-body-2 font-weight-medium">{{ money(pay.amount, currency) }}</td>
                <td class="text-right">
                  <v-btn icon="mdi-certificate-outline" size="x-small" variant="text" title="Cetak Kwitansi" @click="printKw(selected, pay)" />
                  <v-btn icon="mdi-delete-outline" size="x-small" variant="text" color="error" @click="removePay(selected, pay)" />
                </td>
              </tr>
            </tbody>
          </v-table>
          <div v-else class="text-caption text-grey">Belum ada pembayaran tercatat.</div>
        </v-card-text>
        <v-divider />
        <v-card-actions class="px-5 py-3">
          <v-btn variant="text" @click="openForm(selected); detail = false">Edit</v-btn>
          <v-btn variant="tonal" color="secondary" prepend-icon="mdi-invoice-text-check-outline" @click="printInvoice(selected, mitraOf(selected), business, currency)">
            Invoice
          </v-btn>
          <v-btn variant="tonal" color="accent" prepend-icon="mdi-receipt-text-check-outline" @click="printNota(selected, mitraOf(selected), business, currency)">
            Nota
          </v-btn>
          <v-spacer />
          <v-btn color="primary" variant="elevated" prepend-icon="mdi-cash-plus" @click="payDialog = true">Terima Pembayaran</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="printDialog" max-width="380">
      <v-card>
        <v-card-title class="text-h6 font-weight-bold py-4 px-5">Cetak Dokumen</v-card-title>
        <v-divider />
        <v-card-text class="px-5 py-3">
          <v-btn block variant="tonal" color="primary" size="large" prepend-icon="mdi-invoice-text" class="mb-2" @click="printInvoice(selected, mitraOf(selected), business, currency); printDialog = false">
            Invoice
          </v-btn>
          <v-btn block variant="tonal" color="secondary" size="large" prepend-icon="mdi-receipt-text" class="mb-2" @click="printNota(selected, mitraOf(selected), business, currency); printDialog = false">
            Nota
          </v-btn>
          <v-btn block variant="tonal" color="success" size="large" prepend-icon="mdi-certificate" :disabled="!(selected.payments || []).length" @click="printLastKw(selected)">
            Kwitansi (pembayaran terakhir)
          </v-btn>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="payDialog" max-width="480" persistent>
      <v-card>
        <v-card-title class="text-h6 font-weight-bold py-4 px-5">Terima Pembayaran — {{ selected && selected.code }}</v-card-title>
        <v-divider />
        <v-card-text class="px-5 py-4">
          <v-row dense>
            <v-col cols="12" sm="6"><v-text-field v-model="payForm.date" type="date" label="Tanggal *" prepend-inner-icon="mdi-calendar" /></v-col>
            <v-col cols="12" sm="6"><v-text-field v-model.number="payForm.amount" type="number" min="1" label="Jumlah *" prefix="Rp" prepend-inner-icon="mdi-cash" /></v-col>
            <v-col cols="12" sm="6">
              <v-select v-model="payForm.method" :items="['Tunai', 'Transfer Bank', 'QRIS', 'E-Wallet', 'Kartu']" label="Metode" prepend-inner-icon="mdi-credit-card-outline" />
            </v-col>
            <v-col cols="12" sm="6"><v-text-field v-model="payForm.note" label="Keterangan" /></v-col>
          </v-row>
        </v-card-text>
        <v-divider />
        <v-card-actions class="px-5 py-3">
          <v-btn variant="text" size="small" @click="payFull">Bayar Sisa {{ selected ? money(tRemaining(selected), currency) : '' }}</v-btn>
          <v-spacer />
          <v-btn variant="text" @click="payDialog = false">Batal</v-btn>
          <v-btn color="primary" variant="elevated" prepend-icon="mdi-certificate-outline" @click="addPayment">Simpan &amp; Cetak Kwitansi</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { ref, computed, reactive, onMounted, watch } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import StatCard from '@/components/StatCard.vue'
import EmptyState from '@/components/EmptyState.vue'
import ProjectDialog from '@/components/ProjectDialog.vue'
import { optionLabel, optionColor } from '@/utils/options'
import { PROJECT_STATUS, PROJECT_TYPES, HOSTED_BY } from '@/utils/projectPresets'
import { todayISO } from '@/utils/id'
import { money } from '@/utils/format'
import { printInvoice, printKwitansi } from '@/utils/printProject'
import { totals } from '@/store/modules/projects'

export default {
  name: 'ProjectsView',
  components: { StatCard, EmptyState, ProjectDialog },
  setup () {
    const store = useStore()
    const route = useRoute()
    const search = ref('')
    const filterType = ref(null)
    const filterStatus = ref(null)
    const dialog = ref(false)
    const editing = ref(null)
    const detail = ref(false)
    const selected = ref(null)
    const printDialog = ref(false)
    const payDialog = ref(false)
    const presetMitra = ref('')
    const payForm = reactive({ date: todayISO(), amount: 0, method: 'Transfer Bank', note: '' })

    const count = computed(() => store.getters['projects/count'])
    const grand = computed(() => store.getters['projects/grand'])
    const currency = computed(() => store.getters['settings/currency'])
    const business = computed(() => store.getters['settings/business'])
    const typeOptions = computed(() => PROJECT_TYPES.map(t => ({ title: t.title, value: t.value })))
    const statusOptions = computed(() => PROJECT_STATUS.map(s => ({ title: s.title, value: s.value })))

    const filtered = computed(() => {
      let l = store.getters['projects/list']
      const q = search.value.toLowerCase().trim()
      if (q) {
        l = l.filter(p => {
          const m = store.getters['mitras/byId'](p.mitraId)
          return [p.code, p.name, p.description, m && m.name, m && m.company, p.staffName]
            .some(v => String(v || '').toLowerCase().includes(q))
        })
      }
      if (filterType.value) l = l.filter(p => p.type === filterType.value)
      if (filterStatus.value) l = l.filter(p => p.status === filterStatus.value)
      return l
    })

    const pTotals = p => totals(p)
    const t = computed(() => totals(selected.value))
    const featureCategories = computed(() => selected.value ? [...new Set((selected.value.features || []).map(f => f.category || 'Lainnya'))] : [])
    const featSum = computed(() => selected.value ? (selected.value.features || []).length : 0)
    const catItems = (prj, cat) => (prj.features || []).filter(f => (f.category || 'Lainnya') === cat)
    const tRemaining = prj => totals(prj).remaining

    function openForm (p = null) {
      editing.value = p
      detail.value = false
      dialog.value = true
    }
    function saveProject (data) {
      if (editing.value) {
        store.commit('projects/UPDATE', { id: editing.value.id, data })
        store.dispatch('ui/notify', 'Project diperbarui.')
      } else {
        store.commit('projects/ADD', data)
        store.dispatch('ui/notify', 'Project dibuat.')
      }
    }
    function remove (p) {
      if (window.confirm(`Hapus project "${p.name}" (${p.code})? Riwayat pembayaran ikut terhapus.`)) {
        store.commit('projects/REMOVE', p.id)
        store.dispatch('ui/notify', { text: 'Project dihapus.', color: 'error' })
      }
    }
    function openDetail (p) { selected.value = p; detail.value = true }
    function openPrint (p) { selected.value = p; printDialog.value = true }

    const mitraOf = p => store.getters['mitras/byId'](p.mitraId)
    const mitraName = id => {
      const m = store.getters['mitras/byId'](id)
      return m ? m.name : '—'
    }
    function printNota (p, m, b, cur) { printInvoice(p, m, b, cur, 'nota') }
    function printKw (p, pay) {
      printKwitansi(p, pay, mitraOf(p), business.value, currency.value)
    }
    function printLastKw (p) {
      const pays = p.payments || []
      printKw(p, pays[pays.length - 1])
      printDialog.value = false
    }

    function payFull () { payForm.amount = tRemaining(selected.value) }
    function addPayment () {
      if (!payForm.amount || payForm.amount <= 0) return
      store.commit('projects/ADD_PAYMENT', {
        id: selected.value.id,
        payment: { date: payForm.date || todayISO(), amount: Number(payForm.amount), method: payForm.method, note: payForm.note.trim() }
      })
      store.dispatch('ui/notify', 'Pembayaran dicatat.')
      selected.value = store.getters['projects/byId'](selected.value.id)
      const last = (selected.value.payments || []).slice(-1)[0]
      payDialog.value = false
      if (last) printKw(selected.value, last)
      payForm.amount = 0
      payForm.note = ''
    }
    function removePay (p, pay) {
      if (window.confirm('Hapus catatan pembayaran ini?')) {
        store.commit('projects/REMOVE_PAYMENT', { id: p.id, paymentId: pay.id })
        selected.value = store.getters['projects/byId'](p.id)
      }
    }

    const hostedLabel = v => optionLabel(HOSTED_BY, v)
    const typeLabel = v => optionLabel(PROJECT_TYPES, v)
    const statusLabel = v => optionLabel(PROJECT_STATUS, v)
    const statusColor = v => optionColor(PROJECT_STATUS, v)

    watch(() => route.query.new, v => {
      if (v) {
        presetMitra.value = route.query.mitra || ''
        openForm(null)
      }
    })

    return {
      search, filterType, filterStatus, dialog, editing, detail, selected, printDialog, payDialog, presetMitra, payForm,
      count, grand, currency, business, typeOptions, statusOptions, filtered, pTotals, featureCategories, featSum, catItems, tRemaining, t,
      openForm, saveProject, remove, openDetail, openPrint, mitraOf, mitraName, printNota, printKw, printLastKw,
      payFull, addPayment, removePay, hostedLabel, typeLabel, statusLabel, statusColor, money, printInvoice, todayISO
    }
  }
}
</script>
