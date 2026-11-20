<template>
  <div class="page">
    Todo {{ todoId }}
    <section v-if="status === 'not-found'" class="missing">
      <h1 class="missing__title">Заметка не найдена</h1>
      <p class="missing__text">Возможно, её удалили или ссылка введена с ошибкой.</p>
      <TodoButton to="/" variant="primary"> <AppIcon name="back" /> К списку заметок </TodoButton>
    </section>

    <section class="editor">
      <div class="bar" role="toolbar" aria-label="Действия с заметкой">
        <div class="bar__group">
          <TodoButton variant="secondary" title="Отменить изменение (Ctrl+Z)">
            <AppIcon name="undo" /> Отменить
          </TodoButton>
          <TodoButton variant="secondary" title="Повторить изменение (Shift+Ctrl+Z)">
            <AppIcon name="redo" /> Повторить
          </TodoButton>
        </div>
        <div class="bar__group bar__group--end">
          <TodoButton variant="danger" @click="onDelete">
            <AppIcon name="trash" /> Удалить
          </TodoButton>
          <TodoButton variant="ghost" @click="onCancel">Отмена</TodoButton>
          <TodoButton variant="primary" @click="onSave">
            <AppIcon name="save" /> Сохранить
          </TodoButton>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const { id } = useRoute().params
const status = ref<'loading' | 'ready' | 'not-found'>('loading')
const todoId = computed(() => String(id))

const onCancel = () => {
  console.log('onCancel')
}

const onDelete = () => {
  console.log('onDelete')
}
const onSave = () => {
  console.log('onSave')
}
</script>

<style scoped lang="scss">
.bar {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.75rem;

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
</style>
