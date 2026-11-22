import type { Note, Todo } from '../app/types'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { STORAGE_KEY } from '../app/core/constants'
import { SCHEMA_VERSION, saveTodos } from '../app/core/storage'
import { useEditorStore } from '../app/stores/editor'
import { useTodosStore } from '../app/stores/todos'

const todo = (id: string, texts = ['x']) => ({
  id,
  title: `T${id}`,
  notes: texts.map((text, i) => ({
    id: `${id}${i}`,
    text,
    done: false,
    createdAt: '',
    updatedAt: '',
  })),
})
const ids = (store: ReturnType<typeof useTodosStore>) => store.todos.map((todo: Todo) => todo.id)

let store: ReturnType<typeof useTodosStore>
beforeEach(() => {
  localStorage.clear()
  setActivePinia(createPinia())
  store = useTodosStore()
})
afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})
it('saveTodo пишет в хранилище с версией схемы и подхватывается при старте', () => {
  store.saveTodo(todo('a'))
  expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).version).toBe(SCHEMA_VERSION)

  setActivePinia(createPinia())
  expect(ids(useTodosStore())).toEqual(['a'])
})

it('saveTodo сохраняет копию, а не ссылку', () => {
  const source = todo('a')
  store.saveTodo(source)
  source.title = 'изменено'
  expect(store.getById('a')?.title).toBe('Ta')
})

it('saveTodo отбрасывает пустые пункты и не обрезает остальные', () => {
  store.saveTodo(todo('a', ['  молоко  ', '', '   ']))
  expect(store.getById('a')?.notes.map((note: Note) => note.text)).toEqual(['  молоко  '])
})

it('новая заметка идёт в конец, изменённая остаётся на месте', () => {
  store.saveTodo(todo('a'))
  store.saveTodo(todo('b'))
  store.saveTodo(todo('c'))
  store.saveTodo({ ...todo('a'), title: 'новое' })

  expect(ids(store)).toEqual(['a', 'b', 'c'])
  expect(store.getById('a')?.title).toBe('новое')
})

it('removeTodo удаляет и обновляет хранилище', () => {
  store.saveTodo(todo('a'))
  store.saveTodo(todo('b'))
  store.removeTodo('a')
  store.removeTodo('нет') // несуществующая — без ошибки

  expect(ids(store)).toEqual(['b'])
  expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).todos).toHaveLength(1)
})

it('reload отражает изменения из другой вкладки', () => {
  store.saveTodo(todo('a'))
  saveTodos([todo('b')])
  store.reload()
  expect(ids(store)).toEqual(['b'])
})

it('запись в хранилище только при сохранении, а не при каждой правке', () => {
  const setItem = vi.fn()
  vi.stubGlobal('localStorage', { getItem: () => null, setItem, removeItem: vi.fn() })
  const editor = useEditorStore()

  editor.initialize(todo('a'))
  editor.setTitle('1')
  editor.setToggle('a0')
  editor.undo()
  expect(setItem).not.toHaveBeenCalled()

  store.saveTodo(editor.todo!)
  expect(setItem).toHaveBeenCalledTimes(1)
})
