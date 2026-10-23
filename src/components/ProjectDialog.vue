<template>
  <v-dialog :model-value="modelValue" max-width="940" persistent scrollable @update:model-value="close">
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between py-4 px-5">
        <div class="d-flex align-center ga-2">
          <span class="text-h6 font-weight-bold">{{ isEdit ? 'Edit Project' : 'Tambah Project Baru' }}</span>
          <v-chip v-if="isEdit" size="small" color="primary" variant="tonal">{{ form.code }}</v-chip>
        </div>
        <v-btn icon="mdi-close" variant="text" size="small" @click="close" />
      </v-card-title>
      <v-divider />
      <v-card-text class="px-5 py-4" style="max-height:70vh">
        <v-row dense>
          <v-col cols="12" sm="7">
            <v-text-field v-model="form.name" label="Nama project *" :rules="[rules.required]" prepend-inner-icon="mdi-text-box-outline" />
          </v-col>
          <v-col cols="12" sm="5">
            <v-select v-model="form.status" :items="statusOptions" label="Status" prepend-inner-icon="mdi-progress-clock" />
          </v-col>
          <v-col cols="12" sm="7">
            <v-select v-model="form.type" :items="typeOptions" label="Jenis project *" :rules="[rules.required]" prepend-inner-icon="mdi-cube-outline" />
          </v-col>
          <v-col cols="12" sm="5" class="d-flex align-end">
            <v-btn block variant="tonal" color="secondary" prepend-icon="mdi-animation-outline" @click="loadTemplate">
              Muat Template Fitur
            </v-btn>
          </v-col>
          <v-col cols="12" sm="6">
            <v-select v-model="form.mitraId" :items="mitraOptions" label="Mitra / pemesan *" :rules="[rules.required]" clearable prepend-inner-icon="mdi-handshake-outline" />
          </v-col>
          <v-col cols="12" sm="6">
            <v-select v-model="form.staffId" :items="staffOptions" label="Penanggung jawab (staff)" clearable prepend-inner-icon="mdi-account-hard-hat-outline" />
          </v-col>
          <v-col cols="12" sm="4">
            <v-text-field v-model="form.startDate" label="Mulai" type="date" prepend-inner-icon="mdi-calendar-start" />
          </v-col>
          <v-col cols="12" sm="4">
            <v-text-field v-model="form.dueDate" label="Jatuh tempo" type="date" prepend-inner-icon="mdi-calendar-clock" />
          </v-col>
          <v-col cols="12" sm="4">
            <v-text-field v-model.number="form.discount" type="number" min="0" label="Diskon" prefix="Rp" prepend-inner-icon="mdi-sale-outline" />
          </v-col>
          <v-col cols="12">
            <v-textarea v-model="form.description" label="Deskripsi project" rows="2" prepend-inner-icon="mdi-text" />
          </v-col>
        </v-row>

        <v-divider class="my-4" />
        <div class="d-flex align-center justify-space-between mb-2">
          <div class="text-subtitle-2 font-weight-bold">Kategori Fitur &amp; Harga</div>
          <v-btn size="x-small" variant="tonal" prepend-icon="mdi-plus" @click="newCategory">
            Kategori Baru
          </v-btn>
        </div>
        <v-alert v-if="!(form.features || []).length" density="compact" variant="tonal" icon="mdi-animation-outline" color="info" class="mb-3">
          Tambahkan kategori &amp; fitur, atau klik <b>Muat Template Fitur</b> sesuai jenis project lalu sesuaikan nama &amp; harganya.
        </v-alert>

        <v-expansion-panels v-model="openPanels" multiple class="mb-2">
          <v-expansion-panel v-for="(cat, ci) in categories" :key="cat" :value="cat" class="mb-1">
            <v-expansion-panel-title>
              <div class="d-flex align-center justify-space-between flex-grow-1 pr-2" @click.stop>
                <b>{{ cat }}</b>
                <span class="text-caption text-medium-emphasis">
                  {{ catItems(cat).length }} fitur · {{ money(catTotal(cat), currency) }}
                </span>
              </div>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <div v-for="(f, fi) in form.features" :key="f._key" class="pa-0">
                <v-row v-if="fCategory(f) === cat" dense class="align-center">
                  <v-col cols="12" sm="6">
                    <v-text-field v-model="f.name" label="Nama fitur" density="compact" hide-details />
                  </v-col>
                  <v-col cols="6" sm="2">
                    <v-text-field v-model.number="f.qty" type="number" min="1" label="Qty" density="compact" hide-details />
                  </v-col>
                  <v-col cols="5" sm="3">
                    <v-text-field v-model.number="f.price" type="number" min="0" label="Harga" prefix="Rp" density="compact" hide-details />
                  </v-col>
                  <v-col cols="1" sm="1">
                    <v-btn icon="mdi-delete-outline" size="x-small" variant="text" color="error" @click="removeFeature(fi)" />
                  </v-col>
                </v-row>
              </div>
              <v-btn size="x-small" variant="text" color="primary" prepend-icon="mdi-plus" @click="addFeature(cat)">
                Fitur
              </v-btn>
              <v-btn v-if="hasCatFeatures(cat)" size="x-small" variant="tonal" color="warning" class="ml-2" prepend-icon="mdi-file-move-outline" @click="renameCategory(cat)">
                Ganti Nama Kategori
              </v-btn>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>

        <v-divider class="my-4" />
        <div class="text-subtitle-2 font-weight-bold mb-2">Layanan Hosting &amp; Domain</div>
        <v-radio-group v-model="form.hostedBy" inline density="compact" hide-details>
          <v-radio v-for="h in HOSTED_BY" :key="h.value" :label="h.title" :value="h.value" />
        </v-radio-group>
        <v-row v-if="form.hostedBy === 'kita'" dense class="mt-2">
          <v-col cols="12" sm="6">
            <v-text-field v-model="form.hosting.provider" label="Provider (VPS/hosting/domain) *" prepend-inner-icon="mdi-server" />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field v-model="form.hosting.domain" label="Domain" prepend-inner-icon="mdi-web" />
          </v-col>
          <v-col cols="12" sm="8">
            <v-text-field v-model="form.hosting.spec" label="Spesifikasi (RAM, CPU, storage, periode)" prepend-inner-icon="mdi-chip" />
          </v-col>
          <v-col cols="12" sm="4">
            <v-text-field v-model.number="form.hosting.price" type="number" min="0" label="Harga / tahun *" prefix="Rp" prepend-inner-icon="mdi-cash" />
          </v-col>
        </v-row>

        <v-divider class="my-4" />
        <div class="text-subtitle-2 font-weight-bold mb-2">Pengaturan Pajak</div>
        <v-row dense>
          <v-col cols="12" sm="4">
            <v-text-field v-model.number="form.taxPercent" type="number" min="0" label="PPN (%)" suffix="%" prepend-inner-icon="mdi-percent" />
          </v-col>
        </v-row>

        <v-alert variant="tonal" color="primary" density="compact" class="mt-2" icon="mdi-cash-multiple">
          <div class="d-flex flex-wrap justify-space-between ga-3">
            <span>Subtotal: <b>{{ money(subtotal, currency) }}</b></span>
            <span>Total project: <b>{{ money(total, currency) }}</b></span>
          </div>
        </v-alert>
      </v-card-text>
      <v-divider />
      <v-card-actions class="px-5 py-3">
        <v-spacer />
        <v-btn variant="text" @click="close">Batal</v-btn>
        <v-btn color="primary" variant="elevated" @click="save">
          <v-icon start icon="mdi-content-save-outline" />
          Simpan Project
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { reactive, ref, computed, watch } from 'vue'
import { useStore } from 'vuex'
import { optionLabel } from '@/utils/options'
import { PROJECT_STATUS, PROJECT_TYPES, HOSTED_BY, templateFor } from '@/utils/projectPresets'
import { money } from '@/utils/format'

const blank = () => ({
  name: '', type: null, status: 'lead', mitraId: '', staffId: '',
  startDate: '', dueDate: '', description: '',
  features: [], hosting: { provider: '', spec: '', domain: '', price: 0 },
  hostedBy: 'mitra', discount: 0, taxPercent: 0
})

export default {
  name: 'ProjectDialog',
  props: {
    modelValue: { type: Boolean, default: false },
    project: { type: Object, default: null },
    presetMitraId: { type: String, default: '' }
  },
  emits: ['update:modelValue', 'save'],
  setup (props, { emit }) {
    const store = useStore()
    const form = reactive(blank())
    let seq = 0
    const openPanels = ref([])

    const rules = { required: v => !!(v && String(v).trim()) || 'Wajib diisi' }
    const isEdit = computed(() => !!props.project)
    const currency = computed(() => store.getters['settings/currency'])
    const mitraOptions = computed(() => [{ value: '', title: '— pilih mitra —', props: { disabled: true } }, ...store.getters['mitras/options']])
    const staffOptions = computed(() => [{ value: '', title: '— belum ditentukan —' }, ...store.getters['staff/options']])
    const statusOptions = computed(() => PROJECT_STATUS.map(s => ({ title: s.title, value: s.value })))
    const typeOptions = computed(() => PROJECT_TYPES.map(t => ({ title: t.title, value: t.value })))

    const staffName = computed(() => {
      const s = store.getters['staff/byId'](form.staffId)
      return s ? s.name : ''
    })

    const categories = computed(() => [...new Set((form.features || []).map(f => (f.category || 'Lainnya')))])
    const catItems = cat => (form.features || []).filter(f => (f.category || 'Lainnya') === cat && f.name)
    const catTotal = cat => catItems(cat).reduce((s, f) => s + (Number(f.price) || 0) * (Number(f.qty) || 1), 0)
    const hasCatFeatures = cat => (form.features || []).some(f => (f.category || 'Lainnya') === cat)
    const fCategory = f => f.category || 'Lainnya'

    const subtotal = computed(() =>
      (form.features || []).reduce((s, f) => s + (Number(f.price) || 0) * (Number(f.qty) || 1), 0) +
      (form.hostedBy === 'kita' ? Number(form.hosting.price) || 0 : 0))
    const discount = computed(() => Math.min(Number(form.discount) || 0, subtotal.value))
    const tax = computed(() => Math.round((subtotal.value - discount.value) * (Number(form.taxPercent) || 0) / 100))
    const total = computed(() => subtotal.value - discount.value + tax.value)

    watch(() => props.modelValue, open => {
      if (open) {
        Object.assign(form, blank())
        openPanels.value = []
        if (props.project) {
          Object.assign(form, {
            ...props.project,
            hosting: { provider: '', spec: '', domain: '', price: 0, ...(props.project.hosting || {}) },
            features: (props.project.features || []).map(f => ({ ...f, _key: 'f' + (++seq) }))
          })
        } else if (props.presetMitraId) {
          form.mitraId = props.presetMitraId
        }
      }
    })

    function loadTemplate () {
      if (!form.type) return
      const tpl = templateFor(form.type)
      const loaded = []
      tpl.forEach(cat => cat.items.forEach(item =>
        loaded.push({ category: cat.category, name: item.name, price: item.price, qty: 1, _key: 'f' + (++seq) })))
      form.features = loaded
      openPanels.value = [...categories.value]
      store.dispatch('ui/notify', 'Template fitur dimuat — silakan sesuaikan nama & harga.')
    }

    function addFeature (cat) {
      form.features.push({ category: cat, name: 'Fitur baru', price: 0, qty: 1, _key: 'f' + (++seq) })
    }
    function removeFeature (index) { form.features.splice(index, 1) }
    function newCategory () {
      const name = window.prompt('Nama kategori fitur:', 'Kategori Baru')
      if (!name || !name.trim()) return
      const cat = name.trim()
      if (categories.value.includes(cat)) return
      form.features.push({ category: cat, name: '', price: 0, qty: 1, _key: 'f' + (++seq) })
      openPanels.value = [...openPanels.value, cat]
    }
    function renameCategory (oldCat) {
      const name = window.prompt(`Ganti nama kategori "${oldCat}" menjadi:`, oldCat)
      if (!name || !name.trim() || name.trim() === oldCat) return
      const cat = name.trim()
      form.features.forEach(f => { if ((f.category || 'Lainnya') === oldCat) f.category = cat })
      openPanels.value = openPanels.value.filter(c => c !== oldCat)
    }

    function save () {
      if (!rules.required(form.name) || !form.type) return
      const features = (form.features || [])
        .filter(f => String(f.name || '').trim() && (Number(f.price) > 0 || Number(f.qty) >= 1))
        .map(f => ({
          category: (f.category || 'Lainnya').trim() || 'Lainnya',
          name: String(f.name).trim(),
          price: Math.max(0, Number(f.price) || 0),
          qty: Math.max(1, Number(f.qty) || 1)
        }))
      emit('save', {
        name: form.name.trim(),
        type: form.type,
        status: form.status,
        mitraId: form.mitraId || '',
        staffId: form.staffId || '',
        staffName: staffName.value,
        startDate: form.startDate || '',
        dueDate: form.dueDate || '',
        description: (form.description || '').trim(),
        features,
        hostedBy: form.hostedBy,
        hosting: { provider: form.hosting.provider, spec: form.hosting.spec, domain: form.hosting.domain, price: Math.max(0, Number(form.hosting.price) || 0) },
        discount: Math.max(0, Number(form.discount) || 0),
        taxPercent: Math.max(0, Number(form.taxPercent) || 0)
      })
      close()
    }

    function close () { emit('update:modelValue', false) }

    return {
      form, rules, isEdit, close, save,
      mitraOptions, staffOptions, statusOptions, typeOptions, currency,
      categories, catItems, catTotal, hasCatFeatures, fCategory, openPanels,
      subtotal, total, discount, tax,
      HOSTED_BY, optionLabel, money,
      loadTemplate, addFeature, removeFeature, newCategory, renameCategory
    }
  }
}
</script>
