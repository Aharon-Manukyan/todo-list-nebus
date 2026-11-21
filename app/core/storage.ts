import type { Todo } from '~/types'

export const STORAGE_KEY = 'todos'
export const SCHEMA_VERSION = 1

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
