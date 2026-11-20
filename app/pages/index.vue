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
        <TodoCard :todo="todo" />
      </li>
    </ul>

    <section v-else class="empty">
      <h2 class="empty__title">Здесь пока пусто</h2>
      <p class="empty__text">Создайте первую заметку и добавьте в неё список задач.</p>
      <TodoButton to="/todos/new" variant="primary">
        <span>Создать заметку</span>
      </TodoButton>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { Todo } from '~/types'
import TodoButton from '~/components/TodoButton.vue'
import TodoCard from '~/components/TodoCard.vue'

useHead({ title: 'Заметки' })

const todos = ref<Todo[]>([
  {
    id: '1',
    title: 'Заметка1Заметка1Заметка1Заметка1Заметка1Заметка1Заметка1Заметка1Заметка1Заметка1',
    notes: [
      {
        id: '1',
        text: 'Задача 1.1 Задача 1.1 Задача 1.1 Задача1.1Задача1.1Задача 1.1Задача1.1Задача1.1Задача 1.1',
        done: false,
        createdAt: new Date('2026-01-01').toDateString(),
        updatedAt: new Date('2026-01-01').toDateString(),
      },
      {
        id: '2',
        text: 'Задача 1.2',
        done: true,
        createdAt: new Date('2026-01-01').toDateString(),
        updatedAt: new Date('2026-01-01').toDateString(),
      },
      {
        id: '3',
        text: 'Задача 1.3',
        done: true,
        createdAt: new Date('2026-01-01').toDateString(),
        updatedAt: new Date('2026-01-01').toDateString(),
      },
      {
        id: '4',
        text: 'Задача 1.4',
        done: false,
        createdAt: new Date('2026-01-01').toDateString(),
        updatedAt: new Date('2026-01-01').toDateString(),
      },
      {
        id: '5',
        text: 'Задача 1.5',
        done: true,
        createdAt: new Date('2026-01-01').toDateString(),
        updatedAt: new Date('2026-01-01').toDateString(),
      },
    ],
  },
  {
    id: '2',
    title: 'Заметка 2',
    notes: [
      {
        id: '3',
        text: 'Задача 2.1',
        done: true,
        createdAt: new Date('2026-01-01').toDateString(),
        updatedAt: new Date('2026-01-01').toDateString(),
      },
    ],
  },
  {
    id: '3',
    title: 'Заметка 3',
    notes: [
      {
        id: '11',
        text: 'Задача 3.1',
        done: false,
        createdAt: new Date('2026-01-01').toDateString(),
        updatedAt: new Date('2026-01-01').toDateString(),
      },
    ],
  },
])

async function onDelete(todo: Todo): Promise<void> {
  await 1
  console.log('onDelete', todo)
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
