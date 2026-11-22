import type { Todo } from '~/types'
import { STORAGE_KEY, DRAFT_PREFIX } from './constants'

export const SCHEMA_VERSION = 1
const draftKey = (routeId: string) => `${DRAFT_PREFIX}${routeId}`

export interface Draft {
  version: number
  savedAt: number
  todo: Todo
}

interface StoredData {
  version: number
  todos: Todo[]
}

export function migrate(data: unknown): Todo[] {
  if (Array.isArray(data)) return data

  const stored = data as Partial<StoredData> | null
  if (stored?.version === SCHEMA_VERSION && Array.isArray(stored.todos)) return stored.todos

  return []
}

export function loadTodos(): Todo[] {
  if (typeof localStorage === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? migrate(JSON.parse(raw)) : []
  } catch {
    return []
  }
}

export function saveTodos(todos: Todo[]): void {
  const data: StoredData = { version: SCHEMA_VERSION, todos }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.error('Не удалось сохранить данные', error)
  }
}

export function saveDraft(routeId: string, todo: Todo): void {
  const draft: Draft = { version: SCHEMA_VERSION, savedAt: Date.now(), todo }

  try {
    localStorage.setItem(draftKey(routeId), JSON.stringify(draft))
  } catch (error) {
    console.error('Не удалось сохранить черновик', error)
  }
}

export function clearDraft(routeId: string): void {
  try {
    localStorage.removeItem(draftKey(routeId))
  } catch {
    console.log('localStorage', localStorage)
  }
}

export function parseDraft(data: unknown): Draft | null {
  const draft = data as Partial<Draft> | null
  const todo = draft?.todo
  if (draft?.version !== SCHEMA_VERSION || !todo) return null
  if (typeof todo.id !== 'string' || typeof todo.title !== 'string') return null
  if (!Array.isArray(todo.notes)) return null

  const notesValid = todo.notes.every(
    (note) =>
      typeof note?.id === 'string' &&
      typeof note.text === 'string' &&
      typeof note.done === 'boolean',
  )
  return notesValid ? { version: draft.version, savedAt: draft.savedAt ?? 0, todo } : null
}

export function loadDraft(routeId: string): Draft | null {
  if (typeof localStorage === 'undefined') return null
  try {
    const raw = localStorage.getItem(draftKey(routeId))
    return raw ? parseDraft(JSON.parse(raw)) : null
  } catch {
    return null
  }
}
