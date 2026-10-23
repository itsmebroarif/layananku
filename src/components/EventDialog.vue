<template>
  <v-dialog :model-value="modelValue" max-width="620" persistent @update:model-value="close">
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between py-4 px-5">
        <span class="text-h6 font-weight-bold">{{ isEdit ? 'Edit Event' : 'Tambah Event' }}</span>
        <v-btn icon="mdi-close" variant="text" size="small" @click="close" />
      </v-card-title>
      <v-divider />
      <v-card-text class="px-5 py-4">
        <v-row dense>
          <v-col cols="12">
            <v-text-field v-model="form.title" label="Judul event *" :rules="[rules.required]" prepend-inner-icon="mdi-calendar-star" />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field v-model="form.date" label="Tanggal *" type="date" prepend-inner-icon="mdi-calendar" />
          </v-col>
          <v-col cols="12" sm="6">
            <v-select v-model="form.category" label="Kategori" :items="EVENT_CATEGORIES" item-title="title" item-value="value" prepend-inner-icon="mdi-label-outline">
              <template #item="{ item, props }">
                <v-list-item v-bind="props">
                  <template #prepend>
                    <v-avatar :color="item.raw.color" size="10" class="mr-3" />
                  </template>
                </v-list-item>
              </template>
            </v-select>
          </v-col>
          <v-col cols="12" class="pb-1">
            <v-switch v-model="form.allDay" label="Sepanjang hari" color="primary" density="compact" hide-details />
          </v-col>
          <template v-if="!form.allDay">
            <v-col cols="12" sm="6">
              <v-text-field v-model="form.startTime" label="Mulai" type="time" prepend-inner-icon="mdi-clock-start" />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field v-model="form.endTime" label="Selesai" type="time" prepend-inner-icon="mdi-clock-end" />
            </v-col>
          </template>
          <v-col cols="12">
            <v-select v-model="form.customerId" label="Terkait pelanggan (opsional)" :items="customerOptions" clearable prepend-inner-icon="mdi-account-outline" />
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
        <v-btn color="primary" variant="elevated" @click="save">
          <v-icon start icon="mdi-content-save-outline" />
          {{ isEdit ? 'Simpan Perubahan' : 'Tambah Event' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { reactive, ref, watch, computed } from 'vue'
import { useStore } from 'vuex'
import { EVENT_CATEGORIES } from '@/utils/options'
import { todayISO } from '@/utils/id'

const blank = {
  title: '', date: todayISO(), startTime: '09:00', endTime: '10:00',
  category: 'meeting', customerId: '', notes: '', allDay: false
}

export default {
  name: 'EventDialog',
  props: {
    modelValue: { type: Boolean, default: false },
    event: { type: Object, default: null },
    presetDate: { type: String, default: '' }
  },
  emits: ['update:modelValue', 'save'],
  setup (props, { emit }) {
    const store = useStore()
    const form = reactive({ ...blank })
    const rules = { required: v => !!(v && String(v).trim()) || 'Wajib diisi' }
    const isEdit = computed(() => !!props.event)
    const customerOptions = computed(() => store.getters['customers/options'])

    watch(() => props.modelValue, open => {
      if (open) {
        Object.assign(form, blank, props.event ? { ...props.event } : {})
        if (!props.event && props.presetDate) form.date = props.presetDate
      }
    })

    function close () { emit('update:modelValue', false) }

    function save () {
      if (!rules.required(form.title) || !form.date) return
      emit('save', {
        title: form.title.trim(),
        date: form.date,
        startTime: form.allDay ? '' : form.startTime,
        endTime: form.allDay ? '' : form.endTime,
        category: form.category,
        customerId: form.customerId || '',
        notes: (form.notes || '').trim(),
        allDay: !!form.allDay
      })
      close()
    }

    return { form, rules, isEdit, close, save, customerOptions, EVENT_CATEGORIES }
  }
}
</script>
