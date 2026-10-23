<template>
  <div>
    <div class="d-flex flex-wrap justify-space-between align-center mb-4 ga-3">
      <div class="text-body-2 text-grey">
        Todo Kanban: tugas bertebar di kolom per board — tiap tugas punya checklist todo &amp; deadline sendiri. Kolom bisa ditambah, diganti nama, diurutkan, dan dihapus per board.
      </div>
      <div class="d-flex align-center ga-2">
        <span class="text-caption text-grey">{{ boards.length }}/{{ maxBoards }} board</span>
        <v-btn color="primary" variant="elevated" prepend-icon="mdi-plus" :disabled="boards.length >= maxBoards" @click="openBoardForm()">
          Buat Board
        </v-btn>
      </div>
    </div>

    <v-row v-if="boards.length" dense class="mb-3">
      <v-col cols="6" md="3"><stat-card label="Total Tugas" :value="stats.total" icon="mdi-clipboard-list-outline" color="primary" /></v-col>
      <v-col cols="6" md="3"><stat-card label="Board Aktif" :value="boards.length" icon="mdi-view-column-outline" color="secondary" /></v-col>
      <v-col cols="6" md="3"><stat-card label="Tugas Terlambat" :value="stats.late" icon="mdi-firealarm" color="error" /></v-col>
      <v-col cols="6" md="3"><stat-card label="Deadline ≤ 3 Hari" :value="stats.soon" icon="mdi-clock-fast" color="warning" /></v-col>
    </v-row>

    <empty-state
      v-if="!boards.length"
      icon="mdi-view-column-outline"
      title="Belum ada board"
      text="Buat 1–15 board sesuai kebutuhan. Setiap board default berisi 3 kolom yang bisa diatur ulang."
    >
      <template #action>
        <v-btn color="primary" variant="tonal" size="small" @click="openBoardForm()">Buat Board Pertama</v-btn>
      </template>
    </empty-state>

    <v-alert
      v-else-if="boards.length >= maxBoards"
      density="compact"
      variant="tonal"
      color="info"
      icon="mdi-information-outline"
      class="mb-3"
    >
      Maksimal {{ maxBoards }} board tercapai. Hapus board yang tidak terpakai untuk membuat baru.
    </v-alert>

    <div v-for="board in boards" :key="board.id" class="mb-5">
      <v-card border elevation="0">
        <v-card-title class="d-flex align-center py-3 px-4">
          <v-avatar :color="board.color" size="14" class="mr-3" />
          <div class="d-flex align-center ga-2 flex-grow-1">
            <span class="text-subtitle-1 font-weight-bold">{{ board.name }}</span>
            <v-chip size="x-small" variant="tonal" :color="board.color">{{ (board.tasks || []).length }} tugas</v-chip>
            <v-chip size="x-small" variant="tonal">{{ (board.columns || []).length }} kolom</v-chip>
          </div>
          <v-btn icon="mdi-arrow-up-bold" size="x-small" variant="text" title="Geser ke atas" @click="moveBoard(board.id, -1)" />
          <v-btn icon="mdi-arrow-down-bold" size="x-small" variant="text" title="Geser ke bawah" @click="moveBoard(board.id, 1)" />
          <v-btn icon="mdi-pencil-outline" size="x-small" variant="text" title="Edit board" @click="openBoardForm(board)" />
          <v-btn icon="mdi-delete-outline" size="x-small" variant="text" color="error" title="Hapus board" @click="removeBoard(board)" />
        </v-card-title>
        <v-divider />

        <v-card-text class="d-flex ga-3 pa-3 kb-board" style="overflow-x:auto">
          <div
            v-for="(col, ci) in board.columns"
            :key="col.id"
            class="kb-col rounded-lg"
            :class="{ 'kb-col-drag-over': dragOver === board.id + ':' + col.id }"
            @dragover.prevent="dragOver = board.id + ':' + col.id"
            @dragleave="dragOver === board.id + ':' + col.id && (dragOver = '')"
            @drop.prevent="onDrop(board, col.id)"
          >
            <div class="d-flex align-center justify-space-between px-3 pt-2 pb-1">
              <div class="d-flex align-center ga-1 font-weight-medium text-body-2">
                <v-icon :icon="col.icon" size="16" :color="col.color" />
                <span>{{ col.title }}</span>
                <v-chip size="x-small" variant="tonal">{{ tasksIn(board, col.id).length }}</v-chip>
              </div>
              <div class="d-flex align-center">
                <v-btn icon="mdi-plus" size="x-small" variant="text" color="primary" title="Tambah tugas" @click="openTaskForm(board, col)" />
                <v-menu location="bottom">
                  <template #activator="{ props }">
                    <v-btn icon="mdi-dots-vertical" size="x-small" variant="text" title="Kelola kolom" v-bind="props" />
                  </template>
                  <v-list density="compact">
                    <v-list-item prepend-icon="mdi-pencil-outline" @click="openColForm(board, col)">
                      <v-list-item-title>Ganti Nama Kolom</v-list-item-title>
                    </v-list-item>
                    <v-list-item prepend-icon="mdi-arrow-left-bold" :disabled="ci === 0" @click="moveColumn(board.id, col.id, -1)">
                      <v-list-item-title>Geser ke Kiri</v-list-item-title>
                    </v-list-item>
                    <v-list-item prepend-icon="mdi-arrow-right-bold" :disabled="ci === board.columns.length - 1" @click="moveColumn(board.id, col.id, 1)">
                      <v-list-item-title>Geser ke Kanan</v-list-item-title>
                    </v-list-item>
                    <v-divider />
                    <v-list-item prepend-icon="mdi-delete-outline" :disabled="board.columns.length <= 1" class="text-error" @click="removeColumn(board, col)">
                      <v-list-item-title>Hapus Kolom</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </div>
            </div>
            <div class="px-2 pb-2 d-flex flex-column ga-2">
              <div
                v-for="task in tasksIn(board, col.id)"
                :key="task.id"
                class="kb-card rounded-lg pa-2"
                draggable="true"
                @dragstart="dragTask = { boardId: board.id, taskId: task.id }"
                @dragend="dragTask = null; dragOver = ''"
                @click="openTaskForm(board, col, task)"
              >
                <div class="d-flex align-start justify-space-between">
                  <div class="text-body-2 font-weight-medium" :class="isComplete(task) ? 'text-decoration-line-through text-medium-emphasis' : ''">
                    {{ task.title }}
                  </div>
                  <v-btn icon="mdi-close" size="xx-small" variant="text" @click.stop="removeTask(board, task)" />
                </div>
                <div v-if="(task.todos || []).length" class="d-flex align-center ga-1 mt-1">
                  <v-progress-linear
                    :model-value="todoProgress(task)"
                    height="4"
                    rounded
                    :color="isComplete(task) ? 'success' : 'primary'"
                    style="width:54px"
                  />
                  <span class="text-caption text-medium-emphasis">{{ doneTodos(task).length }}/{{ task.todos.length }} todo</span>
                </div>
                <div v-if="task.deadline" class="mt-1">
                  <v-chip size="x-small" variant="tonal" :color="deadlineInfo(task.deadline).color" :prepend-icon="deadlineInfo(task.deadline).icon">
                    {{ deadlineInfo(task.deadline).text }}
                  </v-chip>
                </div>
              </div>
              <div v-if="!tasksIn(board, col.id).length" class="text-caption text-grey text-center py-3">
                Kosong
              </div>
            </div>
          </div>

          <div class="kb-col kb-col-ghost rounded-lg" @click="openColForm(board)">
            <v-icon icon="mdi-plus" size="18" class="mr-1" />
            Tambah Kolom
          </div>
        </v-card-text>
      </v-card>
    </div>

    <v-dialog v-model="boardDialog" max-width="480" persistent>
      <v-card>
        <v-card-title class="text-h6 font-weight-bold py-4 px-5">{{ editingBoard ? 'Edit Board' : 'Buat Board Baru' }}</v-card-title>
        <v-divider />
        <v-card-text class="px-5 py-4">
          <v-text-field v-model="boardForm.name" label="Nama board *" :rules="[req]" prepend-inner-icon="mdi-view-column-outline" />
          <div class="text-caption text-medium-emphasis mb-1 mt-2">Warna board</div>
          <div class="d-flex flex-wrap ga-2">
            <v-btn
              v-for="c in BOARD_COLORS"
              :key="c"
              :color="c"
              :variant="boardForm.color === c ? 'elevated' : 'tonal'"
              size="x-small"
              @click="boardForm.color = c"
            />
          </div>
          <v-alert density="compact" variant="tonal" color="info" icon="mdi-information-outline" class="mt-3">
            Board default berisi 3 kolom (To Do, Dikerjakan, Selesai). Tiap kolom bisa diganti nama, ditambah, diurutkan, dan dihapus lewat menu ⋮ di kolom.
          </v-alert>
        </v-card-text>
        <v-divider />
        <v-card-actions class="px-5 py-3">
          <v-spacer />
          <v-btn variant="text" @click="boardDialog = false">Batal</v-btn>
          <v-btn color="primary" variant="elevated" @click="saveBoard">Simpan</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="colDialog" max-width="440" persistent>
      <v-card>
        <v-card-title class="text-h6 font-weight-bold py-4 px-5">{{ colCtx.id ? 'Ganti Nama Kolom' : 'Tambah Kolom Baru' }}</v-card-title>
        <v-divider />
        <v-card-text class="px-5 py-4">
          <v-text-field v-model="colForm.title" label="Judul kolom *" :rules="[req]" :placeholder="colCtx.id ? colCtx.title : 'Misal: Review'" prepend-inner-icon="mdi-view-column-outline" />
          <v-alert v-if="colCtx.id" density="compact" variant="tonal" color="info" icon="mdi-information-outline">
            Tugas di kolom "{{ colCtx.title }}" tetap tinggal di kolom ini.
          </v-alert>
        </v-card-text>
        <v-divider />
        <v-card-actions class="px-5 py-3">
          <v-btn v-if="colCtx.id" variant="text" color="error" prepend-icon="mdi-delete-outline" @click="confirmRemoveColFromDialog">Hapus</v-btn>
          <v-spacer />
          <v-btn variant="text" @click="colDialog = false">Batal</v-btn>
          <v-btn color="primary" variant="elevated" @click="saveCol">Simpan</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="taskDialog" max-width="520" scrollable persistent>
      <v-card v-if="editBoard">
        <v-card-title class="d-flex align-center justify-space-between py-4 px-5">
          <span class="text-h6 font-weight-bold">{{ editingTask ? 'Edit Tugas' : 'Tambah Tugas' }}</span>
          <v-btn icon="mdi-close" variant="text" size="small" @click="taskDialog = false" />
        </v-card-title>
        <v-divider />
        <v-card-text class="px-5 py-4">
          <v-text-field v-model="taskForm.title" label="Judul tugas *" :rules="[req]" prepend-inner-icon="mdi-text-box-outline" />
          <v-row dense>
            <v-col cols="12" sm="6">
              <v-select
                v-model="taskForm.column"
                :items="taskCols"
                label="Kolom"
                prepend-inner-icon="mdi-view-column-outline"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field v-model="taskForm.deadline" type="date" label="Deadline" clearable prepend-inner-icon="mdi-calendar-flag" />
            </v-col>
          </v-row>

          <div v-if="editCtx.id" class="mt-2">
            <div class="text-subtitle-2 font-weight-bold mb-2">
              Todo checklist
              <span class="text-caption text-grey">({{ doneTodos(editCtx.task).length }}/{{ todosOf(editCtx.task).length }} selesai)</span>
            </div>
            <div v-for="todo in todosOf(editCtx.task)" :key="todo.id" class="d-flex align-center ga-2 pb-1">
              <v-checkbox
                :model-value="todo.done"
                density="compact"
                hide-details
                color="success"
                style="flex:none"
                @click.prevent="toggleTodo(editCtx, todo)"
              />
              <span class="text-body-2 flex-grow-1" :class="todo.done ? 'text-decoration-line-through text-medium-emphasis' : ''">{{ todo.text }}</span>
              <v-btn icon="mdi-delete-outline" size="x-small" variant="text" color="error" @click="removeTodo(editCtx, todo)" />
            </div>
            <div class="d-flex ga-2 mt-2 pr-12">
              <v-text-field
                v-model="newTodo"
                placeholder="Tambah todo baru…"
                density="compact"
                hide-details
                prepend-inner-icon="mdi-plus"
                @keyup.enter="addTodo"
              />
              <v-btn color="primary" variant="tonal" icon="mdi-plus" size="small" style="align-self:center" @click="addTodo" />
            </div>
          </div>
          <v-alert v-else density="compact" variant="tonal" color="info" icon="mdi-view-list-outline" class="mt-3">
            Todo checklist bisa ditambahkan setelah tugas disimpan.
          </v-alert>
        </v-card-text>
        <v-divider />
        <v-card-actions class="px-5 py-3">
          <v-btn v-if="editCtx.id" variant="text" color="error" prepend-icon="mdi-delete-outline" @click="removeTaskAndClose">Hapus Tugas</v-btn>
          <v-spacer />
          <v-btn variant="text" @click="taskDialog = false">Batal</v-btn>
          <v-btn color="primary" variant="elevated" @click="saveTask">Simpan</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { ref, computed, reactive } from 'vue'
import { useStore } from 'vuex'
import StatCard from '@/components/StatCard.vue'
import EmptyState from '@/components/EmptyState.vue'
import { BOARD_COLORS, MAX_BOARDS } from '@/store/modules/kanban'
import { todayISO } from '@/utils/id'

const req = v => !!(v && String(v).trim()) || 'Wajib diisi'

export default {
  name: 'KanbanView',
  components: { StatCard, EmptyState },
  setup () {
    const store = useStore()
    const boardDialog = ref(false)
    const taskDialog = ref(false)
    const colDialog = ref(false)
    const taskCtx = reactive({ board: null, id: null })
    const colCtx = reactive({ boardId: null, id: null, title: '' })
    const editingBoard = ref(null)
    const editingTask = ref(false)
    const dragTask = ref(null)
    const dragOver = ref('')
    const newTodo = ref('')
    const today = todayISO()
    const boardForm = reactive({ name: '', color: 'primary' })
    const taskForm = reactive({ title: '', column: '', deadline: '' })
    const colForm = reactive({ title: '' })

    const maxBoards = MAX_BOARDS
    const boards = computed(() => store.getters['kanban/boards'])
    const stats = computed(() => store.getters['kanban/stats'])

    const editBoard = computed(() => {
      const id = taskCtx.board && taskCtx.board.id
      return boards.value.find(b => b.id === id) || null
    })
    const editCtx = computed(() => {
      if (!editBoard.value || !taskCtx.id) return { id: null, task: {} }
      const task = (editBoard.value.tasks || []).find(t => t.id === taskCtx.id) || {}
      return { id: taskCtx.id, board: editBoard.value, task }
    })
    const taskCols = computed(() =>
      editBoard.value
        ? (editBoard.value.columns || []).map(c => ({ title: c.title, value: c.id }))
        : [])

    const tasksIn = (board, colId) => (board.tasks || []).filter(t => t.column === colId)
    const todosOf = task => (task && task.todos) || []
    const doneTodos = task => todosOf(task).filter(t => t.done)
    const todoProgress = task => {
      const list = todosOf(task)
      return list.length ? Math.round(doneTodos(task).length / list.length * 100) : 0
    }
    const isComplete = task => todosOf(task).length > 0 && doneTodos(task).length === todosOf(task).length

    function deadlineInfo (date) {
      if (!date) return { color: 'grey', text: '', icon: '' }
      const d = new Date(String(date).slice(0, 10) + 'T00:00:00')
      const now = new Date(today + 'T00:00:00')
      const diff = Math.round((d - now) / 86400000)
      const tgl = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
      if (diff < 0) return { color: 'error', text: `Terlambat ${Math.abs(diff)}h · ${tgl}`, icon: 'mdi-firealarm' }
      if (diff === 0) return { color: 'warning', text: `Deadline hari ini`, icon: 'mdi-clock-alert-outline' }
      if (diff <= 3) return { color: 'amber-darken-2', text: `${diff} hari lagi · ${tgl}`, icon: 'mdi-clock-fast' }
      return { color: 'grey', text: `${diff} hari lagi · ${tgl}`, icon: 'mdi-calendar-flag' }
    }

    function openBoardForm (board = null) {
      editingBoard.value = board
      Object.assign(boardForm, { name: board ? board.name : '', color: board ? board.color : 'primary' })
      boardDialog.value = true
    }
    function saveBoard () {
      if (!req(boardForm.name)) return
      if (editingBoard.value) {
        store.commit('kanban/UPDATE_BOARD', { id: editingBoard.value.id, data: { name: boardForm.name.trim(), color: boardForm.color } })
        store.dispatch('ui/notify', 'Board diperbarui.')
      } else {
        store.commit('kanban/ADD_BOARD', { name: boardForm.name.trim(), color: boardForm.color })
        store.dispatch('ui/notify', 'Board dibuat.')
      }
      boardDialog.value = false
    }
    function removeBoard (board) {
      if (window.confirm(`Hapus board "${board.name}" beserta ${(board.tasks || []).length} tugas di dalamnya?`)) {
        store.commit('kanban/REMOVE_BOARD', board.id)
        store.dispatch('ui/notify', { text: 'Board dihapus.', color: 'error' })
      }
    }
    function moveBoard (id, dir) { store.commit('kanban/MOVE_BOARD', { id, dir }) }

    function openColForm (board, col = null) {
      colCtx.boardId = board.id
      colCtx.id = col ? col.id : null
      colCtx.title = col ? col.title : ''
      Object.assign(colForm, { title: col ? col.title : '' })
      colDialog.value = true
    }
    function saveCol () {
      if (!req(colForm.title)) return
      if (colCtx.id) {
        store.commit('kanban/UPDATE_COLUMN', { boardId: colCtx.boardId, columnId: colCtx.id, data: { title: colForm.title.trim() } })
        store.dispatch('ui/notify', 'Kolom diperbarui.')
      } else {
        store.commit('kanban/ADD_COLUMN', { boardId: colCtx.boardId, title: colForm.title })
        store.dispatch('ui/notify', 'Kolom ditambahkan.')
      }
      colDialog.value = false
    }
    function removeColumn (board, col) {
      const n = tasksIn(board, col.id).length
      const tugas = n ? ` Tugas di kolom ini akan dipindahkan ke kolom pertama.` : ''
      if (window.confirm(`Hapus kolom "${col.title}" dari board "${board.name}"?${tugas}`)) {
        store.commit('kanban/REMOVE_COLUMN', { boardId: board.id, columnId: col.id })
        store.dispatch('ui/notify', { text: 'Kolom dihapus.', color: 'error' })
      }
    }
    function confirmRemoveColFromDialog () {
      const board = boards.value.find(b => b.id === colCtx.boardId)
      const col = board && (board.columns || []).find(c => c.id === colCtx.id)
      if (col) {
        removeColumn(board, col)
        colDialog.value = false
      }
    }
    function moveColumn (boardId, columnId, dir) {
      store.commit('kanban/MOVE_COLUMN', { boardId, columnId, dir })
    }

    function openTaskForm (board, col, task = null) {
      taskCtx.board = board
      editingTask.value = !!task
      Object.assign(taskForm, {
        title: task ? task.title : '',
        column: task ? task.column : col.id,
        deadline: task ? task.deadline : ''
      })
      taskCtx.id = task ? task.id : null
      newTodo.value = ''
      taskDialog.value = true
    }
    function saveTask () {
      if (!req(taskForm.title)) return
      const board = editBoard.value
      if (!board) return
      const colIds = (board.columns || []).map(c => c.id)
      const column = colIds.includes(taskForm.column) ? taskForm.column : colIds[0]
      if (editCtx.value.id) {
        store.commit('kanban/UPDATE_TASK', {
          boardId: board.id,
          taskId: editCtx.value.id,
          data: { title: taskForm.title.trim(), column, deadline: taskForm.deadline || '' }
        })
        store.dispatch('ui/notify', 'Tugas diperbarui.')
      } else {
        store.commit('kanban/ADD_TASK', {
          boardId: board.id,
          task: { title: taskForm.title.trim(), column, deadline: taskForm.deadline || '' }
        })
        store.dispatch('ui/notify', 'Tugas ditambahkan.')
      }
      taskDialog.value = false
    }
    function removeTask (board, task) {
      if (window.confirm(`Hapus tugas "${task.title}"?`)) {
        store.commit('kanban/REMOVE_TASK', { boardId: board.id, taskId: task.id })
        store.dispatch('ui/notify', { text: 'Tugas dihapus.', color: 'error' })
      }
    }
    function removeTaskAndClose () {
      removeTask(taskCtx.board, editCtx.value.task)
      taskDialog.value = false
    }

    function addTodo () {
      if (!newTodo.value.trim() || !editCtx.value.id) return
      store.commit('kanban/ADD_TODO', { boardId: taskCtx.board.id, taskId: editCtx.value.id, text: newTodo.value.trim() })
      newTodo.value = ''
    }
    function toggleTodo (ctx, todo) {
      store.commit('kanban/TOGGLE_TODO', { boardId: ctx.board.id, taskId: ctx.id, todoId: todo.id })
    }
    function removeTodo (ctx, todo) {
      store.commit('kanban/REMOVE_TODO', { boardId: ctx.board.id, taskId: ctx.id, todoId: todo.id })
    }

    function onDrop (board, colId) {
      if (dragTask.value && dragTask.value.boardId === board.id) {
        store.commit('kanban/MOVE_TASK', { boardId: board.id, taskId: dragTask.value.taskId, column: colId })
      }
      dragTask.value = null
      dragOver.value = ''
    }

    return {
      boardDialog, taskDialog, colDialog, taskCtx, colCtx, editingBoard, editingTask, editCtx, editBoard,
      dragTask, dragOver, newTodo, boardForm, taskForm, colForm,
      maxBoards, boards, stats, BOARD_COLORS, taskCols,
      tasksIn, todosOf, doneTodos, todoProgress, isComplete, deadlineInfo,
      openBoardForm, saveBoard, removeBoard, moveBoard,
      openColForm, saveCol, removeColumn, confirmRemoveColFromDialog, moveColumn,
      openTaskForm, saveTask, removeTask, removeTaskAndClose,
      addTodo, toggleTodo, removeTodo, onDrop, req
    }
  }
}
</script>

<style scoped>
.kb-col {
  min-width: 265px;
  flex: 1 0 265px;
  background: rgba(var(--v-theme-surface-light), 0.4);
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  transition: background-color 0.15s ease;
}
.kb-col-drag-over {
  background: rgba(var(--v-theme-primary), 0.08);
  border-color: rgba(var(--v-theme-primary), 0.4);
}
.kb-col-ghost {
  flex: 0 0 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 74px;
  cursor: pointer;
  background: transparent;
  border-style: dashed;
  color: rgba(var(--v-theme-on-surface), 0.55);
}
.kb-col-ghost:hover {
  background: rgba(var(--v-theme-primary), 0.06);
  color: var(--v-theme-primary);
  border-color: rgba(var(--v-theme-primary), 0.5);
}
.kb-card {
  cursor: grab;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  background: rgba(var(--v-theme-surface), 1);
  transition: box-shadow 0.12s ease;
}
.kb-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
.kb-card:active {
  cursor: grabbing;
}
</style>
