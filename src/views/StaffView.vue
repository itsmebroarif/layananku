<template>
  <div>
    <div class="d-flex flex-wrap justify-space-between align-center mb-4 ga-3">
      <div class="text-body-2 text-grey">Daftar staff/anggota tim: divisi, jabatan, kontak, dan penanggung jawab project.</div>
      <div class="d-flex flex-wrap gap-2">
        <v-btn variant="tonal" prepend-icon="mdi-sitemap-outline" @click="openManage">Kelola Divisi</v-btn>
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
        <stat-card label="Divisi Terpakai" :value="usedDivisions.length" icon="mdi-sitemap-outline" color="secondary" />
      </v-col>
      <v-col cols="6" md="3">
        <stat-card label="Mengelola Project" :value="busyStaff" icon="mdi-folder-multiple-outline" color="accent" />
      </v-col>
    </v-row>

    <v-card border>
      <v-card-text class="py-3">
        <div class="d-flex flex-wrap gap-2">
          <v-text-field v-model="search" placeholder="Cari nama, jabatan, divisi, kontak…" prepend-inner-icon="mdi-magnify" style="max-width:360px" clearable />
          <v-select v-model="filterDivision" :items="usedDivisionOptions" item-title="title" item-value="value" label="Divisi" style="max-width:220px" clearable />
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
                  <div class="text-caption text-medium-emphasis">{{ positionOf(s) || '—' }}</div>
                </div>
              </div>
            </td>
            <td>
              <v-chip v-if="divisionOf(s)" size="x-small" variant="tonal" :color="divisionColor(s.division)" :prepend-icon="divisionIcon(s.division)">
                {{ divisionOf(s) }}
              </v-chip>
              <span v-else class="text-caption text-grey">—</span>
            </td>
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

    <!-- Form tambah/edit staff -->
    <v-dialog v-model="dialog" max-width="720" persistent>
      <v-card>
        <v-card-title class="text-h6 font-weight-bold py-4 px-5">{{ editing ? 'Edit Staff' : 'Tambah Staff' }}</v-card-title>
        <v-divider />
        <v-card-text class="px-5 py-4">
          <v-form ref="formRef" @submit.prevent="save">
            <v-row dense>
              <v-col cols="12" sm="7"><v-text-field v-model="form.name" label="Nama *" :rules="[req]" prepend-inner-icon="mdi-account-outline" /></v-col>
              <v-col cols="12" sm="5">
                <v-select v-model="form.status" :items="STATUS_OPTIONS" label="Status" prepend-inner-icon="mdi-progress-clock" />
              </v-col>
              <v-col cols="12" sm="6">
                <v-combobox
                  v-model="form.division"
                  :items="divisionOptions"
                  item-title="title"
                  item-value="title"
                  :return-object="false"
                  label="Divisi / Kategori"
                  prepend-inner-icon="mdi-sitemap-outline"
                  :hint="divisionHint"
                  persistent-hint
                  clearable
                  @update:model-value="onDivisionChange"
                >
                  <template #item="{ props, item }">
                    <v-list-item
                      v-bind="props"
                      :prepend-icon="item.raw.icon"
                      :subtitle="`${item.raw.total} jabatan${item.raw.custom ? ' · divisi tambahan' : ''}`"
                    />
                  </template>
                </v-combobox>
              </v-col>
              <v-col cols="12" sm="6">
                <v-combobox
                  v-model="form.position"
                  :items="positionOptions"
                  item-title="title"
                  item-value="value"
                  :return-object="false"
                  label="Jabatan / Posisi"
                  prepend-inner-icon="mdi-badge-account-outline"
                  :disabled="!form.division"
                  :hint="positionHint"
                  persistent-hint
                  clearable
                />
              </v-col>
              <v-col cols="12" sm="6"><v-text-field v-model="form.phone" label="Telepon / WA" prepend-inner-icon="mdi-phone-outline" /></v-col>
              <v-col cols="12" sm="6"><v-text-field v-model="form.email" type="email" label="Email" prepend-inner-icon="mdi-email-outline" /></v-col>
              <v-col cols="12"><v-textarea v-model="form.notes" label="Catatan" rows="2" /></v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-divider />
        <v-card-actions class="px-5 py-3">
          <v-spacer />
          <v-btn variant="text" @click="dialog = false">Batal</v-btn>
          <v-btn color="primary" variant="elevated" @click="save">Simpan</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Kelola kategori divisi & jabatan -->
    <v-dialog v-model="manageDialog" max-width="760" scrollable>
      <v-card>
        <v-card-title class="d-flex align-start justify-space-between py-4 px-5">
          <div>
            <div class="text-h6 font-weight-bold">Kelola Divisi &amp; Jabatan</div>
            <div class="text-caption text-medium-emphasis">Kategori bawaan sudah lengkap. Tambahan Anda tersimpan otomatis dan langsung muncul di formulir staff.</div>
          </div>
          <v-btn icon="mdi-close" variant="text" size="small" @click="manageDialog = false" />
        </v-card-title>
        <v-divider />
        <v-card-text class="px-5 py-4">
          <div class="text-subtitle-2 font-weight-bold mb-2">Tambah Divisi Baru</div>
          <div class="d-flex flex-wrap align-center gap-2">
            <v-text-field
              v-model="newDivision"
              label="Nama divisi baru"
              prepend-inner-icon="mdi-sitemap-outline"
              hide-details
              class="flex-grow-1"
              style="min-width:220px"
              @keyup.enter="addDivision"
            />
            <v-btn color="primary" variant="tonal" prepend-icon="mdi-plus" @click="addDivision">Tambah Divisi</v-btn>
          </div>

          <v-divider class="my-4" />

          <div class="text-subtitle-2 font-weight-bold mb-2">Divisi &amp; Jabatan</div>
          <v-select
            v-model="manageDivision"
            :items="divisionOptions"
            item-title="title"
            item-value="title"
            label="Pilih divisi yang dikelola"
            prepend-inner-icon="mdi-sitemap-outline"
            clearable
          />

          <template v-if="selectedDivision">
            <div class="d-flex flex-wrap align-center ga-2 mt-3">
              <v-chip size="small" :color="selectedDivision.color" variant="tonal" :prepend-icon="selectedDivision.icon">
                {{ selectedDivision.title }}
              </v-chip>
              <span class="text-caption text-medium-emphasis">{{ selectedDivision.total }} jabatan</span>
              <v-spacer />
              <v-btn v-if="selectedDivision.custom" size="small" color="error" variant="text" prepend-icon="mdi-trash-can-outline" @click="deleteDivision">Hapus divisi</v-btn>
            </div>

            <div class="d-flex flex-wrap gap-2 mt-3">
              <v-chip
                v-for="p in selectedDivision.items"
                :key="p"
                size="small"
                :closable="isCustomPosition(p)"
                @click:close="isCustomPosition(p) && removePosition(p)"
              >
                {{ p }}
              </v-chip>
            </div>

            <div class="d-flex flex-wrap align-center gap-2 mt-4">
              <v-text-field
                v-model="newPosition"
                label="Tambah jabatan baru"
                prepend-inner-icon="mdi-badge-account-outline"
                hide-details
                class="flex-grow-1"
                style="min-width:220px"
                @keyup.enter="addPosition"
              />
              <v-btn color="primary" variant="tonal" prepend-icon="mdi-plus" @click="addPosition">Tambah Jabatan</v-btn>
            </div>
            <div class="text-caption text-medium-emphasis mt-2">Jabatan bawaan tidak dapat dihapus. Jabatan tambahan dapat dihapus lewat tanda ×.</div>
          </template>
          <div v-else class="text-caption text-grey mt-3">Pilih divisi untuk melihat dan menambah jabatan.</div>
        </v-card-text>
        <v-divider />
        <v-card-actions class="px-5 py-3">
          <v-spacer />
          <v-btn color="primary" variant="elevated" @click="manageDialog = false">Selesai</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { ref, computed, reactive, nextTick } from 'vue'
import { useStore } from 'vuex'
import StatCard from '@/components/StatCard.vue'
import EmptyState from '@/components/EmptyState.vue'
import { STAFF_DIVISIONS, staffDivisionByTitle } from '@/utils/options'
import { downloadCsv, csvDate } from '@/utils/export'

const STATUS_OPTIONS = [
  { title: 'Aktif', value: 'active' },
  { title: 'Cuti / Nonaktif', value: 'inactive' },
  { title: 'Resign', value: 'resigned' }
]

const sameText = (a, b) => String(a || '').trim().toLowerCase() === String(b || '').trim().toLowerCase()

function textValue (value) {
  if (value == null) return ''
  if (typeof value === 'object') return value.title || value.value || ''
  return String(value)
}

function mergeUnique (base, extra) {
  const result = [...(Array.isArray(base) ? base : [])]
  ;(Array.isArray(extra) ? extra : []).forEach(item => {
    if (!result.some(existing => sameText(existing, item))) result.push(item)
  })
  return result
}

function customItemsFor (positions, division) {
  const key = Object.keys(positions || {}).find(k => sameText(k, division))
  return key ? positions[key] : []
}

export default {
  name: 'StaffView',
  components: { StatCard, EmptyState },
  setup () {
    const store = useStore()
    const search = ref('')
    const filterDivision = ref(null)
    const filterStatus = ref(null)
    const dialog = ref(false)
    const editing = ref(null)
    const formRef = ref(null)
    const manageDialog = ref(false)
    const manageDivision = ref(null)
    const newDivision = ref('')
    const newPosition = ref('')
    const req = v => !!(v && String(v).trim()) || 'Wajib diisi'

    const emptyForm = () => ({ name: '', position: '', division: '', phone: '', email: '', status: 'active', notes: '' })
    const form = reactive(emptyForm())

    const list = computed(() => store.getters['staff/list'])
    const customDivisions = computed(() => store.getters['staff/customDivisions'])
    const customPositions = computed(() => store.getters['staff/customPositions'])

    // Gabungkan kategori bawaan dengan divisi/jabatan tambahan pengguna.
    const divisionOptions = computed(() => {
      const positions = customPositions.value || {}
      const result = STAFF_DIVISIONS.map(d => ({
        value: d.title,
        title: d.title,
        icon: d.icon,
        color: d.color,
        custom: false,
        items: mergeUnique(d.items, customItemsFor(positions, d.title))
      }))

      const addCustomDivision = title => {
        const value = textValue(title).trim()
        if (!value || result.some(d => sameText(d.title, value))) return
        result.push({
          value,
          title: value,
          icon: 'mdi-sitemap-outline',
          color: 'blue-grey',
          custom: true,
          items: customItemsFor(positions, value)
        })
      }

      ;(customDivisions.value || []).forEach(addCustomDivision)
      Object.keys(positions).forEach(addCustomDivision)

      result.forEach(d => { d.total = d.items.length })
      return result
    })

    const usedDivisions = computed(() => {
      const unique = new Set()
      list.value.forEach(s => {
        const division = divisionOf(s)
        if (division) unique.add(division)
      })
      return [...unique].sort((a, b) => a.localeCompare(b, 'id'))
    })
    const usedDivisionOptions = computed(() => usedDivisions.value.map(d => ({ title: d, value: d })))

    const busyStaff = computed(() => new Set(store.getters['projects/list'].map(p => p.staffId).filter(Boolean)).size)

    const currentDivisionOption = computed(() => {
      const value = textValue(form.division)
      return divisionOptions.value.find(d => sameText(d.title, value)) || null
    })
    const positionOptions = computed(() => {
      const division = currentDivisionOption.value
      return division ? division.items.map(item => ({ title: item, value: item })) : []
    })
    const selectedDivision = computed(() => {
      const value = textValue(manageDivision.value)
      return divisionOptions.value.find(d => sameText(d.title, value)) || null
    })

    const divisionHint = computed(() => {
      if (!textValue(form.division)) return 'Pilih kategori atau ketik divisi baru.'
      return currentDivisionOption.value
        ? `${currentDivisionOption.value.total} jabatan tersedia. Bisa juga mengetik divisi baru.`
        : 'Divisi baru — jabatan bisa diketik langsung.'
    })
    const positionHint = computed(() => {
      if (!textValue(form.division)) return 'Pilih divisi terlebih dahulu.'
      return positionOptions.value.length
        ? 'Pilih jabatan atau ketik jabatan baru.'
        : 'Belum ada daftar jabatan. Ketik jabatan baru.'
    })

    function divisionOf (staff) {
      const raw = textValue(staff && staff.division).trim()
      if (!raw) return ''
      if ((customDivisions.value || []).some(d => sameText(d, raw))) return raw
      const preset = staffDivisionByTitle(raw)
      return preset ? preset.title : raw
    }

    function positionOf (staff) {
      const raw = textValue(staff && staff.position).trim()
      if (!raw) return ''
      const division = divisionOptions.value.find(d => sameText(d.title, divisionOf(staff)))
      if (!division) return raw
      return division.items.find(item => sameText(item, raw)) || raw
    }

    function divisionMeta (value) {
      return divisionOptions.value.find(d => sameText(d.title, textValue(value))) || {
        icon: 'mdi-sitemap-outline',
        color: 'blue-grey'
      }
    }
    const divisionIcon = value => divisionMeta(value).icon
    const divisionColor = value => divisionMeta(value).color

    const filtered = computed(() => {
      let result = list.value
      const q = search.value.toLowerCase().trim()
      if (q) {
        result = result.filter(s => [s.name, positionOf(s), divisionOf(s), s.phone, s.email]
          .some(v => String(v || '').toLowerCase().includes(q)))
      }
      if (filterDivision.value) result = result.filter(s => sameText(divisionOf(s), filterDivision.value))
      if (filterStatus.value) result = result.filter(s => s.status === filterStatus.value)
      return result
    })

    const initials = n => String(n || '?').trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase()

    function openForm (s = null) {
      editing.value = s
      Object.assign(form, s
        ? {
            name: textValue(s.name),
            position: positionOf(s),
            division: divisionOf(s),
            phone: textValue(s.phone),
            email: textValue(s.email),
            status: s.status || 'active',
            notes: textValue(s.notes)
          }
        : emptyForm())
      dialog.value = true
      nextTick(() => formRef.value?.resetValidation())
    }

    function onDivisionChange () {
      const current = textValue(form.position).trim()
      if (!current) return
      const division = currentDivisionOption.value
      if (!division || !division.items.some(item => sameText(item, current))) form.position = ''
    }

    async function save () {
      if (formRef.value) {
        const { valid } = await formRef.value.validate()
        if (!valid) return
      }

      const name = textValue(form.name).trim()
      if (!name) {
        store.dispatch('ui/notify', { text: 'Nama staff wajib diisi.', color: 'warning' })
        return
      }

      let division = textValue(form.division).trim()
      let position = textValue(form.position).trim()

      if (!division) position = ''
      if (division) {
        const existingCustom = (customDivisions.value || []).find(d => sameText(d, division))
        if (existingCustom) {
          division = existingCustom
        } else {
          const preset = staffDivisionByTitle(division)
          if (preset) division = preset.title
        }

        const existing = divisionOptions.value.find(d => sameText(d.title, division))
        if (existing) division = existing.title
        if (!existing) store.commit('staff/ADD_CUSTOM_DIVISION', division)

        if (position) {
          const existingPosition = existing && existing.items.find(item => sameText(item, position))
          if (existingPosition) {
            position = existingPosition
          } else {
            store.commit('staff/ADD_CUSTOM_POSITION', { division, title: position })
          }
        }
      }

      const data = {
        name,
        position,
        division,
        phone: textValue(form.phone).trim(),
        email: textValue(form.email).trim(),
        status: form.status || 'active',
        notes: textValue(form.notes).trim()
      }
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

    function openManage () {
      manageDialog.value = true
    }

    function addDivision () {
      const title = textValue(newDivision.value).trim()
      if (!title) {
        store.dispatch('ui/notify', { text: 'Nama divisi wajib diisi.', color: 'warning' })
        return
      }
      const existing = divisionOptions.value.find(d => sameText(d.title, title))
      if (existing) {
        manageDivision.value = existing.title
        newDivision.value = ''
        store.dispatch('ui/notify', { text: `Divisi "${existing.title}" sudah tersedia.`, color: 'info' })
        return
      }
      store.commit('staff/ADD_CUSTOM_DIVISION', title)
      manageDivision.value = title
      newDivision.value = ''
      store.dispatch('ui/notify', `Divisi "${title}" ditambahkan.`)
    }

    function deleteDivision () {
      if (!selectedDivision.value || !selectedDivision.value.custom) return
      const title = selectedDivision.value.title
      if (!window.confirm(`Hapus divisi "${title}" dari daftar? Data staff yang memakainya tetap tersimpan.`)) return
      store.commit('staff/REMOVE_CUSTOM_DIVISION', title)
      manageDivision.value = null
      store.dispatch('ui/notify', { text: `Divisi "${title}" dihapus dari daftar.`, color: 'error' })
    }

    function isCustomPosition (position) {
      const division = selectedDivision.value
      if (!division) return false
      if (division.custom) return true
      const preset = STAFF_DIVISIONS.find(d => sameText(d.title, division.title))
      return !preset || !preset.items.some(item => sameText(item, position))
    }

    function addPosition () {
      if (!selectedDivision.value) {
        store.dispatch('ui/notify', { text: 'Pilih divisi terlebih dahulu.', color: 'warning' })
        return
      }
      const title = textValue(newPosition.value).trim()
      if (!title) {
        store.dispatch('ui/notify', { text: 'Nama jabatan wajib diisi.', color: 'warning' })
        return
      }
      if (selectedDivision.value.items.some(item => sameText(item, title))) {
        store.dispatch('ui/notify', { text: `Jabatan "${title}" sudah ada di divisi ini.`, color: 'info' })
        return
      }
      store.commit('staff/ADD_CUSTOM_POSITION', { division: selectedDivision.value.title, title })
      newPosition.value = ''
      store.dispatch('ui/notify', `Jabatan "${title}" ditambahkan ke ${selectedDivision.value.title}.`)
    }

    function removePosition (position) {
      if (!selectedDivision.value || !isCustomPosition(position)) return
      store.commit('staff/REMOVE_CUSTOM_POSITION', { division: selectedDivision.value.title, title: position })
      store.dispatch('ui/notify', { text: `Jabatan "${position}" dihapus dari daftar.`, color: 'error' })
    }

    function projectCount (id) { return store.getters['projects/byStaff'](id).length }
    function statusLabel (v) {
      const found = STATUS_OPTIONS.find(s => s.value === v)
      return found ? found.title : v
    }

    function exportCsv () {
      const rows = [['Nama', 'Jabatan', 'Divisi', 'Telepon', 'Email', 'Status', 'Catatan']]
      filtered.value.forEach(s => rows.push([s.name, positionOf(s), divisionOf(s), s.phone, s.email, s.status, s.notes]))
      downloadCsv(`staff-${csvDate()}.csv`, rows)
      store.dispatch('ui/notify', 'Data staff diekspor.')
    }

    return {
      search, filterDivision, filterStatus, dialog, editing, form, formRef, req, STATUS_OPTIONS, statusLabel,
      manageDialog, manageDivision, newDivision, newPosition, divisionOptions, positionOptions, selectedDivision,
      list, usedDivisions, usedDivisionOptions, filtered, busyStaff, initials,
      divisionOf, positionOf, divisionIcon, divisionColor, divisionHint, positionHint,
      openForm, onDivisionChange, save, remove, openManage, addDivision, deleteDivision,
      isCustomPosition, addPosition, removePosition, projectCount, exportCsv
    }
  }
}
</script>
