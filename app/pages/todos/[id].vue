<template>
  <div class="page">
    <section v-if="status === 'not-found'" class="missing">
      <h1 class="missing__title">Заметка не найдена</h1>
      <p class="missing__text">Возможно, её удалили или ссылка введена с ошибкой.</p>
      <TodoButton to="/" variant="primary"> <AppIcon name="back" /> К списку заметок </TodoButton>
    </section>

    <section v-else-if="todo" class="editor">
      <div class="bar" role="toolbar" aria-label="Действия с заметкой">
        <div class="bar__group">
          <TodoButton
            variant="secondary"
            :disabled="!canUndo"
            title="Отменить изменение (Ctrl+Z)"
            @click="undo"
          >
            <AppIcon name="undo" /> Отменить
          </TodoButton>
          <TodoButton
            variant="secondary"
            :disabled="!canRedo"
            title="Повторить изменение (Shift+Ctrl+Z)"
            @click="redo"
          >
            <AppIcon name="redo" /> Повторить
          </TodoButton>
        </div>
        <div class="bar__group bar__group--end">
          <TodoButton v-if="!isNew" variant="danger" @click="askDelete">
            <AppIcon name="trash" /> Удалить
          </TodoButton>
          <TodoButton variant="ghost" @click="askCancel">
            <AppIcon name="back" /> Отмена
          </TodoButton>
          <TodoButton variant="primary" @click="onSave">
            <AppIcon name="save" /> Сохранить
          </TodoButton>
        </div>
      </div>

      <input
        :value="todo.title"
        class="title"
        placeholder="Название заметки"
        aria-label="Название заметки"
        @change="setTitle(($event.target as HTMLInputElement).value)"
      />

      <ul class="todos">
        <li v-for="(note, index) in todo.notes" :key="note.id" class="todo">
          <input
            type="checkbox"
            :checked="note.done"
            aria-label="Выполнено"
            @change="setToggle(note.id)"
          />
          <input
            :value="note.text"
            class="todo__text"
            :class="{ 'todo__text--done': note.done }"
            placeholder="Что нужно сделать?"
            aria-label="Текст пункта"
            @change="setText(note.id, ($event.target as HTMLInputElement).value)"
          />
          <TodoButton variant="danger" aria-label="Удалить пункт" @click="removeNote(index)">
            <AppIcon name="trash" />
          </TodoButton>
        </li>
      </ul>

      <TodoButton class="add" variant="secondary" @click="addTodo">
        <AppIcon name="plus" /> Добавить пункт
      </TodoButton>
    </section>

    <TodoConfirm
      :open="deleting"
      title="Удалить заметку?"
      :message="`«${todo?.title.trim() || 'Без названия'}» будет удалена без возможности восстановления.`"
      @confirm="confirmDelete"
      @cancel="deleting = false"
    />

    <TodoConfirm
      :open="cancelling"
      title="Отменить редактирование?"
      message="Все несохранённые изменения будут потеряны."
      confirm-label="Отменить изменения"
      cancel-label="Продолжить"
      @confirm="confirmCancel"
      @cancel="cancelling = false"
    />
  </div>
</template>

<script setup lang="ts">
import { v4 } from 'uuid'
import { storeToRefs } from 'pinia'
import { useEditorStore } from '~/stores/editor'
import { useTodosStore } from '~/stores/todos'
import type { Todo } from '~/types'

const todosStore = useTodosStore()
const { getById, saveTodo, removeTodo } = todosStore

const { id } = useRoute().params
const todoId = computed(() => String(id))

const isNew = todoId.value === 'new'
const existing = isNew ? undefined : getById(todoId.value)
const status: 'ready' | 'not-found' = isNew || existing ? 'ready' : 'not-found'
const createEmpty = (): Todo => ({ id: v4(), title: '', notes: [] })

const editor = useEditorStore()
if (status === 'ready') editor.initialize(existing ?? createEmpty())
const { todo, canUndo, canRedo } = storeToRefs(editor)
const { undo, redo, setTitle, setText, setToggle, addNote, removeNote } = editor

onBeforeUnmount(editor.reset)

const deleting = ref(false)
const cancelling = ref(false)

const addTodo = () => {
  addNote({
    id: v4(),
    text: '',
    done: false,
    createdAt: '',
    updatedAt: '',
  })
}

const onSave = () => {
  if (todo.value) saveTodo(todo.value)
  navigateTo('/')
}

const askDelete = () => {
  deleting.value = true
}

const askCancel = () => {
  cancelling.value = true
}

const confirmDelete = () => {
  deleting.value = false
  removeTodo(todoId.value)
  navigateTo('/')
}

const confirmCancel = () => {
  cancelling.value = false
  navigateTo('/')
}
</script>

<style scoped lang="scss">
.bar {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.75rem;
  margin: 10px 0;

  &__group {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    &--end {
      margin-left: auto;
    }
  }
}

.title {
  display: block;
  width: 100%;
  padding: 0.4rem 0.5rem;
  border: 1.5px solid transparent;
  border-bottom-color: var(--ink);
  border-radius: 6px 6px 0 0;
  background: transparent;
  font: 700 clamp(1.7rem, 5vw, 2.4rem)/1.2 var(--font-title);
  &::placeholder {
    color: var(--muted);
    opacity: 0.7;
  }
  &:focus-visible {
    background: #fff;
  }
}

.todos {
  margin-top: 1rem;
  border-top: 1px solid var(--line);
}

.todo {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.35rem 0;
  border-bottom: 1px solid var(--line);

  &__text {
    flex: 1;
    min-width: 0;
    padding: 0.4rem 0.5rem;
    font: inherit;

    &--done {
      text-decoration: line-through;
    }
  }
}

.add {
  margin-top: 1rem;
}
</style>
