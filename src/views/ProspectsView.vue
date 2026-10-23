<template>
  <div>
    <div class="d-flex flex-wrap justify-space-between align-center mb-4 ga-3">
      <div class="text-body-2 text-grey">Database calon customer (leads) untuk cold messaging — impor Excel/CSV, kirim WhatsApp, ekspor kembali.</div>
      <div class="d-flex gap-2">
        <v-btn color="primary" variant="elevated" prepend-icon="mdi-plus" @click="openForm()">Tambah Manual</v-btn>
      </div>
    </div>

    <v-row dense class="mb-2">
      <v-col v-for="s in STATUSES" :key="s.value" cols="4" md="2">
        <v-card border class="h-100">
          <v-card-text class="pa-3 text-center">
            <div class="text-caption text-medium-emphasis">{{ s.title }}</div>
            <div class="text-h6 font-weight-bold" :class="`text-${s.color}`">{{ statusCounts[s.value] || 0 }}</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-card border>
      <v-card-text class="py-3">
        <div class="d-flex flex-wrap gap-2 align-center">
          <v-text-field v-model="search" placeholder="Cari nama, perusahaan, nomor…" prepend-inner-icon="mdi-magnify" style="max-width:300px" clearable />
          <v-select v-model="filterStatus" :items="statuses" label="Status" style="max-width:200px" clearable />
          <v-spacer />
          <v-btn size="small" variant="tonal" color="success" prepend-icon="mdi-file-excel-outline" @click="importExcel">
            Impor Excel/CSV
          </v-btn>
          <v-btn size="small" variant="tonal" color="secondary" prepend-icon="mdi-file-excel-outline" @click="exportExcel">
            Ekspor Excel
          </v-btn>
          <input ref="fileInput" type="file" accept=".xlsx,.xls,.csv" class="hidden-input" @change="onFilePick">
        </div>
      </v-card-text>
      <v-divider />

      <v-table v-if="filtered.length" density="compact">
        <thead>
          <tr>
            <th class="text-caption">Nama / Perusahaan</th>
            <th class="text-caption">WhatsApp</th>
            <th class="text-caption">Minat</th>
            <th class="text-caption">Status</th>
            <th class="text-caption text-right">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in filtered" :key="p.id">
            <td>
              <div class="text-body-2 font-weight-medium">{{ p.name }}</div>
              <div class="text-caption text-medium-emphasis">{{ p.company || '—' }}{{ p.email ? ' · ' + p.email : '' }}</div>
            </td>
            <td class="text-body-2">{{ waDisplay(p.phone) }}</td>
            <td class="text-caption text-medium-emphasis">{{ p.interest || '—' }}</td>
            <td>
              <v-select
                :model-value="p.status"
                :items="statuses"
                density="compact"
                variant="outlined"
                hide-details
                style="max-width:190px"
                @update:model-value="v => setStatus(p, v)"
              />
            </td>
            <td class="text-right" style="white-space:nowrap">
              <v-btn icon="mdi-whatsapp" size="x-small" variant="text" color="success" title="Kirim pesan WhatsApp" @click="coldMessage(p)" />
              <v-btn v-if="p.status !== 'converted'" icon="mdi-account-plus-outline" size="x-small" variant="text" color="primary" title="Jadikan Pelanggan" @click="convert(p)" />
              <v-btn icon="mdi-pencil" size="x-small" variant="text" @click="openForm(p)" />
              <v-btn icon="mdi-delete-outline" size="x-small" variant="text" color="error" @click="remove(p)" />
            </td>
          </tr>
        </tbody>
      </v-table>
      <empty-state v-else icon="mdi-bullhorn-outline" title="Belum ada calon customer" text="Impor data dari Excel/CSV atau tambah manual, lalu kirim cold message via WhatsApp.">
        <template #action>
          <v-btn color="success" variant="tonal" size="small" prepend-icon="mdi-file-excel-outline" @click="importExcel">Impor Excel/CSV</v-btn>
        </template>
      </empty-state>
    </v-card>

    <v-dialog v-model="dialog" max-width="640" persistent>
      <v-card>
        <v-card-title class="text-h6 font-weight-bold py-4 px-5">{{ editing ? 'Edit Calon Customer' : 'Tambah Calon Customer' }}</v-card-title>
        <v-divider />
        <v-card-text class="px-5 py-4">
          <v-row dense>
            <v-col cols="12" sm="6"><v-text-field v-model="form.name" label="Nama *" :rules="[req]" prepend-inner-icon="mdi-account-outline" /></v-col>
            <v-col cols="12" sm="6"><v-text-field v-model="form.company" label="Perusahaan / usaha" prepend-inner-icon="mdi-office-building-outline" /></v-col>
            <v-col cols="12" sm="6"><v-text-field v-model="form.phone" label="WhatsApp / Telepon *" :rules="[req]" prepend-inner-icon="mdi-phone-outline" /></v-col>
            <v-col cols="12" sm="6"><v-text-field v-model="form.email" type="email" label="Email" prepend-inner-icon="mdi-email-outline" /></v-col>
            <v-col cols="12" sm="6">
              <v-select v-model="form.interest" :items="typeOptions" label="Minat project" clearable prepend-inner-icon="mdi-cube-outline" />
            </v-col>
            <v-col cols="12" sm="6"><v-select v-model="form.status" :items="statuses" label="Status" prepend-inner-icon="mdi-progress-clock" /></v-col>
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

    <v-dialog v-model="msgOpen" max-width="520" persistent>
      <v-card>
        <v-card-title class="text-h6 font-weight-bold py-4 px-5">Cold Message WhatsApp</v-card-title>
        <v-divider />
        <v-card-text class="px-5 py-4">
          <div class="text-body-2 mb-2">Tujuan: <b>{{ target ? target.name : '' }}</b> — {{ target ? waDisplay(target.phone) : '' }}</div>
          <v-textarea v-model="msgTemplate" label="Template pesan" rows="6" variant="outlined" hint="{nama}, {perusahaan}, {jenis} akan diganti otomatis. {business} = nama usaha Anda." persistent-hint />
          <v-alert density="compact" variant="tonal" color="info" class="mt-3" icon="mdi-information-outline">
            Setelah kirim, status otomatis berubah menjadi <b>Sudah Dihubungi</b>.
          </v-alert>
        </v-card-text>
        <v-divider />
        <v-card-actions class="px-5 py-3">
          <v-spacer />
          <v-btn variant="text" @click="msgOpen = false">Batal</v-btn>
          <v-btn color="success" variant="elevated" prepend-icon="mdi-whatsapp" @click="sendWA(target, msgPreview, true)">Buka WhatsApp &amp; Kirim</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="mapDialog" max-width="760" v-if="importPreview.length">
      <v-card>
        <v-card-title class="text-h6 font-weight-bold py-4 px-5">Pratinjau Impor ({{ importPreview.length }} baris)</v-card-title>
        <v-divider />
        <v-card-text class="px-2 py-2" style="max-height:46vh;overflow-y:auto">
          <v-table density="compact">
            <thead><tr><th class="text-caption">Nama</th><th class="text-caption">Perusahaan</th><th class="text-caption">WA</th><th class="text-caption">Email</th><th class="text-caption">Minat</th></tr></thead>
            <tbody>
              <tr v-for="(r, i) in importPreview.slice(0, 50)" :key="i">
                <td class="text-body-2">{{ r.name }}</td>
                <td class="text-body-2">{{ r.company }}</td>
                <td class="text-body-2">{{ waDisplay(r.phone) }}</td>
                <td class="text-caption">{{ r.email }}</td>
                <td class="text-caption">{{ r.interest }}</td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>
        <v-divider />
        <v-card-actions class="px-5 py-3">
          <v-btn variant="text" size="small" prepend-icon="mdi-download" @click="downloadTemplateExcel">Unduh Template Excel</v-btn>
          <v-spacer />
          <v-btn variant="text" @click="mapDialog = false">Batal</v-btn>
          <v-btn color="primary" variant="elevated" prepend-icon="mdi-database-import-outline" @click="doImport">
            Impor {{ importPreview.length }} Data
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { ref, computed, reactive, watch } from 'vue'
import { useStore } from 'vuex'
import EmptyState from '@/components/EmptyState.vue'
import { optionLabel } from '@/utils/options'
import { PROJECT_TYPES, CONTACT_STATUS } from '@/utils/projectPresets'
import * as XLSX from 'xlsx'
import { csvDate } from '@/utils/export'

const STATUSES = CONTACT_STATUS

export default {
  name: 'ProspectsView',
  components: { EmptyState },
  setup () {
    const store = useStore()
    const search = ref('')
    const filterStatus = ref(null)
    const dialog = ref(false)
    const editing = ref(null)
    const msgOpen = ref(false)
    const target = ref(null)
    const fileInput = ref(null)
    const mapDialog = ref(false)
    const importPreview = ref([])
    const req = v => !!(v && String(v).trim()) || 'Wajib diisi'
    const form = reactive({ name: '', company: '', phone: '', email: '', interest: '', status: 'new', notes: '' })

    const msgTemplate = ref('Halo {nama}, saya dari {business}. Kami menyediakan jasa pengembangan {jenis} (ERP, Website, E-Commerce, dsb) dengan penawaran menarik. Apakah {perusahaan} sedang mencari solusi digital? Boleh kami kirimkan contoh & daftar harga? Terima kasih 🙏')

    const statuses = STATUSES.map(s => ({ title: s.title, value: s.value }))
    const typeOptions = computed(() => PROJECT_TYPES.map(t => ({ title: t.title, value: t.value })))
    const list = computed(() => store.getters['prospects/list'])
    const statusCounts = computed(() => store.getters['prospects/countsByStatus'])

    const filtered = computed(() => {
      let l = store.getters['prospects/search'](search.value)
      if (filterStatus.value) l = l.filter(p => p.status === filterStatus.value)
      return l
    })

    function waDisplay (phone) { return (phone || '—').replace(/\s+/g, '') }
    function waIntl (phone) {
      let d = String(phone || '').replace(/[^\d+]/g, '')
      if (d.startsWith('+')) d = d.slice(1)
      if (d.startsWith('0')) d = '62' + d.slice(1)
      if (d.startsWith('62')) return d
      return d
    }
    const msgPreview = computed(() => fillTemplate(msgTemplate.value))

    function fillTemplate (tpl) {
      const b = store.getters['settings/business']
      return String(tpl || '')
        .replaceAll('{nama}', (target.value && target.value.name) || '')
        .replaceAll('{perusahaan}', (target.value && target.value.company) || '')
        .replaceAll('{jenis}', optionLabel(PROJECT_TYPES, (target.value && target.value.interest) || '') === '—' ? 'website & aplikasi digital' : optionLabel(PROJECT_TYPES, (target.value && target.value.interest) || ''))
        .replaceAll('{business}', b.businessName || 'tim kami')
    }

    function openForm (p = null) {
      editing.value = p
      Object.assign(form, p ? { ...p } : { name: '', company: '', phone: '', email: '', interest: '', status: 'new', notes: '' })
      dialog.value = true
    }
    function save () {
      if (!req(form.name) || !req(form.phone)) return
      const data = { name: form.name.trim(), company: form.company.trim(), phone: form.phone.trim(), email: form.email.trim(), interest: form.interest || '', status: form.status, notes: form.notes.trim() }
      if (editing.value) {
        store.commit('prospects/UPDATE', { id: editing.value.id, data })
        store.dispatch('ui/notify', 'Data diperbarui.')
      } else {
        store.commit('prospects/ADD', data)
        store.dispatch('ui/notify', 'Calon customer ditambahkan.')
      }
      dialog.value = false
    }
    function remove (p) {
      if (window.confirm(`Hapus lead "${p.name}"?`)) {
        store.commit('prospects/REMOVE', p.id)
        store.dispatch('ui/notify', { text: 'Lead dihapus.', color: 'error' })
      }
    }
    function setStatus (p, v) {
      store.commit('prospects/UPDATE', { id: p.id, data: { status: v } })
    }
    function convert (p) {
      store.commit('customers/ADD', {
        name: p.name,
        company: p.company,
        phone: p.phone,
        email: p.email,
        address: '',
        category: 'Umum',
        status: 'prospect',
        notes: `Dari calon customer. Minat: ${p.interest || '—'}.${p.notes ? ' ' + p.notes : ''}`
      })
      store.commit('prospects/UPDATE', { id: p.id, data: { status: 'converted', convertedAt: new Date().toISOString() } })
      store.dispatch('ui/notify', `"${p.name}" dijadikan pelanggan — cek halaman Pelanggan.`)
    }
    function coldMessage (p) {
      target.value = p
      msgOpen.value = true
    }
    function sendWA (p, text, markContacted = false) {
      if (!p) return
      const url = `https://wa.me/${waIntl(p.phone)}?text=${encodeURIComponent(text)}`
      window.open(url, '_blank', 'noopener')
      if (markContacted) {
        store.commit('prospects/UPDATE', {
          id: p.id,
          data: { status: p.status === 'new' ? 'contacted' : p.status, lastContactedAt: new Date().toISOString() }
        })
        msgOpen.value = false
      }
    }

    function importExcel () { fileInput.value && fileInput.value.click() }

    function onFilePick (e) {
      const file = e.target.files && e.target.files[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = ev => {
        try {
          const wb = XLSX.read(ev.target.result, { type: 'array' })
          const sheet = wb.Sheets[wb.SheetNames[0]]
          const json = XLSX.utils.sheet_to_json(sheet, { defval: '' })
          const mapped = json.map(row => ({
            name: pick(row, ['nama', 'name', 'customer', 'contact']),
            company: pick(row, ['perusahaan', 'company', 'usaha', 'business']),
            phone: pick(row, ['whatsapp', 'wa', 'phone', 'telepon', 'hp', 'no. hp', 'nomor', 'mobile']),
            email: pick(row, ['email', 'surel']),
            interest: pick(row, ['minat', 'interest', 'project', 'jenis']),
            notes: pick(row, ['catatan', 'notes', 'keterangan'])
          })).filter(r => r.name && r.phone)
          if (!mapped.length) {
            store.dispatch('ui/notify', { text: 'Tidak ada baris valid — pastikan kolom Nama & WhatsApp terisi.', color: 'error', timeout: 4000 })
          } else {
            importPreview.value = mapped
            mapDialog.value = true
          }
        } catch (err) {
          store.dispatch('ui/notify', { text: `Gagal membaca berkas: ${err.message}`, color: 'error', timeout: 4000 })
        }
        e.target.value = ''
      }
      reader.readAsArrayBuffer(file)
    }
    function pick (row, keys) {
      let val = ''
      for (const k of Object.keys(row)) {
        const lk = String(k).toLowerCase().trim()
        if (keys.includes(lk) && String(row[k]).trim()) { val = String(row[k]).trim(); break }
      }
      return val
    }
    function doImport () {
      store.commit('prospects/IMPORT_MERGE', importPreview.value)
      mapDialog.value = false
      importPreview.value = []
      store.dispatch('ui/notify', `Impor selesai — duplikat nomor/email otomatis digabung. Total: ${list.value.length} lead.`)
    }
    function downloadTemplateExcel () {
      const ws = XLSX.utils.aoa_to_sheet([['Nama', 'Perusahaan', 'WhatsApp', 'Email', 'Minat', 'Catatan'], ['Budi Santoso', 'Toko Sejahtera', '081234567890', '', 'E-Commerce', 'Referensi dari Facebook']])
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Calon Customer')
      XLSX.writeFile(wb, `template-calon-customer-${csvDate()}.xlsx`)
    }
    function exportExcel () {
      const data = filtered.value.map(p => ({
        Nama: p.name,
        Perusahaan: p.company,
        WhatsApp: p.phone,
        Email: p.email,
        Minat: optionLabel(PROJECT_TYPES, p.interest) !== '—' ? optionLabel(PROJECT_TYPES, p.interest) : p.interest,
        Status: optionLabel(CONTACT_STATUS, p.status),
        Catatan: p.notes
      }))
      const ws = XLSX.utils.json_to_sheet(data)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Calon Customer')
      XLSX.writeFile(wb, `calon-customer-${csvDate()}.xlsx`)
      store.dispatch('ui/notify', 'Data diekspor ke berkas Excel.')
    }

    return {
      search, filterStatus, dialog, editing, msgOpen, target, fileInput, mapDialog, importPreview, req,
      form, msgTemplate, msgPreview, statuses, STATUSES, typeOptions, list, statusCounts, filtered,
      openForm, save, remove, setStatus, convert, coldMessage, sendWA, waDisplay, waIntl,
      importExcel, onFilePick, doImport, exportExcel, downloadTemplateExcel, fillTemplate
    }
  }
}
</script>

<style scoped>
.hidden-input { display: none; }
</style>
