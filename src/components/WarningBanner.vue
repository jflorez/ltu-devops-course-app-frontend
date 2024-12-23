<template>
  <div v-if="show" class="warning-banner">
    <span>⚠️ Unable to connect to server. Please check your connection.</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  show: boolean;
}>();
</script>

<style scoped>
.warning-banner {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #ff4444;
  color: white;
  padding: 1rem;
  text-align: center;
  z-index: 1000;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}
</style>
