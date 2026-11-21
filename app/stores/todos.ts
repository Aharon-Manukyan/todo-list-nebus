import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Todo } from '~/types'
import { STORAGE_KEY } from '~/core/constants'

function load(): Todo[] {
  if (typeof localStorage === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    return []
  }
}

export const useTodosStore = defineStore('todos', () => {
  const todos = ref<Todo[]>(load())

  function saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos.value))
  }

  function getById(id: string): Todo | undefined {
    return todos.value.find((todo) => todo.id === id)
  }

  function saveTodo(todo: Todo) {
    const copy: Todo = JSON.parse(JSON.stringify(todo)) // копия, чтобы не делить объект со страницей
    const rest = todos.value.filter((todo) => todo.id !== copy.id)
    todos.value = [...rest, copy]
    saveToStorage()
  }

  function removeTodo(id: string) {
    todos.value = todos.value.filter((todo) => todo.id !== id)
    saveToStorage()
  }

  return { todos, getById, saveTodo, removeTodo }
})
