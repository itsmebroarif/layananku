<template>
  <v-dialog :model-value="modelValue" max-width="840" persistent @update:model-value="close">
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between py-4 px-5">
        <div class="d-flex align-center gap-2">
          <span class="text-h6 font-weight-bold">{{ isEdit ? 'Edit Tiket' : 'Buat Tiket Baru' }}</span>
          <v-chip v-if="isEdit" size="small" variant="tonal" color="primary">{{ form.code }}</v-chip>
        </div>
        <v-btn icon="mdi-close" variant="text" size="small" @click="close" />
      </v-card-title>
      <v-divider />
      <v-card-text class="px-5 py-4">
        <v-row dense>
          <v-col cols="12" sm="6">
            <v-select
              v-model="form.customerId"
              label="Pelanggan *"
              :items="customerOptions"
              :rules="[rules.required]"
              prepend-inner-icon="mdi-account-group-outline"
            />
          </v-col>
          <v-col cols="12" sm="6">
            <v-select v-model="form.channel" label="Kanal Masuk" :items="channelOptions" prepend-inner-icon="mdi-source-branch" />
          </v-col>
          <v-col cols="12">
            <v-text-field v-model="form.subject" label="Subjek *" :rules="[rules.required]" prepend-inner-icon="mdi-subtitles-outline" />
          </v-col>
          <v-col cols="12">
            <v-textarea v-model="form.description" label="Deskripsi masalah / permintaan *" :rules="[rules.required]" rows="4" prepend-inner-icon="mdi-text" />
          </v-col>
          <v-col cols="12" sm="4">
            <v-select v-model="form.priority" label="Prioritas" :items="priorityOptions" prepend-inner-icon="mdi-flag-outline" />
          </v-col>
          <v-col cols="12" sm="4">
            <v-select v-model="form.status" label="Status" :items="statusOptions" prepend-inner-icon="mdi-progress-check" />
          </v-col>
          <v-col cols="12" sm="4">
            <v-text-field v-model="form.assignee" label="Penanggung Jawab" prepend-inner-icon="mdi-account-tie-outline" />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field v-model="form.dueDate" label="Tenggat (SLA)" type="date" prepend-inner-icon="mdi-calendar-clock" />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field v-model="form.resolution" label="Catatan penyelesaian" prepend-inner-icon="mdi-checkbook-outline" />
          </v-col>
        </v-row>
      </v-card-text>
      <v-divider />
      <v-card-actions class="px-5 py-3">
        <v-spacer />
        <v-btn variant="text" @click="close">Batal</v-btn>
        <v-btn color="primary" variant="elevated" @click="save">
          <v-icon start icon="mdi-content-save-outline" />
          {{ isEdit ? 'Simpan Perubahan' : 'Buat Tiket' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { reactive, ref, watch, computed } from 'vue'
import { useStore } from 'vuex'
import { TICKET_STATUS, TICKET_PRIORITY, TICKET_CHANNELS } from '@/utils/options'

const blank = {
  code: '', customerId: '', subject: '', description: '',
  priority: 'medium', status: 'open', channel: 'portal',
  assignee: '', dueDate: '', resolution: ''
}

export default {
  name: 'TicketDialog',
  props: {
    modelValue: { type: Boolean, default: false },
    ticket: { type: Object, default: null },
    presetCustomerId: { type: String, default: '' }
  },
  emits: ['update:modelValue', 'save'],
  setup (props, { emit }) {
    const store = useStore()
    const form = reactive({ ...blank })
    const rules = { required: v => !!(v && String(v).trim()) || 'Wajib diisi' }
    const isEdit = computed(() => !!props.ticket)

    const customerOptions = computed(() => store.getters['customers/options'])
    const statusOptions = computed(() => TICKET_STATUS.map(s => ({ title: s.title, value: s.value })))
    const priorityOptions = computed(() => TICKET_PRIORITY.map(p => ({ title: p.title, value: p.value })))
    const channelOptions = computed(() => TICKET_CHANNELS.map(c => ({ title: c.title, value: c.value })))

    watch(() => props.modelValue, open => {
      if (open) {
        Object.assign(form, blank, props.ticket ? { ...props.ticket } : {})
        if (!props.ticket && props.presetCustomerId) form.customerId = props.presetCustomerId
      }
    })

    function close () { emit('update:modelValue', false) }

    function save () {
      if (!rules.required(form.customerId) || !rules.required(form.subject) || !rules.required(form.description)) return
      emit('save', {
        customerId: form.customerId,
        subject: form.subject.trim(),
        description: form.description.trim(),
        priority: form.priority,
        status: form.status,
        channel: form.channel,
        assignee: form.assignee.trim(),
        dueDate: form.dueDate,
        resolution: (form.resolution || '').trim()
      })
      close()
    }

    return { form, rules, isEdit, close, save, customerOptions, statusOptions, priorityOptions, channelOptions }
  }
}
</script>
