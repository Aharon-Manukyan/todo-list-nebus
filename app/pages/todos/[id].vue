<template>
  <div>
    <h1>Todo {{ id }}</h1>
  </div>
</template>
<script setup lang="ts">
const { id } = useRoute().params;
</script>
