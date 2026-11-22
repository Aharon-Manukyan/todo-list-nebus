import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Todo } from '~/types'
import { loadTodos, saveTodos } from '~/core/storage'

export const useTodosStore = defineStore('todos', () => {
  const todos = ref<Todo[]>(loadTodos())

  const getById = (id: string) => todos.value.find((todo) => todo.id === id)

  function saveTodo(todo: Todo) {
    const copy: Todo = JSON.parse(JSON.stringify(todo))
    copy.notes = copy.notes.filter((note) => note.text.trim() !== '')
    todos.value = [...todos.value.filter((item) => item.id !== copy.id), copy]
    saveTodos(todos.value)
  }

  function removeTodo(id: string) {
    todos.value = todos.value.filter((todo) => todo.id !== id)
    saveTodos(todos.value)
  }

  function reload() {
    todos.value = loadTodos()
  }

  return { todos, getById, saveTodo, removeTodo, reload }
})
