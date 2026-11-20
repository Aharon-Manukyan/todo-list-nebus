<template>
  <article class="card">
    <header class="card__head">
      <h2
        class="card__title truncate"
        @mouseenter="showTooltip = todo.title.length > TITLE_LENGTH"
        @mouseleave="showTooltip = false"
      >
        {{ title }}
        <span v-if="!showTooltip && title.length !== todo.title.length">...</span>
        <span v-if="showTooltip" class="card__tooltip">
          {{ todo.title }}
        </span>
      </h2>
      <span v-if="todo.notes.length" class="card__count"
        >{{ doneCount }} из {{ todo.notes.length }}</span
      >
    </header>

    <ul v-if="preview.length" class="card__list">
      <li v-for="item in preview" :key="item.id" :class="{ 'is-done': item.done }">
        <span class="tick" aria-hidden="true">
          <AppIcon v-if="item.done" name="check" />
        </span>
        <span>{{ item.done ? 'Выполнено: ' : 'Не выполнено: ' }}</span>
        <span class="card__text">{{ item.text }}</span>
      </li>
    </ul>
    <p v-else class="card__empty">Задач пока нет</p>
    <p v-if="rest > 0" class="card__more">и ещё {{ rest }}</p>

    <footer class="card__actions">
      <TodoButton :to="`/todos/${todo.id}`" variant="secondary">
        <AppIcon name="edit" />
        Изменить
      </TodoButton>
      <TodoButton variant="danger" :aria-label="`Удалить заметку «${title}»`">
        <AppIcon name="trash" /> Удалить
      </TodoButton>
    </footer>
  </article>
</template>

<script setup lang="ts">
import { UNTITLED, PREVIEW_LIMIT, TITLE_LENGTH } from '~/core/constants'
import type { Todo } from '~/types'

const props = defineProps<{
  todo: Todo
}>()

const title = computed(() => {
  const trimedTitle = props.todo.title.trim()
  if (!trimedTitle) return UNTITLED
  if (trimedTitle.length > TITLE_LENGTH) {
    return trimedTitle.slice(0, TITLE_LENGTH)
  }
  return trimedTitle
})

const preview = computed(() => props.todo.notes.slice(0, PREVIEW_LIMIT))
const rest = computed(() => Math.max(0, props.todo.notes.length - PREVIEW_LIMIT))

const doneCount = computed(() =>
  props.todo.notes.reduce((acc, note) => {
    return acc + Number(note.done)
  }, 0),
)

const showTooltip = ref(false)
</script>

<style scoped lang="scss">
.card {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.1rem 1.1rem 1rem 1.5rem;
  background: var(--surface);
  border: 1.5px solid var(--ink);
  border-radius: var(--radius);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0 auto 0 0;
    width: 0.6rem;
    background: var(--spine);
  }

  &__head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 0.75rem;
  }
  &__title {
    font: 700 1.3rem/1.25 var(--font-title);
    overflow-wrap: anywhere;
  }
  &__count {
    flex: none;
    color: var(--muted);
    font-size: 0.85rem;
    font-variant-numeric: tabular-nums;
  }
  &__list {
    display: grid;
    gap: 0.35rem;
  }
  &__text {
    overflow-wrap: anywhere;
  }
  &__empty,
  &__more {
    color: var(--muted);
    font-size: 0.9rem;
  }
  &__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    margin-top: auto;
    padding-top: 0.4rem;
  }
}

li {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;

  &.is-done .card__text {
    color: var(--muted);
    text-decoration: line-through;
  }
}

.tick {
  display: grid;
  place-items: center;
  flex: none;
  width: 1.15rem;
  height: 1.15rem;
  margin-top: 0.2rem;
  border: 1.5px solid var(--ink);
  border-radius: 4px;
  background: var(--surface);

  .is-done & {
    background: var(--ink);
    color: var(--surface);
  }
  :deep(svg) {
    width: 0.8rem;
    height: 0.8rem;
  }
}
</style>
