<template>
  <v-row dense>
    <v-col cols="12" lg="7">
      <v-card border class="mb-4">
        <v-card-title class="py-4 px-5 text-subtitle-1 font-weight-bold">Profil Badan Usaha</v-card-title>
        <v-divider />
        <v-card-text class="px-5 py-4">
          <v-alert density="compact" variant="tonal" color="info" class="mb-4" icon="mdi-domain">
            Profil ini berlaku untuk seluruh jenis usaha — toko, jasa, klinik, kantor, dan lainnya — serta dicetak pada struk POS.
          </v-alert>
          <v-row dense>
            <v-col cols="12" sm="6">
              <v-text-field v-model="form.businessName" label="Nama usaha / organisasi *" prepend-inner-icon="mdi-storefront-outline" />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field v-model="form.businessType" label="Jenis usaha" prepend-inner-icon="mdi-briefcase-outline" />
            </v-col>
            <v-col cols="12">
              <v-text-field v-model="form.address" label="Alamat" prepend-inner-icon="mdi-map-marker-outline" />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field v-model="form.phone" label="Telepon" prepend-inner-icon="mdi-phone-outline" />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field v-model="form.email" label="Email" prepend-inner-icon="mdi-email-outline" />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field v-model="form.website" label="Website" prepend-inner-icon="mdi-web" />
            </v-col>
            <v-col cols="12" sm="6">
              <v-select v-model="form.currency" label="Mata uang" :items="CURRENCIES" prepend-inner-icon="mdi-cash" />
            </v-col>
            <v-col cols="12" sm="4">
              <v-text-field v-model.number="form.taxRate" type="number" min="0" label="Pajak (%)" suffix="%" prepend-inner-icon="mdi-percent" />
            </v-col>
            <v-col cols="12" sm="4">
              <v-text-field v-model.number="form.lowStockThreshold" type="number" min="0" label="Batas stok menipis" prepend-inner-icon="mdi-alert-outline" />
            </v-col>
            <v-col cols="12" sm="4">
              <v-text-field v-model="form.logoText" label="Inisial logo" maxlength="3" counter prepend-inner-icon="mdi-format-letter-case" />
            </v-col>
            <v-col cols="12">
              <v-text-field v-model="form.receiptFooter" label="Catatan kaki struk" prepend-inner-icon="mdi-text-box-outline" />
            </v-col>
          </v-row>
        </v-card-text>
        <v-divider />
        <v-card-actions class="px-5 py-3">
          <v-spacer />
          <v-btn variant="text" @click="resetForm">Batalkan Perubahan</v-btn>
          <v-btn color="primary" variant="elevated" prepend-icon="mdi-content-save-outline" @click="save">Simpan Pengaturan</v-btn>
        </v-card-actions>
      </v-card>

      <menu-settings />

      <v-card border>
        <v-card-title class="py-4 px-5 text-subtitle-1 font-weight-bold">Data &amp; Cadangan</v-card-title>
        <v-divider />
        <v-card-text class="px-5 py-4">
          <p class="text-body-2 text-medium-emphasis mb-4">
            Seluruh data disimpan secara lokal di browser perangkat ini (localStorage) sehingga aplikasi tetap berfungsi offline.
            Lakukan ekspor berkala sebagai cadangan.
          </p>
          <div class="d-flex flex-wrap gap-2 mb-4">
            <v-btn color="primary" variant="tonal" prepend-icon="mdi-download" @click="exportJson">Ekspor JSON</v-btn>
            <v-btn variant="tonal" prepend-icon="mdi-upload" @click="$refs.importFile.click()">Impor JSON</v-btn>
            <input ref="importFile" type="file" accept=".json,application/json" class="hidden-input" @change="importJson">
          </div>

          <v-divider class="mb-4" />

          <div class="text-subtitle-2 font-weight-bold text-error mb-1">Zona Berbahaya</div>
          <p class="text-body-2 text-medium-emphasis mb-3">
            Menghapus seluruh data (pelanggan, tiket, katalog, transaksi, event) dan mengembalikan aplikasi ke kondisi awal.
          </p>
          <v-btn color="error" variant="outlined" prepend-icon="mdi-delete-alert-outline" @click="confirmReset">Reset Seluruh Data</v-btn>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12" lg="5">
      <v-card border class="mb-4">
        <v-card-title class="py-4 px-5 text-subtitle-1 font-weight-bold">Aplikasi (PWA)</v-card-title>
        <v-divider />
        <v-card-text class="px-5 py-4">
          <v-list density="compact">
            <v-list-item prepend-icon="mdi-information-outline" title="Versi" subtitle="1.0.0 — Service Management Tools" />
            <v-list-item
              prepend-icon="mdi-wifi"
              :title="online ? 'Terhubung jaringan' : 'Mode offline aktif'"
              :subtitle="online ? 'Fitur daring tersedia' : 'Aplikasi tetap berjalan dari cache'"
            />
            <v-list-item prepend-icon="mdi-database-outline" title="Penyimpanan" :subtitle="storageSummary" />
          </v-list>

          <v-btn
            v-if="installPrompt"
            block
            color="primary"
            variant="elevated"
            class="mt-3"
            prepend-icon="mdi-download"
            @click="install"
          >
            Pasang di Perangkat
          </v-btn>
          <v-alert v-else density="compact" variant="tonal" class="mt-3" icon="mdi-cellphone-check">
            Untuk memasang aplikasi: buka menu browser lalu pilih <b>“Pasang aplikasi / Add to Home screen”</b>.
          </v-alert>
        </v-card-text>
      </v-card>

      <v-card border>
        <v-card-title class="py-4 px-5 text-subtitle-1 font-weight-bold">Ringkasan Data</v-card-title>
        <v-divider />
        <v-card-text class="px-5 py-4">
          <v-list density="compact">
            <v-list-item prepend-icon="mdi-account-group" title="Pelanggan" :subtitle="`${counts.customers} entri`" />
            <v-list-item prepend-icon="mdi-lifebuoy" title="Tiket dukungan" :subtitle="`${counts.tickets} entri`" />
            <v-list-item prepend-icon="mdi-package-variant-closed" title="Produk & jasa" :subtitle="`${counts.catalog} entri`" />
            <v-list-item prepend-icon="mdi-cash-register" title="Transaksi POS" :subtitle="`${counts.transactions} entri`" />
            <v-list-item prepend-icon="mdi-calendar-month" title="Event" :subtitle="`${counts.events} entri`" />
          </v-list>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import { reactive, ref, computed, watch } from 'vue'
import { useStore } from 'vuex'
import { CURRENCIES } from '@/utils/options'
import MenuSettings from '@/components/MenuSettings.vue'

export default {
  name: 'SettingsView',
  components: { MenuSettings },
  setup () {
    const store = useStore()
    const importFile = ref(null)
    const form = reactive({ ...store.getters['settings/business'] })

    watch(() => store.getters['settings/business'], v => Object.assign(form, v))

    const online = computed(() => store.state.ui.online)
    const installPrompt = computed(() => store.state.ui.installPrompt)
    const theme = computed(() => store.getters['settings/theme'])
    function setTheme (v) {
      store.commit('settings/UPDATE_SETTINGS', { theme: v })
      store.dispatch('ui/notify', v === 'dark' ? 'Mode gelap diaktifkan.' : 'Mode terang diaktifkan.')
    }
    const counts = computed(() => ({
      customers: store.getters['customers/count'],
      tickets: store.getters['tickets/count'],
      catalog: store.getters['catalog/count'],
      transactions: store.getters['transactions/count'],
      events: store.getters['events/count']
    }))

    const storageSummary = computed(() => {
      try {
        let bytes = 0
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && key.startsWith('smt_')) bytes += (localStorage.getItem(key) || '').length
        }
        return `${(bytes / 1024).toFixed(1)} KB terpakai di localStorage`
      } catch (e) {
        return 'localStorage tidak tersedia'
      }
    })

    function save () {
      store.commit('settings/UPDATE_SETTINGS', { ...form })
      store.dispatch('ui/notify', 'Pengaturan disimpan.')
    }
    function resetForm () {
      Object.assign(form, store.getters['settings/business'])
      store.dispatch('ui/notify', { text: 'Perubahan dibatalkan.', color: 'info' })
    }

    async function exportJson () {
      const data = await store.dispatch('exportData')
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `service-tools-cadangan-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(a.href)
      store.dispatch('ui/notify', 'Cadangan JSON diunduh.')
    }

    function importJson (e) {
      const file = e.target.files && e.target.files[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = async () => {
        try {
          const parsed = JSON.parse(reader.result)
          await store.dispatch('importData', parsed)
          store.dispatch('ui/notify', 'Data berhasil diimpor.')
        } catch (err) {
          store.dispatch('ui/notify', { text: `Impor gagal: ${err.message}`, color: 'error', timeout: 4000 })
        }
        e.target.value = ''
      }
      reader.readAsText(file)
    }

    async function confirmReset () {
      const ok = window.confirm('Yakin menghapus SEMUA data? Tindakan ini tidak dapat dibatalkan.')
      if (!ok) return
      const double = window.confirm('Konfirmasi terakhir: lanjutkan mereset seluruh data?')
      if (!double) return
      await store.dispatch('resetAll')
      store.dispatch('ui/notify', { text: 'Seluruh data telah direset.', color: 'error', timeout: 4000 })
    }

    async function install () {
      const prompt = installPrompt.value
      if (!prompt) return
      prompt.prompt()
      await prompt.userChoice
      store.commit('ui/SET_INSTALL_PROMPT', null)
    }

    return {
      form, importFile, online, installPrompt, counts, storageSummary, CURRENCIES, theme, setTheme,
      save, resetForm, exportJson, importJson, confirmReset, install
    }
  }
}
</script>

<style scoped>
.hidden-input { display: none; }
</style>
