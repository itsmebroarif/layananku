<template>
  <v-dialog :model-value="modelValue" max-width="720" persistent @update:model-value="close">
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between py-4 px-5">
        <span class="text-h6 font-weight-bold">{{ isEdit ? 'Edit Item Katalog' : 'Tambah Item Katalog' }}</span>
        <v-btn icon="mdi-close" variant="text" size="small" @click="close" />
      </v-card-title>
      <v-divider />
      <v-card-text class="px-5 py-4">
        <v-row dense>
          <v-col cols="12" sm="6">
            <v-select v-model="form.type" label="Jenis *" :items="PRODUCT_TYPES" prepend-inner-icon="mdi-shape-outline" @update:model-value="onTypeChange" />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field v-model="form.sku" label="Kode / SKU" prepend-inner-icon="mdi-barcode" />
          </v-col>
          <v-col cols="12">
            <v-text-field v-model="form.name" label="Nama *" :rules="[rules.required]" prepend-inner-icon="mdi-tag-outline" />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field v-model="form.category" label="Kategori" list="category-list" prepend-inner-icon="mdi-folder-outline" />
            <datalist id="category-list">
              <option v-for="c in categories" :key="c" :value="c" />
            </datalist>
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field v-model="form.unit" label="Satuan" placeholder="pcs / unit / jam" prepend-inner-icon="mdi-ruler" />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field v-model.number="form.price" label="Harga Jual *" type="number" min="0" prefix="Rp" prepend-inner-icon="mdi-cash" />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field v-model.number="form.cost" label="Harga Pokok / Modal" type="number" min="0" prefix="Rp" prepend-inner-icon="mdi-cash-minus" />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field
              v-if="form.type === 'product'"
              v-model.number="form.stock"
              label="Stok"
              type="number"
              min="0"
              prepend-inner-icon="mdi-package-variant"
            />
          </v-col>
          <v-col cols="12" sm="6" class="d-flex align-center">
            <v-switch v-model="form.active" label="Aktif dijual" color="success" density="compact" hide-details />
          </v-col>
          <v-col cols="12">
            <v-textarea v-model="form.description" label="Deskripsi" rows="3" prepend-inner-icon="mdi-text" />
          </v-col>
        </v-row>

        <v-alert v-if="isEdit && form.type === 'product'" density="compact" variant="tonal" color="info" class="mt-2" icon="mdi-information-outline">
          Penyesuaian stok dilakukan melalui halaman Produk &amp; Jasa (aksi "Stok") atau otomatis dari transaksi POS.
        </v-alert>
      </v-card-text>
      <v-divider />
      <v-card-actions class="px-5 py-3">
        <v-spacer />
        <v-btn variant="text" @click="close">Batal</v-btn>
        <v-btn color="primary" variant="elevated" @click="save">
          <v-icon start icon="mdi-content-save-outline" />
          {{ isEdit ? 'Simpan Perubahan' : 'Tambah' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { reactive, ref, watch, computed } from 'vue'
import { PRODUCT_TYPES } from '@/utils/options'

const blank = {
  type: 'product', sku: '', name: '', category: '', unit: 'pcs',
  price: 0, cost: 0, stock: 0, active: true, description: ''
}

export default {
  name: 'ProductDialog',
  props: {
    modelValue: { type: Boolean, default: false },
    item: { type: Object, default: null },
    categories: { type: Array, default: () => [] }
  },
  emits: ['update:modelValue', 'save'],
  setup (props, { emit }) {
    const form = reactive({ ...blank })
    const rules = { required: v => !!(v && String(v).trim()) || 'Wajib diisi' }
    const isEdit = computed(() => !!props.item)

    watch(() => props.modelValue, open => {
      if (open) Object.assign(form, blank, props.item ? { ...props.item } : {})
    })

    function onTypeChange (val) {
      if (val === 'service') form.stock = 0
      if (val === 'product' && !form.unit) form.unit = 'pcs'
    }

    function close () { emit('update:modelValue', false) }

    function save () {
      if (!rules.required(form.name)) return
      emit('save', {
        type: form.type,
        sku: (form.sku || '').trim() || (form.type === 'product' ? 'PRD-' : 'JSA-') + Date.now().toString().slice(-5),
        name: form.name.trim(),
        category: (form.category || '').trim() || 'Umum',
        unit: (form.unit || '').trim() || 'unit',
        price: Math.max(0, Number(form.price) || 0),
        cost: Math.max(0, Number(form.cost) || 0),
        stock: form.type === 'product' ? Math.max(0, Number(form.stock) || 0) : 0,
        active: !!form.active,
        description: (form.description || '').trim()
      })
      close()
    }

    return { form, rules, isEdit, close, save, onTypeChange, PRODUCT_TYPES }
  }
}
</script>
