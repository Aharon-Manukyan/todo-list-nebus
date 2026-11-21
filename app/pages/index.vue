<template>
  <div class="page">
    <div class="head">
      <h1 class="head__title">Все заметки</h1>
      <TodoButton to="/todos/new" variant="primary">
        <span>Новая заметка</span>
      </TodoButton>
    </div>

    <ul v-if="todos.length" class="grid">
      <li v-for="todo in todos" :key="todo.id">
        <TodoCard :todo="todo" @delete="askDelete(todo)" />
      </li>
    </ul>

    <section v-else class="empty">
      <h2 class="empty__title">Здесь пока пусто</h2>
      <p class="empty__text">Создайте первую заметку и добавьте в неё список задач.</p>
      <TodoButton to="/todos/new" variant="primary">
        <span>Создать заметку</span>
      </TodoButton>
    </section>
    <TodoConfirm
      :open="!!deleting"
      title="Удалить заметку?"
      :message="`«${deleting?.title.trim() || 'Без названия'}» будет удалена без возможности восстановления.`"
      @confirm="confirmDelete"
      @cancel="deleting = null"
    />
  </div>
</template>

<script setup lang="ts">
import TodoButton from '~/components/TodoButton.vue'
import TodoCard from '~/components/TodoCard.vue'
import { storeToRefs } from 'pinia'
import { useTodosStore } from '~/stores/todos'

useHead({ title: 'Заметки' })

const todosStore = useTodosStore()
const { todos } = storeToRefs(todosStore)
const { removeTodo } = todosStore

const deleting = ref<Todo | null>(null)

const askDelete = (todo: Todo) => {
  deleting.value = todo
}

const confirmDelete = () => {
  if (deleting.value) removeTodo(deleting.value.id)
  deleting.value = null
}
</script>
<style scoped lang="scss">
.head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 1.5rem;

  &__title {
    font: 700 clamp(1.8rem, 5vw, 2.6rem)/1.1 var(--font-title);
  }
}

.grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 19rem), 1fr));

  > li {
    display: flex;
    > * {
      flex: 1;
    }
  }
}

.empty {
  max-width: 28rem;
  padding: 2rem 0;

  &__title {
    font: 700 1.6rem/1.2 var(--font-title);
  }
  &__text {
    margin: 0.4rem 0 1.25rem;
    color: var(--muted);
  }
}
</style>
