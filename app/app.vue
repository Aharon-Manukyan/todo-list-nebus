<template>
  <div>
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
import { STORAGE_KEY } from '~/core/constants'
import { useTodosStore } from '~/stores/todos'

const todosStore = useTodosStore()

const onStorage = (event: StorageEvent) => {
  if (event.key === STORAGE_KEY || event.key === null) todosStore.reload()
}

onMounted(() => window.addEventListener('storage', onStorage))
onBeforeUnmount(() => window.removeEventListener('storage', onStorage))
</script>
