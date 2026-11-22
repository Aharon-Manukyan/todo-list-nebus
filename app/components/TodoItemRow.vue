<template>
  <li class="todo">
    <input type="checkbox" :checked="note.done" aria-label="Выполнено" @change="emit('toggle')" />
    <input
      :value="note.text"
      class="todo__text"
      :class="{ 'todo__text--done': note.done }"
      placeholder="Что нужно сделать?"
      aria-label="Текст пункта"
      @change="change"
    />
    <TodoButton variant="danger" aria-label="Удалить пункт" @click="emit('remove')">
      <AppIcon name="trash" />
    </TodoButton>
  </li>
</template>

<script setup lang="ts">
import type { Note } from '~/types'

defineProps<{ note: Note }>()

const emit = defineEmits<{
  toggle: []
  edit: [text: string]
  remove: []
}>()

const change = (e: Event) => {
  emit('edit', (e.target as HTMLInputElement).value)
}
</script>

<style scoped lang="scss">
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
</style>
