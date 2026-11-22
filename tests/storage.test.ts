import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { DRAFT_PREFIX, STORAGE_KEY } from '../app/core/constants'
import {
  SCHEMA_VERSION as V,
  clearDraft,
  loadDraft,
  loadTodos,
  migrate,
  parseDraft,
  saveDraft,
  saveTodos,
} from '../app/core/storage'

const todo = (id = 't') => ({
  id,
  title: 'T',
  notes: [{ id: 'n', text: 'x', done: false, createdAt: '', updatedAt: '' }],
})

beforeEach(() => localStorage.clear())
afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})
it('migrate принимает старый и новый формат, остальное игнорирует', () => {
  expect(migrate([todo()])).toEqual([todo()])
  expect(migrate({ version: V, todos: [todo()] })).toEqual([todo()])
  expect(migrate({ version: V + 1, todos: [todo()] })).toEqual([])
  expect(migrate(null)).toEqual([])
  expect(migrate('мусор')).toEqual([])
})

it('saveTodos пишет версию схемы, loadTodos читает', () => {
  saveTodos([todo()])
  expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual({ version: V, todos: [todo()] })
  expect(loadTodos()).toEqual([todo()])
})

it('повреждённые данные не ломают загрузку', () => {
  localStorage.setItem(STORAGE_KEY, '{не json')
  expect(loadTodos()).toEqual([])
  localStorage.setItem(`${DRAFT_PREFIX}t`, '{не json')
  expect(loadDraft('t')).toBeNull()
})

it('черновики: запись, чтение, раздельное хранение, удаление', () => {
  vi.spyOn(Date, 'now').mockReturnValue(123)
  saveDraft('a', todo('a'))
  saveDraft('new', todo('x'))

  expect(loadDraft('a')).toEqual({ version: V, savedAt: 123, todo: todo('a') })
  expect(loadDraft('new')?.todo.id).toBe('x')
  expect(localStorage.getItem(STORAGE_KEY)).toBeNull() // список заметок не затронут

  clearDraft('a')
  expect(loadDraft('a')).toBeNull()
  expect(loadDraft('new')).not.toBeNull()
})

it('ошибка хранилища не роняет запись', () => {
  const error = vi.spyOn(console, 'error').mockImplementation(() => {})
  vi.stubGlobal('localStorage', {
    setItem: () => {
      throw new Error('quota')
    },
  })

  expect(() => saveTodos([todo()])).not.toThrow()
  expect(() => saveDraft('t', todo())).not.toThrow()
  expect(error).toHaveBeenCalledTimes(2)
})

it('parseDraft отклоняет чужой или битый формат', () => {
  const ok = { version: V, savedAt: 1, todo: todo() }
  expect(parseDraft(ok)).toEqual(ok)

  expect(parseDraft({ ...ok, version: V + 1 })).toBeNull()
  expect(parseDraft({ version: V })).toBeNull()
  expect(parseDraft({ ...ok, todo: { ...todo(), notes: 'x' } })).toBeNull()
  expect(parseDraft({ ...ok, todo: { ...todo(), notes: [{ id: 'n', done: 1 }] } })).toBeNull()
})
