<template>
  <div class="home">
    <TreeDataGrid />
  </div>
</template>

<script setup lang="ts">
import TreeDataGrid from '@/components/TreeDataGrid.vue'
</script>

<style scoped>
.home {
  min-height: 100vh;
  background: #f8f9fa;
}
</style>