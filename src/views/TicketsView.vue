<template>
  <div>
    <div class="d-flex flex-wrap justify-space-between align-center mb-4 ga-3">
      <div class="text-body-2 text-grey">Kelola seluruh permintaan dukungan pelanggan dari kanal apa pun dalam satu antrean.</div>
      <div class="d-flex gap-2">
        <v-btn variant="tonal" prepend-icon="mdi-file-delimited-outline" @click="exportCsv">Ekspor CSV</v-btn>
        <v-btn color="primary" variant="elevated" prepend-icon="mdi-plus" @click="openForm()">Buat Tiket</v-btn>
      </div>
    </div>

    <v-row dense class="mb-4">
      <v-col cols="6" md="3">
        <stat-card label="Total Tiket" :value="totalCount" icon="mdi-inbox-full-outline" color="primary" />
      </v-col>
      <v-col cols="6" md="3">
        <stat-card label="Sedang Ditangani" :value="openCount" icon="mdi-progress-clock" color="warning" />
      </v-col>
      <v-col cols="6" md="3">
        <stat-card label="Lewat Tenggat" :value="overdue.length" icon="mdi-alert-clock-outline" color="error" />
      </v-col>
      <v-col cols="6" md="3">
        <stat-card label="Selesai" :value="resolvedCount" icon="mdi-check-circle-outline" color="success" />
      </v-col>
    </v-row>

    <v-card border>
      <v-card-text class="py-3">
        <div class="d-flex flex-wrap gap-2">
          <v-text-field v-model="search" placeholder="Cari kode, subjek, pelanggan…" prepend-inner-icon="mdi-magnify" style="max-width:320px" clearable />
          <v-select v-model="filterPriority" :items="priorityFilter" label="Prioritas" style="max-width:170px" clearable />
          <v-select v-model="filterAssignee" :items="assigneeOptions" label="Penanggung jawab" style="max-width:190px" clearable />
        </div>
        <v-tabs v-model="tab" color="primary" density="compact" class="mt-1" hide-slider>
          <v-tab value="all">Semua ({{ totalCount }})</v-tab>
          <v-tab value="active">Aktif ({{ activeCount }})</v-tab>
          <v-tab value="waiting">Menunggu ({{ waitingCount }})</v-tab>
          <v-tab value="resolved">Selesai ({{ resolvedCount }})</v-tab>
        </v-tabs>
      </v-card-text>

      <v-divider />

      <v-window v-model="tab">
        <v-window-item value="all">
          <ticket-table :items="filtered('all')" @edit="openForm" @detail="openDetail" @remove="confirmDelete" @status="setStatus" />
        </v-window-item>
        <v-window-item value="active">
          <ticket-table :items="filtered('active')" @edit="openForm" @detail="openDetail" @remove="confirmDelete" @status="setStatus" />
        </v-window-item>
        <v-window-item value="waiting">
          <ticket-table :items="filtered('waiting')" @edit="openForm" @detail="openDetail" @remove="confirmDelete" @status="setStatus" />
        </v-window-item>
        <v-window-item value="resolved">
          <ticket-table :items="filtered('resolved')" @edit="openForm" @detail="openDetail" @remove="confirmDelete" @status="setStatus" />
        </v-window-item>
      </v-window>
    </v-card>

    <ticket-dialog v-model="dialog" :ticket="editing" :preset-customer-id="presetCustomer" @save="saveTicket" />

    <v-dialog v-model="detail" max-width="720" scrollable>
      <v-card v-if="selected">
        <v-card-title class="d-flex align-center justify-space-between py-4 px-5">
          <div>
            <div class="d-flex align-center gap-2">
              <span class="text-h6 font-weight-bold">{{ selected.code }}</span>
              <v-chip size="x-small" :color="statusColor(selected.status)" variant="flat">{{ statusLabel(selected.status) }}</v-chip>
              <v-chip size="x-small" :color="priorityColor(selected.priority)" variant="tonal">{{ priorityLabel(selected.priority) }}</v-chip>
            </div>
            <div class="text-body-2 text-medium-emphasis mt-1">{{ selected.subject }}</div>
          </div>
          <v-btn icon="mdi-close" variant="text" size="small" @click="detail = false" />
        </v-card-title>
        <v-divider />
        <v-card-text style="max-height:65vh">
          <v-list density="compact" class="mb-3">
            <v-list-item prepend-icon="mdi-account-outline" :title="customerName(selected.customerId)" />
            <v-list-item prepend-icon="mdi-source-branch" :title="'Kanal: ' + channelLabel(selected.channel)" />
            <v-list-item prepend-icon="mdi-account-tie-outline" :title="'Penanggung jawab: ' + (selected.assignee || 'Belum ditentukan')" />
            <v-list-item prepend-icon="mdi-clock-outline" :title="'Dibuat ' + dateTime(selected.createdAt)" />
            <v-list-item
              prepend-icon="mdi-calendar-clock"
              :title="selected.dueDate ? 'Tenggat: ' + dateShort(selected.dueDate) : 'Tenggat tidak ditentukan'"
              :class="isOverdue(selected) ? 'text-error' : ''"
            />
          </v-list>

          <v-alert v-if="selected.resolution" density="compact" variant="tonal" color="success" class="mb-3" title="Penyelesaian">
            {{ selected.resolution }}
          </v-alert>

          <div class="text-subtitle-2 font-weight-bold mb-1">Deskripsi</div>
          <div class="text-body-2 mb-4" style="white-space:pre-wrap">{{ selected.description }}</div>

          <div class="text-subtitle-2 font-weight-bold mb-2">Catatan internal ({{ (selected.notes || []).length }})</div>
          <div v-for="n in selected.notes || []" :key="n.id" class="mb-2 pa-3 rounded" style="background:#f5f5f5">
            <div class="text-body-2" style="white-space:pre-wrap">{{ n.text }}</div>
            <div class="text-caption text-medium-emphasis mt-1">{{ n.author }} · {{ dateTime(n.createdAt) }}</div>
          </div>
          <div v-if="!(selected.notes || []).length" class="text-caption text-grey mb-3">Belum ada catatan.</div>

          <v-textarea v-model="newNote" label="Tambah catatan" rows="2" density="compact" class="mt-2" />
          <v-btn size="small" variant="tonal" color="primary" prepend-icon="mdi-plus" class="mt-2" :disabled="!newNote.trim()" @click="addNote">
            Tambah Catatan
          </v-btn>
        </v-card-text>
        <v-divider />
        <v-card-actions class="px-5 py-3">
          <v-btn variant="text" color="error" size="small" prepend-icon="mdi-delete-outline" @click="confirmDelete(selected)">Hapus</v-btn>
          <v-spacer />
          <v-select
            :model-value="selected.status"
            :items="statusFilter"
            label=""
            style="max-width:190px"
            hide-details
            density="compact"
            @update:model-value="v => setStatus(selected, v)"
          />
          <v-btn color="primary" variant="elevated" size="small" class="ml-2" @click="openForm(selected)">Edit</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import StatCard from '@/components/StatCard.vue'
import TicketDialog from '@/components/TicketDialog.vue'
import TicketTable from '@/components/TicketTable.vue'
import { TICKET_STATUS, TICKET_PRIORITY, TICKET_CHANNELS, optionLabel, optionColor } from '@/utils/options'
import { dateShort, dateTimeShort } from '@/utils/format'
import { downloadCsv, csvDate } from '@/utils/export'

export default {
  name: 'TicketsView',
  components: { StatCard, TicketDialog, TicketTable },
  setup () {
    const store = useStore()
    const route = useRoute()

    const search = ref('')
    const filterPriority = ref(null)
    const filterAssignee = ref(null)
    const tab = ref('all')
    const dialog = ref(false)
    const editing = ref(null)
    const detail = ref(false)
    const selected = ref(null)
    const newNote = ref('')
    const presetCustomer = ref('')


    const tickets = computed(() => store.getters['tickets/list'])
    const totalCount = computed(() => store.getters['tickets/count'])
    const openCount = computed(() => store.getters['tickets/openCount'])
    const resolvedCount = computed(() => store.getters['tickets/resolvedCount'])
    const overdue = computed(() => store.getters['tickets/overdue'])
    const activeCount = computed(() => tickets.value.filter(t => ['open', 'in_progress'].includes(t.status)).length)
    const waitingCount = computed(() => tickets.value.filter(t => t.status === 'waiting').length)
    const statusFilter = TICKET_STATUS.map(s => ({ title: s.title, value: s.value }))
    const priorityFilter = TICKET_PRIORITY.map(p => ({ title: p.title, value: p.value }))
    const assigneeOptions = computed(() => [...new Set(tickets.value.map(t => t.assignee).filter(Boolean))])

    function filtered (group) {
      let list = tickets.value
      if (group === 'active') list = list.filter(t => ['open', 'in_progress'].includes(t.status))
      if (group === 'waiting') list = list.filter(t => t.status === 'waiting')
      if (group === 'resolved') list = list.filter(t => ['resolved', 'closed'].includes(t.status))
      const q = search.value.toLowerCase().trim()
      if (q) {
        list = list.filter(t => {
          const c = store.getters['customers/byId'](t.customerId)
          return [t.code, t.subject, t.description, t.assignee, c && c.name, c && c.company]
            .some(v => String(v || '').toLowerCase().includes(q))
        })
      }
      if (filterPriority.value) list = list.filter(t => t.priority === filterPriority.value)
      if (filterAssignee.value) list = list.filter(t => t.assignee === filterAssignee.value)
      return [...list].sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''))
    }

    watch(() => route.query.new, v => {
      if (v) {
        presetCustomer.value = route.query.customer || ''
        openForm(null, true)
      }
    })

    function openForm (ticket = null) {
      editing.value = ticket
      detail.value = false
      dialog.value = true
    }
    function saveTicket (data) {
      if (editing.value) {
        store.commit('tickets/UPDATE', { id: editing.value.id, data })
        store.dispatch('ui/notify', 'Tiket diperbarui.')
        if (selected.value && selected.value.id === editing.value.id) selected.value = store.getters['tickets/byId'](editing.value.id)
      } else {
        store.commit('tickets/ADD', data)
        store.dispatch('ui/notify', 'Tiket baru dibuat.')
      }
      presetCustomer.value = ''
    }
    function setStatus (ticket, status) {
      store.commit('tickets/SET_STATUS', { id: ticket.id, status })
      store.dispatch('ui/notify', `${ticket.code} → ${optionLabel(TICKET_STATUS, status)}`)
      if (selected.value && selected.value.id === ticket.id) selected.value = store.getters['tickets/byId'](ticket.id)
    }
    function confirmDelete (t) {
      if (window.confirm(`Hapus tiket ${t.code} — "${t.subject}"?`)) {
        store.commit('tickets/REMOVE', t.id)
        detail.value = false
        store.dispatch('ui/notify', { text: 'Tiket dihapus.', color: 'error' })
      }
    }
    function openDetail (t) { selected.value = t; newNote.value = ''; detail.value = true }
    function addNote () {
      if (!newNote.value.trim()) return
      store.commit('tickets/ADD_NOTE', { id: selected.value.id, text: newNote.value.trim(), author: selected.value.assignee || 'Agent' })
      selected.value = store.getters['tickets/byId'](selected.value.id)
      newNote.value = ''
      store.dispatch('ui/notify', 'Catatan ditambahkan.')
    }
    const isOverdue = t => t.dueDate && t.dueDate < new Date().toISOString().slice(0, 10) && !['resolved', 'closed'].includes(t.status)

    function exportCsv () {
      const rows = [['Kode', 'Subjek', 'Pelanggan', 'Kanal', 'Prioritas', 'Status', 'Penanggung Jawab', 'Tenggat', 'Dibuat']]
      tickets.value.forEach(t => {
        const c = store.getters['customers/byId'](t.customerId)
        rows.push([t.code, t.subject, c ? c.name : '', optionLabel(TICKET_CHANNELS, t.channel), optionLabel(TICKET_PRIORITY, t.priority), optionLabel(TICKET_STATUS, t.status), t.assignee || '', t.dueDate || '', t.createdAt])
      })
      downloadCsv(`tiket-${csvDate()}.csv`, rows)
      store.dispatch('ui/notify', 'Data tiket diekspor ke CSV.')
    }

    return {
      search, filterPriority, filterAssignee, tab, dialog, editing, detail, selected, newNote, presetCustomer,
      totalCount, openCount, resolvedCount, overdue, activeCount, waitingCount, statusFilter, priorityFilter, assigneeOptions, filtered,
      openForm, saveTicket, setStatus, confirmDelete, openDetail, addNote, isOverdue, exportCsv,
      statusLabel: v => optionLabel(TICKET_STATUS, v),
      statusColor: v => optionColor(TICKET_STATUS, v),
      priorityLabel: v => optionLabel(TICKET_PRIORITY, v),
      priorityColor: v => optionColor(TICKET_PRIORITY, v),
      channelLabel: v => optionLabel(TICKET_CHANNELS, v),
      customerName: id => {
        const c = store.getters['customers/byId'](id)
        return c ? c.name : 'Tanpa pelanggan'
      },
      dateShort, dateTime: dateTimeShort
    }
  }
}
</script>
