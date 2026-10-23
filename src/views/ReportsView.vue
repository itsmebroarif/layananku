<template>
  <div>
    <div class="d-flex flex-wrap justify-space-between align-center mb-4 ga-3">
      <div class="text-body-2 text-grey">Analisis penjualan, laba, dan aktivitas dukungan dalam rentang waktu yang Anda pilih.</div>
      <div class="d-flex gap-2">
        <v-btn variant="tonal" color="primary" prepend-icon="mdi-file-delimited-outline" @click="exportCsv">Ekspor CSV</v-btn>
        <v-btn variant="tonal" prepend-icon="mdi-printer" @click="printReport">Cetak</v-btn>
      </div>
    </div>

    <v-card border class="mb-4">
      <v-card-text class="py-3">
        <div class="d-flex flex-wrap gap-2 align-center">
          <v-chip-group v-model="preset" mandatory selected-class="text-primary">
            <v-chip value="today" filter variant="tonal">Hari Ini</v-chip>
            <v-chip value="7d" filter variant="tonal">7 Hari</v-chip>
            <v-chip value="30d" filter variant="tonal">30 Hari</v-chip>
            <v-chip value="month" filter variant="tonal">Bulan Ini</v-chip>
            <v-chip value="all" filter variant="tonal">Semua</v-chip>
            <v-chip value="custom" filter variant="tonal">Kustom</v-chip>
          </v-chip-group>
          <template v-if="preset === 'custom'">
            <v-text-field v-model="fromDate" type="date" label="Dari" style="max-width:180px" density="compact" />
            <v-text-field v-model="toDate" type="date" label="Sampai" style="max-width:180px" density="compact" />
          </template>
          <v-spacer />
          <span class="text-caption text-medium-emphasis">{{ rangeLabel }}</span>
        </div>
      </v-card-text>
    </v-card>

    <v-row dense class="mb-2">
      <v-col cols="6" md="3">
        <stat-card label="Omzet" :value="totals.revenue" format :currency="currency" icon="mdi-cash-multiple" color="primary" :sub="`${totals.count} transaksi`" />
      </v-col>
      <v-col cols="6" md="3">
        <stat-card label="Laba Kotor" :value="totals.profit" format :currency="currency" icon="mdi-trending-up" color="success" :sub="`Margin ${marginPct}%`" />
      </v-col>
      <v-col cols="6" md="3">
        <stat-card label="Rata-rata / Transaksi" :value="totals.avg" format :currency="currency" icon="mdi-chart-line" color="secondary" />
      </v-col>
      <v-col cols="6" md="3">
        <stat-card label="Item Terjual" :value="totals.items" icon="mdi-package-variant" color="accent" :sub="`${ticketsCreated} tiket dibuat`" />
      </v-col>
    </v-row>

    <v-row dense>
      <v-col cols="12" lg="7">
        <v-card border class="mb-4">
          <v-card-title class="py-3 px-4 text-subtitle-1 font-weight-bold">Penjualan Harian</v-card-title>
          <v-divider />
          <v-card-text v-if="daily.length">
            <div class="chart d-flex align-end" :style="{ height: chartHeight }">
              <div v-for="d in daily" :key="d.date" class="chart-col text-center">
                <div class="chart-bar-wrap d-flex align-end justify-center">
                  <div
                    class="chart-bar"
                    :style="{ height: barHeight(d.revenue) + '%', opacity: d.revenue ? 1 : .25 }"
                    :title="`${dateShort(d.date)}: ${money(d.revenue, currency)} (${d.count} trx)`"
                  />
                </div>
                <div class="text-caption text-medium-emphasis mt-1 chart-label">{{ d.label }}</div>
              </div>
            </div>
          </v-card-text>
          <empty-state v-else icon="mdi-chart-bar" title="Tidak ada transaksi pada rentang ini" size="40" />
        </v-card>

        <v-card border>
          <v-card-title class="py-3 px-4 text-subtitle-1 font-weight-bold">Produk Terlaris</v-card-title>
          <v-divider />
          <v-table v-if="topItems.length" density="compact">
            <thead>
              <tr>
                <th class="text-caption">Item</th>
                <th class="text-caption text-right">Qty</th>
                <th class="text-caption text-right">Omzet</th>
                <th class="text-caption text-right">Laba</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="i in topItems" :key="i.name">
                <td class="text-body-2">{{ i.name }}</td>
                <td class="text-right text-body-2 font-weight-medium">{{ i.qty }}</td>
                <td class="text-right text-body-2">{{ money(i.revenue, currency) }}</td>
                <td class="text-right text-caption text-success">{{ money(i.profit, currency) }}</td>
              </tr>
            </tbody>
          </v-table>
          <empty-state v-else icon="mdi-cart-off" title="Belum ada item terjual" size="40" />
        </v-card>
      </v-col>

      <v-col cols="12" lg="5">
        <v-card border class="mb-4">
          <v-card-title class="py-3 px-4 text-subtitle-1 font-weight-bold">Metode Pembayaran</v-card-title>
          <v-divider />
          <v-card-text v-if="payments.length" class="pt-4">
            <div v-for="p in payments" :key="p.method" class="mb-3">
              <div class="d-flex justify-space-between text-body-2 mb-1">
                <span>{{ p.label }}</span>
                <span class="font-weight-medium">{{ money(p.amount, currency) }} · {{ p.count }}×</span>
              </div>
              <v-progress-linear :model-value="p.pct" color="primary" rounded height="8" bg-color="grey-lighten-3" />
            </div>
          </v-card-text>
          <empty-state v-else icon="mdi-credit-card-off-outline" title="Tidak ada pembayaran" size="40" />
        </v-card>

        <v-card border class="mb-4">
          <v-card-title class="py-3 px-4 text-subtitle-1 font-weight-bold">Tiket pada Periode</v-card-title>
          <v-divider />
          <v-list density="compact">
            <v-list-item prepend-icon="mdi-plus-circle-outline" title="Tiket dibuat" :subtitle="`${ticketsCreated} tiket`" />
            <v-list-item prepend-icon="mdi-check-circle-outline" title="Tiket selesai" :subtitle="`${ticketsResolved} tiket`" />
            <v-list-item
              prepend-icon="mdi-clock-alert-outline"
              title="Belum selesai"
              :subtitle="`${ticketsStillOpen} tiket (termasuk lewat tenggat: ${overdueInRange})`"
            />
          </v-list>
        </v-card>

        <v-card border>
          <v-card-title class="py-3 px-4 text-subtitle-1 font-weight-bold">Pelanggan Teratas</v-card-title>
          <v-divider />
          <v-list v-if="topCustomers.length" density="compact">
            <v-list-item v-for="c in topCustomers" :key="c.id">
              <template #title>{{ c.name }}</template>
              <template #subtitle>{{ c.count }} transaksi · {{ money(c.total, currency) }}</template>
            </v-list-item>
          </v-list>
          <empty-state v-else icon="mdi-account-off-outline" title="Tidak ada transaksi pelanggan" size="40" />
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { useStore } from 'vuex'
import StatCard from '@/components/StatCard.vue'
import EmptyState from '@/components/EmptyState.vue'
import { money, dateShort, dateLong } from '@/utils/format'
import { todayISO } from '@/utils/id'
import { downloadCsv, csvDate, printHtml } from '@/utils/export'
import { PAYMENT_METHODS, optionLabel } from '@/utils/options'

export default {
  name: 'ReportsView',
  components: { StatCard, EmptyState },
  setup () {
    const store = useStore()
    const preset = ref('30d')
    const fromDate = ref('')
    const toDate = ref('')

    const currency = computed(() => store.getters['settings/currency'])

    function shiftDays (days) {
      const d = new Date()
      d.setDate(d.getDate() + days)
      return d.toISOString().slice(0, 10)
    }

    const range = computed(() => {
      const today = todayISO()
      switch (preset.value) {
        case 'today': return { from: today, to: today }
        case '7d': return { from: shiftDays(-6), to: today }
        case '30d': return { from: shiftDays(-29), to: today }
        case 'month': return { from: today.slice(0, 7) + '-01', to: today }
        case 'all': return { from: '', to: '' }
        default: return { from: fromDate.value, to: toDate.value }
      }
    })

    const rangeLabel = computed(() => {
      const { from, to } = range.value
      if (!from && !to) return 'Semua waktu'
      if (from === to) return dateLong(from)
      return `${from ? dateShort(from) : 'Awal'} — ${to ? dateShort(to) : 'Sekarang'}`
    })

    const transactions = computed(() => {
      const { from, to } = range.value
      return store.getters['transactions/byDateRange'](from, to)
    })

    const costOf = id => {
      const p = store.getters['catalog/byId'](id)
      return p ? Number(p.cost) || 0 : 0
    }

    const totals = computed(() => {
      let revenue = 0, profit = 0, items = 0
      transactions.value.forEach(t => {
        revenue += Number(t.total) || 0
        ;(t.items || []).forEach(i => {
          items += Number(i.qty) || 0
          profit += ((Number(i.price) || 0) - costOf(i.productId)) * (Number(i.qty) || 0)
        })
      })
      const count = transactions.value.length
      return {
        revenue,
        profit: Math.round(profit),
        items,
        count,
        avg: count ? Math.round(revenue / count) : 0
      }
    })

    const marginPct = computed(() => {
      if (!totals.value.revenue) return 0
      return Math.round((totals.value.profit / totals.value.revenue) * 100)
    })

    const daily = computed(() => {
      const map = {}
      const { from, to } = range.value
      transactions.value.forEach(t => {
        const d = String(t.createdAt || '').slice(0, 10)
        if (!map[d]) map[d] = { date: d, revenue: 0, count: 0 }
        map[d].revenue += Number(t.total) || 0
        map[d].count += 1
      })
      let list = Object.values(map).sort((a, b) => a.date.localeCompare(b.date))
      if (list.length && from && to) {
        const filled = []
        const start = new Date(`${from}T00:00:00`)
        const end = new Date(`${to}T00:00:00`)
        const maxPoints = 45
        const span = Math.round((end - start) / 86400000)
        if (span >= 0 && span < maxPoints) {
          for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const iso = d.toISOString().slice(0, 10)
            filled.push(map[iso] || { date: iso, revenue: 0, count: 0 })
          }
          list = filled
        }
      }
      return list.slice(-45).map(d => ({ ...d, label: d.date.slice(8, 10) + '/' + d.date.slice(5, 7) }))
    })

    const maxDaily = computed(() => Math.max(...daily.value.map(d => d.revenue), 1))
    const barHeight = v => Math.max(v > 0 ? 4 : 1, Math.round((v / maxDaily.value) * 100))
    const chartHeight = computed(() => (daily.value.length > 20 ? '150px' : '200px'))

    const topItems = computed(() => {
      const map = {}
      transactions.value.forEach(t => (t.items || []).forEach(i => {
        const key = i.productId || i.name
        if (!map[key]) map[key] = { name: i.name, qty: 0, revenue: 0, profit: 0 }
        map[key].qty += Number(i.qty) || 0
        map[key].revenue += (Number(i.price) || 0) * (Number(i.qty) || 0)
        map[key].profit += ((Number(i.price) || 0) - costOf(i.productId)) * (Number(i.qty) || 0)
      }))
      return Object.values(map).sort((a, b) => b.revenue - a.revenue).slice(0, 10)
    })

    const payments = computed(() => {
      const map = {}
      transactions.value.forEach(t => {
        const m = t.paymentMethod || 'cash'
        if (!map[m]) map[m] = { method: m, amount: 0, count: 0 }
        map[m].amount += Number(t.total) || 0
        map[m].count += 1
      })
      const total = totals.value.revenue || 1
      return Object.values(map)
        .map(p => ({ ...p, label: optionLabel(PAYMENT_METHODS, p.method), pct: Math.round((p.amount / total) * 100) }))
        .sort((a, b) => b.amount - a.amount)
    })

    const ticketsInRange = computed(() => {
      const { from, to } = range.value
      return store.getters['tickets/list'].filter(t => {
        const d = String(t.createdAt || '').slice(0, 10)
        return (!from || d >= from) && (!to || d <= to)
      })
    })
    const ticketsCreated = computed(() => ticketsInRange.value.length)
    const ticketsResolved = computed(() => ticketsInRange.value.filter(t => ['resolved', 'closed'].includes(t.status)).length)
    const ticketsStillOpen = computed(() => store.getters['tickets/openCount'])
    const overdueInRange = computed(() => store.getters['tickets/overdue'].length)

    const topCustomers = computed(() => {
      const map = {}
      transactions.value.forEach(t => {
        if (!t.customerId) return
        if (!map[t.customerId]) map[t.customerId] = { id: t.customerId, count: 0, total: 0 }
        map[t.customerId].count += 1
        map[t.customerId].total += Number(t.total) || 0
      })
      return Object.values(map)
        .sort((a, b) => b.total - a.total)
        .slice(0, 5)
        .map(c => {
          const cus = store.getters['customers/byId'](c.id)
          return { ...c, name: cus ? cus.name : '—' }
        })
    })

    watch(preset, v => {
      if (v === 'custom') {
        fromDate.value = shiftDays(-29)
        toDate.value = todayISO()
      }
    })

    function exportCsv () {
      const rows = [['Invoice', 'Tanggal', 'Pelanggan', 'Metode', 'Subtotal', 'Diskon', 'Pajak', 'Total', 'Laba']]
      transactions.value.forEach(t => {
        const profit = (t.items || []).reduce((s, i) => s + ((Number(i.price) || 0) - costOf(i.productId)) * (Number(i.qty) || 0), 0)
        const c = store.getters['customers/byId'](t.customerId)
        rows.push([
          t.invoice, t.createdAt, c ? c.name : 'Umum', optionLabel(PAYMENT_METHODS, t.paymentMethod),
          t.subtotal, t.discount, t.tax, t.total, Math.round(profit)
        ])
      })
      downloadCsv(`laporan-${range.value.from || 'semua'}_${range.value.to || csvDate()}.csv`, rows)
      store.dispatch('ui/notify', 'Laporan diekspor ke CSV.')
    }

    function esc (v) {
      return String(v == null ? '' : v).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))
    }

    function printReport () {
      const b = store.getters['settings/business']
      const rows = daily.value.map(d =>
        `<tr><td>${esc(dateShort(d.date))}</td><td class="r">${esc(d.count)}</td><td class="r">${esc(money(d.revenue, currency.value))}</td></tr>`
      ).join('')
      const items = topItems.value.map(i =>
        `<tr><td>${esc(i.name)}</td><td class="r">${esc(i.qty)}</td><td class="r">${esc(money(i.revenue, currency.value))}</td><td class="r">${esc(money(i.profit, currency.value))}</td></tr>`
      ).join('')
      const html = `<div style="font-family:Arial,sans-serif;font-size:12px;color:#000">
        <div style="text-align:center">
          <h2 style="margin:0">${esc(b.businessName)}</h2>
          <div>${esc(b.address)} · ${esc(b.phone)}</div>
          <h3 style="margin:8px 0 2px">Laporan Penjualan</h3>
          <div>${esc(rangeLabel.value)} — dicetak ${esc(new Date().toLocaleString('id-ID'))}</div>
        </div><hr>
        <table style="width:100%;border-collapse:collapse;margin-bottom:10px">
          <tr>
            <td>Omzet: <b>${esc(money(totals.value.revenue, currency.value))}</b></td>
            <td>Laba kotor: <b>${esc(money(totals.value.profit, currency.value))}</b> (${marginPct.value}%)</td>
            <td>Transaksi: <b>${esc(totals.value.count)}</b></td>
            <td>Item terjual: <b>${esc(totals.value.items)}</b></td>
          </tr>
        </table>
        <h4>Penjualan Harian</h4>
        <table style="width:100%;border-collapse:collapse" border="1" cellpadding="3">
          <thead><tr><th>Tanggal</th><th class="r">Transaksi</th><th class="r">Omzet</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <h4>Produk Terlaris</h4>
        <table style="width:100%;border-collapse:collapse" border="1" cellpadding="3">
          <thead><tr><th>Item</th><th class="r">Qty</th><th class="r">Omzet</th><th class="r">Laba</th></tr></thead>
          <tbody>${items}</tbody>
        </table>`
      printHtml(html, `Laporan ${b.businessName}`)
    }

    return {
      preset, fromDate, toDate, range, rangeLabel, currency,
      totals, marginPct, daily, chartHeight, barHeight,
      topItems, payments, ticketsCreated, ticketsResolved, ticketsStillOpen, overdueInRange, topCustomers,
      exportCsv, printReport, money, dateShort
    }
  }
}
</script>
<style scoped>
.chart { gap: 3px; }
.chart-col { flex: 1 1 0; min-width: 0; }
.chart-bar-wrap { height: 100%; }
.chart-bar { width: 100%; max-width: 26px; background: #1976D2; border-radius: 4px 4px 0 0; min-height: 3px; }
.chart-label { font-size: 9px; white-space: nowrap; overflow: hidden; }
</style>
