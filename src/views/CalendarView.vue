<template>
  <div>
    <div class="d-flex flex-wrap justify-space-between align-center mb-4 ga-3">
      <div class="d-flex align-center gap-2">
        <v-btn icon="mdi-chevron-left" variant="tonal" size="small" @click="shift(-1)" />
        <v-btn variant="text" size="small" @click="goToday">Hari Ini</v-btn>
        <v-btn icon="mdi-chevron-right" variant="tonal" size="small" @click="shift(1)" />
        <div class="text-h6 font-weight-bold ml-2">{{ monthLabel }}</div>
      </div>
      <v-btn color="primary" variant="elevated" prepend-icon="mdi-calendar-plus" @click="openForm()">Tambah Event</v-btn>
    </div>

    <v-row dense>
      <v-col cols="12" lg="8">
        <v-card border>
          <div class="calendar-grid calendar-head">
            <div v-for="d in weekdays" :key="d" class="cal-cell cal-head text-caption font-weight-bold text-medium-emphasis">
              {{ d }}
            </div>
          </div>
          <div class="calendar-grid">
            <div
              v-for="cell in cells"
              :key="cell.date"
              class="cal-cell"
              :class="{ 'cal-out': !cell.inMonth, 'cal-today': cell.date === today }"
              @click="openForm(null, cell.date)"
            >
              <div class="cal-daynum text-caption" :class="cell.date === today ? 'font-weight-bold text-primary' : ''">
                {{ cell.day }}
              </div>
              <div class="cal-events">
                <div
                  v-for="e in cell.events.slice(0, 2)"
                  :key="e.id"
                  class="cal-event"
                  :style="{ background: categoryHex(e.category) }"
                  :title="e.title"
                  @click.stop="openForm(e)"
                >
                  <span v-if="e.startTime" class="cal-time">{{ e.startTime }}</span>
                  {{ e.title }}
                </div>
                <div v-if="cell.events.length > 2" class="text-caption text-medium-emphasis ml-1 mt-1">
                  +{{ cell.events.length - 2 }} lagi
                </div>
              </div>
            </div>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" lg="4">
        <v-card class="mb-4" border>
          <v-card-title class="py-3 px-4 text-subtitle-1 font-weight-bold">Agenda Hari Ini</v-card-title>
          <v-divider />
          <v-list v-if="todayEvents.length" density="compact" lines="two">
            <v-list-item
              v-for="e in todayEvents"
              :key="e.id"
              :title="e.title"
              :subtitle="e.allDay ? 'Sepanjang hari' : `${e.startTime || ''} – ${e.endTime || ''}`"
              @click="openForm(e)"
            >
              <template #prepend>
                <v-avatar :color="categoryColor(e.category)" size="10" class="mr-3 mt-2" />
              </template>
            </v-list-item>
          </v-list>
          <empty-state v-else icon="mdi-calendar-check-outline" title="Tidak ada agenda hari ini" size="40" />
        </v-card>

        <v-card border>
          <v-card-title class="py-3 px-4 text-subtitle-1 font-weight-bold">Agenda Mendatang</v-card-title>
          <v-divider />
          <v-list v-if="upcoming.length" density="compact" lines="two">
            <v-list-item
              v-for="e in upcoming.slice(0, 8)"
              :key="e.id"
              :title="e.title"
              :subtitle="`${dateShort(e.date)}${e.startTime ? ' · ' + e.startTime : ' · Sepanjang hari'}`"
              @click="openForm(e)"
            >
              <template #prepend>
                <v-avatar :color="categoryColor(e.category)" size="10" class="mr-3 mt-2" />
              </template>
              <template #append>
                <v-btn icon="mdi-delete-outline" size="x-small" variant="text" color="error" @click.stop="removeEvent(e)" />
              </template>
            </v-list-item>
          </v-list>
          <empty-state v-else icon="mdi-calendar-blank-outline" title="Belum ada agenda" size="40" />
        </v-card>

        <v-card class="mt-4" border>
          <v-card-title class="py-3 px-4 text-subtitle-1 font-weight-bold">Kategori</v-card-title>
          <v-card-text class="pt-0">
            <div v-for="c in EVENT_CATEGORIES" :key="c.value" class="d-flex align-center mb-1">
              <v-avatar :color="c.color" size="10" class="mr-2" />
              <span class="text-body-2">{{ c.title }}</span>
              <v-spacer />
              <span class="text-caption text-medium-emphasis">{{ countByCategory(c.value) }}</span>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <event-dialog v-model="dialog" :event="editing" :preset-date="presetDate" @save="saveEvent" />
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import EventDialog from '@/components/EventDialog.vue'
import EmptyState from '@/components/EmptyState.vue'
import { EVENT_CATEGORIES, optionColor } from '@/utils/options'
import { dateShort } from '@/utils/format'
import { todayISO } from '@/utils/id'

const HEX = { primary: '#1976D2', secondary: '#00897B', error: '#D32F2F', warning: '#ED6C02', success: '#2E7D32', purple: '#7E57C2', grey: '#757575' }

export default {
  name: 'CalendarView',
  components: { EventDialog, EmptyState },
  setup () {
    const store = useStore()
    const route = useRoute()

    const cursor = ref(new Date())
    const dialog = ref(false)
    const editing = ref(null)
    const presetDate = ref('')
    const today = todayISO()


    const weekdays = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']
    const monthLabel = computed(() => cursor.value.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }))

    const cells = computed(() => {
      const y = cursor.value.getFullYear()
      const m = cursor.value.getMonth()
      const first = new Date(y, m, 1)
      const offset = (first.getDay() + 6) % 7
      const daysInMonth = new Date(y, m + 1, 0).getDate()
      const total = Math.ceil((offset + daysInMonth) / 7) * 7
      const list = []
      for (let i = 0; i < total; i++) {
        const d = new Date(y, m, i - offset + 1)
        const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
        list.push({
          date: iso,
          day: d.getDate(),
          inMonth: d.getMonth() === m,
          events: store.getters['events/byDate'](iso).sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''))
        })
      }
      return list
    })

    const todayEvents = computed(() => store.getters['events/todayEvents'])
    const upcoming = computed(() => store.getters['events/upcoming'])
    const events = computed(() => store.getters['events/list'])

    watch(() => route.query.new, v => {
      if (v) openForm(null, route.query.date || todayISO())
    })

    function shift (dir) {
      const d = new Date(cursor.value)
      d.setMonth(d.getMonth() + dir)
      cursor.value = d
    }
    function goToday () { cursor.value = new Date() }
    function openForm (event = null, date = '') {
      editing.value = event
      presetDate.value = date || ''
      dialog.value = true
    }
    function saveEvent (data) {
      if (editing.value) {
        store.commit('events/UPDATE', { id: editing.value.id, data })
        store.dispatch('ui/notify', 'Event diperbarui.')
      } else {
        store.commit('events/ADD', data)
        store.dispatch('ui/notify', 'Event ditambahkan.')
        if (data.date) {
          const d = new Date(`${data.date}T00:00:00`)
          if (!isNaN(d.getTime())) cursor.value = d
        }
      }
    }
    function removeEvent (e) {
      if (window.confirm(`Hapus event "${e.title}"?`)) {
        store.commit('events/REMOVE', e.id)
        store.dispatch('ui/notify', { text: 'Event dihapus.', color: 'error' })
      }
    }
    const categoryColor = v => optionColor(EVENT_CATEGORIES, v)
    const categoryHex = v => HEX[optionColor(EVENT_CATEGORIES, v)] || HEX.grey
    const countByCategory = v => events.value.filter(e => e.category === v).length

    return {
      cursor, dialog, editing, presetDate, today, weekdays, monthLabel, cells,
      todayEvents, upcoming, events, EVENT_CATEGORIES,
      shift, goToday, openForm, saveEvent, removeEvent, categoryColor, categoryHex, countByCategory,
      dateShort
    }
  }
}
</script>

<style scoped>
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
}
.calendar-head {
  border-bottom: 1px solid rgba(0,0,0,.12);
}
.cal-cell {
  min-height: 96px;
  border-right: 1px solid rgba(0,0,0,.08);
  border-bottom: 1px solid rgba(0,0,0,.08);
  padding: 5px 6px;
  cursor: pointer;
  transition: background .12s ease;
}
.cal-cell:nth-child(7n) { border-right: 0; }
.cal-cell:hover { background: rgba(25,118,210,.05); }
.cal-head {
  min-height: unset;
  padding: 8px 6px;
  text-align: center;
  cursor: default;
  background: #fafafa;
}
.cal-head:hover { background: #fafafa; }
.cal-out { background: #fcfcfc; color: #9e9e9e; }
.cal-today { background: rgba(25,118,210,.08); }
.cal-daynum { text-align: right; }
.cal-event {
  color: #fff;
  font-size: 10.5px;
  line-height: 1.25;
  border-radius: 4px;
  padding: 2px 4px;
  margin-bottom: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.cal-time { font-weight: 700; margin-right: 3px; }
@media (max-width: 600px) {
  .cal-cell { min-height: 64px; padding: 3px; }
  .cal-event { font-size: 9px; }
  .cal-daynum { font-size: 10px; }
}
</style>
