import { read, write } from '@/utils/storage'
import { uid, nowISO, todayISO } from '@/utils/id'

export const MAX_BOARDS = 15

export const CUSTOM_COLUMN_ICON = 'mdi-circle-outline'
export const CUSTOM_COLUMN_COLOR = 'secondary'

export const DEFAULT_COLUMNS = () => ([
  { id: 'todo', title: 'To Do', icon: 'mdi-clock-outline', color: 'primary' },
  { id: 'doing', title: 'Dikerjakan', icon: 'mdi-progress-clock', color: 'warning' },
  { id: 'done', title: 'Selesai', icon: 'mdi-check-circle-outline', color: 'success' }
])

export const BOARD_COLORS = [
  'primary', 'secondary', 'success', 'warning', 'error', 'purple', 'teal', 'deep-orange', 'indigo', 'blue-grey'
]

const DAY = 86400000

function normalizeBoard (b) {
  const defs = DEFAULT_COLUMNS()
  let cols
  if (Array.isArray(b.columns) && b.columns.length) {
    cols = b.columns.map(c => {
      const def = defs.find(d => d.id === c.id)
      return {
        id: c.id || uid('col'),
        title: c.title || (def ? def.title : 'Kolom'),
        icon: c.icon || (def ? def.icon : CUSTOM_COLUMN_ICON),
        color: c.color || (def ? def.color : CUSTOM_COLUMN_COLOR)
      }
    })
  } else {
    cols = defs
  }
  const valid = new Set(cols.map(c => c.id))
  const tasks = (b.tasks || []).map(t => ({
    ...t,
    todos: Array.isArray(t.todos) ? t.todos : [],
    column: valid.has(t.column) && cols[0] ? t.column : (cols[0] ? cols[0].id : '')
  }))
  return { ...b, columns: cols, tasks }
}

const state = () => ({ list: (read('kanban', []) || []).map(normalizeBoard) })

const getters = {
  boards: s => s.list,
  count: s => s.list.length,
  full: s => s.list.length >= MAX_BOARDS,
  taskCount: s => s.list.reduce((n, b) => n + (b.tasks || []).length, 0),
  stats: s => {
    let total = 0, late = 0, soon = 0
    const t0 = new Date(todayISO() + 'T00:00:00').getTime()
    s.list.forEach(b => (b.tasks || []).forEach(t => {
      total += 1
      if (t.deadline) {
        const d = new Date(String(t.deadline).slice(0, 10) + 'T00:00:00').getTime()
        const diff = Math.round((d - t0) / DAY)
        if (diff < 0) late += 1
        else if (diff <= 3) soon += 1
      }
    }))
    return { total, late, soon, boards: s.list.length }
  }
}

function persist (s) { write('kanban', s.list) }

function findBoard (s, boardId) { return s.list.find(b => b.id === boardId) }
function findTask (board, taskId) { return (board.tasks || []).find(t => t.id === taskId) }

const mutations = {
  ADD_BOARD (s, { name, color }) {
    if (s.list.length >= MAX_BOARDS) return
    s.list.push({
      id: uid('kb'),
      name: String(name).trim() || 'Board Baru',
      color: color || 'primary',
      columns: DEFAULT_COLUMNS(),
      tasks: [],
      createdAt: nowISO(),
      updatedAt: nowISO()
    })
    persist(s)
  },
  UPDATE_BOARD (s, { id, data }) {
    const board = findBoard(s, id)
    if (board) {
      Object.assign(board, data, { updatedAt: nowISO() })
      persist(s)
    }
  },
  REMOVE_BOARD (s, id) {
    s.list = s.list.filter(b => b.id !== id)
    persist(s)
  },
  MOVE_BOARD (s, { id, dir }) {
    const idx = s.list.findIndex(b => b.id === id)
    const next = idx + dir
    if (idx >= 0 && next >= 0 && next < s.list.length) {
      const list = [...s.list]
      const [item] = list.splice(idx, 1)
      list.splice(next, 0, item)
      s.list = list
      persist(s)
    }
  },
  ADD_COLUMN (s, { boardId, title }) {
    const board = findBoard(s, boardId)
    if (!board) return
    board.columns = [...(board.columns || []), {
      id: uid('col'),
      title: String(title).trim() || 'Kolom Baru',
      icon: CUSTOM_COLUMN_ICON,
      color: CUSTOM_COLUMN_COLOR
    }]
    board.updatedAt = nowISO()
    persist(s)
  },
  UPDATE_COLUMN (s, { boardId, columnId, data }) {
    const board = findBoard(s, boardId)
    const col = board && (board.columns || []).find(c => c.id === columnId)
    if (col) {
      Object.assign(col, data)
      board.updatedAt = nowISO()
      persist(s)
    }
  },
  REMOVE_COLUMN (s, { boardId, columnId }) {
    const board = findBoard(s, boardId)
    if (!board || !(board.columns || []).length) return
    const cols = board.columns
    if (cols.length <= 1) return
    const survivor = cols.find(c => c.id !== columnId)
    if (!survivor) return
    board.columns = cols.filter(c => c.id !== columnId)
    board.tasks = (board.tasks || []).map(t => t.column === columnId ? { ...t, column: survivor.id } : t)
    board.updatedAt = nowISO()
    persist(s)
  },
  MOVE_COLUMN (s, { boardId, columnId, dir }) {
    const board = findBoard(s, boardId)
    if (!board) return
    const idx = (board.columns || []).findIndex(c => c.id === columnId)
    const next = idx + dir
    if (idx >= 0 && next >= 0 && next < board.columns.length) {
      const list = [...board.columns]
      const [item] = list.splice(idx, 1)
      list.splice(next, 0, item)
      board.columns = list
      board.updatedAt = nowISO()
      persist(s)
    }
  },
  ADD_TASK (s, { boardId, task }) {
    const board = findBoard(s, boardId)
    if (!board || !(board.columns || []).length) return
    board.tasks = [...(board.tasks || []), {
      id: uid('tsk'),
      title: String(task.title || '').trim() || 'Tugas',
      column: board.columns.some(c => c.id === task.column) ? task.column : board.columns[0].id,
      deadline: task.deadline || '',
      todos: [],
      createdAt: nowISO(),
      updatedAt: nowISO()
    }]
    board.updatedAt = nowISO()
    persist(s)
  },
  UPDATE_TASK (s, { boardId, taskId, data }) {
    const board = findBoard(s, boardId)
    const task = board && findTask(board, taskId)
    if (task) {
      Object.assign(task, data, { updatedAt: nowISO() })
      board.updatedAt = nowISO()
      persist(s)
    }
  },
  REMOVE_TASK (s, { boardId, taskId }) {
    const board = findBoard(s, boardId)
    if (board) {
      board.tasks = (board.tasks || []).filter(t => t.id !== taskId)
      board.updatedAt = nowISO()
      persist(s)
    }
  },
  MOVE_TASK (s, { boardId, taskId, column }) {
    const board = findBoard(s, boardId)
    if (!board || !(board.columns || []).some(c => c.id === column)) return
    const task = findTask(board, taskId)
    if (task) {
      task.column = column
      task.updatedAt = nowISO()
      board.updatedAt = nowISO()
      persist(s)
    }
  },
  ADD_TODO (s, { boardId, taskId, text }) {
    const board = findBoard(s, boardId)
    const task = board && findTask(board, taskId)
    if (task && String(text).trim()) {
      task.todos = [...(task.todos || []), { id: uid('tdo'), text: String(text).trim(), done: false, createdAt: nowISO() }]
      task.updatedAt = nowISO()
      board.updatedAt = nowISO()
      persist(s)
    }
  },
  TOGGLE_TODO (s, { boardId, taskId, todoId }) {
    const board = findBoard(s, boardId)
    const task = board && findTask(board, taskId)
    const todo = task && (task.todos || []).find(t => t.id === todoId)
    if (todo) {
      todo.done = !todo.done
      task.updatedAt = nowISO()
      board.updatedAt = nowISO()
      persist(s)
    }
  },
  REMOVE_TODO (s, { boardId, taskId, todoId }) {
    const board = findBoard(s, boardId)
    const task = board && findTask(board, taskId)
    if (task) {
      task.todos = (task.todos || []).filter(t => t.id !== todoId)
      task.updatedAt = nowISO()
      board.updatedAt = nowISO()
      persist(s)
    }
  },
  REPLACE_ALL (s, list) {
    s.list = Array.isArray(list) ? list.map(normalizeBoard) : []
    write('kanban', s.list)
  }
}

export default { namespaced: true, state, getters, mutations }
