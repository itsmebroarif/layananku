<template>
  <div>
    <div class="d-flex flex-wrap justify-space-between align-center mb-4 ga-3">
      <div class="text-body-2 text-grey">Daftar staff/anggota tim: divisi, kontak, dan penanggung jawab project.</div>
      <div class="d-flex gap-2">
        <v-btn variant="tonal" prepend-icon="mdi-file-delimited-outline" @click="exportCsv">Ekspor CSV</v-btn>
        <v-btn color="primary" variant="elevated" prepend-icon="mdi-plus" @click="openForm()">Tambah Staff</v-btn>
      </div>
    </div>

    <v-row dense class="mb-2">
      <v-col cols="6" md="3">
        <stat-card label="Total Staff" :value="list.length" icon="mdi-account-hard-hat" color="primary" />
      </v-col>
      <v-col cols="6" md="3">
        <stat-card label="Aktif" :value="list.filter(s => s.status === 'active').length" icon="mdi-check-circle" color="success" />
      </v-col>
      <v-col cols="6" md="3">
        <stat-card label="Divisi" :value="divisions.length" icon="mdi-sitemap-outline" color="secondary" />
      </v-col>
      <v-col cols="6" md="3">
        <stat-card label="Mengelola Project" :value="busyStaff" icon="mdi-folder-multiple-outline" color="accent" />
      </v-col>
    </v-row>

    <v-card border>
      <v-card-text class="py-3">
        <div class="d-flex flex-wrap gap-2">
          <v-text-field v-model="search" placeholder="Cari nama, jabatan, divisi…" prepend-inner-icon="mdi-magnify" style="max-width:340px" clearable />
          <v-select v-model="filterStatus" :items="STATUS_OPTIONS" label="Status" style="max-width:180px" clearable />
          <v-spacer />
        </div>
      </v-card-text>
      <v-divider />

      <v-table v-if="filtered.length" density="compact">
        <thead>
          <tr>
            <th class="text-caption">Nama / Jabatan</th>
            <th class="text-caption">Divisi</th>
            <th class="text-caption">Kontak</th>
            <th class="text-caption">Project</th>
            <th class="text-caption">Status</th>
            <th class="text-caption text-right">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="s in filtered" :key="s.id">
            <td>
              <div class="d-flex align-center">
                <v-avatar :color="s.status === 'active' ? 'success' : 'grey'" size="32" variant="tonal" class="mr-3">
                  {{ initials(s.name) }}
                </v-avatar>
                <div>
                  <div class="text-body-2 font-weight-medium">{{ s.name }}</div>
                  <div class="text-caption text-medium-emphasis">{{ s.position || '—' }}</div>
                </div>
              </div>
            </td>
            <td><v-chip v-if="s.division" size="x-small" variant="tonal" color="info">{{ s.division }}</v-chip><span v-else class="text-caption text-grey">—</span></td>
            <td>
              <div class="text-body-2">{{ s.phone || '—' }}</div>
              <div class="text-caption text-medium-emphasis">{{ s.email || '—' }}</div>
            </td>
            <td class="text-body-2 font-weight-medium">{{ projectCount(s.id) }}</td>
            <td><v-chip size="x-small" :color="s.status === 'active' ? 'success' : s.status === 'inactive' ? 'grey' : 'warning'" variant="flat">{{ statusLabel(s.status) }}</v-chip></td>
            <td class="text-right">
              <v-btn icon="mdi-pencil" size="x-small" variant="text" @click="openForm(s)" />
              <v-btn icon="mdi-delete-outline" size="x-small" variant="text" color="error" @click="remove(s)" />
            </td>
          </tr>
        </tbody>
      </v-table>
      <empty-state v-else icon="mdi-account-hard-hat-outline" title="Belum ada staff" text="Tambahkan staff untuk mengelola project & melayani mitra.">
        <template #action>
          <v-btn color="primary" variant="tonal" size="small" @click="openForm()">Tambah Staff</v-btn>
        </template>
      </empty-state>
    </v-card>

    <v-dialog v-model="dialog" max-width="640" persistent>
      <v-card>
        <v-card-title class="text-h6 font-weight-bold py-4 px-5">{{ editing ? 'Edit Staff' : 'Tambah Staff' }}</v-card-title>
        <v-divider />
        <v-card-text class="px-5 py-4">
          <v-row dense>
            <v-col cols="12" sm="7"><v-text-field v-model="form.name" label="Nama *" :rules="[req]" prepend-inner-icon="mdi-account-outline" /></v-col>
            <v-col cols="12" sm="5"><v-text-field v-model="form.position" label="Jabatan (mis. Project Manager)" prepend-inner-icon="mdi-badge-account-outline" /></v-col>
            <v-col cols="12" sm="6"><v-text-field v-model="form.division" label="Divisi / Tim (mis. Development)" prepend-inner-icon="mdi-sitemap-outline" /></v-col>
            <v-col cols="12" sm="6">
              <v-select v-model="form.status" :items="STATUS_OPTIONS" label="Status" prepend-inner-icon="mdi-progress-clock" />
            </v-col>
            <v-col cols="12" sm="6"><v-text-field v-model="form.phone" label="Telepon / WA" prepend-inner-icon="mdi-phone-outline" /></v-col>
            <v-col cols="12" sm="6"><v-text-field v-model="form.email" type="email" label="Email" prepend-inner-icon="mdi-email-outline" /></v-col>
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
  </div>
</template>

<script>
import { ref, computed, reactive } from 'vue'
import { useStore } from 'vuex'
import StatCard from '@/components/StatCard.vue'
import EmptyState from '@/components/EmptyState.vue'
import { downloadCsv, csvDate } from '@/utils/export'

const STATUS_OPTIONS = [
  { title: 'Aktif', value: 'active' },
  { title: 'Cuti / Nonaktif', value: 'inactive' },
  { title: 'Resign', value: 'resigned' }
]

export default {
  name: 'StaffView',
  components: { StatCard, EmptyState },
  setup () {
    const store = useStore()
    const search = ref('')
    const filterStatus = ref(null)
    const dialog = ref(false)
    const editing = ref(null)
    const form = reactive({ name: '', position: '', division: '', phone: '', email: '', status: 'active', notes: '' })
    const req = v => !!(v && String(v).trim()) || 'Wajib diisi'

    const list = computed(() => store.getters['staff/list'])
    const divisions = computed(() => store.getters['staff/divisions'])

    const filtered = computed(() => {
      let l = list.value
      const q = search.value.toLowerCase().trim()
      if (q) l = l.filter(s => [s.name, s.position, s.division, s.phone, s.email].some(v => String(v || '').toLowerCase().includes(q)))
      if (filterStatus.value) l = l.filter(s => s.status === filterStatus.value)
      return l
    })

    const busyStaff = computed(() => new Set(store.getters['projects/list'].map(p => p.staffId).filter(Boolean)).size)

    const initials = n => String(n || '?').trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase()

    function openForm (s = null) {
      editing.value = s
      Object.assign(form, s ? { ...s } : { name: '', position: '', division: '', phone: '', email: '', status: 'active', notes: '' })
      dialog.value = true
    }
    function save () {
      if (!req(form.name)) return
      const data = { name: form.name.trim(), position: form.position.trim(), division: form.division.trim(), phone: form.phone.trim(), email: form.email.trim(), status: form.status, notes: form.notes.trim() }
      if (editing.value) {
        store.commit('staff/UPDATE', { id: editing.value.id, data })
        store.dispatch('ui/notify', 'Staff diperbarui.')
      } else {
        store.commit('staff/ADD', data)
        store.dispatch('ui/notify', 'Staff ditambahkan.')
      }
      dialog.value = false
    }
    function remove (s) {
      if (window.confirm(`Hapus staff "${s.name}"?`)) {
        store.commit('staff/REMOVE', s.id)
        store.dispatch('ui/notify', { text: 'Staff dihapus.', color: 'error' })
      }
    }
    function projectCount (id) { return store.getters['projects/byStaff'](id).length }
    function statusLabel (v) {
      const f = STATUS_OPTIONS.find(s => s.value === v)
      return f ? f.title : v
    }
    function exportCsv () {
      const rows = [['Nama', 'Jabatan', 'Divisi', 'Telepon', 'Email', 'Status', 'Catatan']]
      filtered.value.forEach(s => rows.push([s.name, s.position, s.division, s.phone, s.email, s.status, s.notes]))
      downloadCsv(`staff-${csvDate()}.csv`, rows)
      store.dispatch('ui/notify', 'Data staff diekspor.')
    }

    return {
      search, filterStatus, dialog, editing, form, req, STATUS_OPTIONS, statusLabel,
      list, divisions, filtered, busyStaff, initials,
      openForm, save, remove, projectCount, exportCsv
    }
  }
}
</script>
