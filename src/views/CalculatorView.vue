<template>
  <v-row dense>
    <v-col cols="12" md="7" lg="6">
      <v-card border>
        <v-tabs v-model="tab" color="primary" density="compact" grow>
          <v-tab value="standard" prepend-icon="mdi-calculator-variant-outline">Standar</v-tab>
          <v-tab value="markup" prepend-icon="mdi-tag-multiple-outline">Markup</v-tab>
          <v-tab value="split" prepend-icon="mdi-call-split">Bagi Tagihan</v-tab>
        </v-tabs>
        <v-divider />

        <!-- STANDAR -->
        <v-window v-model="tab">
          <v-window-item value="standard">
            <div class="pa-4">
              <div class="calc-display pa-4 mb-4 rounded">
                <div class="text-caption text-medium-emphasis text-right" style="min-height:18px">{{ expression || '0' }}</div>
                <div class="text-h4 font-weight-bold text-right text-truncate">{{ display }}</div>
                <div v-if="memory" class="text-caption text-primary text-right">M: {{ memory }}</div>
              </div>
              <div class="calc-grid">
                <v-btn class="calc-btn" variant="tonal" color="error" @click="clearAll">AC</v-btn>
                <v-btn class="calc-btn" variant="tonal" @click="backspace" :disabled="!expression">⌫</v-btn>
                <v-btn class="calc-btn" variant="tonal" @click="setMemory">{{ memory ? 'MC' : 'M+' }}</v-btn>
                <v-btn class="calc-btn" variant="tonal" color="primary" @click="input('%')">%</v-btn>

                <v-btn class="calc-btn" variant="flat" color="secondary" @click="input('7')">7</v-btn>
                <v-btn class="calc-btn" variant="flat" color="secondary" @click="input('8')">8</v-btn>
                <v-btn class="calc-btn" variant="flat" color="secondary" @click="input('9')">9</v-btn>
                <v-btn class="calc-btn" variant="tonal" color="primary" @click="input('/')">÷</v-btn>

                <v-btn class="calc-btn" variant="flat" color="secondary" @click="input('4')">4</v-btn>
                <v-btn class="calc-btn" variant="flat" color="secondary" @click="input('5')">5</v-btn>
                <v-btn class="calc-btn" variant="flat" color="secondary" @click="input('6')">6</v-btn>
                <v-btn class="calc-btn" variant="tonal" color="primary" @click="input('*')">×</v-btn>

                <v-btn class="calc-btn" variant="flat" color="secondary" @click="input('1')">1</v-btn>
                <v-btn class="calc-btn" variant="flat" color="secondary" @click="input('2')">2</v-btn>
                <v-btn class="calc-btn" variant="flat" color="secondary" @click="input('3')">3</v-btn>
                <v-btn class="calc-btn" variant="tonal" color="primary" @click="input('-')">−</v-btn>

                <v-btn class="calc-btn" variant="flat" color="secondary" @click="input('±')">±</v-btn>
                <v-btn class="calc-btn" variant="flat" color="secondary" @click="input('0')">0</v-btn>
                <v-btn class="calc-btn" variant="flat" color="secondary" @click="input('.')">.</v-btn>
                <v-btn class="calc-btn" variant="tonal" color="primary" @click="input('+')">+</v-btn>

                <v-btn class="calc-btn calc-eq" color="primary" variant="elevated" @click="evaluate">=</v-btn>
              </div>
            </div>
          </v-window-item>

          <!-- MARKUP -->
          <v-window-item value="markup">
            <v-card-text class="pa-5">
              <v-alert density="compact" variant="tonal" color="info" class="mb-4" icon="mdi-information-outline">
                Hitung harga jual dari modal, atau hitung margin dari harga jual — cocok untuk penawaran jasa & produk.
              </v-alert>
              <v-text-field v-model.number="markupCost" type="number" label="Harga modal / cost" prefix="Rp" prepend-inner-icon="mdi-cash-minus" class="mb-3" />
              <v-text-field v-model.number="markupPrice" type="number" label="Harga jual" prefix="Rp" prepend-inner-icon="mdi-cash-plus" class="mb-3" />
              <v-text-field v-model.number="markupPercent" type="number" label="Margin / markup (%)" suffix="%" prepend-inner-icon="mdi-percent" class="mb-4" />

              <v-divider class="mb-4" />
              <v-list density="compact">
                <v-list-item title="Keuntungan per unit" :subtitle="money(markupProfit, currency)" />
                <v-list-item title="Margin terhitung" :subtitle="markupMargin + '%'" />
                <v-list-item title="Harga jual dengan margin %" :subtitle="money(markupTargetPrice, currency)" />
              </v-list>
              <div class="d-flex gap-2 mt-2">
                <v-btn variant="tonal" color="primary" size="small" @click="applyMarkupPrice">Pakai harga jual hasil hitung</v-btn>
                <v-btn variant="tonal" size="small" @click="markupCost = 0; markupPrice = 0; markupPercent = 20">Reset</v-btn>
              </div>
            </v-card-text>
          </v-window-item>

          <!-- SPLIT -->
          <v-window-item value="split">
            <v-card-text class="pa-5">
              <v-text-field v-model.number="splitTotal" type="number" label="Total tagihan" prefix="Rp" prepend-inner-icon="mdi-receipt" class="mb-3" />
              <v-text-field v-model.number="splitPeople" type="number" min="1" label="Jumlah orang / porsi" prepend-inner-icon="mdi-account-group" class="mb-3" />
              <v-text-field v-model.number="splitTip" type="number" min="0" label="Tip / pembulatan (opsional)" prefix="Rp" prepend-inner-icon="mdi-heart-outline" />
              <v-divider class="my-4" />
              <div class="d-flex justify-space-between align-center mb-2">
                <span class="text-body-1 text-medium-emphasis">Total bayar (termasuk tip)</span>
                <span class="text-h6">{{ money(splitGrand, currency) }}</span>
              </div>
              <div class="d-flex justify-space-between align-center">
                <span class="text-body-1 font-weight-bold">Per orang</span>
                <span class="text-h4 font-weight-bold text-primary">{{ money(splitPerPerson, currency) }}</span>
              </div>
              <v-btn variant="tonal" size="small" class="mt-4" prepend-icon="mdi-content-copy" @click="copySplit">Salin nominal per orang</v-btn>
            </v-card-text>
          </v-window-item>
        </v-window>
      </v-card>
    </v-col>

    <v-col cols="12" md="5" lg="6">
      <v-card border>
        <v-card-title class="py-3 px-4 d-flex align-center justify-space-between">
          <span class="text-subtitle-1 font-weight-bold">Riwayat Perhitungan</span>
          <v-btn v-if="history.length" variant="text" size="x-small" color="error" @click="history = []">Bersihkan</v-btn>
        </v-card-title>
        <v-divider />
        <v-list v-if="history.length" density="compact">
          <v-list-item
            v-for="(h, i) in history"
            :key="i"
            :subtitle="h.expression"
            @click="useResult(h.result)"
          >
            <template #title>
              <span class="font-weight-bold text-primary">{{ h.result }}</span>
            </template>
          </v-list-item>
        </v-list>
        <empty-state v-else icon="mdi-calculator-variant" title="Belum ada riwayat" text="Hasil perhitungan akan tampil di sini dan bisa dipakai ulang." size="44" />
      </v-card>

      <v-card border class="mt-4">
        <v-card-title class="py-3 px-4 text-subtitle-1 font-weight-bold">Tips</v-card-title>
        <v-card-text class="pt-0">
          <ul class="text-body-2 text-medium-emphasis" style="padding-left:18px">
            <li>Gunakan tab <b>Markup</b> saat menyiapkan penawaran harga ke pelanggan.</li>
            <li>Tab <b>Bagi Tagihan</b> untuk membagi tagihan layanan ke beberapa pihak.</li>
            <li>Klik hasil di riwayat untuk memakainya kembali sebagai angka awal.</li>
            <li>Papan ketik juga didukung: angka, <b>+ − * /</b>, Enter (=), Escape (AC), Backspace.</li>
          </ul>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useStore } from 'vuex'
import EmptyState from '@/components/EmptyState.vue'
import { money } from '@/utils/format'

export default {
  name: 'CalculatorView',
  components: { EmptyState },
  setup () {
    const store = useStore()
    const tab = ref('standard')
    const expression = ref('')
    const result = ref('')
    const memory = ref(0)
    const history = ref([])

    const markupCost = ref(0)
    const markupPrice = ref(0)
    const markupPercent = ref(20)

    const splitTotal = ref(0)
    const splitPeople = ref(1)
    const splitTip = ref(0)

    const currency = computed(() => store.getters['settings/currency'])
    const display = computed(() => result.value || expression.value.replace(/\*/g, '×').replace(/\//g, '÷') || '0')

    const markupProfit = computed(() => (Number(markupPrice.value) || 0) - (Number(markupCost.value) || 0))
    const markupMargin = computed(() => {
      const price = Number(markupPrice.value) || 0
      if (!price) return 0
      return Math.round((markupProfit.value / price) * 10000) / 100
    })
    const markupTargetPrice = computed(() => {
      const cost = Number(markupCost.value) || 0
      const pct = Number(markupPercent.value) || 0
      return Math.round(cost * (1 + pct / 100))
    })

    const splitGrand = computed(() => (Number(splitTotal.value) || 0) + (Number(splitTip.value) || 0))
    const splitPerPerson = computed(() => {
      const people = Math.max(1, Math.floor(Number(splitPeople.value) || 1))
      return Math.ceil(splitGrand.value / people)
    })

    function input (key) {
      if (result.value) {
        if (/^[0-9.]$/.test(key)) { expression.value = ''; result.value = '' }
        else if (key === '±') { expression.value = `-(${result.value})`; result.value = ''; return }
        else { expression.value = result.value; result.value = '' }
      }
      if (key === '±') {
        expression.value = expression.value.startsWith('-')
          ? expression.value.slice(1)
          : '-' + expression.value
        return
      }
      expression.value += key
    }

    function clearAll () { expression.value = ''; result.value = '' }
    function backspace () { expression.value = expression.value.slice(0, -1) }

    function setMemory () {
      if (memory.value) { memory.value = 0; return }
      const val = Number(result.value || evaluateRaw(expression.value))
      if (!isNaN(val)) { memory.value = val; result.value = ''; expression.value = '' }
    }

    function evaluateRaw (expr) {
      if (!expr) return 0
      const sanitized = expr.replace(/%/g, '/100')
      if (!/^[0-9+\-*/().\s]+$/.test(sanitized)) return NaN
      try {
        // eslint-disable-next-line no-new-func
        const value = Function(`"use strict";return (${sanitized})`)()
        return typeof value === 'number' && isFinite(value) ? value : NaN
      } catch (e) {
        return NaN
      }
    }

    function evaluate () {
      const expr = expression.value.trim()
      if (!expr) return
      const value = evaluateRaw(expr)
      if (isNaN(value)) {
        store.dispatch('ui/notify', { text: 'Ekspresi tidak valid.', color: 'error' })
        return
      }
      const rounded = Math.round(value * 1e10) / 1e10
      const shown = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 10 }).format(rounded)
      history.value.unshift({ expression: expr.replace(/\*/g, '×').replace(/\//g, '÷'), result: shown })
      if (history.value.length > 20) history.value.pop()
      result.value = shown
      expression.value = ''
    }

    function useResult (shown) {
      const numeric = Number(String(shown).replace(/\./g, '').replace(/,/g, '.'))
      if (isNaN(numeric)) return
      expression.value = String(numeric)
      result.value = ''
      tab.value = 'standard'
    }

    function applyMarkupPrice () {
      markupPrice.value = markupTargetPrice.value
      store.dispatch('ui/notify', 'Harga jual diperbarui dari hasil hitung margin.')
    }

    async function copySplit () {
      const text = String(splitPerPerson.value)
      try {
        await navigator.clipboard.writeText(text)
        store.dispatch('ui/notify', 'Nominal per orang disalin.')
      } catch (e) {
        store.dispatch('ui/notify', { text: 'Gagal menyalin ke clipboard.', color: 'error' })
      }
    }

    function onKey (e) {
      if (tab.value !== 'standard') return
      const tag = (e.target.tagName || '').toLowerCase()
      if (['input', 'textarea'].includes(tag)) return
      if (/^[0-9]$/.test(e.key)) { input(e.key); e.preventDefault() }
      else if (['+', '-', '*', '/'].includes(e.key)) { input(e.key); e.preventDefault() }
      else if (e.key === '.') { input('.') }
      else if (e.key === 'Enter' || e.key === '=') { evaluate(); e.preventDefault() }
      else if (e.key === 'Escape') { clearAll() }
      else if (e.key === 'Backspace') { backspace(); e.preventDefault() }
      else if (e.key === '%') { input('%') }
    }

    onMounted(() => window.addEventListener('keydown', onKey))
    onBeforeUnmount(() => window.removeEventListener('keydown', onKey))

    return {
      tab, expression, display, memory, history,
      markupCost, markupPrice, markupPercent, markupProfit, markupMargin, markupTargetPrice,
      splitTotal, splitPeople, splitTip, splitGrand, splitPerPerson,
      currency, input, clearAll, backspace, setMemory, evaluate, useResult,
      applyMarkupPrice, copySplit, money
    }
  }
}
</script>

<style scoped>
.calc-display { background: #263238; color: #fff; min-height: 110px; }
.calc-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.calc-btn { height: 56px !important; font-size: 1.05rem !important; }
.calc-eq { grid-column: 1 / -1; height: 56px; font-weight: 700; }
@media (max-width: 600px) { .calc-btn { height: 48px !important; } }
</style>
