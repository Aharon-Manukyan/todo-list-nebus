<template>
  <dialog
    ref="dialog"
    class="confirm"
    :aria-labelledby="titleId"
    @close="onClose"
    @click.self="emit('cancel')"
    @keydown.left.prevent="moveFocus(-1)"
    @keydown.right.prevent="moveFocus(1)"
  >
    <div class="confirm__body">
      <h2 :id="titleId" class="confirm__title">{{ title }}</h2>
      <p class="confirm__text">{{ message }}</p>

      <div class="confirm__actions">
        <TodoButton variant="ghost" :autofocus="initialFocus === 'cancel'" @click="emit('cancel')">
          {{ cancelLabel }}
        </TodoButton>
        <TodoButton
          :variant="confirmVariant"
          :autofocus="initialFocus === 'confirm'"
          @click="emit('confirm')"
        >
          {{ confirmLabel }}
        </TodoButton>
      </div>
    </div>
  </dialog>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    open: boolean
    title: string
    message: string
    confirmLabel?: string
    cancelLabel?: string
    confirmVariant?: 'primary' | 'danger'
    initialFocus?: 'confirm' | 'cancel'
  }>(),
  {
    confirmLabel: 'Удалить',
    cancelLabel: 'Отмена',
    confirmVariant: 'danger',
    initialFocus: 'cancel',
  },
)

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

const titleId = useId()
const dialog = ref<HTMLDialogElement | null>(null)

const moveFocus = (step: number) => {
  const buttons = Array.from(dialog.value?.querySelectorAll<HTMLElement>('button') ?? [])
  const current = buttons.indexOf(document.activeElement as HTMLElement)
  if (current === -1) return
  buttons[(current + step + buttons.length) % buttons.length]?.focus()
}

const onClose = () => {
  if (props.open) emit('cancel')
}

const lockScroll = (locked: boolean) => {
  document.documentElement.style.overflow = locked ? 'hidden' : ''
}

watch(
  () => props.open,
  (open) => {
    const el = dialog.value
    if (!el) return
    if (open && !el.open) el.showModal()
    else if (!open && el.open) el.close()
    lockScroll(open)
  },
)

onBeforeUnmount(() => lockScroll(false))
</script>

<style scoped>
.confirm {
  width: min(92vw, 26rem);
  padding: 0;
  border: 1.5px solid var(--ink, #17231c);
  border-radius: var(--radius, 10px);
  background: var(--surface, #fff);
  color: var(--ink, #17231c);
}

.confirm::backdrop {
  background: rgb(0 0 0 / 0.5);
}

.confirm__body {
  padding: 1.25rem;
}

.confirm__title {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 700;
}

.confirm__text {
  margin: 0.5rem 0 0;
  color: var(--muted, #566559);
  overflow-wrap: anywhere;
}

.confirm__actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1.25rem;
}
</style>
