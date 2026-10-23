<template>
  <v-dialog :model-value="modelValue" max-width="720" persistent @update:model-value="close">
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between py-4 px-5">
        <span class="text-h6 font-weight-bold">{{ isEdit ? 'Edit Pelanggan' : 'Tambah Pelanggan' }}</span>
        <v-btn icon="mdi-close" variant="text" size="small" @click="close" />
      </v-card-title>
      <v-divider />
      <v-card-text class="px-5 py-4">
        <v-row dense>
          <v-col cols="12" sm="6">
            <v-text-field v-model="form.name" label="Nama *" :rules="[rules.required]" prepend-inner-icon="mdi-account-outline" />
          </v-col>
          <v-col cols="12" sm="6">
            <v-select v-model="form.type" label="Jenis" :items="CUSTOMER_TYPES" prepend-inner-icon="mdi-domain" />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field v-model="form.company" label="Nama Usaha / Instansi" prepend-inner-icon="mdi-office-building-outline" />
          </v-col>
          <v-col cols="12" sm="6">
            <v-select v-model="form.category" label="Kategori" :items="CUSTOMER_CATEGORIES" prepend-inner-icon="mdi-tag-outline" />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field v-model="form.email" label="Email" type="email" prepend-inner-icon="mdi-email-outline" />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field v-model="form.phone" label="Telepon / HP" prepend-inner-icon="mdi-phone-outline" />
          </v-col>
          <v-col cols="12">
            <v-text-field v-model="form.address" label="Alamat" prepend-inner-icon="mdi-map-marker-outline" />
          </v-col>
          <v-col cols="12" sm="6">
            <v-select v-model="form.status" label="Status" :items="CUSTOMER_STATUS" item-title="title" item-value="value">
              <template #item="{ item, props }">
                <v-list-item v-bind="props" :prepend-avatar="undefined">
                  <template #prepend>
                    <v-avatar :color="item.raw.color" size="10" class="mr-3" />
                  </template>
                </v-list-item>
              </template>
            </v-select>
          </v-col>
          <v-col cols="12">
            <v-textarea v-model="form.notes" label="Catatan" rows="3" prepend-inner-icon="mdi-note-text-outline" />
          </v-col>
        </v-row>
      </v-card-text>
      <v-divider />
      <v-card-actions class="px-5 py-3">
        <v-spacer />
        <v-btn variant="text" @click="close">Batal</v-btn>
        <v-btn color="primary" variant="elevated" :loading="saving" @click="save">
          <v-icon start icon="mdi-content-save-outline" />
          {{ isEdit ? 'Simpan Perubahan' : 'Tambah' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { reactive, ref, watch, computed } from 'vue'
import { CUSTOMER_TYPES, CUSTOMER_CATEGORIES, CUSTOMER_STATUS } from '@/utils/options'

const blank = {
  name: '', company: '', type: 'personal', category: 'Umum',
  email: '', phone: '', address: '', status: 'prospect', notes: ''
}

export default {
  name: 'CustomerDialog',
  props: {
    modelValue: { type: Boolean, default: false },
    customer: { type: Object, default: null }
  },
  emits: ['update:modelValue', 'save'],
  setup (props, { emit }) {
    const form = reactive({ ...blank })
    const saving = ref(false)
    const rules = { required: v => !!(v && String(v).trim()) || 'Wajib diisi' }
    const isEdit = computed(() => !!props.customer)

    watch(() => props.modelValue, open => {
      if (open) Object.assign(form, blank, props.customer ? { ...props.customer } : {})
      saving.value = false
    })

    function close () { emit('update:modelValue', false) }

    async function save () {
      if (!rules.required(form.name)) return
      saving.value = true
      emit('save', { ...form, name: form.name.trim() })
      saving.value = false
      close()
    }

    return { form, saving, rules, isEdit, close, save, CUSTOMER_TYPES, CUSTOMER_CATEGORIES, CUSTOMER_STATUS }
  }
}
</script>
