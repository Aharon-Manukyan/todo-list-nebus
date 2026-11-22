import { beforeEach, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { HISTORY_LIMIT } from '../app/core/constants'
import { useEditorStore } from '../app/stores/editor'
import type { Note } from '../app/types'

const note = (id: string) => ({ id, text: id, done: false, createdAt: '', updatedAt: '' })
const make = () => ({ id: 't', title: 'T', notes: [note('a'), note('b'), note('c')] })

let editor: ReturnType<typeof useEditorStore>
beforeEach(() => {
  setActivePinia(createPinia())
  editor = useEditorStore()
  editor.initialize(make())
})

it('каждая операция — одна запись, одинаковое значение не пишется', () => {
  editor.setTitle('T')
  editor.setText('a', 'a')
  expect(editor.undoStack).toHaveLength(0)

  editor.setTitle('X')
  editor.setText('a', 'x')
  editor.setToggle('b')
  editor.addNote(note('d'))
  editor.removeNote(0)
  expect(editor.undoStack).toHaveLength(5)
})

it('undo и redo полностью обратимы', () => {
  const start = JSON.stringify(editor.todo)
  editor.setTitle('X')
  editor.setText('a', 'x')
  editor.setToggle('b')
  editor.addNote(note('d'))
  editor.removeNote(1)
  const end = JSON.stringify(editor.todo)

  while (editor.canUndo) editor.undo()
  expect(JSON.stringify(editor.todo)).toBe(start)

  while (editor.canRedo) editor.redo()
  expect(JSON.stringify(editor.todo)).toBe(end)
})

it('удалённый пункт возвращается на своё место', () => {
  editor.removeNote(1)
  editor.undo()
  expect(editor.todo?.notes.map((note: Note) => note.id)).toEqual(['a', 'b', 'c'])
})

it('новое изменение после undo очищает redo', () => {
  editor.setTitle('1')
  editor.undo()
  expect(editor.canRedo).toBe(true)
  editor.setTitle('2')
  expect(editor.canRedo).toBe(false)
})

it('лимит истории и хранение изменений, а не копий', () => {
  for (let i = 1; i <= HISTORY_LIMIT + 10; i++) editor.setTitle(`v${i}`)
  expect(editor.undoStack).toHaveLength(HISTORY_LIMIT)

  while (editor.canUndo) editor.undo()
  expect(editor.todo?.title).toBe('v10')

  editor.setText('a', 'x')
  expect(editor.undoStack[0]).not.toHaveProperty('notes')
})

it('clearHistory и reset', () => {
  editor.setTitle('X')
  editor.clearHistory()
  expect(editor.canUndo).toBe(false)
  expect(editor.todo).not.toBeNull()

  editor.reset()
  expect(editor.todo).toBeNull()
})

it('isChanged следит за отличием от исходной версии', () => {
  expect(editor.isChanged).toBe(false)
  editor.setTitle('X')
  expect(editor.isChanged).toBe(true)
  editor.undo()
  expect(editor.isChanged).toBe(false)

  editor.initialize({ ...make(), title: 'Черновик' }, make())
  expect(editor.isChanged).toBe(true)
})
