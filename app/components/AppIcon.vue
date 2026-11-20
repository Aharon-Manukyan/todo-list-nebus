<script setup lang="ts">
type IconName = 'undo' | 'redo' | 'plus' | 'trash' | 'check' | 'edit' | 'back' | 'save'
defineProps<{ name: IconName }>()

const paths: Record<IconName, string> = {
  undo: 'M9 7 4 12l5 5M4 12h10a6 6 0 0 1 0 12h-2',
  redo: 'm15 7 5 5-5 5M20 12H10a6 6 0 0 0 0 12h2',
  plus: 'M12 5v14M5 12h14',
  trash: 'M4 7h16M10 11v6M14 11v6M6 7l1 12h10l1-12M9 7V4h6v3',
  check: 'm5 12 4.5 4.5L19 7',
  edit: 'M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4',
  back: 'M15 5l-7 7 7 7',
  save: 'M5 4h11l3 3v13H5zM8 4v5h7V4M8 20v-6h8v6',
}
</script>

<template>
  <svg
    class="icon"
    viewBox="0 0 24 24"
    width="18"
    height="18"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <path :d="paths[name]" />
  </svg>
</template>

<style scoped lang="scss">
.icon {
  flex: none;
}
</style>
