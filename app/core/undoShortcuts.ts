import { onBeforeUnmount, onMounted } from 'vue'

export function useUndoShortcuts(undo: () => void, redo: () => void) {
  function onKeydown(event: KeyboardEvent) {
    if (event.code !== 'KeyZ' || !(event.ctrlKey || event.metaKey)) return
    if ((event.target as HTMLElement).matches('input:not([type=checkbox]), textarea')) return
    if (document.querySelector('dialog[open]')) return

    event.preventDefault()
    if (event.shiftKey) redo()
    else undo()
  }

  onMounted(() => window.addEventListener('keydown', onKeydown))
  onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
}
