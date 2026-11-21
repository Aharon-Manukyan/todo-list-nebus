import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Note, Todo } from '~/types'
import { HISTORY_LIMIT } from '~/core/constants'

type Op =
  | { type: 'title'; from: string; to: string }
  | { type: 'text'; id: string; from: string; to: string }
  | { type: 'done'; id: string; from: boolean; to: boolean }
  | { type: 'add'; index: number; note: Note }
  | { type: 'remove'; index: number; note: Note }

export const useEditorStore = defineStore('editor', () => {
  const todo = ref<Todo | null>(null)
  const undoStack = ref<Op[]>([])
  const redoStack = ref<Op[]>([])
  const canUndo = computed(() => undoStack.value.length > 0)
  const canRedo = computed(() => redoStack.value.length > 0)

  const findNote = (id: string) => todo.value?.notes.find((note) => note.id === id)

  function reset() {
    undoStack.value = []
    redoStack.value = []
    todo.value = null
  }

  function initialize(source: Todo) {
    reset()
    todo.value = JSON.parse(JSON.stringify(source))
  }

  function apply(op: Op, back: boolean) {
    const todoValue = todo.value
    if (!todoValue) return
    switch (op.type) {
      case 'title':
        todoValue.title = back ? op.from : op.to
        break
      case 'text': {
        const note = findNote(op.id)
        if (note) note.text = back ? op.from : op.to
        break
      }
      case 'done': {
        const note = findNote(op.id)
        if (note) note.done = back ? op.from : op.to
        break
      }
      case 'add':
        if (back) {
          todoValue.notes = todoValue.notes.filter((note) => note.id !== op.note.id)
        } else {
          todoValue.notes.splice(op.index, 0, { ...op.note })
        }
        break
      case 'remove':
        if (back) {
          todoValue.notes.splice(op.index, 0, { ...op.note })
        } else {
          todoValue.notes = todoValue.notes.filter((note) => note.id !== op.note.id)
        }
        break
    }
  }

  function commit(op: Op) {
    apply(op, false)
    undoStack.value.push(op)
    if (undoStack.value.length > HISTORY_LIMIT) undoStack.value.shift()
    redoStack.value = []
  }

  function undo() {
    const op = undoStack.value.pop()
    if (!op) return
    apply(op, true)
    redoStack.value.push(op)
  }

  function redo() {
    const op = redoStack.value.pop()
    if (!op) return
    apply(op, false)
    undoStack.value.push(op)
  }

  function setTitle(value: string) {
    if (todo.value && todo.value.title !== value) {
      commit({ type: 'title', from: todo.value.title, to: value })
    }
  }

  function setText(id: string, value: string) {
    const note = findNote(id)
    if (note && note.text !== value) commit({ type: 'text', id, from: note.text, to: value })
  }

  function setToggle(id: string) {
    const note = findNote(id)
    if (note) commit({ type: 'done', id, from: note.done, to: !note.done })
  }

  function addNote(note: Note) {
    if (todo.value) commit({ type: 'add', index: todo.value.notes.length, note })
  }

  function removeNote(index: number) {
    const note = todo.value?.notes[index]
    if (note) commit({ type: 'remove', index, note: { ...note } })
  }

  return {
    todo,
    undoStack,
    redoStack,
    canUndo,
    canRedo,
    initialize,
    reset,
    undo,
    redo,
    setTitle,
    setText,
    setToggle,
    addNote,
    removeNote,
  }
})
