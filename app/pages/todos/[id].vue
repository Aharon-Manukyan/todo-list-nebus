<template>
  <div class="page">
    <section v-if="status === 'not-found'" class="missing">
      <h1 class="missing__title">Заметка не найдена</h1>
      <p class="missing__text">Возможно, её удалили или ссылка введена с ошибкой.</p>
      <TodoButton to="/" variant="primary"> <AppIcon name="back" /> К списку заметок </TodoButton>
    </section>

    <section v-else-if="todo" class="editor">
      <p v-if="deletedElsewhere" class="notice" role="alert">
        Эта заметка была удалена в другой вкладке. Если сохранить её, она вернётся в список.
      </p>
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
          <TodoButton v-if="!isNew && !deletedElsewhere" variant="danger" @click="askDelete">
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
        <TodoItemRow
          v-for="(note, index) in todo.notes"
          :key="note.id"
          :note="note"
          @toggle="setToggle(note.id)"
          @edit="setText(note.id, $event)"
          @remove="removeNote(index)"
        />
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

    <TodoConfirm
      :open="leaveAsked"
      title="Выйти без сохранения?"
      message="Несохранённые изменения будут потеряны."
      confirm-label="Выйти без сохранения"
      cancel-label="Остаться"
      @confirm="answerLeave(true)"
      @cancel="answerLeave(false)"
    />

    <TodoConfirm
      :open="!!draftPrompt"
      title="Восстановить черновик?"
      :message="draftMessage"
      confirm-label="Восстановить"
      cancel-label="Отбросить"
      confirm-variant="primary"
      initial-focus="confirm"
      @confirm="restoreDraft"
      @cancel="discardDraft"
    />
  </div>
</template>

<script setup lang="ts">
import { v4 } from 'uuid'
import { useTodosStore } from '~/stores/todos'
import { onBeforeRouteLeave } from 'vue-router'
import { useDraftAutosave } from '~/core/draft'
import { clearDraft, loadDraft, type Draft } from '~/core/storage'
import { storeToRefs } from 'pinia'
import { useEditorStore } from '~/stores/editor'
import type { Todo } from '~/types'
import { useUndoShortcuts } from '~/core/undoShortcuts'

const todosStore = useTodosStore()
const { todos } = storeToRefs(todosStore)
const { getById, saveTodo, removeTodo } = todosStore

const todoId = String(useRoute().params.id)

const isNew = todoId === 'new'
const existing = isNew ? undefined : getById(todoId)
const status: 'ready' | 'not-found' = isNew || existing ? 'ready' : 'not-found'
const createEmpty = (id: string = v4()): Todo => ({ id, title: '', notes: [] })

const editor = useEditorStore()
const { todo, canUndo, canRedo } = storeToRefs(editor)
const { undo, redo, setTitle, setText, setToggle, addNote, removeNote } = editor

useUndoShortcuts(undo, redo)

useHead({ title: existing?.title ?? 'Новая заметка' })

onBeforeUnmount(editor.reset)

const draftActive = ref(false)
useDraftAutosave(todoId, draftActive)
const draftPrompt = ref<Draft | null>(null)

const isUsableDraft = (saved: Draft) =>
  isNew || (saved.todo.id === todoId && JSON.stringify(saved.todo) !== JSON.stringify(existing))

if (status === 'ready') {
  editor.initialize(existing ?? createEmpty())
  const saved = loadDraft(todoId)
  if (saved && isUsableDraft(saved)) {
    draftPrompt.value = saved
  } else {
    clearDraft(todoId)
    draftActive.value = true
  }
} else {
  clearDraft(todoId)
}

const draftMessage = computed(() => {
  const at = draftPrompt.value?.savedAt
  return at
    ? `Найдены несохранённые изменения от ${new Date(at).toLocaleString('ru-RU')}. Восстановить их?`
    : 'Найдены несохранённые изменения. Восстановить их?'
})

const restoreDraft = () => {
  const saved = draftPrompt.value
  if (!saved) return
  draftPrompt.value = null
  editor.initialize(saved.todo, existing ?? createEmpty(saved.todo.id))
  draftActive.value = true
}

const discardDraft = () => {
  if (!draftPrompt.value) return
  draftPrompt.value = null
  clearDraft(todoId)
  draftActive.value = true
}

const stopDraft = () => {
  draftActive.value = false
  clearDraft(todoId)
}

let leaving = false
const leaveAsked = ref(false)
let leaveAnswer: ((ok: boolean) => void) | null = null

onBeforeRouteLeave(() => {
  if (leaving || !editor.isChanged) return true
  leaveAnswer?.(false) // на случай повторного перехода, пока окно открыто
  leaveAsked.value = true
  return new Promise<boolean>((resolve) => {
    leaveAnswer = resolve
  })
})

const answerLeave = (ok: boolean) => {
  const answer = leaveAnswer
  if (!answer) return
  leaveAnswer = null
  leaveAsked.value = false
  if (ok) {
    leaving = true
    stopDraft()
  }
  answer(ok)
}

const leave = () => {
  leaving = true
  stopDraft()
  navigateTo('/')
}

const deletedElsewhere = ref(false)
watch(todos, () => {
  if (isNew || leaving || status !== 'ready') return
  deletedElsewhere.value = !getById(todoId)
})

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
  leave()
}

const askDelete = () => {
  deleting.value = true
}

const askCancel = () => {
  cancelling.value = true
}

const confirmDelete = () => {
  deleting.value = false
  removeTodo(todoId)
  leave()
}

const confirmCancel = () => {
  cancelling.value = false
  leave()
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

.add {
  margin-top: 1rem;
}

.notice {
  margin-bottom: 1rem;
  padding: 0.6rem 0.8rem;
  border: 1.5px solid var(--danger);
  border-radius: 8px;
  background: #fff;
  color: var(--danger);
}
</style>
