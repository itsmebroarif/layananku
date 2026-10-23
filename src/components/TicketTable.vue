<template>
  <v-table v-if="items.length" density="compact">
    <thead>
      <tr>
        <th class="text-caption">Kode</th>
        <th class="text-caption">Subjek / Pelanggan</th>
        <th class="text-caption">Prioritas</th>
        <th class="text-caption">Status</th>
        <th class="text-caption">Tenggat</th>
        <th class="text-caption text-right">Aksi</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="t in items" :key="t.id">
        <td class="text-caption font-weight-bold text-primary" style="cursor:pointer" @click="$emit('detail', t)">{{ t.code }}</td>
        <td>
          <div class="text-body-2 font-weight-medium" style="cursor:pointer" @click="$emit('detail', t)">{{ t.subject }}</div>
          <div class="text-caption text-medium-emphasis">
            {{ customerName(t.customerId) }} · {{ channelLabel(t.channel) }}<span v-if="t.assignee"> · {{ t.assignee }}</span>
          </div>
        </td>
        <td><v-chip size="x-small" :color="priorityColor(t.priority)" variant="tonal">{{ priorityLabel(t.priority) }}</v-chip></td>
        <td>
          <v-select
            :model-value="t.status"
            :items="statuses"
            density="compact"
            variant="outlined"
            hide-details
            style="max-width:175px"
            @update:model-value="$emit('status', t, $event)"
          />
        </td>
        <td>
          <v-chip v-if="t.dueDate" size="x-small" :color="dueColor(t)" variant="tonal">{{ dateShort(t.dueDate) }}</v-chip>
          <span v-else class="text-caption text-grey">—</span>
        </td>
        <td class="text-right">
          <v-btn icon="mdi-eye" size="x-small" variant="text" @click="$emit('detail', t)" />
          <v-btn icon="mdi-pencil" size="x-small" variant="text" @click="$emit('edit', t)" />
          <v-btn icon="mdi-delete-outline" size="x-small" variant="text" color="error" @click="$emit('remove', t)" />
        </td>
      </tr>
    </tbody>
  </v-table>
  <empty-state v-else icon="mdi-lifebuoy" title="Tidak ada tiket pada filter ini" text="Ubah filter atau buat tiket baru." size="44" />
</template>

<script>
import { useStore } from 'vuex'
import EmptyState from '@/components/EmptyState.vue'
import { TICKET_STATUS, TICKET_PRIORITY, TICKET_CHANNELS, optionLabel, optionColor } from '@/utils/options'
import { dateShort } from '@/utils/format'

export default {
  name: 'TicketTable',
  components: { EmptyState },
  props: {
    items: { type: Array, default: () => [] }
  },
  emits: ['edit', 'detail', 'remove', 'status'],
  setup () {
    const store = useStore()
    return {
      customerName: id => {
        const c = store.getters['customers/byId'](id)
        return c ? c.name : 'Tanpa pelanggan'
      },
      statuses: TICKET_STATUS.map(s => ({ title: s.title, value: s.value })),
      statusLabel: v => optionLabel(TICKET_STATUS, v),
      priorityLabel: v => optionLabel(TICKET_PRIORITY, v),
      priorityColor: v => optionColor(TICKET_PRIORITY, v),
      channelLabel: v => optionLabel(TICKET_CHANNELS, v),
      dateShort,
      dueColor: t => {
        const today = new Date().toISOString().slice(0, 10)
        if (t.dueDate < today) return 'error'
        if (t.dueDate === today) return 'warning'
        return 'grey'
      }
    }
  }
}
</script>
