<template>
  <div>
    <v-tabs v-model="tab" color="primary" density="comfortable" class="mb-4">
      <v-tab value="cashier" prepend-icon="mdi-cash-register">Kasir (POS)</v-tab>
      <v-tab value="history" prepend-icon="mdi-history">Riwayat Transaksi</v-tab>
    </v-tabs>

    <v-window v-model="tab">
      <!-- ============ KASIR ============ -->
      <v-window-item value="cashier">
        <v-row dense>
          <v-col cols="12" lg="8">
            <v-card border class="mb-4">
              <v-card-text class="py-3">
                <div class="d-flex flex-wrap gap-2 align-center">
                  <v-text-field v-model="search" placeholder="Cari produk / jasa, SKU…" prepend-inner-icon="mdi-magnify" clearable style="max-width:320px" />
                  <v-chip-group v-model="typeFilter" mandatory selected-class="text-primary">
                    <v-chip value="all" filter variant="tonal">Semua</v-chip>
                    <v-chip value="product" filter variant="tonal">Produk</v-chip>
                    <v-chip value="service" filter variant="tonal">Jasa</v-chip>
                  </v-chip-group>
                  <v-spacer />
                  <span class="text-caption text-medium-emphasis">{{ sellable.length }} item siap jual</span>
                </div>
              </v-card-text>
              <v-divider />
              <v-card-text class="pt-4">
                <v-row dense v-if="sellable.length">
                  <v-col v-for="p in sellable" :key="p.id" cols="6" sm="4" md="3">
                    <v-card
                      class="pos-item h-100 d-flex flex-column"
                      :class="{ 'pos-item--out': isOut(p) }"
                      border
                      hover
                      @click="!isOut(p) && addToCart(p)"
                    >
                      <v-card-text class="pa-3 d-flex flex-column flex-grow-1">
                        <div class="d-flex align-center justify-space-between">
                          <v-avatar :color="p.type === 'product' ? 'primary' : 'accent'" size="30" variant="tonal">
                            <v-icon :icon="p.type === 'product' ? 'mdi-cube' : 'mdi-tools'" size="16" />
                          </v-avatar>
                          <v-chip v-if="p.type === 'product'" size="x-small" :color="stockColor(p)" variant="tonal">
                            {{ p.stock }} {{ p.unit }}
                          </v-chip>
                        </div>
                        <div class="text-body-2 font-weight-medium mt-2 text-truncate-2">{{ p.name }}</div>
                        <div class="text-caption text-medium-emphasis">{{ p.sku }}</div>
                        <div class="mt-auto pt-2 font-weight-bold text-primary text-body-2">{{ money(p.price, currency) }}</div>
                      </v-card-text>
                      <v-card-actions class="pa-2 pt-0">
                        <v-btn block size="small" variant="tonal" color="primary" :disabled="isOut(p)" :prepend-icon="isOut(p) ? 'mdi-package-variant-remove' : 'mdi-cart-plus'">
                          {{ isOut(p) ? 'Stok habis' : 'Tambah' }}
                        </v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-col>
                </v-row>
                <empty-state v-else icon="mdi-magnify-close" title="Item tidak ditemukan" text="Ubah kata kunci atau kata kunci lain." />
              </v-card-text>
            </v-card>
          </v-col>

          <!-- KERANJANG -->
          <v-col cols="12" lg="4">
            <v-card border sticky class="pos-cart">
              <v-card-title class="py-3 px-4 d-flex align-center justify-space-between">
                <span class="text-subtitle-1 font-weight-bold">
                  <v-icon start icon="mdi-cart-outline" size="18" />
                  Keranjang
                </span>
                <v-btn v-if="cart.length" variant="text" size="x-small" color="error" @click="clearCart">Kosongkan</v-btn>
              </v-card-title>
              <v-divider />

              <div v-if="cart.length" class="pa-3" style="max-height:340px;overflow-y:auto">
                <div v-for="line in cart" :key="line.productId" class="d-flex align-center py-2" style="border-bottom:1px solid #eee">
                  <div class="flex-grow-1" style="min-width:0">
                    <div class="text-body-2 font-weight-medium text-truncate">{{ line.name }}</div>
                    <div class="text-caption text-medium-emphasis">{{ money(line.price, currency) }} / {{ line.unit || 'unit' }}</div>
                  </div>
                  <div class="d-flex align-center ga-1 mx-2">
                    <v-btn icon="mdi-minus" size="x-small" variant="tonal" @click="changeQty(line, -1)" />
                    <span class="text-body-2 font-weight-bold" style="min-width:24px;text-align:center">{{ line.qty }}</span>
                    <v-btn icon="mdi-plus" size="x-small" variant="tonal" :disabled="line.type === 'product' && line.qty >= line.maxStock" @click="changeQty(line, 1)" />
                  </div>
                  <div class="text-body-2 font-weight-bold" style="min-width:95px;text-align:right">
                    {{ money(line.price * line.qty, currency) }}
                  </div>
                  <v-btn icon="mdi-close" size="x-small" variant="text" color="error" @click="removeLine(line)" />
                </div>
              </div>

              <div v-else class="pa-6">
                <empty-state icon="mdi-cart-outline" title="Keranjang kosong" text="Klik item untuk menambahkannya." size="44" />
              </div>

              <template v-if="cart.length">
                <v-divider />
                <div class="pa-4">
                  <v-select v-model="customerId" :items="customerOptions" label="Pelanggan (opsional)" clearable density="compact" prepend-inner-icon="mdi-account-outline" />
                  <v-text-field v-model.number="orderDiscount" type="number" min="0" label="Diskon (Rp)" prepend-inner-icon="mdi-percent" class="mt-3" />

                  <div class="mt-3 text-body-2">
                    <div class="d-flex justify-space-between mb-1">
                      <span class="text-medium-emphasis">Subtotal</span>
                      <span>{{ money(subtotal, currency) }}</span>
                    </div>
                    <div class="d-flex justify-space-between mb-1" v-if="discount > 0">
                      <span class="text-medium-emphasis">Diskon</span>
                      <span class="text-error">-{{ money(discount, currency) }}</span>
                    </div>
                    <div class="d-flex justify-space-between mb-1">
                      <span class="text-medium-emphasis">Pajak ({{ taxRate }}%)</span>
                      <span>{{ money(tax, currency) }}</span>
                    </div>
                    <v-divider class="my-2" />
                    <div class="d-flex justify-space-between align-center">
                      <span class="font-weight-bold">TOTAL</span>
                      <span class="text-h6 font-weight-bold text-primary">{{ money(total, currency) }}</span>
                    </div>
                  </div>

                  <v-select v-model="paymentMethod" :items="paymentOptions" label="Metode pembayaran" class="mt-3" prepend-inner-icon="mdi-credit-card-outline" />
                  <v-text-field v-model.number="amountPaid" type="number" min="0" label="Uang diterima" prepend-inner-icon="mdi-cash" class="mt-3">
                    <template #append-inner>
                      <v-btn size="x-small" variant="tonal" color="primary" @click="payExact">Bayar Pas</v-btn>
                    </template>
                  </v-text-field>

                  <div class="d-flex justify-space-between align-center mt-3 pa-3 rounded" :style="{ background: change >= 0 ? '#e8f5e9' : '#ffebee' }">
                    <span class="text-body-2 font-weight-medium">Kembalian</span>
                    <span class="text-h6 font-weight-bold" :class="change >= 0 ? 'text-success' : 'text-error'">{{ money(Math.max(0, change), currency) }}</span>
                  </div>

                  <v-btn
                    block
                    size="large"
                    color="success"
                    class="mt-4"
                    prepend-icon="mdi-check-circle-outline"
                    :disabled="!canCheckout"
                    @click="checkout"
                  >
                    Proses Pembayaran
                  </v-btn>
                </div>
              </template>
            </v-card>
          </v-col>
        </v-row>
      </v-window-item>

      <!-- ============ RIWAYAT ============ -->
      <v-window-item value="history">
        <v-card border>
          <v-card-text class="py-3">
            <div class="d-flex flex-wrap gap-2">
              <v-text-field v-model="historySearch" placeholder="Cari no. invoice / pelanggan…" prepend-inner-icon="mdi-magnify" clearable style="max-width:320px" />
              <v-text-field v-model="fromDate" type="date" label="Dari tanggal" style="max-width:190px" />
              <v-text-field v-model="toDate" type="date" label="Sampai" style="max-width:190px" />
              <v-spacer />
              <v-btn variant="tonal" size="small" prepend-icon="mdi-file-delimited-outline" @click="exportHistoryCsv">Ekspor CSV</v-btn>
              <div class="d-flex align-center gap-2 ml-2">
                <span class="text-caption text-medium-emphasis">Total ditampilkan</span>
                <v-chip color="success" variant="tonal" size="small">{{ money(historyTotal, currency) }}</v-chip>
              </div>
            </div>
          </v-card-text>
          <v-divider />
          <v-table v-if="history.length" density="compact">
            <thead>
              <tr>
                <th class="text-caption">Invoice</th>
                <th class="text-caption">Waktu</th>
                <th class="text-caption">Pelanggan</th>
                <th class="text-caption">Item</th>
                <th class="text-caption">Pembayaran</th>
                <th class="text-caption text-right">Total</th>
                <th class="text-caption text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="t in history" :key="t.id">
                <td class="text-caption font-weight-bold text-primary">{{ t.invoice }}</td>
                <td class="text-caption">{{ dateTime(t.createdAt) }}</td>
                <td class="text-body-2">{{ customerName(t.customerId) }}</td>
                <td class="text-caption">{{ (t.items || []).length }} item · {{ totalQty(t) }} unit</td>
                <td><v-chip size="x-small" variant="tonal" color="info">{{ paymentLabel(t.paymentMethod) }}</v-chip></td>
                <td class="text-right text-body-2 font-weight-medium">{{ money(t.total, currency) }}</td>
                <td class="text-right">
                  <v-btn icon="mdi-receipt" size="x-small" variant="text" title="Lihat struk" @click="showReceipt(t)" />
                  <v-btn icon="mdi-delete-outline" size="x-small" variant="text" color="error" title="Hapus" @click="removeTransaction(t)" />
                </td>
              </tr>
            </tbody>
          </v-table>
          <empty-state v-else icon="mdi-receipt-variant" title="Belum ada transaksi" text="Transaksi yang diproses melalui POS akan tampil di sini." />
        </v-card>
      </v-window-item>
    </v-window>

    <!-- STRUK -->
    <v-dialog v-model="receipt" max-width="420">
      <v-card v-if="receiptData">
        <v-card-text class="pa-0">
          <div id="receipt-print" class="receipt pa-5">
            <div class="text-center">
              <div class="text-h6 font-weight-bold">{{ business.businessName }}</div>
              <div class="text-caption">{{ business.address }}</div>
              <div class="text-caption">{{ business.phone }} · {{ business.email }}</div>
            </div>
            <v-divider class="my-3" />
            <div class="text-caption d-flex justify-space-between">
              <span>{{ receiptData.invoice }}</span>
              <span>{{ dateTime(receiptData.createdAt) }}</span>
            </div>
            <div class="text-caption mb-2">Kasir: {{ receiptData.cashier || '-' }} · {{ customerName(receiptData.customerId) }}</div>
            <v-divider class="mb-2" />
            <div v-for="i in receiptData.items" :key="i.productId + i.name" class="text-body-2 mb-1">
              <div class="d-flex justify-space-between">
                <span class="text-truncate" style="max-width:65%">{{ i.name }}</span>
                <span class="font-weight-medium">{{ money(i.price * i.qty, currency) }}</span>
              </div>
              <div class="text-caption text-medium-emphasis">{{ i.qty }} × {{ money(i.price, currency) }}</div>
            </div>
            <v-divider class="my-2" />
            <div class="text-body-2">
              <div class="d-flex justify-space-between"><span>Subtotal</span><span>{{ money(receiptData.subtotal, currency) }}</span></div>
              <div v-if="receiptData.discount" class="d-flex justify-space-between"><span>Diskon</span><span>-{{ money(receiptData.discount, currency) }}</span></div>
              <div class="d-flex justify-space-between"><span>Pajak</span><span>{{ money(receiptData.tax, currency) }}</span></div>
              <div class="d-flex justify-space-between font-weight-bold text-h6 mt-1"><span>TOTAL</span><span>{{ money(receiptData.total, currency) }}</span></div>
              <div class="d-flex justify-space-between mt-1"><span>{{ paymentLabel(receiptData.paymentMethod) }}</span><span>{{ money(receiptData.amountPaid, currency) }}</span></div>
              <div class="d-flex justify-space-between"><span>Kembalian</span><span>{{ money(receiptData.change, currency) }}</span></div>
            </div>
            <v-divider class="my-3" />
            <div class="text-center text-caption">{{ business.receiptFooter }}</div>
          </div>
        </v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-btn variant="text" color="error" size="small" prepend-icon="mdi-close" @click="receipt = false">Tutup</v-btn>
          <v-spacer />
          <v-btn color="primary" variant="elevated" size="small" prepend-icon="mdi-printer" @click="printReceipt">Cetak Struk</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import EmptyState from '@/components/EmptyState.vue'
import { PAYMENT_METHODS, optionLabel } from '@/utils/options'
import { money, dateTimeShort } from '@/utils/format'
import { downloadCsv, csvDate } from '@/utils/export'

export default {
  name: 'PosView',
  components: { EmptyState },
  setup () {
    const store = useStore()

    const tab = ref('cashier')
    const search = ref('')
    const typeFilter = ref('all')
    const cart = ref([])
    const customerId = ref(null)
    const orderDiscount = ref(0)
    const paymentMethod = ref('cash')
    const amountPaid = ref(0)
    const historySearch = ref('')
    const fromDate = ref('')
    const toDate = ref('')
    const receipt = ref(false)
    const receiptData = ref(null)


    const currency = computed(() => store.getters['settings/currency'])
    const taxRate = computed(() => store.getters['settings/taxRate'])
    const business = computed(() => store.getters['settings/business'])
    const paymentOptions = PAYMENT_METHODS.map(p => ({ title: p.title, value: p.value }))
    const customerOptions = computed(() => store.getters['customers/options'])

    const sellable = computed(() => store.getters['catalog/activeItems']
      .filter(p => typeFilter.value === 'all' || p.type === typeFilter.value)
      .filter(p => {
        const q = search.value.toLowerCase().trim()
        if (!q) return true
        return [p.name, p.sku, p.category].some(v => String(v || '').toLowerCase().includes(q))
      }))

    const subtotal = computed(() => cart.value.reduce((sum, l) => sum + l.price * l.qty, 0))
    const discount = computed(() => Math.min(Math.max(0, Number(orderDiscount.value) || 0), subtotal.value))
    const taxable = computed(() => Math.max(0, subtotal.value - discount.value))
    const tax = computed(() => Math.round(taxable.value * (taxRate.value / 100)))
    const total = computed(() => taxable.value + tax.value)
    const change = computed(() => (Number(amountPaid.value) || 0) - total.value)
    const canCheckout = computed(() => cart.value.length > 0 && (Number(amountPaid.value) || 0) >= total.value)

    const history = computed(() => {
      let list = store.getters['transactions/sorted']
      const q = historySearch.value.toLowerCase().trim()
      if (q) {
        list = list.filter(t => {
          const c = store.getters['customers/byId'](t.customerId)
          return [t.invoice, c && c.name, c && c.company].some(v => String(v || '').toLowerCase().includes(q))
        })
      }
      if (fromDate.value) list = list.filter(t => String(t.createdAt).slice(0, 10) >= fromDate.value)
      if (toDate.value) list = list.filter(t => String(t.createdAt).slice(0, 10) <= toDate.value)
      return list
    })
    const historyTotal = computed(() => history.value.reduce((sum, t) => sum + (Number(t.total) || 0), 0))

    function isOut (p) {
      return p.type === 'product' && Number(p.stock) <= 0
    }
    function addToCart (p) {
      const line = cart.value.find(l => l.productId === p.id)
      if (line) {
        if (p.type === 'product' && line.qty >= p.stock) return
        line.qty += 1
      } else {
        cart.value.push({
          productId: p.id,
          name: p.name,
          price: Number(p.price) || 0,
          qty: 1,
          type: p.type,
          unit: p.unit,
          maxStock: Number(p.stock) || 0
        })
      }
      if (!amountPaid.value) amountPaid.value = 0
    }
    function changeQty (line, delta) {
      const next = line.qty + delta
      if (next <= 0) { removeLine(line); return }
      if (line.type === 'product' && next > line.maxStock) return
      line.qty = next
    }
    function removeLine (line) { cart.value = cart.value.filter(l => l.productId !== line.productId) }
    function clearCart () { cart.value = []; orderDiscount.value = 0; amountPaid.value = 0 }

    function checkout () {
      if (!canCheckout.value) return
      const items = cart.value.map(l => ({ productId: l.productId, name: l.name, price: l.price, qty: l.qty, unit: l.unit }))
      const payload = {
        items,
        subtotal: subtotal.value,
        discount: discount.value,
        tax: tax.value,
        total: total.value,
        paymentMethod: paymentMethod.value,
        amountPaid: Number(amountPaid.value) || 0,
        change: Math.max(0, change.value),
        customerId: customerId.value || '',
        cashier: 'Kasir'
      }
      store.commit('transactions/ADD', payload)
      items.forEach(i => {
        const item = store.getters['catalog/byId'](i.productId)
        if (item && item.type === 'product') store.commit('catalog/DECREASE_STOCK', { id: i.productId, qty: i.qty })
      })
      const created = store.getters['transactions/list'][0]
      store.dispatch('ui/notify', `Transaksi ${created.invoice} tersimpan.`)
      showReceipt(created)
      clearCart()
      customerId.value = null
    }

    function showReceipt (t) { receiptData.value = t; receipt.value = true }
    function payExact () { amountPaid.value = total.value }
    function restoreStock (t) {
      (t.items || []).forEach(i => {
        const item = store.getters['catalog/byId'](i.productId)
        if (item && item.type === 'product') store.commit('catalog/ADJUST_STOCK', { id: i.productId, delta: Number(i.qty) || 0 })
      })
    }
    function removeTransaction (t) {
      if (!window.confirm(`Hapus transaksi ${t.invoice}?`)) return
      const restore = window.confirm('Kembalikan stok produk pada transaksi ini ke katalog? (OK = ya, Cancel = stok tidak diubah)')
      if (restore) restoreStock(t)
      store.commit('transactions/REMOVE', t.id)
      store.dispatch('ui/notify', { text: `Transaksi ${t.invoice} dihapus.${restore ? ' Stok dikembalikan.' : ''}`, color: 'error' })
    }
    function exportHistoryCsv () {
      const rows = [['Invoice', 'Tanggal', 'Pelanggan', 'Item', 'Qty', 'Metode', 'Total']]
      history.value.forEach(t => {
        const c = store.getters['customers/byId'](t.customerId)
        ;(t.items || []).forEach(i => {
          rows.push([t.invoice, t.createdAt, c ? c.name : 'Umum', i.name, i.qty, paymentLabel(t.paymentMethod), (Number(i.price) || 0) * (Number(i.qty) || 0)])
        })
      })
      downloadCsv(`transaksi-${csvDate()}.csv`, rows)
      store.dispatch('ui/notify', 'Riwayat transaksi diekspor ke CSV.')
    }

    function printReceipt () {
      const t = receiptData.value
      if (!t) return
      const esc = v => String(v == null ? '' : v).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))
      const row = (left, right, cls = '') => `<div class="row ${cls}"><span>${left}</span><span>${right}</span></div>`
      const itemsHtml = (t.items || []).map(i =>
        `<div class="item"><div class="row bold"><span>${esc(i.name)}</span><span>${money(i.price * i.qty, currency.value)}</span></div>${row(`${i.qty} × ${money(i.price, currency.value)}`, '')}</div>`
      ).join('')
      const html = `<!doctype html><html lang="id"><head><meta charset="utf-8"><title>${esc(t.invoice)}</title><style>
        @page{margin:8mm}
        body{font-family:ui-monospace,'Courier New',monospace;font-size:12px;width:290px;margin:0 auto;color:#000}
        .center{text-align:center}
        hr{border:0;border-top:1px dashed #999;margin:7px 0}
        .row{display:flex;justify-content:space-between;gap:8px}
        .bold{font-weight:700}
        .caption{font-size:11px}
        .item{margin-bottom:5px}
        h1{font-size:15px;margin:0 0 3px}
        .total{font-size:15px;font-weight:700}
      </style></head><body>
        <div class="center">
          <h1>${esc(business.value.businessName)}</h1>
          <div class="caption">${esc(business.value.address)}</div>
          <div class="caption">${esc(business.value.phone)} · ${esc(business.value.email)}</div>
        </div>
        <hr>
        ${row(`<span class="caption">${esc(t.invoice)}</span>`, `<span class="caption">${dateTime(t.createdAt)}</span>`)}
        <div class="caption">Kasir: ${esc(t.cashier || '-')} · ${esc(customerName(t.customerId))}</div>
        <hr>
        ${itemsHtml}
        <hr>
        ${row('Subtotal', money(t.subtotal, currency.value))}
        ${t.discount ? row('Diskon', '-' + money(t.discount, currency.value)) : ''}
        ${row('Pajak', money(t.tax, currency.value))}
        ${row('TOTAL', money(t.total, currency.value), 'total')}
        ${row(paymentLabel(t.paymentMethod), money(t.amountPaid, currency.value))}
        ${row('Kembalian', money(t.change, currency.value))}
        <hr>
        <div class="center caption">${esc(business.value.receiptFooter)}</div>
      </body></html>`
      const frame = document.createElement('iframe')
      frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden'
      document.body.appendChild(frame)
      const w = frame.contentWindow
      w.document.open(); w.document.write(html); w.document.close()
      w.onafterprint = () => setTimeout(() => frame.remove(), 300)
      setTimeout(() => {
        try { w.focus(); w.print() } catch (e) { window.print() }
        setTimeout(() => frame.remove(), 120000)
      }, 250)
    }

    const stockColor = p => {
      const th = store.getters['settings/business'].lowStockThreshold || 5
      if (p.stock <= 0) return 'error'
      if (p.stock <= th) return 'warning'
      return 'success'
    }
    const customerName = id => {
      if (!id) return 'Umum'
      const c = store.getters['customers/byId'](id)
      return c ? c.name : '—'
    }
    const totalQty = t => (t.items || []).reduce((s, i) => s + i.qty, 0)
    const paymentLabel = v => optionLabel(PAYMENT_METHODS, v)
    const dateTime = v => dateTimeShort(v)

    return {
      tab, search, typeFilter, cart, customerId, orderDiscount, paymentMethod, amountPaid,
      historySearch, fromDate, toDate, receipt, receiptData,
      currency, taxRate, business, paymentOptions, customerOptions, sellable,
      subtotal, discount, tax, total, change, canCheckout, history, historyTotal,
      isOut, addToCart, changeQty, removeLine, clearCart, checkout, showReceipt, removeTransaction, printReceipt,
      payExact, exportHistoryCsv,
      stockColor, customerName, totalQty, paymentLabel, dateTime, money
    }
  }
}
</script>

<style scoped>
.pos-item { transition: transform .12s ease, box-shadow .12s ease; cursor: pointer; }
.pos-item:hover { transform: translateY(-2px); box-shadow: 0 4px 14px rgba(0,0,0,.12); }
.pos-item--out { opacity: .55; cursor: not-allowed; }
.pos-cart { position: sticky; top: 76px; }
.text-truncate-2 {
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
  overflow: hidden; min-height: 2.6em;
}
@media (max-width: 960px) { .pos-cart { position: static; } }
</style>
