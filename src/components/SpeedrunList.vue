<template>
  <div>
    <h2>Speedruns for {{ game.name }}</h2>
    <table>
      <thead>
        <tr>
          <th @click="sortTable('runner')">Runner</th>
          <th @click="sortTable('time_ms')">Time (ms)</th>
          <th @click="sortTable('date')">Date</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="speedrun in sortedSpeedruns" :key="speedrun.id">
          <td>{{ speedrun.runner.name }}</td>
          <td>{{ speedrun.time_ms }}</td>
          <td>{{ formatDate(speedrun.date) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import type { Game, Speedrun } from './data/Speedrun';
import axios from 'axios';

const props = defineProps<{ game: Game }>();
const speedruns = ref<Speedrun[]>([]);
const sortKey = ref<string>('time_ms');
const sortOrder = ref<number>(1);

const fetchSpeedruns = async (gameId: string) => {
  try {
    const response = await axios.get(`/api/speedruns?gameId=${gameId}`);
    speedruns.value = response.data.details;
  } catch (error) {
    console.error('Error fetching speedruns:', error);
  }
};

watch(
  () => props.game.id,
  (newId) => {
    console.log('Game ID changed to:', newId);
    if (newId) {
      fetchSpeedruns(newId);
    }
  },
  { immediate: true }
);

const sortedSpeedruns = computed(() => {
  return [...speedruns.value].sort((a, b) => {
    const aValue = sortKey.value === 'runner' ? a.runner.name : a[sortKey.value as keyof Speedrun];
    const bValue = sortKey.value === 'runner' ? b.runner.name : b[sortKey.value as keyof Speedrun];
    if (aValue < bValue) return -1 * sortOrder.value;
    if (aValue > bValue) return 1 * sortOrder.value;
    return 0;
  });
});

const sortTable = (key: string) => {
  if (sortKey.value === key) {
    sortOrder.value *= -1;
  } else {
    sortKey.value = key;
    sortOrder.value = 1;
  }
};

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

onMounted(() => {
  window.addEventListener('refresh-speedruns', () => {
    if (props.game) {
      fetchSpeedruns(props.game.id);
    }
  });
});

onUnmounted(() => {
  window.removeEventListener('refresh-speedruns', () => {});
});
</script>

<style scoped>
h2 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: var(--color-primary);
}

table {
  width: 100%;
  border-collapse: collapse;
}

th {
  cursor: pointer;
  background-color: var(--color-background-soft);
  padding: 0.5rem;
  text-align: left;
  border-bottom: 2px solid var(--color-border);
}

td {
  padding: 0.5rem;
  border-bottom: 1px solid var(--color-border);
  white-space: nowrap;
}

tr:hover {
  background-color: var(--color-background-mute);
}
</style>
