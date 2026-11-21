import { ref } from 'vue'
import type { Todo } from '~/types/'

const KEY = 'todos'

function load(): Todo[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]')
  } catch {
    return []
  }
}

const todos = ref<Todo[]>(load())

function saveToStorage() {
  localStorage.setItem(KEY, JSON.stringify(todos.value))
}

export function useTodosStore() {
  return {
    todos,

    getById: (id: string) => todos.value.find((todo) => todo.id === id),

    saveTodo(todo: Todo) {
      const copy: Todo = JSON.parse(JSON.stringify(todo)) // копия, чтобы не делить объект со страницей
      const rest = todos.value.filter((todo) => todo.id !== copy.id)
      todos.value = [...rest, copy]
      saveToStorage()
    },

    removeTodo(id: string) {
      todos.value = todos.value.filter((todo) => todo.id !== id)
      saveToStorage()
    },
  }
}
