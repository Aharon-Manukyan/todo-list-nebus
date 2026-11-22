import { onBeforeUnmount, onMounted, watch, type Ref } from 'vue'
import { storeToRefs } from 'pinia'
import { DRAFT_DELAY } from '~/core/constants'
import { clearDraft, saveDraft } from '~/core/storage'
import { useEditorStore } from '~/stores/editor'

export function useDraftAutosave(routeId: string, enabled: Ref<boolean>) {
  const { todo, isChanged } = storeToRefs(useEditorStore())
  let timer: ReturnType<typeof setTimeout> | undefined

  function save() {
    clearTimeout(timer)
    if (!enabled.value || !todo.value) return

    if (isChanged.value) {
      saveDraft(routeId, todo.value)
    } else {
      clearDraft(routeId)
    }
  }

  function onPageHide() {
    const focused = document.activeElement as HTMLElement | null
    focused?.blur()
    save()
  }

  watch(
    todo,
    () => {
      clearTimeout(timer)
      timer = setTimeout(save, DRAFT_DELAY)
    },
    { deep: true },
  )

  onMounted(() => window.addEventListener('pagehide', onPageHide))

  onBeforeUnmount(() => {
    window.removeEventListener('pagehide', onPageHide)
    clearTimeout(timer)
  })
}
