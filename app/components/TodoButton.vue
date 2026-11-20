<template>
  <NuxtLink v-if="to" :to="to" class="btn" :class="`btn--${variant}`"><slot /></NuxtLink>
  <button v-else :type="type" class="btn" :class="`btn--${variant}`"><slot /></button>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
    type?: 'button' | 'submit'
    to?: string
  }>(),
  { variant: 'secondary', type: 'button', to: undefined },
)
</script>

<style scoped lang="scss">
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  min-height: 2.5rem;
  padding: 0.4rem 0.9rem;
  border: 1.5px solid var(--ink);
  border-radius: 8px;
  background: transparent;
  color: var(--ink);
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition:
    background-color 0.15s,
    color 0.15s,
    border-color 0.15s;

  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  &--primary {
    background: var(--accent);
    border-color: var(--accent);
    color: var(--accent-ink);
    &:hover:not(:disabled) {
      background: #155540;
      border-color: #155540;
    }
  }
  &--secondary:hover:not(:disabled) {
    background: var(--ink);
    color: var(--surface);
  }
  &--ghost {
    border-color: transparent;
    &:hover:not(:disabled) {
      background: rgb(23 35 28 / 0.08);
    }
  }
  &--danger {
    border-color: var(--danger);
    color: var(--danger);
    &:hover:not(:disabled) {
      background: var(--danger);
      color: #fff;
    }
  }
}
</style>
