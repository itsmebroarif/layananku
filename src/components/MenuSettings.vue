<template>
  <v-card border>
    <v-card-title class="py-4 px-5 d-flex align-center justify-space-between">
      <span class="text-subtitle-1 font-weight-bold">Menu Navigasi</span>
      <div class="d-flex ga-2">
        <v-btn size="small" variant="tonal" color="primary" prepend-icon="mdi-plus" @click="openItemDialog()">
          Item
        </v-btn>
        <v-btn size="small" variant="tonal" prepend-icon="mdi-folder-plus-outline" @click="groupDialog = true">
          Grup
        </v-btn>
      </div>
    </v-card-title>
    <v-card-text class="px-5 pt-1 pb-0 text-caption text-medium-emphasis">
      Atur menu yang tampil di panel kiri: tambah, ubah, sembunyikan, tampilkan, urutkan, atau hapus.
      Item dapat dipindahkan antar-grup saat mengedit.
    </v-card-text>

    <v-divider class="mt-4" />

    <v-card-text class="px-3 py-3" style="max-height:520px;overflow-y:auto">
      <div v-for="group in groups" :key="group.id" class="mb-3">
        <div class="d-flex align-center py-1 px-1">
          <v-icon icon="mdi-folder-outline" size="18" color="grey" class="mr-2" />
          <span class="text-body-2 font-weight-bold">{{ group.title }}</span>
          <span class="text-caption text-medium-emphasis ml-2">({{ (group.items || []).length }} menu)</span>
          <v-spacer />
          <v-btn icon="mdi-pencil-outline" size="x-small" variant="text" @click="renameGroup(group)" />
          <v-btn
            icon="mdi-delete-outline"
            size="x-small"
            variant="text"
            color="error"
            :disabled="(group.items || []).length > 0"
            @click="removeGroup(group)"
          />
        </div>

        <v-list density="compact" class="py-0" style="background:transparent">
          <div
            v-for="(item, idx) in group.items || []"
            :key="item.id"
            class="d-flex align-center menu-row rounded-lg pa-2 mb-1"
            :class="{ 'menu-row--hidden': item.hidden }"
          >
            <v-avatar color="primary" size="28" variant="tonal" class="mr-2">
              <v-icon :icon="item.icon || 'mdi-link-variant'" size="16" />
            </v-avatar>
            <div class="flex-grow-1" style="min-width:0">
              <div class="text-body-2 font-weight-medium" :class="{ 'text-decoration-line-through': item.hidden }">
                {{ item.title }}
              </div>
              <div class="text-caption text-medium-emphasis text-truncate">
                {{ item.external ? item.path + ' (tautan eksternal)' : '#' + String(item.path).replace(/^#/, '') }}
              </div>
            </div>
            <v-btn icon="mdi-arrow-up" size="x-small" variant="text" :disabled="idx === 0" @click="move(group, item, -1)" />
            <v-btn
              icon="mdi-arrow-down"
              size="x-small"
              variant="text"
              :disabled="idx === (group.items || []).length - 1"
              @click="move(group, item, 1)"
            />
            <v-btn icon="mdi-pencil-outline" size="x-small" variant="text" @click="openItemDialog(group, item)" />
            <v-btn
              :icon="item.hidden ? 'mdi-eye-off' : 'mdi-eye'"
              size="x-small"
              variant="text"
              :color="item.hidden ? 'warning' : 'default'"
              @click="toggleHidden(group, item)"
            />
            <v-btn icon="mdi-delete-outline" size="x-small" variant="text" color="error" @click="removeItem(group, item)" />
          </div>

          <div v-if="!(group.items || []).length" class="text-caption text-medium-emphasis px-2 py-2">
            Grup kosong — tambah item atau pindahkan item lain ke grup ini.
          </div>
        </v-list>
      </div>
    </v-card-text>

    <v-divider />
    <v-card-actions class="px-5 py-3">
      <v-btn variant="text" color="warning" prepend-icon="mdi-restore" @click="confirmReset">
        Pulihkan Menu Default
      </v-btn>
      <v-spacer />
    </v-card-actions>

    <v-dialog v-model="groupDialog" max-width="420" persistent>
      <v-card>
        <v-card-title class="text-h6 font-weight-bold py-4 px-5">
          {{ editingGroup ? 'Ubah Nama Grup' : 'Tambah Grup Menu' }}
        </v-card-title>
        <v-divider />
        <v-card-text class="px-5 py-4">
          <v-text-field v-model="groupTitle" label="Judul grup *" :rules="[req]" prepend-inner-icon="mdi-folder-outline" autofocus @keyup.enter="saveGroup" />
        </v-card-text>
        <v-divider />
        <v-card-actions class="px-5 py-3">
          <v-spacer />
          <v-btn variant="text" @click="groupDialog = false">Batal</v-btn>
          <v-btn color="primary" @click="saveGroup">Simpan</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="itemDialog" max-width="600" persistent>
      <v-card>
        <v-card-title class="text-h6 font-weight-bold py-4 px-5">
          {{ editingItem ? 'Edit Menu' : 'Tambah Menu' }}
        </v-card-title>
        <v-divider />
        <v-card-text class="px-5 py-4">
          <v-row dense>
            <v-col cols="12">
              <v-text-field v-model="itemForm.title" label="Judul menu *" :rules="[req]" prepend-inner-icon="mdi-text-short" />
            </v-col>
            <v-col cols="12" sm="7">
              <v-combobox
                v-model="itemForm.icon"
                label="Ikon (nama MDI)"
                :items="ICON_SUGGESTIONS"
                prepend-inner-icon="mdi-shape-plus"
                @update:model-value="validIcon(itemForm.icon)"
              />
            </v-col>
            <v-col cols="12" sm="5" class="d-flex align-center">
              <v-avatar color="primary" size="38" variant="tonal" class="mr-2">
                <v-icon :icon="validIcon(itemForm.icon)" />
              </v-avatar>
              <span class="text-caption text-medium-emphasis">Pratinjau ikon</span>
            </v-col>
            <v-col cols="12">
              <v-radio-group v-model="itemForm.external" inline density="compact" hide-details>
                <v-radio label="Halaman internal" :value="false" />
                <v-radio label="Tautan eksternal" :value="true" />
              </v-radio-group>
            </v-col>
            <v-col v-if="!itemForm.external" cols="12">
              <v-select
                v-model="itemForm.path"
                label="Tujuan halaman *"
                :items="internalRoutes"
                item-title="title"
                item-value="path"
                prepend-inner-icon="mdi-sitemap-outline"
              >
                <template #item="{ item, props }">
                  <v-list-item v-bind="props" :prepend-icon="item.raw.icon" />
                </template>
              </v-select>
            </v-col>
            <v-col v-else cols="12">
              <v-text-field v-model="itemForm.path" label="URL * (https://…)" :rules="[urlRule]" prepend-inner-icon="mdi-link-variant-outline" />
            </v-col>
            <v-col cols="12">
              <v-select
                v-model="itemForm.groupId"
                label="Letak grup"
                :items="groups"
                item-title="title"
                item-value="id"
                prepend-inner-icon="mdi-folder-outline"
              />
            </v-col>
          </v-row>
        </v-card-text>
        <v-divider />
        <v-card-actions class="px-5 py-3">
          <v-spacer />
          <v-btn variant="text" @click="itemDialog = false">Batal</v-btn>
          <v-btn color="primary" @click="saveItem">Simpan</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

const ICON_SUGGESTIONS = [
  'mdi-view-dashboard-outline', 'mdi-account-group-outline', 'mdi-lifebuoy', 'mdi-package-variant-closed',
  'mdi-cash-register', 'mdi-calendar-month-outline', 'mdi-chart-box-outline', 'mdi-calculator-variant-outline',
  'mdi-cog-outline', 'mdi-home-outline', 'mdi-briefcase-outline', 'mdi-file-document-outline',
  'mdi-cart-outline', 'mdi-storefront-outline', 'mdi-phone-outline', 'mdi-email-outline',
  'mdi-server', 'mdi-shield-account-outline', 'mdi-map-marker-outline', 'mdi-chart-bar',
  'mdi-clock-outline', 'mdi-bell-outline', 'mdi-star-outline', 'mdi-heart-outline',
  'mdi-link-variant', 'mdi-file-table-outline', 'mdi-ticket-confirmation-outline', 'mdi-tools'
]

export default {
  name: 'MenuSettings',
  setup () {
    const store = useStore()
    const router = useRouter()

    const groups = computed(() => store.getters['menu/groups'])

    const internalRoutes = computed(() => router.getRoutes()
      .filter(r => r.name && r.name !== '*')
      .map(r => ({ title: (r.meta && r.meta.title) || r.path, path: r.path, icon: (r.meta && r.meta.icon) || 'mdi-circle-small' }))
      .filter(r => !r.path.includes(':')))

    const req = v => !!(v && String(v).trim()) || 'Wajib diisi'
    const urlRule = v => /^(https?:\/\/)?[\w-]+(\.[\w-]+)+\S*$/.test(v) || 'URL tidak valid'

    const groupDialog = ref(false)
    const editingGroup = ref(null)
    const groupTitle = ref('')

    const itemDialog = ref(false)
    const editingItem = ref(null)
    const sourceGroupId = ref('')
    const itemForm = ref({ title: '', icon: 'mdi-circle-small', external: false, path: '', groupId: '' })

    function validIcon (icon) {
      const name = String(icon || '').trim()
      return name && name.startsWith('mdi-') ? name : 'mdi-circle-small'
    }

    function renameGroup (group) {
      editingGroup.value = group
      groupTitle.value = group.title
      groupDialog.value = true
    }

    function saveGroup () {
      if (!String(groupTitle.value).trim()) return
      if (editingGroup.value) {
        store.commit('menu/UPDATE_GROUP', { id: editingGroup.value.id, title: groupTitle.value })
      } else {
        store.commit('menu/ADD_GROUP', groupTitle.value)
      }
      groupDialog.value = false
      editingGroup.value = null
      groupTitle.value = ''
      store.dispatch('ui/notify', 'Grup menu disimpan.')
    }

    function removeGroup (group) {
      store.commit('menu/REMOVE_GROUP', group.id)
      store.dispatch('ui/notify', { text: `Grup "${group.title}" dihapus.`, color: 'error' })
    }

    function openItemDialog (group = null, item = null) {
      editingItem.value = item
      sourceGroupId.value = group ? group.id : (groups.value[0] ? groups.value[0].id : '')
      if (item) {
        itemForm.value = { ...item, groupId: group ? group.id : '' }
      } else {
        const route = internalRoutes.value.find(r => !groups.value.some(g => (g.items || []).some(i => i.path === r.path))) || internalRoutes.value[0]
        itemForm.value = {
          title: '', icon: route ? route.icon : 'mdi-circle-small', external: false,
          path: route ? route.path : '/', groupId: sourceGroupId.value
        }
      }
      itemDialog.value = true
    }

    function saveItem () {
      const f = itemForm.value
      if (!String(f.title).trim() || !String(f.path || '').trim()) return
      const data = {
        title: f.title.trim(),
        icon: validIcon(f.icon),
        external: !!f.external,
        path: String(f.path).trim()
      }
      const targetGroup = f.groupId || sourceGroupId.value
      const target = groups.value.find(g => g.id === targetGroup)
      if (editingItem.value) {
        if (targetGroup !== sourceGroupId.value) {
          store.commit('menu/REMOVE_ITEM', { groupId: sourceGroupId.value, itemId: editingItem.value.id })
          store.commit('menu/ADD_ITEM', { groupId: targetGroup, item: { ...editingItem.value, ...data } })
        } else {
          store.commit('menu/UPDATE_ITEM', { groupId: sourceGroupId.value, itemId: editingItem.value.id, data })
        }
      } else if (target) {
        store.commit('menu/ADD_ITEM', { groupId: targetGroup, item: data })
      }
      itemDialog.value = false
      editingItem.value = null
      store.dispatch('ui/notify', 'Menu disimpan.')
    }

    function toggleHidden (group, item) {
      store.commit('menu/UPDATE_ITEM', { groupId: group.id, itemId: item.id, data: { hidden: !item.hidden } })
      store.dispatch('ui/notify', item.hidden ? `Menu "${item.title}" ditampilkan.` : { text: `Menu "${item.title}" disembunyikan.`, color: 'info' })
    }

    function removeItem (group, item) {
      store.commit('menu/REMOVE_ITEM', { groupId: group.id, itemId: item.id })
      store.dispatch('ui/notify', { text: `Menu "${item.title}" dihapus.`, color: 'error' })
    }

    function move (group, item, dir) {
      store.commit('menu/MOVE_ITEM', { groupId: group.id, itemId: item.id, dir })
    }

    function confirmReset () {
      if (window.confirm('Pulihkan seluruh menu ke pengaturan default? Menu kustom akan dihapus.')) {
        store.commit('menu/RESET_DEFAULTS')
        store.dispatch('ui/notify', 'Menu dipulihkan ke default.')
      }
    }

    return {
      groups, internalRoutes, ICON_SUGGESTIONS,
      groupDialog, editingGroup, groupTitle,
      itemDialog, editingItem, itemForm, req, urlRule,
      validIcon, renameGroup, saveGroup, removeGroup, openItemDialog, saveItem,
      toggleHidden, removeItem, move, confirmReset
    }
  }
}
</script>

<style scoped>
.menu-row { background: rgba(0,0,0,.03); }
.menu-row--hidden { opacity: .6; }
</style>
